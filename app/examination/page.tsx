import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_EXAM_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600";

export const metadata: Metadata = {
  title: "Entrance Exams 2024–25 | Dates, Syllabus & Results – AdmissionX",
  description:
    "Explore all entrance exams — JEE, NEET, CAT, GATE and more. Get exam dates, eligibility, syllabus, admit cards, results and preparation tips.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_EXAM_IMAGE;
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
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[examination/page.tsx safeQuery]", err);
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
  exam_count: number;
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
  stream_name: string | null;
  stream_slug: string | null;
  section_slug: string | null;
}

// ─── Section icon map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  engineering:  { icon: "engineering",       color: "text-blue-700",   bg: "bg-blue-50"   },
  medical:      { icon: "medical_services",  color: "text-red-700",    bg: "bg-red-50"    },
  management:   { icon: "business_center",   color: "text-purple-700", bg: "bg-purple-50" },
  mba:          { icon: "trending_up",       color: "text-indigo-700", bg: "bg-indigo-50" },
  law:          { icon: "gavel",             color: "text-amber-700",  bg: "bg-amber-50"  },
  arts:         { icon: "palette",           color: "text-pink-700",   bg: "bg-pink-50"   },
  science:      { icon: "science",           color: "text-teal-700",   bg: "bg-teal-50"   },
  commerce:     { icon: "account_balance",   color: "text-emerald-700","bg": "bg-emerald-50" },
  computer:     { icon: "computer",          color: "text-cyan-700",   bg: "bg-cyan-50"   },
  pharmacy:     { icon: "medication",        color: "text-lime-700",   bg: "bg-lime-50"   },
  design:       { icon: "brush",             color: "text-rose-700",   bg: "bg-rose-50"   },
  architecture: { icon: "architecture",      color: "text-orange-700", bg: "bg-orange-50" },
  agriculture:  { icon: "eco",               color: "text-green-700",  bg: "bg-green-50"  },
  default:      { icon: "quiz",              color: "text-neutral-600","bg": "bg-neutral-100" },
};

function getSectionMeta(name: string) {
  const key = name.toLowerCase().split(/\s+/)[0];
  return SECTION_ICONS[key] ?? SECTION_ICONS.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExaminationHubPage() {
  const [sectionRows, examRows, statsRows] = await Promise.all([
    // Exam categories/sections with count of exams
    safeQuery<SectionRow>(`
      SELECT
        es.id,
        es.name,
        es.slug,
        es.iconImage,
        es.functionalarea_id,
        fa.name  AS fa_name,
        COUNT(ed.id) AS exam_count
      FROM exam_sections es
      LEFT JOIN functionalarea fa  ON fa.id = es.functionalarea_id
      LEFT JOIN examination_details ed ON ed.functionalarea_id = es.functionalarea_id
      WHERE es.status = 1
      GROUP BY es.id, es.name, es.slug, es.iconImage, es.functionalarea_id, fa.name
      ORDER BY es.isShowOnTop DESC, es.isShowOnHome DESC, exam_count DESC, es.id ASC
      LIMIT 16
    `),

    // Recent / popular exams
    safeQuery<ExamRow>(`
      SELECT
        ed.id,
        ed.title,
        ed.slug,
        ed.image,
        ed.description,
        ed.applicationFrom,
        ed.applicationTo,
        ed.exminationDate,
        fa.name     AS stream_name,
        fa.pageslug AS stream_slug,
        es.slug     AS section_slug
      FROM examination_details ed
      LEFT JOIN functionalarea fa ON fa.id = ed.functionalarea_id
      LEFT JOIN exam_sections   es ON es.functionalarea_id = ed.functionalarea_id
      ORDER BY ed.created_at DESC
      LIMIT 12
    `),

    // Quick stats
    safeQuery<RowDataPacket>(`
      SELECT
        (SELECT COUNT(*) FROM examination_details)  AS total_exams,
        (SELECT COUNT(*) FROM exam_sections WHERE status = 1) AS total_streams,
        (SELECT COUNT(*) FROM exam_faqs)            AS total_faqs,
        (SELECT COUNT(*) FROM exam_questions)       AS total_questions
    `),
  ]);

  const stats = statsRows[0] ?? {};
  const totalExams     = Number(stats.total_exams)     || 0;
  const totalStreams    = Number(stats.total_streams)   || 0;
  const totalFaqs      = Number(stats.total_faqs)      || 0;
  const totalQuestions = Number(stats.total_questions) || 0;

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* ── Full Page Background ── */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="pt-24 pb-16 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Examinations</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">quiz</span>
                Entrance Exams
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              India&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                Entrance Exams
              </span>{" "}
              — All in One Place
            </h1>
            <p className="text-neutral-400 text-base max-w-2xl leading-relaxed mb-8">
              Dates, syllabus, eligibility, admit cards, results and preparation tips for every
              major entrance examination across engineering, medical, management, law and more.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Exams",     value: totalExams,     icon: "description"    },
                { label: "Streams",   value: totalStreams,   icon: "category"        },
                { label: "FAQs",      value: totalFaqs,      icon: "help"            },
                { label: "Questions", value: totalQuestions, icon: "forum"           },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] text-red-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s.icon}
                  </span>
                  <span className="text-white font-black text-lg leading-none">
                    {s.value.toLocaleString("en-IN")}+
                  </span>
                  <span className="text-neutral-500 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-14">

        {/* ── Exam Streams ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">Browse by Stream</h2>
              <p className="text-sm text-neutral-300 mt-0.5">
                Select a category to view all exams in that stream
              </p>
            </div>
          </div>

          {sectionRows.length === 0 ? (
            <EmptySections />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sectionRows.map((sec) => {
                const meta = getSectionMeta(sec.name);
                return (
                  <Link
                    key={sec.id}
                    href={`/examination/${sec.slug}`}
                    className="group flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span
                        className={`material-symbols-outlined text-[24px] ${meta.color}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-800 group-hover:text-red-600 transition-colors leading-snug mb-1">
                      {sec.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-semibold">
                      {sec.exam_count > 0
                        ? `${sec.exam_count} exam${sec.exam_count !== 1 ? "s" : ""}`
                        : "View exams"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Recent / Popular Exams ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">Popular Entrance Exams</h2>
              <p className="text-sm text-neutral-300 mt-0.5">
                Most-searched exams with key dates and info
              </p>
            </div>
          </div>

          {examRows.length === 0 ? (
            <EmptyExams />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {examRows.map((exam) => {
                const streamSlug = exam.section_slug ?? exam.stream_slug ?? "general";
                return (
                  <ExamCard key={exam.id} exam={exam} streamSlug={streamSlug} />
                );
              })}
            </div>
          )}
        </section>

        {/* ── Info strip ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-[24px] text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications_active
              </span>
            </div>
            <div>
              <h3 className="text-white font-black text-lg mb-1">
                Never Miss an Exam Deadline
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Application deadlines, admit card releases and result dates — get all important
                notifications directly. Register as a student to track exams you&apos;re appearing for.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/signup/student"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20"
            >
              <span className="material-symbols-outlined text-[17px]">person_add</span>
              Register Free
            </Link>
            <Link
              href="/top-colleges"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-white/10"
            >
              <span className="material-symbols-outlined text-[17px]">apartment</span>
              Top Colleges
            </Link>
          </div>
        </section>

      </div>
      <Footer />
      </div>
    </div>
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({
  exam,
  streamSlug,
}: {
  exam: ExamRow;
  streamSlug: string;
}) {
  const description = stripHtml(exam.description);

  return (
    <Link
      href={`/examination/${streamSlug}/${exam.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/8 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-neutral-100 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={buildImageUrl(exam.image)}
          alt={exam.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {exam.stream_name && (
          <span className="absolute top-2 left-2 bg-white/90 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {exam.stream_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
          {exam.title}
        </h3>

        {description && (
          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {/* Date badges */}
        <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-neutral-50">
          {exam.applicationTo && (
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[13px] text-amber-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                edit_document
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Apply by:{" "}
                <span className="font-bold text-neutral-700">
                  {formatDate(exam.applicationTo)}
                </span>
              </span>
            </div>
          )}
          {exam.exminationDate && (
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[13px] text-red-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                event
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Exam:{" "}
                <span className="font-bold text-neutral-700">
                  {formatDate(exam.exminationDate)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* View link */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-red-600 group-hover:text-red-700 flex items-center gap-1">
            View Details
            <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptySections() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[30px] text-neutral-300">category</span>
      </div>
      <p className="text-sm font-bold text-neutral-600 mb-1">No exam categories yet</p>
      <p className="text-xs text-neutral-400 max-w-xs">
        Exam categories are being added. Check back soon.
      </p>
    </div>
  );
}

function EmptyExams() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[30px] text-neutral-300">quiz</span>
      </div>
      <p className="text-sm font-bold text-neutral-600 mb-1">No exams published yet</p>
      <p className="text-xs text-neutral-400 max-w-xs">
        Exam information is being updated. Please check back soon.
      </p>
    </div>
  );
}
