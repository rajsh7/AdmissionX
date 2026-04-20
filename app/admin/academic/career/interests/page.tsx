import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import InterestListClient from "./InterestListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createInterest(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!title || isNaN(functionalarea_id)) return;

  try {
    await pool.query(
      `INSERT INTO counseling_career_interests (title, description, slug, functionalarea_id, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description, slug, functionalarea_id, status]
    );
  } catch (e) {
    console.error("[admin/academic/career/interests createAction]", e);
  }
  revalidatePath("/admin/academic/career/interests");
  revalidatePath("/", "layout");
}

async function updateInterest(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!id || !title || isNaN(functionalarea_id)) return;

  try {
    await pool.query(
      `UPDATE counseling_career_interests SET title = ?, description = ?, slug = ?, functionalarea_id = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, description, slug, functionalarea_id, status, id]
    );
  } catch (e) {
    console.error("[admin/academic/career/interests updateAction]", e);
  }
  revalidatePath("/admin/academic/career/interests");
  revalidatePath("/", "layout");
}

async function deleteInterest(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_career_interests WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/interests deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/interests");
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
    console.error("[admin/academic/career/interests safeQuery]", err);
    return [];
  }
}

interface InterestRow  {
  id: number;
  title: string;
  description: string | null;
  slug: string | null;
  status: number;
  functionalarea_id: number;
  functionalArea: string | null;
}

interface StreamOption  {
  id: number;
  name: string;
}

export default async function CareerInterestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { $or: [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }] } : {};
  const [intDocs, faDocs] = await Promise.all([
    db.collection("counseling_career_interests").find(filter).sort({ id: -1 }).limit(200).toArray(),
    db.collection("functionalarea").find({}, { projection: { id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
  ]);
  const faMap = new Map(faDocs.map((d: any) => [Number(d.id), String(d.name ?? "").trim()]));
  const interests: InterestRow[] = intDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? "").trim(),
    description: d.description ? String(d.description).trim() : null,
    slug: d.slug ? String(d.slug).trim() : null,
    status: Number(String(d.status ?? "0").trim()),
    functionalarea_id: Number(d.functionalarea_id ?? 0),
    functionalArea: faMap.get(Number(d.functionalarea_id)) || null,
  }));
  const streams: StreamOption[] = faDocs.map((d: any) => ({ id: Number(d.id ?? 0), name: String(d.name ?? "").trim() }));

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full font-sans">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search interests or streams..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <InterestListClient 
        interests={interests}
        streams={streams}
        createInterest={createInterest}
        updateInterest={updateInterest}
        deleteInterest={deleteInterest}
      />
    </div>
  );
}




