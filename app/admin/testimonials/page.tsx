import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import { saveUpload } from "@/lib/upload-utils";
import TestimonialListClient from "./TestimonialListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function createTestimonial(formData: FormData) {
  "use server";
  const author   = formData.get("author") as string;
  const misc     = formData.get("misc") as string;
  const title    = formData.get("title") as string;
  const slug     = formData.get("slug") as string;
  const desc     = formData.get("description") as string;
  const imgFile  = formData.get("image_file") as File;

  let featuredimage = null;
  if (imgFile && imgFile.size > 0) {
    featuredimage = await saveUpload(imgFile, "testimonials", "testimonial");
  }

  if (!author || !desc) return;

  try {
    await pool.query(
      `INSERT INTO testimonials 
       (author, misc, title, slug, description, featuredimage, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [author, misc || null, title || null, slug || null, desc, featuredimage || null]
    );
  } catch (e) {
    console.error("[admin/testimonials createAction]", e);
  }
  revalidatePath("/admin/testimonials");
}

async function updateTestimonial(formData: FormData) {
  "use server";
  const id     = parseInt(formData.get("id") as string, 10);
  const author = formData.get("author") as string;
  const misc   = formData.get("misc") as string;
  const title  = formData.get("title") as string;
  const slug   = formData.get("slug") as string;
  const desc   = formData.get("description") as string;
  const imgFile = formData.get("image_file") as File;
  let featuredimage = formData.get("featuredimage") as string;

  if (imgFile && imgFile.size > 0) {
    featuredimage = await saveUpload(imgFile, "testimonials", "testimonial");
  }

  if (!id || !author) return;

  try {
    await pool.query(
      `UPDATE testimonials 
       SET author = ?, misc = ?, title = ?, slug = ?, description = ?, featuredimage = ?, updated_at = NOW() 
       WHERE id = ?`,
      [author, misc || null, title || null, slug || null, desc, featuredimage || null, id]
    );
  } catch (e) {
    console.error("[admin/testimonials updateAction]", e);
  }
  revalidatePath("/admin/testimonials");
}

async function deleteTestimonial(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/testimonials deleteAction]", e);
  }
  revalidatePath("/admin/testimonials");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/testimonials safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestimonialRow extends RowDataPacket {
  id: number;
  author: string;
  misc: string;
  title: string;
  slug: string;
  description: string;
  featuredimage: string;
  created_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const PAGE_SIZE = 25;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(author LIKE ? OR title LIKE ? OR description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [testimonials, countRows] = await Promise.all([
    safeQuery<TestimonialRow>(
      `SELECT * FROM testimonials ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM testimonials ${where}`,
      params,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>format_quote</span>
            User Testimonials
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and showcase positive feedback from students and parents.</p>
        </div>
        <form method="GET" action="/admin/testimonials" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Search testimonials..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>
        </form>
      </div>

      <TestimonialListClient 
        data={testimonials}
        createAction={createTestimonial}
        updateAction={updateTestimonial}
        deleteAction={deleteTestimonial}
        offset={offset}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong className="text-slate-800">{total}</strong> testimonials
          </p>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <a href={`/admin/testimonials?page=${page - 1}${q ? `&q=${q}` : ""}`} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_left</span>
              </a>
            )}
            {page < totalPages && (
              <a href={`/admin/testimonials?page=${page + 1}${q ? `&q=${q}` : ""}`} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                <span className="material-symbols-rounded text-[18px]" style={ICO}>chevron_right</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
