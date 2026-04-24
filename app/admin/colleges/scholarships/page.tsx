import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ScholarshipListClient from "./ScholarshipListClient";

export const dynamic = "force-dynamic";

async function createScholarship(formData: FormData) {
  "use server";
  const db = await getDb();
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const title = String(formData.get("title") || "");
  if (!collegeprofile_id || !title) return;
  try {
    const last = await db.collection("college_scholarships").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("college_scholarships").insertOne({
      id: nextId, collegeprofile_id, title,
      description: String(formData.get("description") || "") || null,
      created_at: new Date(), updated_at: new Date(),
    });
  } catch (e) { console.error("[admin/colleges/scholarships createAction]", e); }
  revalidatePath("/admin/colleges/scholarships");
}

async function updateScholarship(formData: FormData) {
  "use server";
  const db = await getDb();
  const id = Number(formData.get("id"));
  try {
    await db.collection("college_scholarships").updateOne({ id }, {
      $set: {
        collegeprofile_id: Number(formData.get("collegeprofile_id")),
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || "") || null,
        updated_at: new Date(),
      }
    });
  } catch (e) { console.error("[admin/colleges/scholarships updateAction]", e); }
  revalidatePath("/admin/colleges/scholarships");
}

async function deleteScholarshipRow(id: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("college_scholarships").deleteOne({ id });
  } catch (e) { console.error("[admin/colleges/scholarships deleteAction]", e); }
  revalidatePath("/admin/colleges/scholarships");
}

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function CollegeScholarshipsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = (sp.collegeId ?? "").trim();
  const title = (sp.title ?? "").trim();
  const description = (sp.description ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const match: Record<string, unknown> = {};
  if (collegeId) match.collegeprofile_id = Number(collegeId);
  if (title) match.title = { $regex: title, $options: "i" };
  if (description) match.description = { $regex: description, $options: "i" };
  if (q) match.$or = [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];

  const [total, rows] = await Promise.all([
    db.collection("college_scholarships").countDocuments(match),
    db.collection("college_scholarships").find(match).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
  ]);

  const cpIds = [...new Set(rows.map((r: any) => Number(r.collegeprofile_id)).filter(Boolean))];
  const cpRows = cpIds.length > 0
    ? await db.collection("collegeprofile").aggregate([
        { $match: { id: { $in: cpIds } } },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: 1, name: { $ifNull: ["$user.firstname", "$slug"] } } },
      ]).toArray()
    : [];
  const cpMap = new Map(cpRows.map((c: any) => [Number(c.id), String(c.name || "").trim()]));

  const scholarships = rows.map((r: any) => ({
    id: Number(r.id), collegeprofile_id: Number(r.collegeprofile_id),
    college_name: cpMap.get(Number(r.collegeprofile_id)) || "Unknown College",
    title: String(r.title || ""), description: String(r.description || ""),
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const collegeOptions = await db.collection("collegeprofile").aggregate([
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, id: 1, name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] } } },
    { $sort: { name: 1 } }, { $limit: 500 },
  ]).toArray();
  const colleges = collegeOptions.map((c: any) => ({ id: Number(c.id), name: String(c.name || "").trim() }));

  const buildPageHref = (p: number) => {
    const query = new URLSearchParams({ page: String(p) });
    if (q) query.set("q", q); if (collegeId) query.set("collegeId", collegeId);
    if (title) query.set("title", title); if (description) query.set("description", description);
    return `/admin/colleges/scholarships?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>redeem</span>
            Scholarship programs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage financial aid, eligibility, and scholarship awards.</p>
        </div>
        <form method="GET" action="/admin/colleges/scholarships" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input type="text" name="q" defaultValue={q} placeholder="Search scholarships..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
        </form>
      </div>
      <ScholarshipListClient
        scholarships={JSON.parse(JSON.stringify(scholarships))}
        colleges={JSON.parse(JSON.stringify(colleges))}
        offset={offset} total={total} pageSize={PAGE_SIZE}
        searchQuery={q} selectedCollegeId={collegeId} selectedTitle={title} selectedDescription={description}
        onAdd={createScholarship} onDelete={deleteScholarshipRow}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> records</p>
          <div className="flex items-center gap-1">
            {page > 1 ? <Link href={buildPageHref(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link> : <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={buildPageHref(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link> : <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>}
          </div>
        </div>
      )}
    </div>
  );
}
