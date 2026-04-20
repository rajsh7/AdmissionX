import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import OpportunityListClient from "./OpportunityListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createOpportunity(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const avgSalery = formData.get("avgSalery") as string; // Typo in DB
  const topCompany = formData.get("topCompany") as string;
  const careerDetailsId = parseInt(formData.get("careerDetailsId") as string, 10);

  if (!title || isNaN(careerDetailsId)) return;

  try {
    await pool.query(
      `INSERT INTO counseling_career_job_role_saleries (title, avgSalery, topCompany, careerDetailsId, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [title, avgSalery, topCompany, careerDetailsId]
    );
  } catch (e) {
    console.error("[admin/academic/career/opportunities createAction]", e);
  }
  revalidatePath("/admin/academic/career/opportunities");
  revalidatePath("/", "layout");
}

async function updateOpportunity(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const avgSalery = formData.get("avgSalery") as string; // Typo in DB
  const topCompany = formData.get("topCompany") as string;
  const careerDetailsId = parseInt(formData.get("careerDetailsId") as string, 10);

  if (!id || !title || isNaN(careerDetailsId)) return;

  try {
    await pool.query(
      `UPDATE counseling_career_job_role_saleries SET title = ?, avgSalery = ?, topCompany = ?, careerDetailsId = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, avgSalery, topCompany, careerDetailsId, id]
    );
  } catch (e) {
    console.error("[admin/academic/career/opportunities updateAction]", e);
  }
  revalidatePath("/admin/academic/career/opportunities");
  revalidatePath("/", "layout");
}

async function deleteOpportunity(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_career_job_role_saleries WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/opportunities deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/opportunities");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career/opportunities safeQuery]", err);
    return [];
  }
}

interface OppRow  {
  id: number;
  title: string;
  avgSalery: string | null;
  topCompany: string | null;
  careerDetailsId: number | null;
  career_title: string | null;
}

interface CareerStreamOption  {
  id: number;
  title: string;
}

export default async function CareerOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { $or: [{ title: { $regex: q, $options: "i" } }, { topCompany: { $regex: q, $options: "i" } }] } : {};
  const [oppDocs, careerDocs] = await Promise.all([
    db.collection("counseling_career_job_role_saleries").find(filter).sort({ id: -1 }).limit(200).toArray(),
    db.collection("counseling_career_details").find({}, { projection: { id: 1, title: 1 } }).sort({ title: 1 }).toArray(),
  ]);
  const careerMap = new Map(careerDocs.map((d: any) => [Number(d.id), String(d.title ?? "").trim()]));
  const opportunities: OppRow[] = oppDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? "").trim(),
    avgSalery: d.avgSalery ? String(d.avgSalery).trim() : null,
    topCompany: d.topCompany ? String(d.topCompany).trim() : null,
    careerDetailsId: Number(d.careerDetailsId ?? 0),
    career_title: careerMap.get(Number(d.careerDetailsId)) || null,
  }));
  const careerStreams: CareerStreamOption[] = careerDocs.map((d: any) => ({ id: Number(d.id ?? 0), title: String(d.title ?? "").trim() }));

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center font-sans">
        <form method="GET" className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search roles or companies..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <OpportunityListClient 
        opportunities={opportunities}
        careerStreams={careerStreams}
        createOpportunity={createOpportunity}
        updateOpportunity={updateOpportunity}
        deleteOpportunity={deleteOpportunity}
      />
    </div>
  );
}




