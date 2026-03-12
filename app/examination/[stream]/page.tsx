import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_EXAM_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_EXAM_IMAGE;
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
    console.error("[examination/[stream]/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  iconImage: string | null;
  functionalarea_id: number | null;
  fa_name: string | null;
  fa_slug: string | null;
}

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
  status: string | null;
  exam_type_name: string | null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stream: string }>;
}): Promise<Metadata> {
  const { stream } = await params;

  const rows = await safeQuery<SectionRow>(
    `SELECT es.name FROM exam_sections es WHERE es.slug = ? LIMIT 1`,
    [stream],
  );

  const name = rows[0]?.name ?? stream.replace(/-/g, " ");
  const title = `${name} Entrance Exams — Dates, Syllabus & Results`;

  return {
    title: `${title} | AdmissionX`,
    description: `Browse all ${name} entrance exams. Get complete information on application dates, eligibility, syllabus, admit cards, and results.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExaminationStreamPage({
  params,
}: {
  params: Promise<{ stream: string }>;
}) {
  const { stream } = await params;

  // ── Fetch section meta ──────────────────────────────────────────────────────
  const sectionRows = await safeQuery<SectionRow>(
    `SELECT
       es.id,
       es.name,
       es.slug,
       es.iconImage,
       es.functionalarea_id,
       fa.name     AS fa_name,
       fa.pageslug AS fa_slug
     FROM exam_sections es
     LEFT JOIN functionalarea fa ON fa.id = es.functionalarea_id
     WHERE es.slug = ?
     LIMIT 1`,
    [stream],
  );

  const section = sectionRows[0];
  if (!section) notFound();

  // ── Fetch exams for this section's functionalarea ───────────────────────────
  let exams: ExamRow[] = [];

  if (section.functionalarea_id) {
    exams = await safeQuery<ExamRow>(
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
         ed.status,
         et.name AS exam_type_name
       FROM examination_details ed
       LEFT JOIN examination_types et ON et.id = ed.typeOfExaminations_id
       WHERE ed.functionalarea_id = ?
         AND ed.slug IS NOT NULL
         AND ed.slug != ''
       ORDER BY ed.created_at DESC`,
      [section.functionalarea_id],
    );
  }

  const streamName = section.name;
  const upcomingExams = exams.filter(
    (e) => isUpcoming(e.applicationTo) || isUpcoming(e.exminationDate),
  );
  const pastExams = exams.filter(
    (e) => !isUpcoming(e.applicationTo) && !isUpcoming(e.exminationDate),
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-neutral-900 pt-24 pb-14 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

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
              href="/examination"
              className="hover:text-white transition-colors"
            >
              Examinations
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">{streamName}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">
                    quiz
                  </span>
                  {streamName} Exams
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                {streamName}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                  Entrance Exams
                </span>
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                Complete list of {streamName.toLowerCase()} entrance exams with
                application dates, eligibility criteria, syllabus, and results.
              </p>
            </div>

            {/* Stat badges */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
                <p className="text-xl font-black text-white">{exams.length}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                  Total
                </p>
              </div>
              {upcomingExams.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-xl font-black text-red-400">
                    {upcomingExams.length}
                  </p>
                  <p className="text-[10px] font-semibold text-red-500/70 uppercase tracking-wide">
                    Upcoming
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">

        {exams.length === 0 ? (
          <EmptyState streamName={streamName} />
        ) : (
          <>
            {/* ── Upcoming Exams ── */}
            {upcomingExams.length > 0 && (
              <section>
                <SectionHeader
                  icon="event_upcoming"
                  title="Upcoming / Active Exams"
                  badge={{ text: "Live", color: "bg-emerald-500" }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {upcomingExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      streamSlug={stream}
                      highlighted
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── All / Past Exams ── */}
            {pastExams.length > 0 && (
              <section>
                <SectionHeader
                  icon="history_edu"
                  title={
                    upcomingExams.length > 0
                      ? "Previous / Other Exams"
                      : `All ${streamName} Exams`
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} streamSlug={stream} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Related links strip ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[22px] text-red-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-sm text-neutral-600 font-medium">
              Looking for a different exam stream?
            </p>
          </div>
          <Link
            href="/examination"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">
              apps
            </span>
            All Exam Streams
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: string;
  title: string;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-6 bg-red-600 rounded-full block" />
      <span
        className="material-symbols-outlined text-[20px] text-red-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <h2 className="text-lg font-black text-neutral-900">{title}</h2>
      {badge && (
        <span
          className={`${badge.color} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}
        >
          {badge.text}
        </span>
      )}
    </div>
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({
  exam,
  streamSlug,
  highlighted = false,
}: {
  exam: ExamRow;
  streamSlug: string;
  highlighted?: boolean;
}) {
  const description = stripHtml(exam.description);
  const appOpen = isUpcoming(exam.applicationFrom);
  const appClose = isUpcoming(exam.applicationTo);
  const examUpcoming = isUpcoming(exam.exminationDate);

  return (
    <Link
      href={`/examination/${streamSlug}/${exam.slug}`}
      className={`group flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
        highlighted
          ? "border-red-200 shadow-md shadow-red-500/5 hover:border-red-300 hover:shadow-red-500/10"
          : "border-neutral-100 hover:border-neutral-200 hover:shadow-neutral-200/60"
      }`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-neutral-100 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={buildImageUrl(exam.image)}
          alt={exam.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status badge */}
        {highlighted && (appOpen || appClose || examUpcoming) && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {appOpen || appClose ? "Apply Now" : "Upcoming"}
            </span>
          </div>
        )}

        {/* Exam type */}
        {exam.exam_type_name && (
          <span className="absolute bottom-2 left-2 bg-white/90 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {exam.exam_type_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
          {exam.title}
        </h3>

        {description && (
          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {/* Date table */}
        <div className="mt-auto space-y-1.5 pt-2.5 border-t border-neutral-50">
          {[
            {
              icon: "edit_document",
              color: "text-blue-500",
              label: "Apply",
              value: exam.applicationFrom
                ? `${formatDate(exam.applicationFrom)} — ${formatDate(exam.applicationTo)}`
                : formatDate(exam.applicationTo),
            },
            {
              icon: "event",
              color: "text-red-500",
              label: "Exam",
              value: formatDate(exam.exminationDate),
            },
            {
              icon: "emoji_events",
              color: "text-amber-500",
              label: "Result",
              value: formatDate(exam.resultAnnounce),
            },
          ]
            .filter((r) => r.value && r.value !== "—")
            .map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <span
                  className={`material-symbols-outlined text-[13px] ${row.color} shrink-0`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {row.icon}
                </span>
                <span className="text-[10px] text-neutral-500 font-medium shrink-0">
                  {row.label}:
                </span>
                <span className="text-[10px] font-bold text-neutral-700 truncate">
                  {row.value}
                </span>
              </div>
            ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end pt-1">
          <span className="text-[11px] font-bold text-red-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            View Details
            <span className="material-symbols-outlined text-[13px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ streamName }: { streamName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 py-20 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[36px] text-red-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          quiz
        </span>
      </div>
      <h3 className="text-base font-black text-neutral-700 mb-2">
        No {streamName} exams published yet
      </h3>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mb-6">
        Exam information for this stream is being updated. Please check back
        soon or browse all exam categories.
      </p>
      <Link
        href="/examination"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm shadow-red-500/20"
      >
        <span className="material-symbols-outlined text-[16px]">apps</span>
        Browse All Streams
      </Link>
    </div>
  );
}
