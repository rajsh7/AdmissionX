import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import DeleteButton from "@/app/admin/_components/DeleteButton";

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function deleteQueryRecord(id: string) {
  "use server";
  try {
    const db = await getDb();
    // Try student_queries first (ObjectId), then query collection (numeric id)
    if (id.length === 24) {
      await db.collection("student_queries").deleteOne({ _id: new ObjectId(id) });
    } else {
      await db.collection("query").deleteOne({ id: Number(id) });
    }
  } catch (e) {
    console.error("[admin/queries/college-student deleteAction]", e);
  }
  revalidatePath("/admin/queries/college-student");
}

interface QueryRow {
  id: string;
  student_name: string;
  student_email: string;
  college_slug: string;
  college_name: string;
  subject: string;
  message: string;
  status: string;
  source: string;
  created_at: string;
  response: string | null;
}

export default async function CollegeStudentQueryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip   = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // ── Build filters ──────────────────────────────────────────────────────────
  const sqFilter: Record<string, unknown> = {};
  if (q) sqFilter.$or = [
    { subject:       { $regex: q, $options: "i" } },
    { message:       { $regex: q, $options: "i" } },
    { student_name:  { $regex: q, $options: "i" } },
    { student_email: { $regex: q, $options: "i" } },
    { college_slug:  { $regex: q, $options: "i" } },
  ];
  if (status) sqFilter.status = status;

  // ── Fetch from student_queries (public page + college dashboard) ───────────
  const [sqDocs, sqTotal] = await Promise.all([
    db.collection("student_queries")
      .find(sqFilter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection("student_queries").countDocuments(sqFilter),
  ]);

  // ── Resolve college names from slugs ──────────────────────────────────────
  const slugs = [...new Set(sqDocs.map((d: any) => d.college_slug).filter(Boolean))];
  const cpDocs = slugs.length
    ? await db.collection("collegeprofile")
        .find({ slug: { $in: slugs } }, { projection: { slug: 1, users_id: 1 } })
        .toArray()
    : [];

  const userIds = [...new Set(cpDocs.map((c: any) => c.users_id).filter(Boolean))];
  const userDocs = userIds.length
    ? await db.collection("users")
        .find({ $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] }, { projection: { _id: 1, id: 1, firstname: 1 } })
        .toArray()
    : [];

  const userMap = new Map(userDocs.map((u: any) => [String(u._id), String(u.firstname ?? "").trim()]));
  const slugToName = new Map(cpDocs.map((c: any) => [
    String(c.slug),
    userMap.get(String(c.users_id)) || String(c.slug),
  ]));

  const queries: QueryRow[] = sqDocs.map((d: any) => ({
    id:            String(d._id),
    student_name:  String(d.student_name ?? "Anonymous"),
    student_email: String(d.student_email ?? ""),
    college_slug:  String(d.college_slug ?? ""),
    college_name:  slugToName.get(String(d.college_slug)) || String(d.college_slug || "Unknown College"),
    subject:       String(d.subject ?? ""),
    message:       String(d.message ?? ""),
    status:        String(d.status ?? "pending"),
    source:        String(d.source ?? "dashboard"),
    created_at:    d.created_at
      ? new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "",
    response:      d.response ? String(d.response) : null,
  }));

  const totalPages = Math.ceil(sqTotal / PAGE_SIZE);

  const STATUS_COLORS: Record<string, string> = {
    pending:  "bg-amber-50 text-amber-600",
    answered: "bg-emerald-50 text-emerald-600",
    closed:   "bg-slate-100 text-slate-500",
  };

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (status) qs.set("status", status);
    qs.set("page", String(p));
    return `/admin/queries/college-student?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>forum</span>
            College &amp; Student Queries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All queries submitted via college public pages and student dashboards.
          </p>
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          {sqTotal.toLocaleString()} records
        </span>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/queries/college-student"
        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Search</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[16px] text-slate-400" style={ICO}>search</span>
            <input
              type="text" name="q" defaultValue={q}
              placeholder="Name, email, subject, college..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
          <select name="status" defaultValue={status}
            className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none font-medium">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit"
          className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Apply
        </button>
        {(q || status) && (
          <Link href="/admin/queries/college-student"
            className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {queries.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-5xl text-slate-200 block mb-3" style={ICO_FILL}>forum</span>
            <p className="text-slate-500 font-semibold text-sm">No queries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {queries.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{r.student_name}</p>
                      {r.student_email && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{r.student_email}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-blue-600 text-sm truncate max-w-[160px]">{r.college_name}</p>
                      {r.college_slug && (
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{r.college_slug}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-[280px]">
                      <p className="font-semibold text-slate-700 truncate">{r.subject}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.message}</p>
                      {r.response && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>check_circle</span>
                          Replied
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.source === "public_page"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {r.source === "public_page" ? "Public Page" : "Dashboard"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-slate-400 whitespace-nowrap">{r.created_at}</td>
                    <td className="px-4 py-4 text-right">
                      <DeleteButton action={deleteQueryRecord.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{skip + 1}–{Math.min(skip + PAGE_SIZE, sqTotal)}</strong> of <strong>{sqTotal.toLocaleString()}</strong>
          </p>
          <div className="flex items-center gap-1">
            {page > 1
              ? <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>
              : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            }
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages
              ? <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>
              : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}
