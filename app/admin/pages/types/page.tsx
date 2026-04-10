import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import PageTypeListClient from "./PageTypeListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createPageType(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;

  if (!name) return;

  try {
    await pool.query(
      "INSERT INTO contentcategory (name, status, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, status]
    );
  } catch (e) {
    console.error("[admin/pages/types createAction]", e);
  }
  revalidatePath("/admin/pages/types");
}

async function updatePageType(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const status = parseInt(formData.get("status") as string, 10) || 0;

  if (!id || !name) return;

  try {
    await pool.query(
      "UPDATE contentcategory SET name = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [name, status, id]
    );
  } catch (e) {
    console.error("[admin/pages/types updateAction]", e);
  }
  revalidatePath("/admin/pages/types");
}

async function deletePageType(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM contentcategory WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/pages/types deleteAction]", e);
  }
  revalidatePath("/admin/pages/types");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getPageTypes() {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, status, created_at FROM contentcategory ORDER BY id DESC"
    );
    return rows as any[];
  } catch (e) {
    console.error("[admin/pages/types getPageTypes]", e);
    return [];
  }
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function PageTypesPage() {
  const data = await getPageTypes();

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-slate-600 text-[22px]" style={ICO_FILL}>category</span>
            Page Types
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Categorization of different page templates and structures.</p>
        </div>
      </div>

      <PageTypeListClient 
        data={data}
        createAction={createPageType}
        updateAction={updatePageType}
        deleteAction={deletePageType}
      />
    </div>
  );
}





