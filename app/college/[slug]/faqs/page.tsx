// Cache the fully-rendered page for 5 minutes (same TTL as the layout).
export const revalidate = 300;

import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import FAQAccordion from "@/app/college/[slug]/faqs/FAQAccordion";
import type { FAQData } from "@/app/api/college/[slug]/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/faqs/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeBaseRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
}

interface FAQRow extends RowDataPacket {
  id: number;
  question: string | null;
  answer: string | null;
  refLinks: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeFAQsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch college base + FAQs in parallel ─────────────────────────────────
  const [baseRows, faqRows] = await Promise.all([
    safeQuery<CollegeBaseRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<FAQRow>(
      `SELECT cf.id, cf.question, cf.answer, cf.refLinks
       FROM college_faqs cf
       JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id AND cp.slug = ?
       ORDER BY cf.id ASC
       LIMIT 60`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  const faqs: FAQData[] = faqRows.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    refLinks: f.refLinks,
  }));

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
                {collegeName}
              </span>{" "}
              — admission process, courses, fees, facilities, and more.
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

      {/* ── FAQ accordion / empty state ── */}
      {faqs.length === 0 ? (
        <EmptyState collegeName={collegeName} slug={slug} />
      ) : (
        <>
          {/* Interactive accordion (client component) */}
          <FAQAccordion faqs={faqs} collegeName={collegeName} />

          {/* Ask a question CTA */}
          <AskQuestionCTA collegeName={collegeName} slug={slug} />
        </>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  collegeName,
  slug,
}: {
  collegeName: string;
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
        {collegeName} has not published FAQs yet. You can contact the college
        directly or ask your question below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/college/${slug}`}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Back to Overview
        </a>
        <a
          href={`/college/${slug}#contact`}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          Contact College
        </a>
      </div>
    </div>
  );
}

// ─── Ask a question CTA ───────────────────────────────────────────────────────

function AskQuestionCTA({
  collegeName,
  slug,
}: {
  collegeName: string;
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
            Ask your question directly to the admissions team at{" "}
            <span className="text-neutral-300 font-semibold">
              {collegeName}
            </span>
            . We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <a
          href={`/college/${slug}#contact`}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          Contact College
        </a>
        <a
          href="/login/student"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">
            edit_document
          </span>
          Apply Now
        </a>
      </div>
    </div>
  );
}
