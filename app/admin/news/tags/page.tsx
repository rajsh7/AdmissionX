import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import NewsTagListClient from "./NewsTagListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createNewsTag(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name) return;

  try {
    await pool.query(
      "INSERT INTO news_tags (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, slug || null]
    );
  } catch (e) {
    console.error("[admin/news/tags createAction]", e);
  }
  revalidatePath("/admin/news/tags");
}

async function updateNewsTag(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!id || !name) return;

  try {
    await pool.query(
      "UPDATE news_tags SET name = ?, slug = ?, updated_at = NOW() WHERE id = ?",
      [name, slug || null, id]
    );
  } catch (e) {
    console.error("[admin/news/tags updateAction]", e);
  }
  revalidatePath("/admin/news/tags");
}

async function deleteNewsTag(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM news_tags WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/news/tags deleteAction]", e);
  }
  revalidatePath("/admin/news/tags");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getNewsTags(q?: string) {
  try {
    const where = q ? "WHERE name LIKE ? OR slug LIKE ?" : "";
    const params = q ? [`%${q}%`, `%${q}%`] : [];
    const [rows] = await pool.query(
      `SELECT id, name, slug FROM news_tags ${where} ORDER BY id DESC`,
      params
    );
    return rows as any[];
  } catch (e) {
    console.error("[admin/news/tags getNewsTags]", e);
    return [];
  }
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function NewsTagsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const data = await getNewsTags(q);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-500 text-[22px]" style={ICO_FILL}>tag</span>
            News Tags
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage tags for news articles.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search tags..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
           />
        </form>
      </div>

      <NewsTagListClient 
        data={data}
        createAction={createNewsTag}
        updateAction={updateNewsTag}
        deleteAction={deleteNewsTag}
      />
    </div>
  );
}




