import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=600";

export const metadata: Metadata = {
  title: "Career Courses — Find the Right Course for Your Future | AdmissionX",
  description:
    "Explore top career-oriented courses across engineering, medicine, management, law, arts and more. Get details on eligibility, job scope, and top colleges.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_COURSE_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string | null | undefined, maxLen = 110): string {
  const clean = stripHtml(text);
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[careers-courses/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationLevelRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string | null;
  course_count: number;
}

interface StreamRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  course_count: number;
}

interface CourseRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  bestChoiceOfCourse: string | null;
  jobsCareerOpportunityDesc: string | null;
  slug: string;
  educationlevel_id: number | null;
  functionalarea_id: number | null;
  level_name: string | null;
  level_slug: string | null;
  stream_name: string | null;
  stream_slug: string | null;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  undergraduate: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "school",
  },
  postgraduate: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: "workspace_premium",
  },
  diploma: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "military_tech",
  },
  certificate: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "verified",
  },
  doctoral: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "biotech",
  },
  default: {
    bg: "bg-neutral-50",
    text: "text-neutral-600",
    border: "border-neutral-200",
    icon: "menu_book",
  },
};

function getLevelColor(name: string | null) {
  if (!name) return LEVEL_COLORS.default;
  const lower = name.toLowerCase();
  for (const key of Object.keys(LEVEL_COLORS)) {
    if (lower.includes(key)) return LEVEL_COLORS[key];
  }
  return LEVEL_COLORS.default;
}

const STREAM_COLORS: Record<string, { bg: string; text: string }> = {
  engineering: { bg: "bg-blue-50", text: "text-blue-700" },
  medical: { bg: "bg-red-50", text: "text-red-700" },
  management: { bg: "bg-purple-50", text: "text-purple-700" },
  mba: { bg: "bg-indigo-50", text: "text-indigo-700" },
  law: { bg: "bg-amber-50", text: "text-amber-700" },
  arts: { bg: "bg-pink-50", text: "text-pink-700" },
  science: { bg: "bg-teal-50", text: "text-teal-700" },
  commerce: { bg: "bg-orange-50", text: "text-orange-700" },
  computer: { bg: "bg-cyan-50", text: "text-cyan-700" },
  design: { bg: "bg-rose-50", text: "text-rose-700" },
  default: { bg: "bg-neutral-100", text: "text-neutral-600" },
};

function getStreamColor(slug: string | null) {
  if (!slug) return STREAM_COLORS.default;
  const lower = slug.toLowerCase();
  for (const key of Object.keys(STREAM_COLORS)) {
    if (lower.includes(key)) return STREAM_COLORS[key];
  }
  return STREAM_COLORS.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CareerCoursesPage() {
  const [levelRows, streamRows, courseRows] = await Promise.all([
    // Education levels that have courses
    safeQuery<EducationLevelRow>(`
      SELECT
        el.id,
        el.name,
        el.pageslug AS slug,
        COUNT(ccd.id) AS course_count
      FROM educationlevel el
      INNER JOIN counseling_courses_details ccd
        ON ccd.educationlevel_id = el.id
      WHERE el.name IS NOT NULL AND el.name != ''
      GROUP BY el.id, el.name, el.pageslug
      ORDER BY el.isShowOnTop DESC, course_count DESC, el.id ASC
      LIMIT 12
    `),

    // Streams that have courses
    safeQuery<StreamRow>(`
      SELECT
        fa.id,
        fa.name,
        fa.pageslug,
        COUNT(ccd.id) AS course_count
      FROM functionalarea fa
      INNER JOIN counseling_courses_details ccd
        ON ccd.functionalarea_id = fa.id
      WHERE fa.name IS NOT NULL AND fa.name != ''
      GROUP BY fa.id, fa.name, fa.pageslug
      HAVING course_count > 0
      ORDER BY course_count DESC, fa.name ASC
      LIMIT 16
    `),

    // All courses with joined level and stream info
    safeQuery<CourseRow>(`
      SELECT
        ccd.id,
        ccd.title,
        ccd.description,
        ccd.image,
        ccd.bestChoiceOfCourse,
        ccd.jobsCareerOpportunityDesc,
        ccd.slug,
        ccd.educationlevel_id,
        ccd.functionalarea_id,
        el.name     AS level_name,
        el.pageslug AS level_slug,
        fa.name     AS stream_name,
        fa.pageslug AS stream_slug
      FROM counseling_courses_details ccd
      LEFT JOIN educationlevel   el ON el.id = ccd.educationlevel_id
      LEFT JOIN functionalarea   fa ON fa.id = ccd.functionalarea_id
      WHERE ccd.slug IS NOT NULL AND ccd.slug != ''
      ORDER BY ccd.id DESC
      LIMIT 80
    `),
  ]);

  const totalCourses = courseRows.length;

  // Group courses by level for section display
  const coursesByLevel = new Map<number | string, CourseRow[]>();
  for (const c of courseRows) {
    const key = c.educationlevel_id ?? "other";
    if (!coursesByLevel.has(key)) coursesByLevel.set(key, []);
    coursesByLevel.get(key)!.push(c);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <Link
              href="/careers/opportunities"
              className="hover:text-white transition-colors"
            >
              Careers
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Career Courses</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">
                  menu_book
                </span>
                Career Courses
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Find the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Right Course
              </span>{" "}
              for Your Career
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed max-w-2xl mb-8">
              Browse career-oriented courses across all disciplines. Compare
              eligibility criteria, job prospects, salary insights and the
              best colleges offering each programme.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: "menu_book",   label: "Courses",         value: totalCourses      },
                { icon: "school",      label: "Education Levels", value: levelRows.length  },
                { icon: "category",    label: "Streams",          value: streamRows.length },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] text-purple-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s.icon}
                  </span>
                  <span className="text-white font-black text-lg leading-none">
                    {s.value}+
                  </span>
                  <span className="text-neutral-500 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Education Level Filter Bar ────────────────────────────────────── */}
      {levelRows.length > 1 && (
        <section className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest shrink-0 mr-1">
                Level:
              </span>
              <a
                href="#all-courses"
                className="shrink-0 inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">apps</span>
                All ({totalCourses})
              </a>
              {levelRows.map((lvl) => {
                const colors = getLevelColor(lvl.name);
                return (
                  <a
                    key={lvl.id}
                    href={`#level-${lvl.id}`}
                    className={`shrink-0 inline-flex items-center gap-1.5 ${colors.bg} ${colors.text} border ${colors.border} text-xs font-bold px-4 py-2 rounded-full transition-all hover:shadow-sm`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {colors.icon}
                    </span>
                    {lvl.name}
                    <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                      {lvl.course_count}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-14">
        {/* ── Empty state ── */}
        {totalCourses === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[36px] text-neutral-300">
                menu_book
              </span>
            </div>
            <h2 className="text-lg font-black text-neutral-700 mb-2">
              No courses yet
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm">
              Career course information is being updated. Check back soon.
            </p>
          </div>
        )}

        {/* ── All anchor ── */}
        <div id="all-courses" />

        {/* ── Render by education level ── */}
        {levelRows.map((level) => {
          const courses = coursesByLevel.get(level.id) ?? [];
          if (courses.length === 0) return null;
          const colors = getLevelColor(level.name);

          return (
            <section
              key={level.id}
              id={`level-${level.id}`}
              className="scroll-mt-20"
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${colors.text}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {colors.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">
                      {level.name}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {courses.length} course
                      {courses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    levelColors={colors}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* ── Courses with no level assigned ── */}
        {(() => {
          const other = coursesByLevel.get("other") ?? [];
          if (other.length === 0 || levelRows.length > 0) return null;
          return (
            <section id="level-other" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-7 bg-purple-600 rounded-full block" />
                <h2 className="text-xl font-black text-neutral-900">
                  All Courses
                </h2>
                <span className="text-sm text-neutral-400">
                  ({other.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {other.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    levelColors={LEVEL_COLORS.default}
                  />
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Stream explorer chips ── */}
        {streamRows.length > 0 && (
          <section className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-base font-black text-neutral-900 mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-purple-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                category
              </span>
              Browse by Stream
            </h3>
            <div className="flex flex-wrap gap-2">
              {streamRows.map((s) => {
                const slug =
                  s.pageslug ??
                  s.name.toLowerCase().replace(/\s+/g, "-");
                const colors = getStreamColor(slug);
                return (
                  <Link
                    key={s.id}
                    href={`/careers/opportunities/${slug}`}
                    className={`inline-flex items-center gap-1.5 ${colors.bg} ${colors.text} border border-current/20 text-xs font-bold px-3.5 py-2 rounded-full hover:shadow-sm transition-all`}
                  >
                    {s.name}
                    <span className="opacity-60 text-[10px]">
                      {s.course_count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-lg">
            <h3 className="text-white font-black text-xl mb-2">
              Find Colleges Offering These Courses
            </h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              Discover top-ranked institutions that offer your preferred
              programme — compare fees, placements and more.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/top-colleges"
              className="inline-flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">
                apartment
              </span>
              Top Colleges
            </Link>
            <Link
              href="/examination"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">quiz</span>
              Entrance Exams
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  levelColors,
}: {
  course: CourseRow;
  levelColors: { bg: string; text: string; border: string; icon: string };
}) {
  const imgUrl = buildImageUrl(course.image);
  const desc = excerpt(
    course.description ?? course.bestChoiceOfCourse ?? course.jobsCareerOpportunityDesc,
    110,
  );
  const streamColors = getStreamColor(course.stream_slug);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Level badge */}
        {course.level_name && (
          <span
            className={`absolute top-2 left-2 inline-flex items-center gap-1 ${levelColors.bg} ${levelColors.text} text-[10px] font-bold px-2.5 py-1 rounded-full`}
          >
            {course.level_name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {desc && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1 mb-3">
            {desc}
          </p>
        )}

        <div className="mt-auto space-y-2">
          {/* Stream tag */}
          {course.stream_name && (
            <span
              className={`inline-flex items-center gap-1 ${streamColors.bg} ${streamColors.text} text-[10px] font-semibold px-2.5 py-1 rounded-full`}
            >
              <span className="material-symbols-outlined text-[11px]">
                category
              </span>
              {course.stream_name}
            </span>
          )}

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5">
            {course.bestChoiceOfCourse && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[11px]">
                  star
                </span>
                Best Choice
              </span>
            )}
            {course.jobsCareerOpportunityDesc && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[11px]">
                  work
                </span>
                Job Scope
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
