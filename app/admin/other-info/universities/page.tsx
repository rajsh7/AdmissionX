import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import OtherInfoUniversityClient from "./OtherInfoUniversityClient";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function createUniversity(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const imageFile = formData.get("image_file") as File;

  let image = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);
    image = fileName;
  }

  try {
    await pool.query(
      "INSERT INTO university (name, image, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, image]
    );
  } catch (e) {
    console.error("[admin/other-info/universities createAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
}

async function updateUniversity(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const imageFile = formData.get("image_file") as File;
  const existingImage = formData.get("image_existing") as string;

  let image = existingImage;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);
    image = fileName;
  }

  try {
    await pool.query(
      "UPDATE university SET name = ?, image = ?, updated_at = NOW() WHERE id = ?",
      [name, image, id]
    );
  } catch (e) {
    console.error("[admin/other-info/universities updateAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
}

async function deleteUniversity(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM university WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/other-info/universities deleteAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/other-info/universities safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UniversityRow {
  id: number;
  name: string;
  image: string | null;
}

interface CountRow {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OtherInfoUniversityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q || "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q ? "WHERE name LIKE ?" : "";
  const params = q ? [`%${q}%`] : [];

  const { getDb } = await import("@/lib/db");
  const db  = await getDb();
  const col = db.collection("university");
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};

  const [docs, total] = await Promise.all([
    col.find(filter).sort({ name: 1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    col.countDocuments(filter),
  ]);

  const universities: UniversityRow[] = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    name: String(d.name ?? "").trim(),
    image: (d.logoimage && String(d.logoimage).trim() !== "NULL") ? String(d.logoimage).trim() : null,
  }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>account_balance</span>
            Universities Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the list of universities available for academic mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} records
          </span>
          <form method="GET" className="relative max-w-sm w-full">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
             <input 
               name="q" 
               defaultValue={q}
               placeholder="Search universities..." 
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
             />
          </form>
        </div>
      </div>

      <OtherInfoUniversityClient 
        data={universities}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        createUniversity={createUniversity}
        updateUniversity={updateUniversity}
        deleteUniversity={deleteUniversity}
      />
    </div>
  );
}
