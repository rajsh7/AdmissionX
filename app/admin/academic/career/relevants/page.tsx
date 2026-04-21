import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import RelevantListClient from "./RelevantListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createRelevant(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const salery = formData.get("salery") as string; // Typo in DB
  const stream = formData.get("stream") as string;
  const academicDifficulty = formData.get("academicDifficulty") as string;
  const status = formData.get("status") === "on" ? 1 : 0;
  const careerInterest = parseInt(formData.get("careerInterest") as string, 10);
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const slug = formData.get("slug") as string;

  if (!title) return;

  try {
    await pool.query(
      `INSERT INTO counseling_career_relevants (title, salery, stream, academicDifficulty, status, careerInterest, functionalarea_id, slug, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, salery, stream, academicDifficulty, status, isNaN(careerInterest) ? null : careerInterest, isNaN(functionalarea_id) ? null : functionalarea_id, slug]
    );
  } catch (e) {
    console.error("[admin/academic/career/relevants createAction]", e);
  }
  revalidatePath("/admin/academic/career/relevants");
  revalidatePath("/", "layout");
}

async function updateRelevant(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const salery = formData.get("salery") as string; // Typo in DB
  const stream = formData.get("stream") as string;
  const academicDifficulty = formData.get("academicDifficulty") as string;
  const status = formData.get("status") === "on" ? 1 : 0;
  const careerInterest = parseInt(formData.get("careerInterest") as string, 10);
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const slug = formData.get("slug") as string;

  if (!id || !title) return;

  try {
    await pool.query(
      `UPDATE counseling_career_relevants SET 
        title = ?, salery = ?, stream = ?, academicDifficulty = ?, 
        status = ?, careerInterest = ?, functionalarea_id = ?, slug = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, salery, stream, academicDifficulty, status, isNaN(careerInterest) ? null : careerInterest, isNaN(functionalarea_id) ? null : functionalarea_id, slug, id]
    );
  } catch (e) {
    console.error("[admin/academic/career/relevants updateAction]", e);
  }
  revalidatePath("/admin/academic/career/relevants");
  revalidatePath("/", "layout");
}

async function deleteRelevant(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_career_relevants WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/relevants deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/relevants");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career/relevants safeQuery]", err);
    return [];
  }
}

interface RelevantRow  {
  id: number;
  title: string;
  salery: string | null;
  stream: string | null;
  academicDifficulty: string | null;
  status: number;
  careerInterest: number | null;
  functionalarea_id: number | null;
  interestTitle: string | null;
  functionalArea: string | null;
  slug: string | null;
}

interface StreamOption  {
  id: number;
  name: string;
}

interface InterestOption  {
  id: number;
  title: string;
}

export default async function CareerRelevantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { $or: [{ title: { $regex: q, $options: "i" } }, { stream: { $regex: q, $options: "i" } }] } : {};
  const [relDocs, faDocs, intDocs] = await Promise.all([
    db.collection("counseling_career_relevants").find(filter).sort({ id: -1 }).limit(200).toArray(),
    db.collection("functionalarea").find({}, { projection: { id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
    db.collection("counseling_career_interests").find({}, { projection: { id: 1, title: 1 } }).sort({ title: 1 }).toArray(),
  ]);
  const faMap = new Map(faDocs.map((d: any) => [Number(d.id), String(d.name ?? "").trim()]));
  const intMap = new Map(intDocs.map((d: any) => [Number(d.id), String(d.title ?? "").trim()]));
  const relevants: RelevantRow[] = relDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? "").trim(),
    salery: d.salery ? String(d.salery).trim() : null,
    stream: d.stream ? String(d.stream).trim() : null,
    academicDifficulty: d.academicDifficulty ? String(d.academicDifficulty).trim() : null,
    status: Number(String(d.status ?? "0").trim()),
    careerInterest: d.careerInterest ? Number(d.careerInterest) : null,
    functionalarea_id: d.functionalarea_id ? Number(d.functionalarea_id) : null,
    interestTitle: intMap.get(Number(d.careerInterest)) || null,
    functionalArea: faMap.get(Number(d.functionalarea_id)) || null,
    slug: d.slug ? String(d.slug).trim() : null,
  }));
  const streams: StreamOption[] = faDocs.map((d: any) => ({ id: Number(d.id ?? 0), name: String(d.name ?? "").trim() }));
  const interests: InterestOption[] = intDocs.map((d: any) => ({ id: Number(d.id ?? 0), title: String(d.title ?? "").trim() }));

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] font-sans">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search posts, streams or interests..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <RelevantListClient 
        relevants={relevants}
        streams={streams}
        interests={interests}
        createRelevant={createRelevant}
        updateRelevant={updateRelevant}
        deleteRelevant={deleteRelevant}
      />
    </div>
  );
}




