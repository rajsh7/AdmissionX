import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import ExamFAQAccordion from "./ExamFAQAccordion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[examination/[stream]/[slug]/faqs/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamBaseRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
}

interface FAQRow extends RowDataPacket {
  id: number;
  question: string | null;
  answer: string | null;
  refLinks: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExamFAQsPage({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}) {
  const { stream, slug } = await params;

  // ── Fetch exam base + FAQs in parallel ────────────────────────────────────
  const [baseRows, faqRows] = await Promise.all([
    safeQuery<ExamBaseRow>(
      `SELECT id, title, slug
       FROM examination_details
       WHERE slug = ?
       LIMIT 1`,
      [slug],
    ),

    // FAQs linked via typeOfExaminations_id = examination_details.id
    // We need the exam id first — use a subquery
    safeQuery<FAQRow>(
      `SELECT ef.id, ef.question, ef.answer, ef.refLinks
       FROM exam_faqs ef
       WHERE ef.typeOfExaminations_id = (
         SELECT ed.id FROM examination_details ed WHERE ed.slug = ? LIMIT 1
       )
       ORDER BY ef.id ASC
       LIMIT 100`,
      [slug],
    ),
  ]);

  const exam = baseRows[0];
  if (!exam) notFound();

  const faqs: FAQRow[] = faqRows;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-[24px] text-red-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              help
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-neutral-900 leading-snug mb-1">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Common questions about{" "}
              <span className="font-semibold text-neutral-700">
                {exam.title}
              </span>{" "}
              — eligibility, application process, exam pattern, admit cards,
              results and more.
            </p>
          </div>

          {faqs.length > 0 && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[13px]">
                forum
              </span>
              {faqs.length} {faqs.length === 1 ? "question" : "questions"}
            </span>
          )}
        </div>
      </div>

      {/* ── FAQ Accordion / Empty State ── */}
      {faqs.length === 0 ? (
        <EmptyState examTitle={exam.title} stream={stream} slug={slug} />
      ) : (
        <>
          <ExamFAQAccordion faqs={faqs} examTitle={exam.title} />
          <AskQuestionCTA examTitle={exam.title} stream={stream} slug={slug} />
        </>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  examTitle,
  stream,
  slug,
}: {
  examTitle: string;
  stream: string;
  slug: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[36px] text-neutral-300">
          quiz
        </span>
      </div>
      <h3 className="text-base font-black text-neutral-700 mb-2">
        No FAQs published yet
      </h3>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mb-6">
        FAQs for{" "}
        <span className="font-semibold text-neutral-600">{examTitle}</span> have
        not been added yet. Browse the overview for important dates and exam
        details.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/examination/${stream}/${slug}`}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Back to Overview
        </a>
        <a
          href={`/examination/${stream}/${slug}/questions`}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">forum</span>
          Community Q&amp;A
        </a>
      </div>
    </div>
  );
}

// ─── Ask Question CTA ─────────────────────────────────────────────────────────

function AskQuestionCTA({
  examTitle,
  stream,
  slug,
}: {
  examTitle: string;
  stream: string;
  slug: string;
}) {
  return (
    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-[22px] text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            forum
          </span>
        </div>
        <div>
          <p className="text-white font-black text-sm mb-1">
            Didn&apos;t find your answer?
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-xs">
            Ask your question in the community Q&amp;A section for{" "}
            <span className="text-neutral-300 font-semibold">{examTitle}</span>.
            Get answers from students and experts.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <a
          href={`/examination/${stream}/${slug}/questions`}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">forum</span>
          Community Q&amp;A
        </a>
        <a
          href="/signup/student"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">
            person_add
          </span>
          Register Free
        </a>
      </div>
    </div>
  );
}
