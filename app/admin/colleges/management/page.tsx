import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ManagementListClient from "./ManagementListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createManagementMember(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name              = formData.get("name");
  const suffix            = formData.get("suffix")      || null;
  const designation       = formData.get("designation") || null;
  const email             = formData.get("emailaddress") || null;
  const phone             = formData.get("phoneno")      || null;
  const picture           = formData.get("picture")     || null;

  try {
    await pool.query(
      `INSERT INTO college_management_details 
        (collegeprofile_id, name, suffix, designation, emailaddress, phoneno, picture, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, name, suffix, designation, email, phone, picture],
    );
  } catch (e) {
    console.error("[admin/colleges/management createAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

async function updateManagementMember(formData: FormData) {
  "use server";
  const id                = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name              = formData.get("name");
  const suffix            = formData.get("suffix")      || null;
  const designation       = formData.get("designation") || null;
  const email             = formData.get("emailaddress") || null;
  const phone             = formData.get("phoneno")      || null;
  const picture           = formData.get("picture")     || null;

  try {
    await pool.query(
      `UPDATE college_management_details 
          SET collegeprofile_id = ?, name = ?, suffix = ?, designation = ?, 
              emailaddress = ?, phoneno = ?, picture = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, name, suffix, designation, email, phone, picture, id],
    );
  } catch (e) {
    console.error("[admin/colleges/management updateAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

async function deleteManagementRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_management_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/management deleteAction]", e);
  }
  revalidatePath("/admin/colleges/management");
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
    console.error("[admin/colleges/management safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManagementRow  {
  id: number;
  collegeprofile_id: number;
  name: string;
  suffix: string;
  designation: string;
  emailaddress: string;
  phoneno: string;
  picture: string;
  college_name: string;
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

export default async function CollegeManagementPage({
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

  const collegeId = sp.collegeId ?? "";

  if (q) {
    conditions.push(
      "(m.name LIKE ? OR m.designation LIKE ? OR u.firstname LIKE ? OR m.emailaddress LIKE ? OR m.phoneno LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (collegeId) {
    conditions.push("m.collegeprofile_id = ?");
    filterParams.push(collegeId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch metadata + data ──────────────────────────────────────────────────
  const [members, countRows, colleges] = await Promise.all([
    safeQuery<ManagementRow>(
      `SELECT 
        m.id,
        m.collegeprofile_id,
        m.name,
        m.suffix,
        m.designation,
        m.emailaddress,
        m.phoneno,
        m.picture,
        COALESCE(u.firstname, 'Unnamed College') as college_name
       FROM college_management_details m
       JOIN collegeprofile cp ON cp.id = m.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_management_details m 
       JOIN collegeprofile cp ON cp.id = m.collegeprofile_id
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

  // Deeply map to plain objects to strip hidden Buffer/Date fields from the DB shim
  const cleanMembers = members.map((m: any, idx: number) => ({
    id: Number(m.id) || (idx + 1),
    collegeprofile_id: Number(m.collegeprofile_id),
    name: String(m.name || ""),
    suffix: String(m.suffix || ""),
    designation: String(m.designation || ""),
    emailaddress: String(m.emailaddress || ""),
    phoneno: String(m.phoneno || ""),
    picture: String(m.picture || ""),
    college_name: String(m.college_name || "")
  }));

  const cleanColleges = colleges.map((c: any, idx: number) => ({
    id: Number(c.id) || (idx + 1),
    name: String(c.name || "")
  }));

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      
      {/* ── Header Area (Search Box Match Design) ───────────────────── */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 mb-6">
        <h1 className="text-[22px] font-semibold text-slate-500 mb-8 border-b border-slate-100 pb-3">
          Search College  Management Details
        </h1>
        
        <form method="GET" action="/admin/colleges/management" className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-8">
          {/* College Name Select */}
          <div className="relative flex-1 w-full relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-semibold text-slate-500">
              College Name
            </label>
            <select
              name="collegeId"
              defaultValue={collegeId}
              className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              <option value="">Select college</option>
              {cleanColleges.map((c, idx) => (
                <option key={`college-opt-${c.id}-${idx}`} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-rounded text-xl">
              keyboard_arrow_down
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-semibold text-slate-500">
              Search
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Enter name, email, phone..."
              className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-600 bg-transparent focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 w-full sm:w-auto h-[46px]">
            <Link
              href="/admin/colleges/management"
              className="flex items-center justify-center px-6 h-full rounded-md bg-[#9CA3AF] hover:bg-[#8A9ba8] text-white font-medium text-[15px] transition-colors w-full sm:w-auto min-w-[100px]"
            >
              Clear
            </Link>
            <button
              type="submit"
              className="flex items-center justify-center px-6 h-full rounded-md bg-[#FF3C3C] hover:bg-red-600 text-white font-medium text-[15px] transition-colors w-full sm:w-auto min-w-[100px]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <ManagementListClient
        members={cleanMembers}
        colleges={cleanColleges}
        offset={offset}
        onAdd={createManagementMember}
        onEdit={updateManagementMember}
        onDelete={deleteManagementRow}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> records
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={`/admin/colleges/management?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/admin/colleges/management?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




