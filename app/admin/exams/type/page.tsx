import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import ExamTypeListClient from "./ExamTypeListClient";

// --- Server Actions -----------------------------------------------------------

async function createExamType(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;

  if (!name) return;

  try {
    await pool.query(
      "INSERT INTO examination_types (name, slug, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [name, slug || null, status]
    );
  } catch (e) {
    console.error("[admin/exams/type createAction]", e);
  }
  revalidatePath("/admin/exams/type");
}

async function updateExamType(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;

  if (!id || !name) return;

  try {
    await pool.query(
      "UPDATE examination_types SET name = ?, slug = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [name, slug || null, status, id]
    );
  } catch (e) {
    console.error("[admin/exams/type updateAction]", e);
  }
  revalidatePath("/admin/exams/type");
}

async function deleteType(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM examination_types WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/type deleteAction]", e);
  }
  revalidatePath("/admin/exams/type");
  revalidatePath("/", "layout");
}

// --- Helpers ------------------------------------------------------------------

async function getExamTypes(q?: string) {
  try {
    const where = q ? "WHERE name LIKE ? OR slug LIKE ?" : "";
    const params = q ? [`%${q}%`, `%${q}%`] : [];
    const [rows] = await pool.query(
      `SELECT id, name, slug, status FROM examination_types ${where} ORDER BY id DESC`,
      params
    );
    return rows as any[];
  } catch (e) {
    console.error("[admin/exams/type getExamTypes]", e);
    return [];
  }
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// --- Page Component ----------------------------------------------------------

export default async function ExamTypePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const data = await getExamTypes(q);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-cyan-600 text-[22px]" style={ICO_FILL}>category</span>
            Examination Type
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage categories/types of examinations (e.g., National, State).</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search types or slugs..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
           />
        </form>
      </div>

      <ExamTypeListClient 
        data={data}
        createAction={createExamType}
        updateAction={updateExamType}
        deleteAction={deleteType}
      />
    </div>
  );
}




