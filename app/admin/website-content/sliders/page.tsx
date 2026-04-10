import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminImg from "@/app/admin/_components/AdminImg";
import SlidersClient from "./SlidersClient";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload-utils";
import path from "path";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteSlider(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM sliders WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/sliders deleteAction]", e);
  }
  revalidatePath("/admin/website-content/sliders");
  revalidatePath("/", "layout");
}

async function createSlider(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("sliderImage_file") as File;
    let sliderImage = "";

    if (bannerFile && bannerFile.size > 0) {
      const publicUrl = await saveUpload(bannerFile, "sliders", "slider");
      sliderImage = path.basename(publicUrl);
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      INSERT INTO sliders (sliderTitle, bottomText, sliderImage, status, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await pool.query(sql, [
      data.sliderTitle, 
      data.bottomText, 
      sliderImage, 
      data.status
    ]);
  } catch (e) {
    console.error("[admin/sliders createAction]", e);
  }
  revalidatePath("/admin/website-content/sliders");
  revalidatePath("/", "layout");
}

async function updateSlider(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("sliderImage_file") as File;
    let sliderImage = formData.get("sliderImage_existing") as string;

    if (bannerFile && bannerFile.size > 0) {
      const publicUrl = await saveUpload(bannerFile, "sliders", "slider");
      sliderImage = path.basename(publicUrl);
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      UPDATE sliders SET 
        sliderTitle = ?, 
        bottomText = ?, 
        sliderImage = ?, 
        status = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    await pool.query(sql, [
      data.sliderTitle, 
      data.bottomText, 
      sliderImage, 
      data.status,
      data.id
    ]);
  } catch (e) {
    console.error("[admin/sliders updateAction]", e);
  }
  revalidatePath("/admin/website-content/sliders");
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
    console.error("[admin/website-content/sliders safeQuery]", err);
    return [];
  }
}

interface SliderRow  {
  id: number;
  sliderTitle: string | null;
  bottomText: string | null;
  sliderImage: string | null;
  status: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function SliderManagerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE sliderTitle LIKE ? OR bottomText LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<SliderRow>(
    `SELECT id, sliderTitle, bottomText, sliderImage, status
     FROM slider_managers
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
            <span className="material-symbols-rounded text-amber-600 text-[22px]" style={ICO_FILL}>gallery_thumbnail</span>
            Slider Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the homepage hero sliders and their content.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search sliders..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
           />
        </form>
      </div>

      <SlidersClient 
        sliders={data}
        onAdd={createSlider}
        onEdit={updateSlider}
        onDelete={deleteSlider}
      />
    </div>
  );
}




