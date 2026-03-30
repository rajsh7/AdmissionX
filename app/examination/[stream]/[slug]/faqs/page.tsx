import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import ExamFAQAccordion from "./ExamFAQAccordion";

export default async function ExamFAQsPage({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}) {
  const { stream, slug } = await params;
  const db = await getDb();

  const exam = await db.collection("examination_details").findOne(
    { slug },
    { projection: { id: 1, title: 1, slug: 1 } },
  );
  if (!exam) notFound();

  const examId = exam.id ?? exam._id;

  const faqDocs = await db.collection("exam_faqs")
    .find({ typeOfExaminations_id: examId }, { projection: { id: 1, question: 1, answer: 1, refLinks: 1 } })
    .sort({ id: 1 }).limit(100).toArray();

  const faqs = faqDocs.map((d: Record<string, unknown>) => ({
    id: (d.id ?? d._id) as number,
    question: (d.question ?? null) as string | null,
    answer: (d.answer ?? null) as string | null,
    refLinks: (d.refLinks ?? null) as string | null,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[24px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-neutral-900 leading-snug mb-1">Frequently Asked Questions</h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Common questions about{" "}
              <span className="font-semibold text-neutral-700">{exam.title}</span>{" "}
              — eligibility, application process, exam pattern, admit cards, results and more.
            </p>
          </div>
          {faqs.length > 0 && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[13px]">forum</span>
              {faqs.length} {faqs.length === 1 ? "question" : "questions"}
            </span>
          )}
        </div>
      </div>

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

function EmptyState({ examTitle, stream, slug }: { examTitle: string; stream: string; slug: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[36px] text-neutral-300">quiz</span>
      </div>
      <h3 className="text-base font-black text-neutral-700 mb-2">No FAQs published yet</h3>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mb-6">
        FAQs for <span className="font-semibold text-neutral-600">{examTitle}</span> have not been added yet.
        Browse the overview for important dates and exam details.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a href={`/examination/${stream}/${slug}`}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Overview
        </a>
        <a href={`/examination/${stream}/${slug}/questions`}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20">
          <span className="material-symbols-outlined text-[16px]">forum</span>
          Community Q&amp;A
        </a>
      </div>
    </div>
  );
}

function AskQuestionCTA({ examTitle, stream, slug }: { examTitle: string; stream: string; slug: string }) {
  return (
    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[22px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
        </div>
        <div>
          <p className="text-white font-black text-sm mb-1">Didn&apos;t find your answer?</p>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-xs">
            Ask your question in the community Q&amp;A section for{" "}
            <span className="text-neutral-300 font-semibold">{examTitle}</span>.
            Get answers from students and experts.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <a href={`/examination/${stream}/${slug}/questions`}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap">
          <span className="material-symbols-outlined text-[16px]">forum</span>
          Community Q&amp;A
        </a>
        <a href="/signup/student"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap">
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Register Free
        </a>
      </div>
    </div>
  );
}
