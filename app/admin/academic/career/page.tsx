import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import CareerListClient from "./CareerListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function createCareer(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;
  const status = formData.get("status") || "1";
  const salary = formData.get("salery") as string; // Match DB typo
  const mandatorySubject = formData.get("mandatorySubject") as string;
  const academicDifficulty = formData.get("academicDifficulty") as string;
  const careerInterest = formData.get("careerInterest") as string;
  const functionalarea_id = formData.get("functionalarea_id") as string;
  const slug = formData.get("slug") as string;

  if (!title) return;

  try {
    await pool.query(
      `INSERT INTO counseling_career_relevants 
       (title, description, image, status, salery, mandatorySubject, academicDifficulty, careerInterest, functionalarea_id, slug, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description || null, image || null, status, salary || null, mandatorySubject || null, academicDifficulty || null, careerInterest || null, functionalarea_id || null, slug || null]
    );
  } catch (e) {
    console.error("[admin/academic/career createAction]", e);
  }
  revalidatePath("/admin/academic/career");
  revalidatePath("/", "layout");
}

async function updateCareer(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;
  const status = formData.get("status") || "1";
  const salary = formData.get("salery") as string; // Match DB typo
  const mandatorySubject = formData.get("mandatorySubject") as string;
  const academicDifficulty = formData.get("academicDifficulty") as string;
  const careerInterest = formData.get("careerInterest") as string;
  const functionalarea_id = formData.get("functionalarea_id") as string;
  const slug = formData.get("slug") as string;

  if (!id || !title) return;

  try {
    await pool.query(
      `UPDATE counseling_career_relevants 
       SET title = ?, description = ?, image = ?, status = ?, salery = ?, mandatorySubject = ?, academicDifficulty = ?, careerInterest = ?, functionalarea_id = ?, slug = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, description || null, image || null, status, salary || null, mandatorySubject || null, academicDifficulty || null, careerInterest || null, functionalarea_id || null, slug || null, id]
    );
  } catch (e) {
    console.error("[admin/academic/career updateAction]", e);
  }
  revalidatePath("/admin/academic/career");
  revalidatePath("/", "layout");
}

async function deleteCareer(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM counseling_career_relevants WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career deleteAction]", e);
  }
  revalidatePath("/admin/academic/career");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career safeQuery]", err);
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp       = await searchParams;
  const q        = (sp.q ?? "").trim();
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset   = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(title LIKE ? OR slug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [careers, countRows] = await Promise.all([
    safeQuery<any>(
      `SELECT * FROM counseling_career_relevants
       ${where}
       ORDER BY title ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<any>(
      `SELECT COUNT(*) AS total FROM counseling_career_relevants ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 text-rose-600">
            <span className="material-symbols-rounded text-[22px]" style={ICO_FILL}>work</span>
            Career Opportunities Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage detailed career paths, salary expectations, and academic requirements.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} career paths
          </span>
        </div>
      </div>

      <CareerListClient 
        data={careers}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        createAction={createCareer}
        updateAction={updateCareer}
        deleteAction={deleteCareer}
      />
    </div>
  );
}
