import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface CourseRow {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
  created_at: string | null;
}

interface OptionRow {
  id: number;
  name: string;
}

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/courses/[id] safeQuery]", err);
    return [];
  }
}

async function updateCourse(formData: FormData) {
  "use server";

  const id = parseInt(formData.get("id") as string, 10);
  const toNum = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? null : n;
  };

  const collegeprofile_id = toNum(formData.get("collegeprofile_id"));
  const course_id = toNum(formData.get("course_id"));
  const degree_id = toNum(formData.get("degree_id"));
  const functionalarea_id = toNum(formData.get("functionalarea_id"));
  const fees = (formData.get("fees") as string | null) || null;
  const seats = (formData.get("seats") as string | null) || null;
  const courseduration = (formData.get("courseduration") as string | null) || null;

  if (Number.isNaN(id) || !collegeprofile_id || !course_id) return;

  try {
    await pool.query(
      `UPDATE collegemaster
        SET collegeprofile_id = ?, course_id = ?, degree_id = ?,
            functionalarea_id = ?, fees = ?, seats = ?, courseduration = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        collegeprofile_id,
        course_id,
        degree_id,
        functionalarea_id,
        fees,
        seats,
        courseduration,
        id,
      ],
    );
  } catch (e) {
    console.error("[admin/colleges/courses/[id] updateCourse]", e);
  }

  revalidatePath("/admin/colleges/courses");
  redirect("/admin/colleges/courses");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const selectCls = `${inputCls} appearance-none pr-10`;

const labelCls =
  "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#008080] rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[18px] text-[#008080]"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
      >
        {icon}
      </span>
      <h2 className="text-sm font-black text-slate-700">{title}</h2>
    </div>
  );
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) notFound();

  const [courses, colleges, courseOptions, degrees, streams] = await Promise.all([
    safeQuery<CourseRow>(
      `SELECT
          cm.*,
          COALESCE(u.firstname, 'Unnamed College') AS college_name,
          c.name  AS course_name,
          d.name  AS degree_name,
          fa.name AS stream_name
       FROM collegemaster cm
       LEFT JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = cm.course_id
       LEFT JOIN degree d ON d.id = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE cm.id = ?
       LIMIT 1`,
      [idNum],
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC",
    ),
    safeQuery<OptionRow>("SELECT id, name FROM course ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM degree ORDER BY name ASC"),
    safeQuery<OptionRow>("SELECT id, name FROM functionalarea ORDER BY name ASC"),
  ]);

  const course = courses[0];
  if (!course) notFound();

  const createdAt = course.created_at
    ? new Date(course.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  const formatFee = (val: string | null) => {
    if (!val) return "-";
    const n = Number(val);
    if (Number.isFinite(n)) return `INR ${n.toLocaleString("en-IN")}`;
    return val;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateCourse} className="w-full">
        <input type="hidden" name="id" value={course.id} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/colleges/courses"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-700 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              chevron_left
            </span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              Edit College Course
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {course.course_name || "Course"}
            </p>
          </div>

          <button
            type="submit"
            className="h-10 px-6 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] active:bg-[#005555] transition-colors shadow-md shadow-[#008080]/25 flex items-center gap-2 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[17px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
            >
              save
            </span>
            Save Changes
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <SectionHeading icon="menu_book" title="Course Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>College Profile</label>
                  <div className="relative">
                    <select
                      name="collegeprofile_id"
                      defaultValue={course.collegeprofile_id}
                      className={selectCls}
                      required
                    >
                      <option value="">Select college</option>
                      {colleges.map((c, idx) => (
                        <option key={`${c.id}-${c.name}-${idx}`} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Course</label>
                  <div className="relative">
                    <select
                      name="course_id"
                      defaultValue={course.course_id ?? ""}
                      className={selectCls}
                      required
                    >
                      <option value="">Select course</option>
                      {courseOptions.map((c, idx) => (
                        <option key={`${c.id}-${c.name}-${idx}`} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Degree</label>
                  <div className="relative">
                    <select
                      name="degree_id"
                      defaultValue={course.degree_id ?? ""}
                      className={selectCls}
                    >
                      <option value="">Select degree</option>
                      {degrees.map((d, idx) => (
                        <option key={`${d.id}-${d.name}-${idx}`} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Stream</label>
                  <div className="relative">
                    <select
                      name="functionalarea_id"
                      defaultValue={course.functionalarea_id ?? ""}
                      className={selectCls}
                    >
                      <option value="">Select stream</option>
                      {streams.map((s, idx) => (
                        <option key={`${s.id}-${s.name}-${idx}`} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="payments" title="Fees & Seats" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Fees (per year)</label>
                  <input
                    name="fees"
                    defaultValue={course.fees ?? ""}
                    placeholder="e.g. 250000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Seats</label>
                  <input
                    type="number"
                    name="seats"
                    defaultValue={course.seats ?? ""}
                    placeholder="e.g. 60"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Duration</label>
                  <input
                    name="courseduration"
                    defaultValue={course.courseduration ?? ""}
                    placeholder="e.g. 4 Years"
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Course Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {course.course_name || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">College</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {course.college_name || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{course.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {createdAt}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Degree & Stream</p>
                  <p className="text-[12px] text-slate-600 mt-1 truncate">
                    {[course.degree_name, course.stream_name].filter(Boolean).join(" · ") || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fees & Seats</p>
                  <p className="text-[12px] text-slate-600 mt-1">
                    {formatFee(course.fees)} · Seats: {course.seats || "-"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
