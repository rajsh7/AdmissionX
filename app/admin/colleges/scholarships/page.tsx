import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ScholarshipListClient from "./ScholarshipListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createScholarship(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `INSERT INTO college_scholarships (collegeprofile_id, title, description, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, title, description],
    );
  } catch (e) {
    console.error("[admin/colleges/scholarships createAction]", e);
  }
  revalidatePath("/admin/colleges/scholarships");
}

async function updateScholarship(formData: FormData) {
  "use server";
  const id                = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `UPDATE college_scholarships 
          SET collegeprofile_id = ?, title = ?, description = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, title, description, id],
    );
  } catch (e) {
    console.error("[admin/colleges/scholarships updateAction]", e);
  }
  revalidatePath("/admin/colleges/scholarships");
}

async function deleteScholarshipRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_scholarships WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/scholarships deleteAction]", e);
  }
  revalidatePath("/admin/colleges/scholarships");
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
    console.error("[admin/colleges/scholarships safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScholarshipRow  {
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

export default async function CollegeScholarshipsPage({
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
      "(u.firstname LIKE ? OR s.title LIKE ? OR s.description LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch metadata + data ──────────────────────────────────────────────────
  const [scholarships, countRows, colleges] = await Promise.all([
    safeQuery<ScholarshipRow>(
      `SELECT 
        s.id,
        s.collegeprofile_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        s.title,
        s.description
       FROM college_scholarships s
       JOIN collegeprofile cp ON cp.id = s.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_scholarships s 
       JOIN collegeprofile cp ON cp.id = s.collegeprofile_id
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
    <div className="p-6 space-y-6 w-full">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>redeem</span>
            Scholarship programs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage financial aid, eligibility, and scholarship awards.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/scholarships" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search scholarships, colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <ScholarshipListClient
        scholarships={scholarships}
        colleges={colleges}
        offset={offset}
        total={total}
        pageSize={PAGE_SIZE}
        onAdd={createScholarship}
        onDelete={deleteScholarshipRow}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> records
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={`/admin/colleges/scholarships?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/admin/colleges/scholarships?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




