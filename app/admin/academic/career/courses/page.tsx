import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import CareerCourseListClient from "./CareerCourseListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createCourse(formData: FormData) {
  "use server";
  const courseName = formData.get("courseName") as string;
  const jobProfiles = formData.get("jobProfiles") as string;
  const avgSalery = formData.get("avgSalery") as string; // Typo in DB
  const topCompany = formData.get("topCompany") as string;
  const coursesDetailsId = parseInt(formData.get("coursesDetailsId") as string, 10);

  if (!courseName || isNaN(coursesDetailsId)) return;

  try {
    await pool.query(
      `INSERT INTO counseling_courses_job_careers (courseName, jobProfiles, avgSalery, topCompany, coursesDetailsId, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [courseName, jobProfiles, avgSalery, topCompany, coursesDetailsId]
    );
  } catch (e) {
    console.error("[admin/academic/career/courses createAction]", e);
  }
  revalidatePath("/admin/academic/career/courses");
  revalidatePath("/", "layout");
}

async function updateCourse(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const courseName = formData.get("courseName") as string;
  const jobProfiles = formData.get("jobProfiles") as string;
  const avgSalery = formData.get("avgSalery") as string; // Typo in DB
  const topCompany = formData.get("topCompany") as string;
  const coursesDetailsId = parseInt(formData.get("coursesDetailsId") as string, 10);

  if (!id || !courseName || isNaN(coursesDetailsId)) return;

  try {
    await pool.query(
      `UPDATE counseling_courses_job_careers SET courseName = ?, jobProfiles = ?, avgSalery = ?, topCompany = ?, coursesDetailsId = ?, updated_at = NOW() 
       WHERE id = ?`,
      [courseName, jobProfiles, avgSalery, topCompany, coursesDetailsId, id]
    );
  } catch (e) {
    console.error("[admin/academic/career/courses updateAction]", e);
  }
  revalidatePath("/admin/academic/career/courses");
  revalidatePath("/", "layout");
}

async function deleteCourse(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_courses_job_careers WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/courses deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/courses");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career/courses safeQuery]", err);
    return [];
  }
}

interface CareerCourseRow  {
  id: number;
  courseName: string;
  jobProfiles: string | null;
  avgSalery: string | null;
  topCompany: string | null;
  coursesDetailsId: number | null;
  career_title: string | null;
  created_at: string;
  updated_at: string;
}

interface CareerStreamOption  {
  id: number;
  title: string;
}

export default async function CareerCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE c.courseName LIKE ? OR c.jobProfiles LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const [careerCourses, careerStreams] = await Promise.all([
    safeQuery<CareerCourseRow>(
      `SELECT c.*, cd.title as career_title
       FROM counseling_courses_job_careers c
       LEFT JOIN counseling_career_details cd ON cd.id = c.coursesDetailsId
       ${where}
       ORDER BY c.id DESC
       LIMIT 200`,
      params
    ),
    safeQuery<CareerStreamOption>("SELECT id, title FROM counseling_career_details ORDER BY title ASC"),
  ]);

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full font-sans">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search courses or job profiles..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition text-slate-800"
            />
        </form>
      </div>

      <CareerCourseListClient 
        careerCourses={careerCourses}
        careerStreams={careerStreams}
        createCourse={createCourse}
        updateCourse={updateCourse}
        deleteCourse={deleteCourse}
      />
    </div>
  );
}




