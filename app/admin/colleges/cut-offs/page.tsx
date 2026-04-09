import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import CutOffListClient from "./CutOffListClient";

// --- Server Actions -----------------------------------------------------------

async function createCutOff(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const course_id         = formData.get("course_id") || null;
  const degree_id         = formData.get("degree_id") || null;
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `INSERT INTO college_cut_offs 
        (collegeprofile_id, course_id, degree_id, title, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, course_id, degree_id, title, description],
    );
  } catch (e) {
    console.error("[admin/colleges/cut-offs createAction]", e);
  }
  revalidatePath("/admin/colleges/cut-offs");
}

async function updateCutOff(formData: FormData) {
  "use server";
  const id                = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const course_id         = formData.get("course_id") || null;
  const degree_id         = formData.get("degree_id") || null;
  const title             = formData.get("title");
  const description       = formData.get("description") || null;

  try {
    await pool.query(
      `UPDATE college_cut_offs 
          SET collegeprofile_id = ?, course_id = ?, degree_id = ?, title = ?, description = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, course_id, degree_id, title, description, id],
    );
  } catch (e) {
    console.error("[admin/colleges/cut-offs updateAction]", e);
  }
  revalidatePath("/admin/colleges/cut-offs");
}

async function deleteCutOffRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_cut_offs WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/cut-offs deleteAction]", e);
  }
  revalidatePath("/admin/colleges/cut-offs");
}

// --- Helpers ------------------------------------------------------------------

const PAGE_SIZE = 25;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/cut-offs safeQuery]", err);
    return [];
  }
}

// --- Types --------------------------------------------------------------------

interface CutOffRow  {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
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

// --- Page ---------------------------------------------------------------------

export default async function CollegeCutOffsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const collegeId = (sp.collegeId ?? "").trim();
  const courseId = (sp.courseId ?? "").trim();
  const degreeId = (sp.degreeId ?? "").trim();
  const title = (sp.title ?? "").trim();
  const description = (sp.description ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // -- Build WHERE clause -----------------------------------------------------
  const conditions: string[] = [];
  const filterParams: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR c.name LIKE ? OR d.name LIKE ? OR co.title LIKE ? OR co.description LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (collegeId) {
    conditions.push("co.collegeprofile_id = ?");
    filterParams.push(collegeId);
  }

  if (courseId) {
    conditions.push("co.course_id = ?");
    filterParams.push(courseId);
  }

  if (degreeId) {
    conditions.push("co.degree_id = ?");
    filterParams.push(degreeId);
  }

  if (title) {
    conditions.push("co.title LIKE ?");
    filterParams.push(`%${title}%`);
  }

  if (description) {
    conditions.push("co.description LIKE ?");
    filterParams.push(`%${description}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // -- Fetch metadata + data --------------------------------------------------
  const [cutOffs, countRows, colleges, courses, degrees] = await Promise.all([
    safeQuery<CutOffRow>(
      `SELECT 
        co.id,
        co.collegeprofile_id,
        co.course_id,
        co.degree_id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        c.name as course_name,
        d.name as degree_name,
        co.title,
        co.description
       FROM college_cut_offs co
       JOIN collegeprofile cp ON cp.id = co.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = co.course_id
       LEFT JOIN degree d ON d.id = co.degree_id
       ${where}
       ORDER BY co.created_at DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_cut_offs co 
       JOIN collegeprofile cp ON cp.id = co.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = co.course_id
       LEFT JOIN degree d ON d.id = co.degree_id
       ${where}`,
      filterParams,
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC"
    ),
    safeQuery<OptionRow>("SELECT id, name FROM course ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM degree ORDER BY name ASC"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (q) query.set("q", q);
    if (collegeId) query.set("collegeId", collegeId);
    if (courseId) query.set("courseId", courseId);
    if (degreeId) query.set("degreeId", degreeId);
    if (title) query.set("title", title);
    if (description) query.set("description", description);
    return `/admin/colleges/cut-offs?${query.toString()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* -- Header --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>data_exploration</span>
            Course cut offs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage historical qualifying marks and admission trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/cut-offs" className="w-full sm:w-80">
            {collegeId ? <input type="hidden" name="collegeId" value={collegeId} /> : null}
            {courseId ? <input type="hidden" name="courseId" value={courseId} /> : null}
            {degreeId ? <input type="hidden" name="degreeId" value={degreeId} /> : null}
            {title ? <input type="hidden" name="title" value={title} /> : null}
            {description ? <input type="hidden" name="description" value={description} /> : null}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search cut-offs, colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <CutOffListClient
        cutoffs={cutOffs}
        colleges={colleges}
        courses={courses}
        degrees={degrees}
        offset={offset}
        total={total}
        pageSize={PAGE_SIZE}
        searchQuery={q}
        selectedCollegeId={collegeId}
        selectedCourseId={courseId}
        selectedDegreeId={degreeId}
        selectedTitle={title}
        selectedDescription={description}
        onAdd={createCutOff}
        onDelete={deleteCutOffRow}
      />

      {/* -- Pagination ----------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> records
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={buildPageHref(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={buildPageHref(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




