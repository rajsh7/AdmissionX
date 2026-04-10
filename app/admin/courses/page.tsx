import pool from "@/lib/db";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload-utils";
import Link from "next/link";
import CourseListClient from "./CourseListClient";

async function updateCourse(formData: FormData) {
  "use server";
  try {
    const id        = parseInt(formData.get("id") as string, 10);
    const name      = formData.get("name") as string;
    const pageslug  = formData.get("pageslug") as string;
    const imageFile = formData.get("image_file") as File;
    let image       = formData.get("image_existing") as string || "";
    if (imageFile && imageFile.size > 0)
      image = await saveUpload(imageFile, "courses", `course_${id}`);
    const isShowOnTop  = formData.get("isShowOnTop")  === "on" ? 1 : 0;
    const isShowOnHome = formData.get("isShowOnHome") === "on" ? 1 : 0;
    if (isNaN(id)) return;
    const db = await getDb();
    await db.collection("course").updateOne(
      { id },
      { $set: { name, pageslug, image, isShowOnTop, isShowOnHome, updated_at: new Date() } },
    );
  } catch (e) {
    console.error("[admin/courses updateCourse]", e);
  }
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/courses safeQuery]", err);
    return [];
  }
}



interface CourseRow  {
  id: number;
  name: string;
  pageslug: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  degree_name: string | null;
  degree_id: number | null;
  image: string | null;
  created_at: string;
}

interface CountRow  {
  total: number;
}

interface StatsRow  {
  total: number;
  on_top: number;
  on_home: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all"; // all | top | home
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE ────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(c.name LIKE ? OR c.pageslug LIKE ? OR d.name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (filter === "top")  conditions.push("c.isShowOnTop = 1");
  if (filter === "home") conditions.push("c.isShowOnHome = 1");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [courses, countRows, statsRows] = await Promise.all([
    safeQuery<CourseRow>(
      `SELECT
         c.id,
         c.name,
         c.pageslug,
         c.isShowOnTop,
         c.isShowOnHome,
         c.degree_id,
         c.image,
         c.created_at,
         d.name AS degree_name
       FROM course c
       LEFT JOIN degree d ON d.id = c.degree_id
       ${where}
       ORDER BY c.name ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM course c
       LEFT JOIN degree d ON d.id = c.degree_id
       ${where}`,
      params,
    ),
    safeQuery<StatsRow>(
      `SELECT
         COUNT(*) AS total,
         SUM(isShowOnTop  = 1) AS on_top,
         SUM(isShowOnHome = 1) AS on_home
       FROM course`,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/courses${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-orange-500 text-[22px]"
              style={ICO_FILL}
            >
              menu_book
            </span>
            Courses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All courses available on the platform, grouped by degree.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {(stats?.total ?? 0).toLocaleString()} total
          </span>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Courses",
            value: stats?.total ?? 0,
            icon: "menu_book",
            color: "text-orange-500",
            bg: "bg-orange-50",
            filterVal: "all",
          },
          {
            label: "Featured (Top)",
            value: stats?.on_top ?? 0,
            icon: "star",
            color: "text-amber-600",
            bg: "bg-amber-50",
            filterVal: "top",
          },
          {
            label: "Shown on Home",
            value: stats?.on_home ?? 0,
            icon: "home",
            color: "text-blue-600",
            bg: "bg-blue-50",
            filterVal: "home",
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={buildUrl({ filter: s.filterVal, page: 1 })}
            className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md transition-all ${
              filter === s.filterVal
                ? "border-orange-200 ring-2 ring-orange-100"
                : "border-slate-100 shadow-sm"
            }`}
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">
                {s.value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Search + filter bar ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <form method="GET" action="/admin/courses" className="flex-1 flex gap-2">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search course name, slug, or degree…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildUrl({ q: "", page: 1 })}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(
            [
              { value: "all",  label: "All"       },
              { value: "top",  label: "Top only"  },
              { value: "home", label: "Home only" },
            ] as const
          ).map((f) => (
            <Link
              key={f.value}
              href={buildUrl({ filter: f.value, page: 1 })}
              className={`text-xs font-semibold px-3 py-2 rounded-xl capitalize transition-colors ${
                filter === f.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {courses.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>menu_book</span>
            <p className="text-slate-500 font-semibold text-sm">
              {q ? `No courses matching "${q}"` : filter !== "all" ? `No courses with filter "${filter}".` : "No courses found."}
            </p>
            {(q || filter !== "all") && (
              <Link href="/admin/courses" className="mt-3 inline-block text-sm text-orange-500 hover:underline">View all courses</Link>
            )}
          </div>
        ) : (
          <>
            <CourseListClient
              courses={courses}
              offset={offset}
              total={total}
              updateCourse={updateCourse}
              buildUrl={buildUrl}
            />

            {/* ── Pagination ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">
                  {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-700">
                  {total.toLocaleString()}
                </strong>{" "}
                course{total !== 1 ? "s" : ""}
                {q && (
                  <span className="text-slate-400 ml-1">
                    matching &ldquo;{q}&rdquo;
                  </span>
                )}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4),
                      );
                      const p = start + i;
                      if (p > totalPages) return null;
                      return (
                        <Link
                          key={p}
                          href={buildUrl({ page: p })}
                          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                            p === page
                              ? "bg-orange-500 text-white shadow-sm"
                              : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    },
                  )}

                  {/* Next */}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pb-2">
        <span className="material-symbols-rounded text-[13px]" style={ICO}>info</span>
        Course images are stored in <code className="bg-slate-100 px-1 rounded">public/uploads/courses/</code>.
      </p>
    </div>
  );
}




