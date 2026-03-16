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
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-neutral-900">
        {/* ── Background Layer ── */}
        <div className="fixed inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
            alt="Campus Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>

        {/* ── Content Layer ── */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative h-[460px] md:h-[540px] flex flex-col items-center justify-center text-center">
            {/* Localized overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

            {/* Centered Hero Content */}
            <div className="relative z-20 w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center flex-wrap gap-1 text-white/70 text-sm mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>chevron_right</span>
                <Link href="/examination" className="hover:text-white transition-colors">Examinations</Link>
                <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>chevron_right</span>
                <span className="text-white/90 line-clamp-1">{streamName}</span>
              </nav>

              <div className="flex flex-col items-center max-w-4xl">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-300 text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                    <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}>quiz</span>
                    {streamName} Exams
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
                  {streamName}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                    Entrance Exams
                  </span>
                </h1>
                
                <p className="text-neutral-300 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-10 drop-shadow-lg">
                  Complete list of {streamName.toLowerCase()} entrance exams with
                  application dates, eligibility criteria, syllabus, and results.
                </p>

                {/* Stat badges - Glassmorphism */}
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-center min-w-[120px] shadow-2xl">
                    <p className="text-3xl font-black text-white mb-1">{exams.length}</p>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Total Exams</p>
                  </div>
                  {upcomingExams.length > 0 && (
                    <div className="bg-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-2xl px-6 py-4 text-center min-w-[120px] shadow-2xl">
                      <p className="text-3xl font-black text-red-400 mb-1">{upcomingExams.length}</p>
                      <p className="text-[10px] font-black text-red-400/70 uppercase tracking-[0.2em]">Upcoming</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-4 lg:px-8 xl:px-12 py-10 space-y-12">

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
                  {pastExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} streamSlug={stream} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Related links strip ── */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <span
              className="material-symbols-rounded text-3xl text-red-500"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
            >
              info
            </span>
            <p className="text-base text-white/90 font-bold">
              Looking for a different exam stream?
            </p>
          </div>
          <Link
            href="/examination"
            className="inline-flex items-center gap-3 bg-white text-neutral-900 hover:bg-red-600 hover:text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-xl hover:scale-[1.05] whitespace-nowrap"
          >
            <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}>
              apps
            </span>
            All Exam Streams
          </Link>
        </div> {/* closes Related links strip (302) */}

      </div> {/* closes Main Content Area (253) */}

      <Footer />
      </div> {/* closes Content Layer (198) */}
      </main>
    </>
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
    <div className="flex items-center gap-4 mb-8">
      <div className="w-1.5 h-8 bg-gradient-to-b from-red-600 to-rose-600 rounded-full" />
      <span
        className="material-symbols-rounded text-2xl text-red-500"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
      >
        {icon}
      </span>
      <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">{title}</h2>
      {badge && (
        <span
          className={`${badge.color} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg`}
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
      className={`group flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${highlighted
          ? "border-red-200 shadow-md shadow-red-500/5 hover:border-red-300 hover:shadow-red-500/10"
          : "border-neutral-100 hover:border-neutral-200 hover:shadow-neutral-200/60"
        }`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-neutral-100 flex-shrink-0">
        <Image
          src={buildImageUrl(exam.image)}
          alt={exam.title}
          fill
          sizes="(max-width: 640px) 100vw, 350px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
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
