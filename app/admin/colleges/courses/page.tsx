import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import CourseListClient from "./CourseListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createCourse(formData: FormData) {
  "use server";
  const collegeprofile_id  = formData.get("collegeprofile_id");
  const course_id          = formData.get("course_id")          || null;
  const degree_id          = formData.get("degree_id")          || null;
  const functionalarea_id  = formData.get("functionalarea_id")  || null;
  const fees               = formData.get("fees")               || null;
  const seats              = formData.get("seats")              || null;
  const courseduration     = formData.get("courseduration")     || null;

  try {
    await pool.query(
      `INSERT INTO collegemaster
        (collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration],
    );
  } catch (e) {
    console.error("[admin/colleges/courses createAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

async function updateCourse(formData: FormData) {
  "use server";
  const id                 = formData.get("id");
  const collegeprofile_id  = formData.get("collegeprofile_id");
  const course_id          = formData.get("course_id")          || null;
  const degree_id          = formData.get("degree_id")          || null;
  const functionalarea_id  = formData.get("functionalarea_id")  || null;
  const fees               = formData.get("fees")               || null;
  const seats              = formData.get("seats")              || null;
  const courseduration     = formData.get("courseduration")     || null;

  try {
    await pool.query(
      `UPDATE collegemaster
          SET collegeprofile_id = ?, course_id = ?, degree_id = ?,
              functionalarea_id = ?, fees = ?, seats = ?, courseduration = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration, id],
    );
  } catch (e) {
    console.error("[admin/colleges/courses updateAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

async function deleteCourse(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM collegemaster WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/courses deleteAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
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
    console.error("[admin/colleges/courses safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseRow  {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
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

export default async function CollegeCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE clause ───────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const filterParams: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR c.name LIKE ? OR d.name LIKE ? OR fa.name LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const BASE_JOIN = `
     FROM collegemaster cm
     JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
     JOIN users u ON u.id = cp.users_id
     LEFT JOIN course c ON c.id = cm.course_id
     LEFT JOIN degree d ON d.id = cm.degree_id
     LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
  `;

  // ── Fetch everything in parallel ──────────────────────────────────────────
  const [courses, countRows, colleges, courseOptions, degrees, streams] =
    await Promise.all([
      safeQuery<CourseRow>(
        `SELECT
          cm.id,
          cm.collegeprofile_id,
          cm.course_id,
          cm.degree_id,
          cm.functionalarea_id,
          COALESCE(u.firstname, 'Unnamed College') AS college_name,
          c.name  AS course_name,
          d.name  AS degree_name,
          fa.name AS stream_name,
          cm.fees,
          cm.seats,
          cm.courseduration
         ${BASE_JOIN}
         ${where}
         ORDER BY cm.created_at DESC
         LIMIT ? OFFSET ?`,
        [...filterParams, PAGE_SIZE, offset],
      ),
      safeQuery<CountRow>(
        `SELECT COUNT(*) AS total ${BASE_JOIN} ${where}`,
        filterParams,
      ),
      // colleges for the dropdown
      safeQuery<OptionRow>(
        "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC",
      ),
      // course names
      safeQuery<OptionRow>("SELECT id, name FROM course ORDER BY name ASC"),
      // degrees
      safeQuery<OptionRow>("SELECT id, name FROM degree ORDER BY name ASC"),
      // streams / functional areas
      safeQuery<OptionRow>("SELECT id, name FROM functionalarea ORDER BY name ASC"),
    ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>menu_book</span>
            College Courses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage course programs offered by various colleges.
          </p>
        </div>
        <form method="GET" action="/admin/colleges/courses" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search colleges, courses…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </form>
      </div>

      {/* ── Client list (table + modal) ───────────────────────────────────── */}
      <CourseListClient
        courses={courses}
        colleges={colleges}
        courseOptions={courseOptions}
        degrees={degrees}
        streams={streams}
        offset={offset}
        onAdd={createCourse}
        onEdit={updateCourse}
        onDelete={deleteCourse}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of{" "}
            <strong>{total.toLocaleString()}</strong> courses
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link
                href={`/admin/colleges/courses?page=${page - 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/admin/colleges/courses?page=${page + 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




