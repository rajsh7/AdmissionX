import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import CourseListClient from "./CourseListClient";

async function createCourse(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `INSERT INTO collegemaster (collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [formData.get("collegeprofile_id"), formData.get("course_id") || null, formData.get("degree_id") || null, formData.get("functionalarea_id") || null, formData.get("fees") || null, formData.get("seats") || null, formData.get("courseduration") || null],
    );
  } catch (e) { console.error("[admin/colleges/courses createAction]", e); }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

async function updateCourse(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `UPDATE collegemaster SET collegeprofile_id=?, course_id=?, degree_id=?, functionalarea_id=?, fees=?, seats=?, courseduration=?, updated_at=NOW() WHERE id=?`,
      [formData.get("collegeprofile_id"), formData.get("course_id") || null, formData.get("degree_id") || null, formData.get("functionalarea_id") || null, formData.get("fees") || null, formData.get("seats") || null, formData.get("courseduration") || null, formData.get("id")],
    );
  } catch (e) { console.error("[admin/colleges/courses updateAction]", e); }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

async function deleteCourse(id: number) {
  "use server";
  try { await pool.query("DELETE FROM collegemaster WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/courses deleteAction]", e); }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 25;

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/courses safeQuery]", err); return []; }
}

interface CourseRow { id: number; collegeprofile_id: number; course_id: number | null; degree_id: number | null; functionalarea_id: number | null; college_name: string; course_name: string | null; degree_name: string | null; stream_name: string | null; fees: string | null; seats: string | null; courseduration: string | null; }
interface CountRow { total: number; }
interface OptionRow { id: number; name: string; }

export default async function CollegeCoursesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset    = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const filterParams: (string | number)[] = [];
  if (q) { conditions.push("(u.firstname LIKE ? OR c.name LIKE ? OR d.name LIKE ? OR fa.name LIKE ?)"); filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("cm.collegeprofile_id = ?"); filterParams.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const BASE_JOIN = `FROM collegemaster cm JOIN collegeprofile cp ON cp.id=cm.collegeprofile_id JOIN users u ON u.id=cp.users_id LEFT JOIN course c ON c.id=cm.course_id LEFT JOIN degree d ON d.id=cm.degree_id LEFT JOIN functionalarea fa ON fa.id=cm.functionalarea_id`;

  const [courses, countRows, colleges, courseOptions, degrees, streams, collegeOptions] = await Promise.all([
    safeQuery<CourseRow>(
      `SELECT cm.id, cm.collegeprofile_id, cm.course_id, cm.degree_id, cm.functionalarea_id, COALESCE(u.firstname,'Unnamed College') AS college_name, c.name AS course_name, d.name AS degree_name, fa.name AS stream_name, cm.fees, cm.seats, cm.courseduration ${BASE_JOIN} ${where} ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total ${BASE_JOIN} ${where}`, filterParams),
    safeQuery<OptionRow>("SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id=cp.users_id ORDER BY u.firstname ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM course ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM degree ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM functionalarea ORDER BY name ASC"),
    fetchCollegeOptions(),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const cleanCourses      = (courses as any[]).map((c, i) => ({ id: Number(c.id)||(i+1), collegeprofile_id: Number(c.collegeprofile_id)||0, course_id: c.course_id?Number(c.course_id):null, degree_id: c.degree_id?Number(c.degree_id):null, functionalarea_id: c.functionalarea_id?Number(c.functionalarea_id):null, college_name: String(c.college_name||"Unnamed College"), course_name: c.course_name?String(c.course_name):null, degree_name: c.degree_name?String(c.degree_name):null, stream_name: c.stream_name?String(c.stream_name):null, fees: c.fees?String(c.fees):null, seats: c.seats?String(c.seats):null, courseduration: c.courseduration?String(c.courseduration):null }));
  const cleanColleges     = (colleges as any[]).map((c, i) => ({ id: Number(c.id)||(i+1), name: String(c.name||"") }));
  const cleanCourseOptions= (courseOptions as any[]).map((c, i) => ({ id: Number(c.id)||(i+1), name: String(c.name||"") }));
  const cleanDegrees      = (degrees as any[]).map((d, i) => ({ id: Number(d.id)||(i+1), name: String(d.name||"") }));
  const cleanStreams       = (streams as any[]).map((s, i) => ({ id: Number(s.id)||(i+1), name: String(s.name||"") }));

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (collegeId) qs.set("collegeId", collegeId);
    qs.set("page", String(p));
    return `/admin/colleges/courses?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar
        colleges={collegeOptions}
        selectedId={collegeId}
        total={total}
        label="College Courses"
        icon="menu_book"
        description="Manage courses offered by each college — filter by college to see classified data."
      />

      <CourseListClient
        courses={cleanCourses}
        colleges={cleanColleges}
        courseOptions={cleanCourseOptions}
        degrees={cleanDegrees}
        streams={cleanStreams}
        offset={offset}
        onAdd={createCourse}
        onEdit={updateCourse}
        onDelete={deleteCourse}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> courses
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>}
          </div>
        </div>
      )}
    </div>
  );
}
