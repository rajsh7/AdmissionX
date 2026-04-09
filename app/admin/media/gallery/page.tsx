import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import GalleryClient from "./GalleryClient";
import { saveUpload } from "@/lib/upload-utils";

// --- Server Actions -----------------------------------------------------------

async function deleteGalleryItem(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM gallery WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/gallery deleteAction]", e);
  }
  revalidatePath("/admin/media/gallery");
  revalidatePath("/", "layout");
}

async function createGalleryItem(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("fullimage_file") as File;
    let fullimage = "";

    if (bannerFile && bannerFile.size > 0) {
      const publicUrl = await saveUpload(bannerFile, "gallery", "photo");
      fullimage = publicUrl.replace("/uploads/", "");
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      INSERT INTO gallery (name, caption, fullimage, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    await pool.query(sql, [
      data.name, 
      data.caption, 
      fullimage
    ]);
  } catch (e) {
    console.error("[admin/gallery createAction]", e);
  }
  revalidatePath("/admin/media/gallery");
  revalidatePath("/", "layout");
}

async function updateGalleryItem(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("fullimage_file") as File;
    let fullimage = formData.get("fullimage_existing") as string;

    if (bannerFile && bannerFile.size > 0) {
      const publicUrl = await saveUpload(bannerFile, "gallery", "photo");
      fullimage = publicUrl.replace("/uploads/", "");
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      UPDATE gallery SET 
        name = ?, 
        caption = ?, 
        fullimage = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    await pool.query(sql, [
      data.name, 
      data.caption, 
      fullimage,
      data.id
    ]);
  } catch (e) {
    console.error("[admin/gallery updateAction]", e);
  }
  revalidatePath("/admin/media/gallery");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/media/gallery safeQuery]", err);
    return [];
  }
}

interface GalleryRow  {
  id: number;
  name: string;
  fullimage: string | null;
  caption: string | null;
  users_id: number | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE name LIKE ? OR caption LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<GalleryRow>(
    `SELECT id, name, fullimage, caption, users_id
     FROM gallery
     ${where}
     ORDER BY id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>gallery_thumbnail</span>
            Gallery & Photos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage photos, captions, and the media gallery.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search items..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <GalleryClient 
        items={data}
        onAdd={createGalleryItem}
        onEdit={updateGalleryItem}
        onDelete={deleteGalleryItem}
      />
    </div>
  );
}




