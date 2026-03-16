import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BOARD_IMAGE =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_BOARD_IMAGE;
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

function renderParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw).trim();
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
    console.error("[board/[category]/[slug]/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardRow extends RowDataPacket {
  id: number;
  title: string;
  name: string | null;
  status: number;
  misc: string | null;
  slug: string;
}

interface BoardDetailRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
  image: string | null;
  aboutBoard: string | null;
  admissionDesc: string | null;
  boardDesc: string | null;
  syllabusDesc: string | null;
  samplePaper: string | null;
  admitCardDetails: string | null;
  preprationTips: string | null;
  resultDesc: string | null;
  entranceExam: string | null;
  chooseRightCollege: string | null;
  counselingBoardId: number;
}

interface HighlightRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
}

interface ImpDateRow extends RowDataPacket {
  id: number;
  dates: string | null;
  description: string | null;
}

interface LatestUpdateRow extends RowDataPacket {
  id: number;
  dates: string | null;
  description: string | null;
}

interface SyllabusRow extends RowDataPacket {
  id: number;
  class: string | null;
  subject: string | null;
  description: string | null;
}

interface ExamDateRow extends RowDataPacket {
  id: number;
  class: string | null;
  dates: string | null;
  subject: string | null;
  setting: string | null;
}

interface SamplePaperRow extends RowDataPacket {
  id: number;
  class: string | null;
  subject: string | null;
  description: string | null;
}

interface AdmissionDateRow extends RowDataPacket {
  id: number;
  place: string | null;
  dates: string | null;
  fees: string | null;
  class: string | null;
  subjects: string | null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rows = await safeQuery<
    BoardRow & { detail_image: string | null; about_text: string | null }
  >(
    `SELECT
       cb.title, cb.name,
       cbd.image       AS detail_image,
       cbd.aboutBoard  AS about_text,
       cbd.description AS detail_desc
     FROM counseling_boards cb
     LEFT JOIN counseling_board_details cbd ON cbd.counselingBoardId = cb.id
     WHERE cb.slug = ? AND cb.status = 1
     LIMIT 1`,
    [slug],
  );
  const board = rows[0];
  if (!board) return { title: "Board Not Found — AdmissionX" };

  const displayName = board.name || board.title;
  const rawDesc =
    (
      board as unknown as {
        about_text: string | null;
        detail_desc: string | null;
      }
    ).about_text ??
    (board as unknown as { detail_desc: string | null }).detail_desc;
  const desc = stripHtml(rawDesc).slice(0, 160);

  return {
    title: `${displayName} — Board Details | AdmissionX`,
    description:
      desc ||
      `Get complete details on ${displayName} — syllabus, exam dates, sample papers, important dates, and admission information.`,
    openGraph: {
      title: `${displayName} | AdmissionX`,
      description: desc,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  // category is a soft URL segment — ignore it and look up by slug only
  const { slug } = await params;

  // ── Step 1: Fetch core board record ───────────────────────────────────────
  const boardRows = await safeQuery<BoardRow>(
    `SELECT id, title, name, status, misc, slug
     FROM counseling_boards
     WHERE slug = ? AND status = 1
     LIMIT 1`,
    [slug],
  );

  const board = boardRows[0];
  if (!board) notFound();

  // ── Step 2: Fetch all related tables in parallel ───────────────────────────
  const [
    detailRows,
    highlights,
    impDates,
    latestUpdates,
    syllabus,
    examDates,
    samplePapers,
    admissionDates,
  ] = await Promise.all([
    safeQuery<BoardDetailRow>(
      `SELECT id, title, description, image, aboutBoard, admissionDesc,
              boardDesc, syllabusDesc, samplePaper, admitCardDetails,
              preprationTips, resultDesc, entranceExam, chooseRightCollege,
              counselingBoardId
       FROM counseling_board_details
       WHERE counselingBoardId = ?
       LIMIT 1`,
      [board.id],
    ),
    safeQuery<HighlightRow>(
      `SELECT id, title, description
       FROM counseling_board_highlights
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
    safeQuery<ImpDateRow>(
      `SELECT id, dates, description
       FROM counseling_board_imp_dates
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
    safeQuery<LatestUpdateRow>(
      `SELECT id, dates, description
       FROM counseling_board_latest_updates
       WHERE counselingBoardId = ?
       ORDER BY id DESC`,
      [board.id],
    ),
    safeQuery<SyllabusRow>(
      `SELECT id, \`class\`, subject, description
       FROM counseling_board_syllabus
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
    safeQuery<ExamDateRow>(
      `SELECT id, \`class\`, dates, subject, setting
       FROM counseling_board_exam_dates
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
    safeQuery<SamplePaperRow>(
      `SELECT id, \`class\`, subject, description
       FROM counseling_board_sample_papers
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
    safeQuery<AdmissionDateRow>(
      `SELECT id, place, dates, fees, \`class\`, subjects
       FROM counseling_board_admission_dates
       WHERE counselingBoardId = ?
       ORDER BY id ASC`,
      [board.id],
    ),
  ]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const detail = detailRows[0] ?? null;
  const displayName = board.name || board.title;
  const imgUrl = buildImageUrl(detail?.image);

  const aboutRaw = stripHtml(
    detail?.aboutBoard ?? detail?.boardDesc ?? detail?.description,
  );
  const admissionRaw = stripHtml(detail?.admissionDesc);
  const syllabusDescRaw = stripHtml(detail?.syllabusDesc);
  const samplePaperDescRaw = stripHtml(detail?.samplePaper);
  const admitCardRaw = stripHtml(detail?.admitCardDetails);
  const prepTipsRaw = stripHtml(detail?.preprationTips);
  const resultRaw = stripHtml(detail?.resultDesc);
  const entranceExamRaw = stripHtml(detail?.entranceExam);

  // ── Section visibility flags ──────────────────────────────────────────────
  const hasAbout = !!aboutRaw;
  const hasHighlights = highlights.length > 0;
  const hasImpDates = impDates.length > 0;
  const hasLatestUpdates = latestUpdates.length > 0;
  const hasSyllabus = syllabus.length > 0 || !!syllabusDescRaw;
  const hasExamDates = examDates.length > 0;
  const hasSamplePapers = samplePapers.length > 0 || !!samplePaperDescRaw;
  const hasAdmissionDates = admissionDates.length > 0 || !!admissionRaw;
  const hasAdmitCard = !!admitCardRaw;
  const hasPrepTips = !!prepTipsRaw;
  const hasResult = !!resultRaw;
  const hasEntrance = !!entranceExamRaw;

  const jumpItems = [
    { id: "about", label: "About", icon: "info", show: hasAbout },
    {
      id: "highlights",
      label: "Highlights",
      icon: "star",
      show: hasHighlights,
    },
    {
      id: "imp-dates",
      label: "Important Dates",
      icon: "calendar_month",
      show: hasImpDates,
    },
    {
      id: "updates",
      label: "Latest Updates",
      icon: "notifications",
      show: hasLatestUpdates,
    },
    { id: "syllabus", label: "Syllabus", icon: "menu_book", show: hasSyllabus },
    {
      id: "exam-dates",
      label: "Exam Dates",
      icon: "event",
      show: hasExamDates,
    },
    {
      id: "papers",
      label: "Sample Papers",
      icon: "assignment",
      show: hasSamplePapers,
    },
    {
      id: "admission",
      label: "Admission Dates",
      icon: "how_to_reg",
      show: hasAdmissionDates,
    },
    {
      id: "admit-card",
      label: "Admit Card",
      icon: "badge",
      show: hasAdmitCard,
    },
    {
      id: "prep-tips",
      label: "Prep Tips",
      icon: "tips_and_updates",
      show: hasPrepTips,
    },
    { id: "result", label: "Results", icon: "emoji_events", show: hasResult },
  ].filter((j) => j.show);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-neutral-900 pt-24 pb-12 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imgUrl}
            alt={displayName}
            fill
            priority
            className="object-cover opacity-[0.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/85 to-neutral-900" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <Link href="/boards" className="hover:text-white transition-colors">
              Boards
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300 truncate max-w-[200px]">
              {displayName}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    school
                  </span>
                  Education Board
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                {board.title}
              </h1>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {hasHighlights && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">
                      star
                    </span>
                    <span className="text-xs font-bold text-white">
                      {highlights.length} Highlight
                      {highlights.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {hasSyllabus && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">
                      menu_book
                    </span>
                    <span className="text-xs font-bold text-white">
                      Syllabus Available
                    </span>
                  </div>
                )}
                {hasExamDates && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">
                      event
                    </span>
                    <span className="text-xs font-bold text-white">
                      {examDates.length} Exam Date
                      {examDates.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {hasSamplePapers && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-purple-400">
                      assignment
                    </span>
                    <span className="text-xs font-bold text-white">
                      Sample Papers
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Board initials badge — desktop */}
            <div className="hidden lg:flex items-center justify-center w-36 h-36 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex-shrink-0">
              <div className="text-center">
                <span
                  className="material-symbols-outlined text-[48px] text-amber-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
                <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest mt-1 max-w-[120px] truncate px-2">
                  {displayName.length > 10
                    ? displayName
                        .split(/\s+/)
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 5)
                        .toUpperCase()
                    : displayName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Jump Navigation ───────────────────────────────────────────────── */}
      {jumpItems.length > 1 && (
        <div className="bg-white border-b border-neutral-100 shadow-sm sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav
              className="flex items-center overflow-x-auto scrollbar-hide"
              aria-label="Board sections"
            >
              {jumpItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 px-4 py-4 text-xs font-bold text-neutral-500 hover:text-amber-600 whitespace-nowrap transition-colors shrink-0 border-b-2 border-transparent hover:border-amber-300 -mb-px"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ══ LEFT / MAIN COLUMN ══════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* About */}
            {hasAbout && (
              <section
                id="about"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="info" title={`About ${displayName}`} />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-3">
                  {renderParagraphs(aboutRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights */}
            {hasHighlights && (
              <section id="highlights" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-[15px] text-amber-500"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <h2 className="text-base font-black text-neutral-800">
                    Highlights
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {highlights.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span
                            className="material-symbols-outlined text-[16px] text-amber-500"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </div>
                        <div className="min-w-0">
                          {h.title && (
                            <p className="text-xs font-black text-neutral-800 mb-1 leading-snug">
                              {h.title}
                            </p>
                          )}
                          {h.description && (
                            <p className="text-xs text-neutral-500 leading-relaxed">
                              {stripHtml(h.description)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Important Dates */}
            {hasImpDates && (
              <section
                id="imp-dates"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="calendar_month" title="Important Dates" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {impDates.length} event{impDates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-neutral-50">
                  {impDates.map((item) => {
                    const upcoming = isUpcoming(item.dates);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-4 px-6 py-4 transition-colors ${upcoming ? "bg-amber-50/40" : "hover:bg-neutral-50"}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${upcoming ? "bg-amber-100" : "bg-neutral-100"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-[16px] ${upcoming ? "text-amber-600" : "text-neutral-400"}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              event
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          {item.description && (
                            <p className="text-xs font-semibold text-neutral-800 leading-snug mb-1">
                              {stripHtml(item.description)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-black ${upcoming ? "text-amber-600" : "text-neutral-500"}`}
                            >
                              {formatDate(item.dates)}
                            </span>
                            {upcoming && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Latest Updates */}
            {hasLatestUpdates && (
              <section
                id="updates"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="notifications" title="Latest Updates" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {latestUpdates.length} update
                    {latestUpdates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-neutral-50">
                  {latestUpdates.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                            idx === 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.description && (
                          <p className="text-xs font-medium text-neutral-700 leading-relaxed mb-1">
                            {stripHtml(item.description)}
                          </p>
                        )}
                        {item.dates && (
                          <span className="text-[10px] font-bold text-neutral-400">
                            {formatDate(item.dates)}
                          </span>
                        )}
                      </div>
                      {idx === 0 && (
                        <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Syllabus */}
            {hasSyllabus && (
              <section
                id="syllabus"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="menu_book" title="Syllabus" />
                  {syllabus.length > 0 ? (
                    <span className="text-xs font-semibold text-neutral-400">
                      {syllabus.length} subject
                      {syllabus.length !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
                {syllabus.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 text-left">
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-24">
                            Class
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-[30%]">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {syllabus.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              {row.class ? (
                                <span className="inline-flex items-center text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                                  {row.class}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">
                                  &mdash;
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-neutral-800">
                                {row.subject || "\u2014"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-600 leading-relaxed">
                              {stripHtml(row.description) || "\u2014"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : syllabusDescRaw ? (
                  <div className="p-6">
                    <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
                      {renderParagraphs(syllabusDescRaw).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* Exam Dates */}
            {hasExamDates && (
              <section
                id="exam-dates"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="event" title="Exam Dates" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {examDates.length} schedule
                    {examDates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-24">
                          Class
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Setting
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {examDates.map((row) => {
                        const upcoming = isUpcoming(row.dates);
                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors ${
                              upcoming
                                ? "bg-amber-50/30"
                                : "hover:bg-neutral-50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              {row.class ? (
                                <span className="inline-flex items-center text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                                  {row.class}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">
                                  \u2014
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-neutral-700">
                              {row.subject || "\u2014"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {upcoming && (
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                                )}
                                <span
                                  className={`text-xs font-black ${
                                    upcoming
                                      ? "text-amber-600"
                                      : "text-neutral-600"
                                  }`}
                                >
                                  {formatDate(row.dates)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-500">
                              {row.setting || "\u2014"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Sample Papers */}
            {hasSamplePapers && (
              <section
                id="papers"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="assignment" title="Sample Papers" />
                  {samplePapers.length > 0 && (
                    <span className="text-xs font-semibold text-neutral-400">
                      {samplePapers.length} paper
                      {samplePapers.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {samplePapers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 text-left">
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-24">
                            Class
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-[30%]">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {samplePapers.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              {row.class ? (
                                <span className="inline-flex items-center text-[11px] font-black text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                                  {row.class}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">
                                  \u2014
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-neutral-800">
                                {row.subject || "\u2014"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-600 leading-relaxed">
                              {stripHtml(row.description) || "\u2014"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : samplePaperDescRaw ? (
                  <div className="p-6">
                    <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
                      {renderParagraphs(samplePaperDescRaw).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* Admission Dates */}
            {hasAdmissionDates && (
              <section
                id="admission"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="how_to_reg" title="Admission Dates" />
                  {admissionDates.length > 0 && (
                    <span className="text-xs font-semibold text-neutral-400">
                      {admissionDates.length}{" "}
                      {admissionDates.length !== 1 ? "entries" : "entry"}
                    </span>
                  )}
                </div>
                {admissionDates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 text-left">
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Place / Event
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-20">
                            Class
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Fees
                          </th>
                          <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Subjects
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {admissionDates.map((row) => {
                          const upcoming = isUpcoming(row.dates);
                          return (
                            <tr
                              key={row.id}
                              className={`transition-colors ${
                                upcoming
                                  ? "bg-emerald-50/30"
                                  : "hover:bg-neutral-50"
                              }`}
                            >
                              <td className="px-6 py-4 text-xs font-semibold text-neutral-800">
                                {row.place || "\u2014"}
                              </td>
                              <td className="px-6 py-4">
                                {row.class ? (
                                  <span className="inline-flex text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                    {row.class}
                                  </span>
                                ) : (
                                  <span className="text-xs text-neutral-400">
                                    \u2014
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-xs font-black ${
                                    upcoming
                                      ? "text-emerald-600"
                                      : "text-neutral-600"
                                  }`}
                                >
                                  {formatDate(row.dates)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-neutral-600">
                                {row.fees || "\u2014"}
                              </td>
                              <td className="px-6 py-4 text-xs text-neutral-500 max-w-[160px]">
                                {row.subjects || "\u2014"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : admissionRaw ? (
                  <div className="p-6">
                    <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
                      {renderParagraphs(admissionRaw).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* Admit Card */}
            {hasAdmitCard && (
              <section
                id="admit-card"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="badge" title="Admit Card" />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(admitCardRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Preparation Tips */}
            {hasPrepTips && (
              <section
                id="prep-tips"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle
                  icon="tips_and_updates"
                  title="Preparation Tips"
                />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(prepTipsRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Results */}
            {hasResult && (
              <section
                id="result"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="emoji_events" title="Results" />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(resultRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Entrance Exam */}
            {hasEntrance && (
              <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                <SectionTitle icon="quiz" title="Entrance Exam Info" />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(entranceExamRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* \u2550\u2550 RIGHT / SIDEBAR \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-5">
            {/* Quick Facts */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-amber-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fact_check
                </span>
                <h3 className="text-sm font-black text-neutral-800">
                  Quick Facts
                </h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {[
                  {
                    icon: "school",
                    label: "Board",
                    value: displayName,
                  },
                  {
                    icon: "star",
                    label: "Highlights",
                    value:
                      highlights.length > 0
                        ? `${highlights.length} key points`
                        : "Not listed",
                  },
                  {
                    icon: "menu_book",
                    label: "Syllabus",
                    value:
                      syllabus.length > 0
                        ? `${syllabus.length} subjects`
                        : hasSyllabus
                          ? "Available"
                          : "Not listed",
                  },
                  {
                    icon: "event",
                    label: "Exam Dates",
                    value:
                      examDates.length > 0
                        ? `${examDates.length} scheduled`
                        : "See schedule",
                  },
                  {
                    icon: "assignment",
                    label: "Sample Papers",
                    value:
                      samplePapers.length > 0
                        ? `${samplePapers.length} available`
                        : hasSamplePapers
                          ? "Available"
                          : "Not listed",
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="px-5 py-3.5 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[15px] text-amber-500">
                        {icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-xs font-bold text-neutral-700 mt-0.5 truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Update highlight */}
            {latestUpdates.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="material-symbols-outlined text-[18px] text-emerald-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    notifications_active
                  </span>
                  <h3 className="text-sm font-black text-emerald-800">
                    Latest Update
                  </h3>
                  <span className="ml-auto inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    New
                  </span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed line-clamp-4">
                  {stripHtml(latestUpdates[0].description)}
                </p>
                {latestUpdates[0].dates && (
                  <p className="text-[10px] font-bold text-emerald-600 mt-2">
                    {formatDate(latestUpdates[0].dates)}
                  </p>
                )}
              </div>
            )}

            {/* Upcoming important date highlight */}
            {impDates.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="material-symbols-outlined text-[18px] text-amber-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    calendar_month
                  </span>
                  <h3 className="text-sm font-black text-amber-800">
                    Next Important Date
                  </h3>
                </div>
                {(() => {
                  const next =
                    impDates.find((d) => isUpcoming(d.dates)) ?? impDates[0];
                  return (
                    <>
                      <p className="text-xs text-amber-700 leading-relaxed mb-2">
                        {stripHtml(next.description)}
                      </p>
                      <span className="text-sm font-black text-amber-800">
                        {formatDate(next.dates)}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Back to Boards CTA */}
            <Link
              href="/boards"
              className="block bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 group hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[20px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    school
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest">
                    Explore
                  </p>
                  <p className="text-sm font-black text-white">
                    All Education Boards
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-100 leading-relaxed mb-3">
                Compare CBSE, ICSE, state boards and more — syllabus, dates,
                sample papers.
              </p>
              <div className="flex items-center gap-1 text-xs font-black text-white group-hover:gap-2 transition-all">
                View all boards
                <span className="material-symbols-outlined text-[15px]">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Related links */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-black text-neutral-800">
                  Explore More
                </h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {[
                  {
                    href: "/examination",
                    icon: "quiz",
                    label: "Entrance Exams",
                    sub: "Find exams by stream",
                  },
                  {
                    href: "/popular-careers",
                    icon: "work",
                    label: "Popular Careers",
                    sub: "Explore career paths",
                  },
                  {
                    href: "/colleges",
                    icon: "account_balance",
                    label: "Top Colleges",
                    sub: "Find the best colleges",
                  },
                ].map(({ href, icon, label, sub }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 group-hover:bg-amber-50 flex items-center justify-center flex-shrink-0 transition-colors">
                      <span className="material-symbols-outlined text-[17px] text-neutral-400 group-hover:text-amber-500 transition-colors">
                        {icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-neutral-700 group-hover:text-amber-600 transition-colors">
                        {label}
                      </p>
                      <p className="text-[10px] text-neutral-400">{sub}</p>
                    </div>
                    <span className="material-symbols-outlined text-[15px] text-neutral-300 group-hover:text-amber-400 transition-colors">
                      arrow_forward_ios
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* \u2500\u2500 Bottom CTA banner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-black text-xl mb-1">
                Everything you need to know about {displayName}
              </h3>
              <p className="text-amber-100 text-sm leading-relaxed max-w-lg">
                Syllabus, exam dates, sample papers and admission details for{" "}
                {displayName} — all in one place.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/boards"
                className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px]">
                  school
                </span>
                All Boards
              </Link>
              <Link
                href="/examination"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">
                  quiz
                </span>
                Entrance Exams
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// \u2500\u2500\u2500 SectionTitle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
        <span
          className="material-symbols-outlined text-[15px] text-amber-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <h2 className="text-base font-black text-neutral-800">{title}</h2>
    </div>
  );
}
