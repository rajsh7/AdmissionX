import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AdmissionListClient from "./AdmissionListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createAdmission(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `INSERT INTO college_admission_procedures (collegeprofile_id, title, description, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, title, description],
    );
  } catch (e) {
    console.error("[admin/colleges/admission createAction]", e);
  }
  revalidatePath("/admin/colleges/admission");
}

async function updateAdmission(formData: FormData) {
  "use server";
  const id                = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `UPDATE college_admission_procedures 
          SET collegeprofile_id = ?, title = ?, description = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, title, description, id],
    );
  } catch (e) {
    console.error("[admin/colleges/admission updateAction]", e);
  }
  revalidatePath("/admin/colleges/admission");
}

async function deleteAdmissionRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_admission_procedures WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/admission deleteAction]", e);
  }
  revalidatePath("/admin/colleges/admission");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/admission safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdmissionRow  {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  title: string;
  description: string;
}

interface CountRow  {
  total: number;
}

interface OptionRow  {
  id: number;
  name: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeAdmissionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const filterParams: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR ap.title LIKE ? OR ap.description LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch everything in parallel ──────────────────────────────────────────
  const [admissions, countRows, colleges] = await Promise.all([
    safeQuery<AdmissionRow>(
      `SELECT 
        ap.id,
        ap.collegeprofile_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        ap.title,
        ap.description
       FROM college_admission_procedures ap
       JOIN collegeprofile cp ON cp.id = ap.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY ap.created_at DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_admission_procedures ap 
       JOIN collegeprofile cp ON cp.id = ap.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}`,
      filterParams,
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC"
    )
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>assignment_ind</span>
            Admission procedures
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage enrollment workflows and step-by-step admission guidelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/admission" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search procedures, colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <AdmissionListClient
        admissions={admissions}
        colleges={colleges}
        offset={offset}
        onAdd={createAdmission}
        onEdit={updateAdmission}
        onDelete={deleteAdmissionRow}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> procedures
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={`/admin/colleges/admission?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/admin/colleges/admission?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




