// Cache the fully-rendered page for 5 minutes (same TTL as the layout).
export const revalidate = 300;

import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

function isUpcoming(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    return new Date(dateStr) >= new Date();
  } catch {
    return false;
  }
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/admission-procedure/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeBaseRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
  admissionStart: string | null;
  admissionEnd: string | null;
}

interface ProcedureRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
}

interface ImportantDateRow extends RowDataPacket {
  id: number;
  eventName: string | null;
  fromdate: string | null;
  todate: string | null;
  collegeAdmissionProcedure_id: number;
  procedure_title: string | null;
}

// ─── Step number badge ────────────────────────────────────────────────────────

function StepBadge({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-red-500/20 z-10">
        {index + 1}
      </div>
      {!isLast && (
        <div className="w-0.5 flex-1 bg-gradient-to-b from-red-300 to-neutral-200 mt-1 min-h-[2rem]" />
      )}
    </div>
  );
}

// ─── Important date pill ──────────────────────────────────────────────────────

function DatePill({
  event,
  from,
  to,
}: {
  event: string | null;
  from: string | null;
  to: string | null;
}) {
  const upcoming = isUpcoming(from ?? to);
  const fromStr = formatDate(from);
  const toStr = formatDate(to);

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        upcoming
          ? "bg-emerald-50 border-emerald-200"
          : "bg-neutral-50 border-neutral-100"
      }`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
          upcoming ? "bg-emerald-100" : "bg-neutral-200"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] ${
            upcoming ? "text-emerald-600" : "text-neutral-400"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          event
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-bold leading-snug mb-1 ${
            upcoming ? "text-emerald-800" : "text-neutral-700"
          }`}
        >
          {event ?? "Important Date"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {fromStr && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                upcoming
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {fromStr}
            </span>
          )}
          {toStr && toStr !== fromStr && (
            <>
              <span className="text-neutral-300 text-[10px]">→</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  upcoming
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {toStr}
              </span>
            </>
          )}
          {upcoming && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Upcoming
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Procedure card ───────────────────────────────────────────────────────────

function ProcedureCard({
  procedure,
  index,
  dates,
  isLast,
}: {
  procedure: ProcedureRow;
  index: number;
  dates: ImportantDateRow[];
  isLast: boolean;
}) {
  const title = stripHtml(procedure.title) || `Step ${index + 1}`;
  const description = stripHtml(procedure.description);

  return (
    <div className="flex gap-4">
      {/* Step indicator */}
      <StepBadge index={index} isLast={isLast} />

      {/* Card content */}
      <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-6"}`}>
        <div className="bg-white rounded-2xl border border-neutral-100 hover:border-red-100 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300 overflow-hidden">
          {/* Card header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-neutral-900 leading-snug">
                  {title}
                </h3>

                {/* Stream / Degree / Course tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {procedure.stream_name && (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[10px]">
                        school
                      </span>
                      {procedure.stream_name}
                    </span>
                  )}
                  {procedure.degree_name && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {procedure.degree_name}
                    </span>
                  )}
                  {procedure.course_name && (
                    <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {procedure.course_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Step number on the right */}
              <span className="flex-shrink-0 text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                Step {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-neutral-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Important dates for this procedure */}
          {dates.length > 0 && (
            <div className="px-5 pb-5 border-t border-neutral-50 pt-4">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] text-red-400">
                  calendar_month
                </span>
                Key Dates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dates.map((d) => (
                  <DatePill
                    key={d.id}
                    event={d.eventName}
                    from={d.fromdate ? String(d.fromdate) : null}
                    to={d.todate ? String(d.todate) : null}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── General admission steps (shown when no DB data) ─────────────────────────

const GENERAL_STEPS = [
  {
    icon: "search",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Research & Shortlist",
    description:
      "Research the courses offered, fees structure, placement records, and eligibility criteria. Shortlist courses that align with your career goals.",
  },
  {
    icon: "assignment",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Check Eligibility",
    description:
      "Verify the minimum eligibility requirements — qualifying exam scores, percentage criteria, entrance exam scores (if required), and age limits.",
  },
  {
    icon: "edit_document",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Fill Application Form",
    description:
      "Complete the online or offline application form. Keep scanned copies of mark-sheets, ID proof, passport photo, and category certificate (if applicable) ready.",
  },
  {
    icon: "payments",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Pay Application Fee",
    description:
      "Submit the application fee through the college's payment portal. Keep the payment receipt for future reference.",
  },
  {
    icon: "how_to_reg",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    title: "Entrance Test / Merit List",
    description:
      "Appear for the college-level entrance test (if applicable) or monitor the merit list publication. Check cut-off marks for your desired course.",
  },
  {
    icon: "event_available",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    title: "Counselling & Seat Allotment",
    description:
      "Attend the counselling session (online or offline). Verify your documents, select your preferred course, and get your seat allotted.",
  },
  {
    icon: "currency_rupee",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Fee Payment & Enrolment",
    description:
      "Pay the first-semester / annual tuition fee to confirm your admission. Collect your enrolment number and college ID card.",
  },
];

function GeneralStepsGuide({ collegeName }: { collegeName: string }) {
  return (
    <div className="space-y-6">
      {/* Notice banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <span
          className="material-symbols-outlined text-[20px] text-amber-500 flex-shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          info
        </span>
        <div>
          <p className="text-sm font-bold text-amber-800 mb-0.5">
            Specific procedure not published yet
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            {collegeName} has not yet published the detailed admission
            procedure. Below is the standard admission process followed by most
            colleges. Please contact the admissions office for exact steps.
          </p>
        </div>
      </div>

      {/* General steps */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full block" />
            General Admission Process
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Typical steps to secure admission at any college
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-0">
            {GENERAL_STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                {/* Left: icon + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center z-10`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${step.iconColor}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {step.icon}
                    </span>
                  </div>
                  {i < GENERAL_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 bg-neutral-100 mt-1 min-h-[1.5rem]" />
                  )}
                </div>

                {/* Right: content */}
                <div
                  className={`flex-1 min-w-0 ${
                    i < GENERAL_STEPS.length - 1 ? "pb-5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdmissionProcedurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch in parallel ─────────────────────────────────────────────────────
  const [baseRows, procedureRows, importantDateRows] = await Promise.all([
    safeQuery<CollegeBaseRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.admissionStart,
         cp.admissionEnd
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<ProcedureRow>(
      `SELECT
         cap.id,
         cap.title,
         cap.description,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name
       FROM college_admission_procedures cap
       JOIN collegeprofile cp ON cp.id = cap.collegeprofile_id AND cp.slug = ?
       LEFT JOIN degree        d  ON d.id  = cap.degree_id
       LEFT JOIN course        co ON co.id = cap.course_id
       LEFT JOIN functionalarea fa ON fa.id = cap.functionalarea_id
       ORDER BY cap.id ASC
       LIMIT 30`,
      [slug],
    ),

    safeQuery<ImportantDateRow>(
      `SELECT
         caid.id,
         caid.eventName,
         caid.fromdate,
         caid.todate,
         caid.collegeAdmissionProcedure_id,
         cap.title AS procedure_title
       FROM college_admission_important_dateds caid
       JOIN college_admission_procedures cap
         ON cap.id = caid.collegeAdmissionProcedure_id
       JOIN collegeprofile cp ON cp.id = caid.collegeprofile_id AND cp.slug = ?
       ORDER BY caid.fromdate ASC
       LIMIT 50`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  const hasProcedures = procedureRows.length > 0;
  const hasAdmissionWindow = base.admissionStart || base.admissionEnd;

  // Group important dates by procedure id
  const datesByProcedure: Record<number, ImportantDateRow[]> = {};
  for (const d of importantDateRows) {
    const pid = d.collegeAdmissionProcedure_id;
    if (!datesByProcedure[pid]) datesByProcedure[pid] = [];
    datesByProcedure[pid].push(d);
  }

  // Collect all dates that are upcoming for the "upcoming highlights" bar
  const allUpcomingDates = importantDateRows.filter((d) =>
    isUpcoming(d.fromdate ? String(d.fromdate) : null),
  );

  // Group procedures by stream
  const streamGroups: Record<string, ProcedureRow[]> = {};
  for (const p of procedureRows) {
    const key = p.stream_name ?? "General";
    if (!streamGroups[key]) streamGroups[key] = [];
    streamGroups[key].push(p);
  }
  const hasMultipleStreams = Object.keys(streamGroups).length > 1;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-neutral-900 flex items-center gap-2 mb-1">
            <span className="w-1 h-5 bg-red-600 rounded-full block flex-shrink-0" />
            Admission Procedure
          </h1>
          <p className="text-xs text-neutral-500 ml-3">
            Step-by-step guide to securing admission at{" "}
            <span className="font-semibold text-neutral-700">
              {collegeName}
            </span>
          </p>
        </div>

        {hasProcedures && (
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">
              assignment
            </span>
            {procedureRows.length}{" "}
            {procedureRows.length === 1 ? "step" : "steps"} defined
          </span>
        )}
      </div>

      {/* ── Admission window banner ── */}
      {hasAdmissionWindow && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {base.admissionStart && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[20px] text-emerald-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  event_available
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                  Admission Opens
                </p>
                <p className="text-sm font-black text-emerald-900">
                  {base.admissionStart}
                </p>
              </div>
            </div>
          )}
          {base.admissionEnd && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[20px] text-red-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  event_busy
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                  Last Date to Apply
                </p>
                <p className="text-sm font-black text-red-900">
                  {base.admissionEnd}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Upcoming dates highlight strip ── */}
      {allUpcomingDates.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
          <h2 className="text-sm font-black text-neutral-800 mb-3 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[16px] text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_month
            </span>
            Upcoming Important Dates
            <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
              Live
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allUpcomingDates.slice(0, 6).map((d) => (
              <DatePill
                key={d.id}
                event={d.eventName}
                from={d.fromdate ? String(d.fromdate) : null}
                to={d.todate ? String(d.todate) : null}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      {!hasProcedures ? (
        <GeneralStepsGuide collegeName={collegeName} />
      ) : hasMultipleStreams ? (
        /* Multiple streams — show each stream group separately */
        Object.entries(streamGroups).map(([stream, procs]) => (
          <section key={stream}>
            {/* Stream sub-heading */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="material-symbols-outlined text-[16px] text-red-500">
                school
              </span>
              <h2 className="text-sm font-black text-neutral-700 uppercase tracking-wide">
                {stream}
              </h2>
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400 font-semibold">
                {procs.length} {procs.length === 1 ? "step" : "steps"}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="space-y-0">
                {procs.map((proc, i) => (
                  <ProcedureCard
                    key={proc.id}
                    procedure={proc}
                    index={i}
                    dates={datesByProcedure[proc.id] ?? []}
                    isLast={i === procs.length - 1}
                  />
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        /* Single stream or no stream — flat timeline */
        <section>
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            {/* Section header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-600 rounded-full block flex-shrink-0" />
                Admission Steps
              </h2>
              <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full flex-shrink-0">
                {procedureRows.length}{" "}
                {procedureRows.length === 1 ? "step" : "steps"}
              </span>
            </div>

            <div className="p-6">
              <div className="space-y-0">
                {procedureRows.map((proc, i) => (
                  <ProcedureCard
                    key={proc.id}
                    procedure={proc}
                    index={i}
                    dates={datesByProcedure[proc.id] ?? []}
                    isLast={i === procedureRows.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── All important dates table (if many dates) ── */}
      {importantDateRows.length > 3 && (
        <section className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-600 rounded-full block flex-shrink-0" />
              Complete Date Schedule
            </h2>
            <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full flex-shrink-0">
              {importantDateRows.length} dates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                    Procedure
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                    From
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                    To
                  </th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {importantDateRows.map((d, i) => {
                  const upcoming = isUpcoming(
                    d.fromdate ? String(d.fromdate) : null,
                  );
                  return (
                    <tr
                      key={d.id}
                      className={`border-b border-neutral-50 hover:bg-red-50/20 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-neutral-50/30"
                      }`}
                    >
                      <td className="px-5 py-3 font-semibold text-neutral-800 text-sm">
                        {d.eventName ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-neutral-500 text-xs max-w-[160px] truncate">
                        {d.procedure_title
                          ? String(d.procedure_title)
                              .replace(/<[^>]+>/g, " ")
                              .trim()
                              .slice(0, 60)
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        {d.fromdate ? (
                          <span className="font-semibold text-neutral-700">
                            {formatDate(String(d.fromdate))}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        {d.todate ? (
                          <span className="font-semibold text-neutral-700">
                            {formatDate(String(d.todate))}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {upcoming ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Passed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-neutral-400">
              info
            </span>
            <p className="text-[11px] text-neutral-400">
              Dates are subject to change. Always verify with the official{" "}
              <span className="font-semibold text-neutral-600">
                {collegeName}
              </span>{" "}
              prospectus or admissions office.
            </p>
          </div>
        </section>
      )}

      {/* ── CTA strip ── */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-black text-base mb-1">
            Ready to apply to {collegeName}?
          </p>
          <p className="text-red-100 text-sm">
            Start your application today before the deadline closes.
          </p>
        </div>
        <a
          href={`/apply/${slug}`}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-700 font-black text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-red-800/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[17px]">
            edit_document
          </span>
          Apply Now
        </a>
      </div>
    </div>
  );
}
