import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null): string {
  if (!raw || !raw.trim()) return "";
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

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isUpcoming(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = new Date(raw);
  return !isNaN(d.getTime()) && d > new Date();
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[examination/[stream]/[slug]/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamBaseRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  examEligibilityCriteria: string | null;
  examDates: string | null;
  admidCardDesc: string | null;
  admidCardInstructions: string | null;
  examResultDesc: string | null;
  mockTestDesc: string | null;
  getMoreInfoLink: string | null;
  applicationFrom: string | null;
  applicationTo: string | null;
  exminationDate: string | null;
  resultAnnounce: string | null;
}

interface ExamDateRow extends RowDataPacket {
  id: number;
  degreeId: number | null;
  degreeName: string | null;
  eventName: string | null;
  eventDate: string | null;
  eventStatus: string | null;
}

interface EligibilityRow extends RowDataPacket {
  id: number;
  degreeId: number | null;
  degreeName: string | null;
  description: string | null;
}

interface PatternRow extends RowDataPacket {
  id: number;
  degreeId: number | null;
  degreeName: string | null;
  patternDesc: string | null;
  modeOfExam: string | null;
  examDuration: string | null;
  totalQuestion: string | null;
  totalMarks: string | null;
  section: string | null;
  markingSchem: string | null;
  languageofpaper: string | null;
}

interface FeeRow extends RowDataPacket {
  id: number;
  category: string | null;
  quota: string | null;
  mode: string | null;
  gender: string | null;
  amount: string | null;
}

interface AppProcessRow extends RowDataPacket {
  id: number;
  modeofapplication: string | null;
  modeofpayment: string | null;
  description: string | null;
  examinationtype: string | null;
  applicationandexamstatus: string | null;
  examinationmode: string | null;
  eligibilitycriteria: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExamOverviewPage({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}) {
  const { slug } = await params;

  // ── Step 1: get exam ID ───────────────────────────────────────────────────
  const baseRows = await safeQuery<ExamBaseRow>(
    `SELECT
       id,
       title,
       slug,
       description,
       content,
       examEligibilityCriteria,
       examDates,
       admidCardDesc,
       admidCardInstructions,
       examResultDesc,
       mockTestDesc,
       getMoreInfoLink,
       applicationFrom,
       applicationTo,
       exminationDate,
       resultAnnounce
     FROM examination_details
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );

  const exam = baseRows[0];
  if (!exam) notFound();

  // ── Step 2: fetch all sub-data in parallel using exam.id ─────────────────
  const [dateRows, eligibilityRows, patternRows, feeRows, appProcessRows] =
    await Promise.all([
      safeQuery<ExamDateRow>(
        `SELECT id, degreeId, degreeName, eventName, eventDate, eventStatus
         FROM exam_dates
         WHERE typeOfExaminations_id = ?
         ORDER BY eventDate ASC`,
        [exam.id],
      ),

      safeQuery<EligibilityRow>(
        `SELECT id, degreeId, degreeName, description
         FROM exam_eligibilities
         WHERE typeOfExaminations_id = ?
         ORDER BY id ASC`,
        [exam.id],
      ),

      safeQuery<PatternRow>(
        `SELECT
           id, degreeId, degreeName, patternDesc, modeOfExam,
           examDuration, totalQuestion, totalMarks, section,
           markingSchem, languageofpaper
         FROM exam_patterns
         WHERE typeOfExaminations_id = ?
         ORDER BY id ASC`,
        [exam.id],
      ),

      safeQuery<FeeRow>(
        `SELECT id, category, quota, mode, gender, amount
         FROM exam_application_fees
         WHERE typeOfExaminations_id = ?
         ORDER BY id ASC`,
        [exam.id],
      ),

      safeQuery<AppProcessRow>(
        `SELECT
           id, modeofapplication, modeofpayment, description,
           examinationtype, applicationandexamstatus, examinationmode,
           eligibilitycriteria
         FROM exam_application_processes
         WHERE typeOfExaminations_id = ?
         ORDER BY id ASC`,
        [exam.id],
      ),
    ]);

  // ── Normalize text fields ─────────────────────────────────────────────────
  const descText = stripHtml(exam.description);
  const contentText = stripHtml(exam.content);
  const eligibilityCriteriaText = stripHtml(exam.examEligibilityCriteria);
  const examDatesText = stripHtml(exam.examDates);

  // ── Section visibility flags ──────────────────────────────────────────────
  const hasAbout = !!descText || !!contentText;
  const hasDates = dateRows.length > 0 || !!examDatesText;
  const hasEligibility =
    eligibilityRows.length > 0 || !!eligibilityCriteriaText;
  const hasPattern = patternRows.length > 0;
  const hasFees = feeRows.length > 0;
  const hasProcess = appProcessRows.length > 0;

  // ── Jump nav items ────────────────────────────────────────────────────────
  const jumpItems = [
    { id: "about", label: "About", show: hasAbout, icon: "info" },
    {
      id: "dates",
      label: "Important Dates",
      show: hasDates,
      icon: "calendar_month",
    },
    {
      id: "eligibility",
      label: "Eligibility",
      show: hasEligibility,
      icon: "verified",
    },
    {
      id: "pattern",
      label: "Exam Pattern",
      show: hasPattern,
      icon: "format_list_bulleted",
    },
    { id: "fees", label: "Application Fees", show: hasFees, icon: "payments" },
    {
      id: "process",
      label: "How to Apply",
      show: hasProcess,
      icon: "how_to_reg",
    },
  ].filter((j) => j.show);

  return (
    <div className="space-y-6">
      {/* ── Jump Navigation ───────────────────────────────────────────────── */}
      {jumpItems.length > 1 && (
        <nav className="bg-white rounded-2xl border border-neutral-100 px-5 py-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">
            On this page:
          </span>
          {jumpItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {/* ── About ─────────────────────────────────────────────────────────── */}
      {hasAbout && (
        <section
          id="about"
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24"
        >
          <SectionTitle icon="info" title={`About ${exam.title}`} />
          {contentText ? (
            <div className="text-sm text-neutral-600 leading-relaxed space-y-3">
              {contentText.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {descText}
            </p>
          )}
        </section>
      )}

      {/* ── Key Dates (quick overview row) ────────────────────────────────── */}
      {(exam.applicationFrom ||
        exam.applicationTo ||
        exam.exminationDate ||
        exam.resultAnnounce) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: "edit_document",
              label: "Application Opens",
              date: exam.applicationFrom,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: "calendar_today",
              label: "Application Closes",
              date: exam.applicationTo,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
            {
              icon: "event",
              label: "Exam Date",
              date: exam.exminationDate,
              color: "text-red-600",
              bg: "bg-red-50",
              border: "border-red-100",
            },
            {
              icon: "emoji_events",
              label: "Result Date",
              date: exam.resultAnnounce,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
          ]
            .filter((d) => d.date)
            .map((d) => (
              <div
                key={d.label}
                className={`${d.bg} border ${d.border} rounded-2xl p-4 flex flex-col gap-2`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${d.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {d.icon}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                    {d.label}
                  </p>
                  <p
                    className={`text-sm font-black ${d.color} leading-tight mt-0.5`}
                  >
                    {formatDate(d.date)}
                  </p>
                  {isUpcoming(d.date) && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-white rounded-full px-1.5 py-0.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Important Dates Table ─────────────────────────────────────────── */}
      {hasDates && (
        <section
          id="dates"
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24"
        >
          <div className="px-6 py-4 border-b border-neutral-100">
            <SectionTitle icon="calendar_month" title="Important Dates" />
          </div>

          {dateRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-left">
                    <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Degree
                    </th>
                    <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {dateRows.map((row) => {
                    const upcoming = isUpcoming(row.eventDate);
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors hover:bg-neutral-50 ${
                          upcoming ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            {upcoming && (
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                            )}
                            <span className="font-semibold text-neutral-900 text-xs">
                              {row.eventName || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`text-xs font-black ${
                              upcoming ? "text-red-600" : "text-neutral-700"
                            }`}
                          >
                            {formatDate(row.eventDate)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-neutral-500">
                          {row.degreeName || "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          {row.eventStatus ? (
                            <span
                              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                row.eventStatus
                                  .toLowerCase()
                                  .includes("active") ||
                                row.eventStatus.toLowerCase().includes("open")
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : row.eventStatus
                                        .toLowerCase()
                                        .includes("closed") ||
                                      row.eventStatus
                                        .toLowerCase()
                                        .includes("over")
                                    ? "bg-neutral-100 text-neutral-500"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {row.eventStatus}
                            </span>
                          ) : upcoming ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              Upcoming
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : examDatesText ? (
            <div className="p-6">
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {examDatesText}
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* ── Eligibility ───────────────────────────────────────────────────── */}
      {hasEligibility && (
        <section
          id="eligibility"
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24"
        >
          <SectionTitle icon="verified" title="Eligibility Criteria" />

          {eligibilityRows.length > 0 ? (
            <div className="space-y-5">
              {eligibilityRows.map((row, idx) => (
                <div key={row.id}>
                  {(row.degreeName || eligibilityRows.length > 1) && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      {row.degreeName && (
                        <h4 className="text-sm font-black text-neutral-800">
                          {row.degreeName}
                        </h4>
                      )}
                    </div>
                  )}
                  {row.description && (
                    <div className="ml-7 text-sm text-neutral-600 leading-relaxed">
                      {stripHtml(row.description)
                        .split(/\n+/)
                        .filter(Boolean)
                        .map((line, li) => (
                          <p key={li} className={li > 0 ? "mt-1.5" : ""}>
                            {line.trim()}
                          </p>
                        ))}
                    </div>
                  )}
                  {idx < eligibilityRows.length - 1 && (
                    <div className="mt-4 border-b border-dashed border-neutral-100" />
                  )}
                </div>
              ))}
            </div>
          ) : eligibilityCriteriaText ? (
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {eligibilityCriteriaText}
            </p>
          ) : null}
        </section>
      )}

      {/* ── Exam Pattern ──────────────────────────────────────────────────── */}
      {hasPattern && (
        <section
          id="pattern"
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24"
        >
          <div className="px-6 py-4 border-b border-neutral-100">
            <SectionTitle icon="format_list_bulleted" title="Exam Pattern" />
          </div>

          <div className="divide-y divide-neutral-50">
            {patternRows.map((row, idx) => (
              <div key={row.id} className="p-6">
                {row.degreeName && (
                  <h4 className="text-sm font-black text-neutral-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 text-[11px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {row.degreeName}
                  </h4>
                )}

                {/* Pattern grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      icon: "devices",
                      label: "Mode",
                      value: row.modeOfExam,
                    },
                    {
                      icon: "schedule",
                      label: "Duration",
                      value: row.examDuration,
                    },
                    {
                      icon: "quiz",
                      label: "Total Questions",
                      value: row.totalQuestion,
                    },
                    {
                      icon: "stars",
                      label: "Total Marks",
                      value: row.totalMarks,
                    },
                    {
                      icon: "view_column",
                      label: "Sections",
                      value: row.section,
                    },
                    {
                      icon: "translate",
                      label: "Language",
                      value: row.languageofpaper,
                    },
                  ]
                    .filter((f) => f.value)
                    .map((field) => (
                      <div
                        key={field.label}
                        className="bg-neutral-50 rounded-xl p-3 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-red-400">
                            {field.icon}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                            {field.label}
                          </span>
                        </div>
                        <p className="text-sm font-black text-neutral-800 leading-snug">
                          {field.value}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Marking scheme */}
                {row.markingSchem && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-3">
                    <span
                      className="material-symbols-outlined text-[18px] text-amber-500 flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      calculate
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">
                        Marking Scheme
                      </p>
                      <p className="text-sm text-amber-800 font-semibold">
                        {row.markingSchem}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pattern description */}
                {row.patternDesc && (
                  <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {stripHtml(row.patternDesc)
                      .split(/\n+/)
                      .filter(Boolean)
                      .map((line, li) => (
                        <p key={li} className={li > 0 ? "mt-1.5" : ""}>
                          {line.trim()}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Application Fees ──────────────────────────────────────────────── */}
      {hasFees && (
        <section
          id="fees"
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24"
        >
          <div className="px-6 py-4 border-b border-neutral-100">
            <SectionTitle icon="payments" title="Application Fees" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  {["Category", "Quota", "Mode", "Gender", "Amount"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {feeRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold text-neutral-800">
                        {row.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-600">
                      {row.quota || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-600">
                      {row.mode || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-600">
                      {row.gender || "All"}
                    </td>
                    <td className="px-6 py-3.5">
                      {row.amount ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">
                            currency_rupee
                          </span>
                          {row.amount}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">
                info
              </span>
              Fee amounts are subject to change. Verify on the official website
              before applying.
            </p>
          </div>
        </section>
      )}

      {/* ── Application Process ───────────────────────────────────────────── */}
      {hasProcess && (
        <section
          id="process"
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24"
        >
          <SectionTitle icon="how_to_reg" title="How to Apply" />

          <div className="space-y-6">
            {appProcessRows.map((row, idx) => (
              <div key={row.id} className="relative">
                {/* Step connector line */}
                {idx < appProcessRows.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-neutral-100" />
                )}

                <div className="flex gap-4">
                  {/* Step number */}
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 z-10">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Mode pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {row.modeofapplication && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">
                            app_registration
                          </span>
                          Apply: {row.modeofapplication}
                        </span>
                      )}
                      {row.modeofpayment && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">
                            payments
                          </span>
                          Payment: {row.modeofpayment}
                        </span>
                      )}
                      {row.examinationmode && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">
                            devices
                          </span>
                          Exam Mode: {row.examinationmode}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {row.description && (
                      <p className="text-sm text-neutral-600 leading-relaxed mb-2">
                        {stripHtml(row.description)}
                      </p>
                    )}

                    {/* Eligibility criteria inline */}
                    {row.eligibilitycriteria && (
                      <div className="bg-neutral-50 rounded-xl px-4 py-3 mt-2">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
                          Eligibility
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {stripHtml(row.eligibilitycriteria)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Official link CTA ─────────────────────────────────────────────── */}
      {exam.getMoreInfoLink && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-[22px] text-red-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              open_in_new
            </span>
            <div>
              <p className="text-white font-black text-sm mb-0.5">
                Get the latest information
              </p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Dates and details may change. Always verify on the official exam
                website before applying.
              </p>
            </div>
          </div>
          <a
            href={exam.getMoreInfoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20 whitespace-nowrap flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">
              open_in_new
            </span>
            Official Website
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="text-base font-black text-neutral-900 flex items-center gap-2 mb-4">
      <span
        className="material-symbols-outlined text-[20px] text-red-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      {title}
    </h2>
  );
}
