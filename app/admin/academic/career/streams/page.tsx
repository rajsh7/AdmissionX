import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import CareerStreamListClient from "./CareerStreamListClient";

// --- Server Actions -----------------------------------------------------------

async function createCareer(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const descrition = formData.get("descrition") as string; // Typo in DB
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!title || isNaN(functionalarea_id)) return;

  try {
    await pool.query(
      `INSERT INTO counseling_career_details (title, slug, functionalarea_id, descrition, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, slug, functionalarea_id, descrition, status]
    );
  } catch (e) {
    console.error("[admin/academic/career/streams createAction]", e);
  }
  revalidatePath("/admin/academic/career/streams");
  revalidatePath("/", "layout");
}

async function updateCareer(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const functionalarea_id = parseInt(formData.get("functionalarea_id") as string, 10);
  const descrition = formData.get("descrition") as string; // Typo in DB
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!id || !title || isNaN(functionalarea_id)) return;

  try {
    await pool.query(
      `UPDATE counseling_career_details SET title = ?, slug = ?, functionalarea_id = ?, descrition = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, slug, functionalarea_id, descrition, status, id]
    );
  } catch (e) {
    console.error("[admin/academic/career/streams updateAction]", e);
  }
  revalidatePath("/admin/academic/career/streams");
  revalidatePath("/", "layout");
}

async function deleteCareer(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_career_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/streams deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/streams");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career/streams safeQuery]", err);
    return [];
  }
}

interface CareerStreamRow  {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  descrition: string | null;
  functionalarea_id: number;
  stream_name: string;
  created_at: string;
  updated_at: string;
}

interface StreamOption  {
  id: number;
  name: string;
}

export default async function CareerStreamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE c.title LIKE ? OR c.slug LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const [careerStreams, streams] = await Promise.all([
    safeQuery<CareerStreamRow>(
      `SELECT c.*, f.name as stream_name
       FROM counseling_career_details c
       LEFT JOIN functionalarea f ON f.id = c.functionalarea_id
       ${where}
       ORDER BY c.id DESC
       LIMIT 200`,
      params
    ),
    safeQuery<StreamOption>("SELECT id, name FROM functionalarea ORDER BY name ASC"),
  ]);

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full font-sans">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search careers or slugs..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <CareerStreamListClient 
        careerStreams={careerStreams}
        streams={streams}
        createCareer={createCareer}
        updateCareer={updateCareer}
        deleteCareer={deleteCareer}
      />
    </div>
  );
}




