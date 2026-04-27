import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const PAGE_SIZE = 20;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function updateStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  await db.collection("contact_queries").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updated_at: new Date() } }
  );
  revalidatePath("/admin/queries/contact");
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

export default async function ContactQueriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const statusFilter = sp.status ?? "all";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }
  if (statusFilter !== "all") filter.status = statusFilter;

  const [queries, total, newCount, readCount, resolvedCount] = await Promise.all([
    db.collection("contact_queries").find(filter).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    db.collection("contact_queries").countDocuments(filter),
    db.collection("contact_queries").countDocuments({ status: "new" }),
    db.collection("contact_queries").countDocuments({ status: "read" }),
    db.collection("contact_queries").countDocuments({ status: "resolved" }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, status: statusFilter, page: "1", ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/queries/contact${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a href="/admin/queries" className="text-xs text-slate-400 hover:text-primary flex items-center gap-1 mb-1">
            <span className="material-symbols-rounded text-[14px]" style={ICO}>arrow_back</span>
            All Queries
          </a>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-primary text-[22px]" style={ICO_FILL}>contact_mail</span>
            Contact Us Queries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Messages submitted via the Contact Us form.</p>
        </div>
        <form method="GET" action="/admin/queries/contact" className="w-full sm:w-72">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input type="text" name="q" defaultValue={q} placeholder="Search name, email, message…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "New", count: newCount, color: "text-blue-600", bg: "bg-blue-50", status: "new" },
          { label: "Read", count: readCount, color: "text-amber-600", bg: "bg-amber-50", status: "read" },
          { label: "Resolved", count: resolvedCount, color: "text-emerald-600", bg: "bg-emerald-50", status: "resolved" },
        ].map((s) => (
          <a key={s.status} href={buildUrl({ status: s.status })}
            className={`rounded-2xl border p-4 flex items-center gap-3 transition-all hover:shadow-sm ${statusFilter === s.status ? "border-primary/30 ring-2 ring-primary/10" : "border-slate-100"} bg-white`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`text-xl font-black ${s.color}`}>{s.count}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600">{s.label}</span>
          </a>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "new", "read", "resolved"].map((s) => (
          <a key={s} href={buildUrl({ status: s })}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-primary/50"}`}>
            {s}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {queries.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-5xl text-slate-300 block mb-3" style={ICO}>inbox</span>
            <p className="text-slate-500 font-semibold text-sm">No queries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name & Email</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {queries.map((r) => (
                  <tr key={String(r._id)} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.email}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium max-w-[160px] truncate">{r.subject || "—"}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs max-w-[260px]">
                      <p className="line-clamp-2">{r.message}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <form action={updateStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={String(r._id)} />
                        {r.status !== "read" && (
                          <button name="status" value="read" type="submit"
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                            Mark Read
                          </button>
                        )}
                        {r.status !== "resolved" && (
                          <button name="status" value="resolved" type="submit"
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            Resolve
                          </button>
                        )}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            {page > 1
              ? <a href={buildUrl({ page: page - 1 })} className="text-xs font-semibold text-slate-500 hover:text-primary">← Prev</a>
              : <span />}
            <span className="text-xs text-slate-400">{page} / {totalPages}</span>
            {page < totalPages
              ? <a href={buildUrl({ page: page + 1 })} className="text-xs font-semibold text-slate-500 hover:text-primary">Next →</a>
              : <span />}
          </div>
        )}
      </div>
    </div>
  );
}
