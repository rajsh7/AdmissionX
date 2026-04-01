// Cache the fully-rendered page for 5 minutes (same TTL as the layout).
export const revalidate = 300;

import pool from "@/lib/db";
import { notFound } from "next/navigation";
import CourseList from "@/app/components/college/CourseList";
import type { CourseData } from "@/app/api/college/[slug]/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/courses/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeBaseRow {
  id: number;
  slug: string;
  college_name: string;
  admissionStart: string | null;
  admissionEnd: string | null;
  website: string | null;
}

interface CourseRow {
  id: number;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
  twelvemarks: string | null;
  course_description: string | null;
}

// ─── Fee helpers ──────────────────────────────────────────────────────────────

function formatFees(fees: string | null): string {
  if (!fees) return "—";
  const n = parseInt(fees);
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L / yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K / yr`;
  return `₹${n} / yr`;
}

// ─── Summary stats helpers ────────────────────────────────────────────────────

function computeStats(courses: CourseRow[]) {
  const streams = new Set(courses.map((c) => c.stream_name).filter(Boolean));
  const degrees = new Set(courses.map((c) => c.degree_name).filter(Boolean));

  const fees = courses
    .map((c) => (c.fees ? parseInt(String(c.fees)) : null))
    .filter((v): v is number => v !== null && !isNaN(v) && v > 0);

  const minFees = fees.length > 0 ? Math.min(...fees) : null;
  const maxFees = fees.length > 0 ? Math.max(...fees) : null;

  const totalSeats = courses.reduce((acc, c) => {
    const s = c.seats ? parseInt(String(c.seats)) : 0;
    return acc + (isNaN(s) ? 0 : s);
  }, 0);

  return { streams, degrees, minFees, maxFees, totalSeats };
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ courses }: { courses: CourseRow[] }) {
  const { streams, degrees, minFees, maxFees, totalSeats } =
    computeStats(courses);

  const items: {
    icon: string;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string;
  }[] = [
    {
      icon: "school",
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      label: "Total Courses",
      value: String(courses.length),
    },
    {
      icon: "category",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      label: "Streams",
      value: String(streams.size),
    },
    {
      icon: "workspace_premium",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      label: "Degrees",
      value: String(degrees.size),
    },
    ...(totalSeats > 0
      ? [
          {
            icon: "chair",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            label: "Total Seats",
            value: totalSeats.toLocaleString("en-IN") + "+",
          },
        ]
      : []),
    ...(minFees !== null && maxFees !== null
      ? [
          {
            icon: "currency_rupee",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            label: "Fees Range",
            value:
              minFees === maxFees
                ? formatFees(String(minFees))
                : `${formatFees(String(minFees))} – ${formatFees(String(maxFees))}`,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-100 px-4 py-3 hover:border-red-100 hover:shadow-sm transition-all duration-200"
        >
          <div
            className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${item.iconColor}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide leading-none">
              {item.label}
            </p>
            <p className="text-sm font-black text-neutral-900 leading-snug mt-0.5 truncate">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Admission window banner ──────────────────────────────────────────────────

function AdmissionBanner({
  start,
  end,
  website,
  slug,
}: {
  start: string | null;
  end: string | null;
  website: string | null;
  slug: string;
}) {
  if (!start && !end) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-[22px] text-emerald-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            event_available
          </span>
        </div>
        <div>
          <p className="text-sm font-black text-emerald-900 mb-1">
            Admissions are Open
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-700 font-semibold">
            {start && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  play_circle
                </span>
                Opens: {start}
              </span>
            )}
            {end && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  stop_circle
                </span>
                Closes: {end}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {website && (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              open_in_new
            </span>
            Official Site
          </a>
        )}
        <a
          href={`/apply/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
        >
          <span className="material-symbols-outlined text-[14px]">
            edit_document
          </span>
          Apply Now
        </a>
      </div>
    </div>
  );
}

// ─── Degree filter chips ──────────────────────────────────────────────────────

function DegreeHighlights({ courses }: { courses: CourseRow[] }) {
  // Aggregate courses per degree with min-fees and count
  const degreeMap: Record<
    string,
    { count: number; minFees: number | null; streams: Set<string> }
  > = {};

  for (const c of courses) {
    const deg = c.degree_name ?? "Other";
    if (!degreeMap[deg]) {
      degreeMap[deg] = { count: 0, minFees: null, streams: new Set() };
    }
    degreeMap[deg].count++;
    if (c.stream_name) degreeMap[deg].streams.add(c.stream_name);
    if (c.fees) {
      const n = parseInt(String(c.fees));
      if (!isNaN(n) && n > 0) {
        if (
          degreeMap[deg].minFees === null ||
          n < (degreeMap[deg].minFees as number)
        ) {
          degreeMap[deg].minFees = n;
        }
      }
    }
  }

  const entries = Object.entries(degreeMap).sort(
    ([, a], [, b]) => b.count - a.count,
  );

  if (entries.length <= 1) return null;

  const accentPalette = [
    "bg-red-50 border-red-200 text-red-700",
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-violet-50 border-violet-200 text-violet-700",
    "bg-emerald-50 border-emerald-200 text-emerald-700",
    "bg-amber-50 border-amber-200 text-amber-700",
    "bg-pink-50 border-pink-200 text-pink-700",
  ];

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 p-5">
      <h2 className="text-sm font-black text-neutral-700 mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-red-600 rounded-full block" />
        Programmes at a Glance
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([deg, info], i) => {
          const color = accentPalette[i % accentPalette.length];
          return (
            <a
              key={deg}
              href={`#stream-${deg.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex flex-col gap-1.5 border rounded-xl px-4 py-3 hover:shadow-sm transition-all duration-200 ${color}`}
            >
              <span className="text-xs font-black leading-snug">{deg}</span>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-semibold opacity-70">
                  {info.count} {info.count === 1 ? "course" : "courses"}
                </span>
                {info.minFees !== null && (
                  <span className="text-[11px] font-bold opacity-80">
                    from {formatFees(String(info.minFees))}
                  </span>
                )}
              </div>
              {info.streams.size > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Array.from(info.streams)
                    .slice(0, 2)
                    .map((s) => (
                      <span
                        key={s}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/60 uppercase tracking-wide opacity-80"
                      >
                        {s}
                      </span>
                    ))}
                  {info.streams.size > 2 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/60 uppercase tracking-wide opacity-60">
                      +{info.streams.size - 2}
                    </span>
                  )}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeCoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch base info + courses in parallel ──────────────────────────────────
  const [baseRows, courseRows] = await Promise.all([
    safeQuery<CollegeBaseRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.admissionStart,
         cp.admissionEnd,
         cp.website
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<CourseRow>(
      `SELECT
         cm.id,
         co.name  AS course_name,
         d.name   AS degree_name,
         fa.name  AS stream_name,
         cm.fees,
         cm.seats,
         cm.courseduration,
         cm.twelvemarks,
         cm.description AS course_description
       FROM collegemaster cm
       JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id AND cp.slug = ?
       LEFT JOIN course        co ON co.id = cm.course_id
       LEFT JOIN degree        d  ON d.id  = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       ORDER BY fa.name ASC, d.name ASC, co.name ASC
       LIMIT 200`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-neutral-900 flex items-center gap-2 mb-1">
            <span className="w-1 h-5 bg-red-600 rounded-full block flex-shrink-0" />
            Courses Offered
          </h1>
          <p className="text-xs text-neutral-500 ml-3">
            All programmes available at{" "}
            <span className="font-semibold text-neutral-700">
              {collegeName}
            </span>
          </p>
        </div>

        {courseRows.length > 0 && (
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">
              menu_book
            </span>
            {courseRows.length} {courseRows.length === 1 ? "course" : "courses"}{" "}
            listed
          </span>
        )}
      </div>

      {/* ── Admission window banner ── */}
      <AdmissionBanner
        start={base.admissionStart}
        end={base.admissionEnd}
        website={base.website}
        slug={slug}
      />

      {/* ── Summary stats ── */}
      {courseRows.length > 0 && <SummaryStrip courses={courseRows} />}

      {/* ── Degree highlights / programme overview ── */}
      {courseRows.length > 0 && <DegreeHighlights courses={courseRows} />}

      {/* ── Full courses list ── */}
      <CourseList
        courses={courseRows as CourseData[]}
        collegeName={collegeName}
      />

      {/* ── Bottom CTA ── */}
      {courseRows.length > 0 && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-base mb-1">
              Found your course?
            </p>
            <p className="text-neutral-400 text-sm">
              Apply to {collegeName} directly through AdmissionX — fast,
              paperless, and free.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <a
              href={`/college/${slug}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                info
              </span>
              College Overview
            </a>
            <a
              href={`/apply/${slug}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit_document
              </span>
              Apply Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
