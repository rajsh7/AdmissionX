import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExamTabs from "./ExamTabs";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_BANNER;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return null as unknown as string;
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

function slugToName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[examination/[stream]/[slug]/layout.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  applicationFrom: string | null;
  applicationTo: string | null;
  exminationDate: string | null;
  resultAnnounce: string | null;
  getMoreInfoLink: string | null;
  totalViews: number | null;
  totalLikes: number | null;
  typeOfExaminations_id: number | null;
  functionalarea_id: number | null;
  stream_name: string | null;
  stream_slug: string | null;
  section_slug: string | null;
  exam_type_name: string | null;
}

interface CountRow extends RowDataPacket {
  faq_count: number;
  question_count: number;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const rows = await safeQuery<ExamRow>(
    `SELECT ed.title, ed.description
     FROM examination_details ed
     WHERE ed.slug = ?
     LIMIT 1`,
    [slug],
  );

  const exam = rows[0];
  if (!exam) return { title: "Exam Details | AdmissionX" };

  const desc = exam.description
    ? exam.description
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160)
    : `Get complete information on ${exam.title} — exam dates, eligibility, syllabus, admit card, results and more.`;

  return {
    title: `${exam.title} 2024-25 — Dates, Syllabus, Eligibility | AdmissionX`,
    description: desc,
    openGraph: {
      title: exam.title,
      description: desc,
    },
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function ExamLayout({
  params,
  children,
}: {
  params: Promise<{ stream: string; slug: string }>;
  children: React.ReactNode;
}) {
  const { stream, slug } = await params;

  // ── Fetch exam base data ──────────────────────────────────────────────────
  const [examRows, countRows] = await Promise.all([
    safeQuery<ExamRow>(
      `SELECT
         ed.id,
         ed.title,
         ed.slug,
         ed.image,
         ed.description,
         ed.applicationFrom,
         ed.applicationTo,
         ed.exminationDate,
         ed.resultAnnounce,
         ed.getMoreInfoLink,
         ed.totalViews,
         ed.totalLikes,
         ed.typeOfExaminations_id,
         ed.functionalarea_id,
         fa.name     AS stream_name,
         fa.pageslug AS stream_slug,
         es.slug     AS section_slug,
         et.name     AS exam_type_name
       FROM examination_details ed
       LEFT JOIN functionalarea  fa ON fa.id = ed.functionalarea_id
       LEFT JOIN exam_sections   es ON es.functionalarea_id = ed.functionalarea_id
       LEFT JOIN examination_types et ON et.id = ed.typeOfExaminations_id
       WHERE ed.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<CountRow>(
      `SELECT
         (SELECT COUNT(*) FROM exam_faqs     WHERE typeOfExaminations_id = ed.id) AS faq_count,
         (SELECT COUNT(*) FROM exam_questions WHERE typeOfExaminations_id = ed.id) AS question_count
       FROM examination_details ed
       WHERE ed.slug = ?
       LIMIT 1`,
      [slug],
    ),
  ]);

  const exam = examRows[0];
  if (!exam) notFound();

  const counts = countRows[0] ?? { faq_count: 0, question_count: 0 };
  const faqCount      = Number(counts.faq_count) || 0;
  const questionCount = Number(counts.question_count) || 0;

  // The section slug from the URL is our tab base path
  const sectionSlug = stream;
  const examTitle   = exam.title ?? slugToName(slug);
  const bannerUrl   = buildImageUrl(exam.image);

  // Key dates for sidebar
  const keyDates = [
    {
      icon: "edit_document",
      label: "Application Open",
      date: formatDate(exam.applicationFrom),
      upcoming: isUpcoming(exam.applicationFrom),
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: "calendar_today",
      label: "Application Close",
      date: formatDate(exam.applicationTo),
      upcoming: isUpcoming(exam.applicationTo),
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: "event",
      label: "Exam Date",
      date: formatDate(exam.exminationDate),
      upcoming: isUpcoming(exam.exminationDate),
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: "emoji_events",
      label: "Result Announcement",
      date: formatDate(exam.resultAnnounce),
      upcoming: isUpcoming(exam.resultAnnounce),
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ].filter((d) => d.date);

  const basePath = `/examination/${sectionSlug}/${slug}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <div className="relative pt-16 overflow-hidden">
        {/* Background image layer */}
        <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt={examTitle}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 to-neutral-900/30" />
        </div>

        {/* Hero content (sits on top of image) */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 pb-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-[13px]">
                chevron_right
              </span>
              <Link
                href="/examination"
                className="hover:text-white transition-colors"
              >
                Examinations
              </Link>
              <span className="material-symbols-outlined text-[13px]">
                chevron_right
              </span>
              <Link
                href={`/examination/${sectionSlug}`}
                className="hover:text-white transition-colors capitalize"
              >
                {exam.stream_name ?? slugToName(sectionSlug)}
              </Link>
              <span className="material-symbols-outlined text-[13px]">
                chevron_right
              </span>
              <span className="text-white font-semibold truncate max-w-[200px]">
                {examTitle}
              </span>
            </nav>

            {/* Title + badges row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Type badge */}
                {exam.exam_type_name && (
                  <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                    <span className="material-symbols-outlined text-[12px]">
                      label
                    </span>
                    {exam.exam_type_name}
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {examTitle}
                </h1>

                {/* Quick stats row */}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {exam.stream_name && (
                    <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-400">
                        category
                      </span>
                      {exam.stream_name}
                    </span>
                  )}
                  {exam.exminationDate && (
                    <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-400">
                        event
                      </span>
                      {formatDate(exam.exminationDate)}
                    </span>
                  )}
                  {(exam.totalViews ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
                      <span className="material-symbols-outlined text-[14px]">
                        visibility
                      </span>
                      {Number(exam.totalViews).toLocaleString("en-IN")} views
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Apply / Info link */}
              {exam.getMoreInfoLink && (
                <a
                  href={exam.getMoreInfoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    open_in_new
                  </span>
                  Official Site
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Tab Navigation ───────────────────────────────────────────── */}
      <ExamTabs
        basePath={basePath}
        faqCount={faqCount}
        questionCount={questionCount}
      />

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* ── Page content (children) ── */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 xl:w-80 flex-shrink-0">

            {/* Key Dates card */}
            {keyDates.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] text-red-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    calendar_month
                  </span>
                  <h3 className="text-sm font-black text-neutral-900">
                    Key Dates
                  </h3>
                </div>
                <div className="divide-y divide-neutral-50">
                  {keyDates.map((kd) => (
                    <div key={kd.label} className="flex items-start gap-3 px-5 py-3.5">
                      <div
                        className={`w-8 h-8 rounded-lg ${kd.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${kd.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {kd.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide leading-none mb-1">
                          {kd.label}
                        </p>
                        <p className="text-sm font-black text-neutral-900">
                          {kd.date}
                        </p>
                        {kd.upcoming && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info card */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-blue-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  info
                </span>
                <h3 className="text-sm font-black text-neutral-900">
                  Quick Info
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  {
                    label: "Stream",
                    value: exam.stream_name,
                    icon: "category",
                  },
                  {
                    label: "Type",
                    value: exam.exam_type_name,
                    icon: "label",
                  },
                  {
                    label: "FAQs",
                    value: faqCount > 0 ? `${faqCount} available` : null,
                    icon: "help",
                  },
                  {
                    label: "Q&A",
                    value:
                      questionCount > 0
                        ? `${questionCount} questions`
                        : null,
                    icon: "forum",
                  },
                ]
                  .filter((r) => r.value)
                  .map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                        <span className="material-symbols-outlined text-[14px]">
                          {row.icon}
                        </span>
                        {row.label}
                      </span>
                      <span className="text-xs font-bold text-neutral-800 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-white font-black text-sm">
                Prepare for {examTitle}
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Find colleges that accept {examTitle} scores and start your
                application process.
              </p>
              <Link
                href="/top-colleges"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  apartment
                </span>
                Find Accepting Colleges
              </Link>
              <Link
                href="/signup/student"
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  person_add
                </span>
                Register for Updates
              </Link>
            </div>

          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
