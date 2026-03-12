import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import QuestionsAccordion from "./QuestionsAccordion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[examination/[stream]/[slug]/questions/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamBaseRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
}

interface QuestionRow extends RowDataPacket {
  id: number;
  question: string | null;
  questionDate: string | null;
  userId: number | null;
}

interface AnswerRow extends RowDataPacket {
  id: number;
  answer: string | null;
  answerDate: string | null;
  questionId: number;
  likes: number | null;
}

export interface QuestionWithAnswers {
  id: number;
  question: string;
  questionDate: string | null;
  answers: {
    id: number;
    answer: string;
    answerDate: string | null;
    likes: number;
  }[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExamQuestionsPage({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}) {
  const { stream, slug } = await params;

  // ── Fetch exam base ───────────────────────────────────────────────────────
  const baseRows = await safeQuery<ExamBaseRow>(
    `SELECT id, title, slug FROM examination_details WHERE slug = ? LIMIT 1`,
    [slug],
  );

  const exam = baseRows[0];
  if (!exam) notFound();

  // ── Fetch questions + answers in parallel ─────────────────────────────────
  const [questionRows, answerRows] = await Promise.all([
    safeQuery<QuestionRow>(
      `SELECT id, question, questionDate, userId
       FROM exam_questions
       WHERE typeOfExaminations_id = ?
       ORDER BY id DESC
       LIMIT 100`,
      [exam.id],
    ),

    safeQuery<AnswerRow>(
      `SELECT eqa.id, eqa.answer, eqa.answerDate, eqa.questionId, eqa.likes
       FROM exam_question_answers eqa
       WHERE eqa.typeOfExaminations_id = ?
       ORDER BY eqa.likes DESC, eqa.id ASC`,
      [exam.id],
    ),
  ]);

  // ── Group answers by questionId ───────────────────────────────────────────
  const answersByQuestion = new Map<number, AnswerRow[]>();
  for (const a of answerRows) {
    if (!answersByQuestion.has(a.questionId)) {
      answersByQuestion.set(a.questionId, []);
    }
    answersByQuestion.get(a.questionId)!.push(a);
  }

  // ── Build typed data for client component ─────────────────────────────────
  const questions: QuestionWithAnswers[] = questionRows.map((q) => {
    const qAnswers = answersByQuestion.get(q.id) ?? [];
    return {
      id: q.id,
      question: stripHtml(q.question) || `Question #${q.id}`,
      questionDate: q.questionDate,
      answers: qAnswers
        .map((a) => ({
          id: a.id,
          answer: stripHtml(a.answer) || "",
          answerDate: a.answerDate,
          likes: Number(a.likes) || 0,
        }))
        .filter((a) => a.answer.length > 0),
    };
  });

  const totalQuestions = questions.length;
  const totalAnswers = questions.reduce((s, q) => s + q.answers.length, 0);
  const unanswered = questions.filter((q) => q.answers.length === 0).length;

  const basePath = `/examination/${stream}/${slug}`;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-[24px] text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              forum
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-neutral-900 leading-snug mb-1">
              Questions &amp; Answers
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Community questions about{" "}
              <span className="font-semibold text-neutral-700">
                {exam.title}
              </span>{" "}
              — asked and answered by students and aspirants.
            </p>
          </div>

          {/* Stats */}
          {totalQuestions > 0 && (
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <p className="text-lg font-black text-neutral-900 leading-none">
                  {totalQuestions}
                </p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  Questions
                </p>
              </div>
              <div className="w-px h-8 bg-neutral-100" />
              <div className="text-center">
                <p className="text-lg font-black text-neutral-900 leading-none">
                  {totalAnswers}
                </p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  Answers
                </p>
              </div>
              {unanswered > 0 && (
                <>
                  <div className="w-px h-8 bg-neutral-100" />
                  <div className="text-center">
                    <p className="text-lg font-black text-amber-600 leading-none">
                      {unanswered}
                    </p>
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                      Unanswered
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile stats */}
        {totalQuestions > 0 && (
          <div className="sm:hidden flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-blue-500">
                help
              </span>
              <span className="text-xs font-bold text-neutral-700">
                {totalQuestions} questions
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-500">
                chat
              </span>
              <span className="text-xs font-bold text-neutral-700">
                {totalAnswers} answers
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── No questions state ── */}
      {totalQuestions === 0 ? (
        <EmptyState examTitle={exam.title} basePath={basePath} />
      ) : (
        <>
          {/* ── Questions accordion (client component) ── */}
          <QuestionsAccordion
            questions={questions}
            examTitle={exam.title}
          />

          {/* ── Ask / contribute CTA ── */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[22px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_comment
                </span>
              </div>
              <div>
                <p className="text-white font-black text-sm mb-1">
                  Have a question about {exam.title}?
                </p>
                <p className="text-blue-200 text-xs leading-relaxed max-w-xs">
                  Register as a student to ask questions, get answers from the
                  community and stay updated on exam changes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Link
                href={`${basePath}/faqs`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">
                  help
                </span>
                View FAQs
              </Link>
              <Link
                href="/signup/student"
                className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">
                  person_add
                </span>
                Register Free
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  examTitle,
  basePath,
}: {
  examTitle: string;
  basePath: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[36px] text-blue-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          forum
        </span>
      </div>
      <h3 className="text-base font-black text-neutral-700 mb-2">
        No questions yet
      </h3>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mb-6">
        No community questions have been posted for{" "}
        <span className="font-semibold text-neutral-600">{examTitle}</span> yet.
        Be the first to ask!
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`${basePath}/faqs`}
          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">help</span>
          Check FAQs Instead
        </Link>
        <Link
          href="/signup/student"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">
            person_add
          </span>
          Register to Ask
        </Link>
      </div>
    </div>
  );
}
