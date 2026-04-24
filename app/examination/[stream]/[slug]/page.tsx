import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null): string {
  if (!raw || !raw.trim()) return "";
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (html === null || html === undefined || html === "") return "";
  const str = String(html);
  return str
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


// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamBaseRow {
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
  syllabus: string | null;
}

interface ExamDateRow {
  id: number;
  degreeId: number | null;
  degreeName: string | null;
  eventName: string | null;
  eventDate: string | null;
  eventStatus: string | null;
}

interface EligibilityRow {
  id: number;
  degreeId: number | null;
  degreeName: string | null;
  description: string | null;
}

interface PatternRow {
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

interface FeeRow {
  id: number;
  category: string | null;
  quota: string | null;
  mode: string | null;
  gender: string | null;
  amount: string | null;
}

interface AppProcessRow {
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

export default async function ExamOverviewPage({ params }: { params: Promise<{ stream: string; slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const examDoc = await db.collection("examination_details").findOne({ slug });
  if (!examDoc) notFound();
  const exam: ExamBaseRow = {
    id: examDoc.id, title: examDoc.title, slug: examDoc.slug,
    description: examDoc.description ?? null, content: examDoc.content ?? null,
    examEligibilityCriteria: examDoc.examEligibilityCriteria ?? null, examDates: examDoc.examDates ?? null,
    admidCardDesc: examDoc.admidCardDesc ?? null, admidCardInstructions: examDoc.admidCardInstructions ?? null,
    examResultDesc: examDoc.examResultDesc ?? null, mockTestDesc: examDoc.mockTestDesc ?? null,
    getMoreInfoLink: examDoc.getMoreInfoLink ?? null,
    applicationFrom: examDoc.applicationFrom ?? null, applicationTo: examDoc.applicationTo ?? null,
    exminationDate: examDoc.exminationDate ?? null, resultAnnounce: examDoc.resultAnnounce ?? null,
    syllabus: examDoc.syllabus ?? null,
  };

  // ── Step 2: fetch all sub-data in parallel using exam.id ─────────────────
  const [dateRows, eligibilityRows, patternRows, feeRows, appProcessRows] = await Promise.all([
    db.collection("exam_dates").find({ typeOfExaminations_id: exam.id }).sort({ eventDate: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, eventName: r.eventName ?? null, eventDate: r.eventDate ?? null, eventStatus: r.eventStatus ?? null } as ExamDateRow))),
    db.collection("exam_eligibilities").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, description: r.description ?? null } as EligibilityRow))),
    db.collection("exam_patterns").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, patternDesc: r.patternDesc ?? null, modeOfExam: r.modeOfExam ?? null, examDuration: r.examDuration ?? null, totalQuestion: r.totalQuestion ?? null, totalMarks: r.totalMarks ?? null, section: r.section ?? null, markingSchem: r.markingSchem ?? null, languageofpaper: r.languageofpaper ?? null } as PatternRow))),
    db.collection("exam_application_fees").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, category: r.category ?? null, quota: r.quota ?? null, mode: r.mode ?? null, gender: r.gender ?? null, amount: r.amount ?? null } as FeeRow))),
    db.collection("exam_application_processes").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, modeofapplication: r.modeofapplication ?? null, modeofpayment: r.modeofpayment ?? null, description: r.description ?? null, examinationtype: r.examinationtype ?? null, applicationandexamstatus: r.applicationandexamstatus ?? null, examinationmode: r.examinationmode ?? null, eligibilitycriteria: r.eligibilitycriteria ?? null } as AppProcessRow))),
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
  const hasSyllabus = !!exam.syllabus;

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
      id: "syllabus",
      label: "Syllabus",
      show: hasSyllabus,
      icon: "menu_book",
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
        <nav className="bg-transparent rounded-2xl border border-neutral-200 px-5 py-3 flex items-center gap-1.5 flex-wrap shadow-sm">
          <span className="text-[10px] font-bold text-black uppercase tracking-widest mr-2">
            On this page:
          </span>
          {jumpItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>
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
                color: "text-blue-700",
              },
              {
                icon: "calendar_today",
                label: "Application Closes",
                date: exam.applicationTo,
                color: "text-amber-700",
              },
              {
                icon: "event",
                label: "Exam Date",
                date: exam.exminationDate,
                color: "text-red-700",
              },
              {
                icon: "emoji_events",
                label: "Result Date",
                date: exam.resultAnnounce,
                color: "text-emerald-700",
              },
            ]
              .filter((d) => d.date)
              .map((d) => (
                <div
                  key={d.label}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-2 shadow-md"
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
                      className="text-sm font-black text-black leading-tight mt-0.5"
                    >
                      {formatDate(d.date)}
                    </p>
                    {isUpcoming(d.date) && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5 mt-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

      {/* ── About ─────────────────────────────────────────────────────────── */}
      {hasAbout && (
        <section
          id="about"
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24 shadow-md"
        >
          <SectionTitle icon="info" title={`About ${exam.title}`} />
          {contentText ? (
            <div className="text-sm text-black leading-relaxed space-y-3 font-medium">
              {contentText.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black leading-relaxed font-medium">
              {descText}
            </p>
          )}
        </section>
      )}

      {/* ── Important Dates Table ─────────────────────────────────────────── */}
      {hasDates && (
        <section
          id="dates"
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24 shadow-md"
        >
          <div className="px-6 py-4 border-b border-neutral-100 bg-white">
            <SectionTitle icon="calendar_month" title="Important Dates" />
          </div>

          {dateRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-neutral-100 text-left">
                    <th className="px-6 py-3 text-[11px] font-black text-black uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-[11px] font-black text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-[11px] font-black text-black uppercase tracking-wider">
                      Degree
                    </th>
                    <th className="px-6 py-3 text-[11px] font-black text-black uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {dateRows.map((row) => {
                    const upcoming = isUpcoming(row.eventDate);
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors hover:bg-neutral-50 ${upcoming ? "bg-red-50/30" : ""
                          }`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            {upcoming && (
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse flex-shrink-0" />
                            )}
                            <span className="font-bold text-black text-xs">
                              {row.eventName || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`text-xs font-black ${upcoming ? "text-red-700" : "text-black"
                              }`}
                          >
                            {formatDate(row.eventDate)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-neutral-900 font-medium">
                          {row.degreeName || "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          {row.eventStatus ? (
                            <span
                              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full ${(() => {
                                const s = String(row.eventStatus).toLowerCase();
                                return s.includes("active") || s.includes("open")
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : s.includes("closed") || s.includes("over")
                                      ? "bg-neutral-100 text-neutral-600"
                                      : "bg-amber-50 text-amber-800 border border-amber-200";
                              })()
                                }`}
                            >
                              {String(row.eventStatus)}
                            </span>
                          ) : upcoming ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                              Upcoming
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">
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
            <div className="p-6 bg-white">
              <p className="text-sm text-black leading-relaxed whitespace-pre-line font-medium">
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
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24 shadow-md"
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
                        <h4 className="text-sm font-black text-black">
                          {row.degreeName}
                        </h4>
                      )}
                    </div>
                  )}
                  {row.description && (
                    <div className="ml-7 text-sm text-black font-medium leading-relaxed">
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
            <div className="p-6 bg-white">
              <p className="text-sm text-black font-medium leading-relaxed whitespace-pre-line">
                {eligibilityCriteriaText}
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* ── Syllabus ───────────────────────────────────────────────────── */}
      {hasSyllabus && (
        <section
          id="syllabus"
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24 shadow-md"
        >
          <SectionTitle icon="menu_book" title="Syllabus" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <p className="text-sm text-black font-medium leading-relaxed">
              View and download the complete syllabus for {exam.title}.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("syllabus-modal")?.classList.remove("hidden");
                document.getElementById("syllabus-modal")?.classList.add("flex");
              }}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              View Syllabus
            </a>
          </div>
        </section>
      )}

      {/* ── Exam Pattern ──────────────────────────────────────────────────── */}
      {hasPattern && (
        <section
          id="pattern"
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24 shadow-md"
        >
          <div className="px-6 py-4 border-b border-neutral-100 bg-white">
            <SectionTitle icon="format_list_bulleted" title="Exam Pattern" />
          </div>

          <div className="divide-y divide-neutral-100 bg-white">
            {patternRows.map((row, idx) => (
              <div key={row.id} className="p-6">
                {row.degreeName && (
                  <h4 className="text-sm font-black text-black mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-700 text-[11px] font-black flex items-center justify-center border border-red-100">
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
                        className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col gap-1.5 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-red-600">
                            {field.icon}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                            {field.label}
                          </span>
                        </div>
                        <p className="text-sm font-black text-black leading-snug">
                          {field.value}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Marking scheme */}
                {row.markingSchem && (
                  <div className="bg-white border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-3 shadow-sm">
                    <span
                      className="material-symbols-outlined text-[18px] text-red-600 flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      calculate
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-0.5">
                        Marking Scheme
                      </p>
                      <p className="text-sm text-black font-black">
                        {row.markingSchem}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pattern description */}
                {row.patternDesc && (
                  <div className="mt-2 text-sm text-black font-medium leading-relaxed">
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
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-24 shadow-md"
        >
          <div className="px-6 py-4 border-b border-neutral-100 bg-white">
            <SectionTitle icon="payments" title="Application Fees" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-neutral-100 text-left">
                  {["Category", "Quota", "Mode", "Gender", "Amount"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[11px] font-black text-black uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {feeRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-black text-black">
                        {row.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-800 font-medium">
                      {row.quota || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-800 font-medium">
                      {row.mode || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-neutral-800 font-medium">
                      {row.gender || "All"}
                    </td>
                    <td className="px-6 py-3.5">
                      {row.amount ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">
                            currency_rupee
                          </span>
                          {row.amount}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200">
            <p className="text-[11px] text-neutral-600 font-bold flex items-center gap-1.5">
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
          className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-24 shadow-md"
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
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Mode pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {row.modeofapplication && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-full shadow-md">
                          <span className="material-symbols-outlined text-[12px]">
                            app_registration
                          </span>
                          Apply: {row.modeofapplication}
                        </span>
                      )}
                      {row.modeofpayment && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-full shadow-md">
                          <span className="material-symbols-outlined text-[12px]">
                            payments
                          </span>
                          Payment: {row.modeofpayment}
                        </span>
                      )}
                      {row.examinationmode && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-white border border-purple-200 px-2.5 py-1 rounded-full shadow-md">
                          <span className="material-symbols-outlined text-[12px]">
                            devices
                          </span>
                          Exam Mode: {row.examinationmode}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {row.description && (
                      <p className="text-sm text-black font-medium leading-relaxed mb-2">
                        {stripHtml(row.description)}
                      </p>
                    )}

                    {/* Eligibility criteria inline */}
                    {row.eligibilitycriteria && (
                      <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3 mt-2 shadow-md">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
                          Eligibility
                        </p>
                        <p className="text-xs text-black leading-relaxed font-bold">
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
        <div className="bg-neutral-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-neutral-800 overflow-hidden relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/20">
              <span
                className="material-symbols-outlined text-[24px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                open_in_new
              </span>
            </div>
            <div>
              <p className="text-white font-black text-lg mb-1 leading-tight">
                Get the latest information
              </p>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
                Dates and details may change. Always verify on the official exam
                website before applying.
              </p>
            </div>
          </div>
          <a
            href={exam.getMoreInfoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 whitespace-nowrap flex-shrink-0 hover:scale-[1.02] active:scale-[0.98] relative z-10"
          >
            Official Website
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </a>
        </div>
      )}

      {/* ── Syllabus Modal ───────────────────────────────────────────────── */}
      {hasSyllabus && exam.syllabus && (
        <div
          id="syllabus-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.classList.add("hidden");
              e.currentTarget.classList.remove("flex");
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
              <h3 className="text-lg font-black text-black flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
                {exam.title} Syllabus
              </h3>
              <button
                onClick={() => {
                  document.getElementById("syllabus-modal")?.classList.add("hidden");
                  document.getElementById("syllabus-modal")?.classList.remove("flex");
                }}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-neutral-600">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="prose prose-sm max-w-none text-black font-medium leading-relaxed whitespace-pre-line">
                {stripHtml(exam.syllabus)}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50 shrink-0">
              <p className="text-xs text-neutral-500">
                Download the official syllabus for reference.
              </p>
              <button
                onClick={() => {
                  const content = stripHtml(exam.syllabus);
                  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${exam.title.replace(/[^a-z0-9]/gi, "-")}-syllabus.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <h2
      className="bg-white text-base font-black flex items-center gap-2 mb-4 text-black"
    >
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
