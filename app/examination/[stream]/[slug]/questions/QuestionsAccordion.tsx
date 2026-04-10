"use client";

import { useState, useMemo } from "react";
import type { QuestionWithAnswers } from "./page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Single Question Item ─────────────────────────────────────────────────────

function QuestionItem({
  q,
  index,
  isOpen,
  onToggle,
  searchQuery,
}: {
  q: QuestionWithAnswers;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return <>{text}</>;
    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const hasAnswers = q.answers.length > 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "border-blue-200 shadow-md shadow-blue-500/5"
          : "border-neutral-100 hover:border-blue-100"
      }`}
    >
      {/* ── Question trigger ── */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-4 px-5 py-4 text-left focus:outline-none group"
      >
        {/* Index badge */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black mt-0.5 transition-colors ${
            isOpen
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-500 group-hover:bg-blue-50 group-hover:text-blue-600"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-bold leading-snug transition-colors ${
              isOpen
                ? "text-blue-700"
                : "text-neutral-800 group-hover:text-blue-700"
            }`}
          >
            {highlightText(q.question)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {q.questionDate && (
              <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                <span className="material-symbols-outlined text-[12px]">
                  schedule
                </span>
                {formatDate(q.questionDate)}
              </span>
            )}
            <span
              className={`flex items-center gap-1 text-[10px] font-bold ${
                hasAnswers ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {hasAnswers ? "chat" : "help"}
              </span>
              {hasAnswers
                ? `${q.answers.length} answer${q.answers.length !== 1 ? "s" : ""}`
                : "Unanswered"}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <span
          className={`flex-shrink-0 material-symbols-outlined text-[20px] mt-0.5 transition-all duration-300 ${
            isOpen
              ? "text-blue-500 rotate-180"
              : "text-neutral-300 group-hover:text-blue-400"
          }`}
        >
          expand_more
        </span>
      </button>

      {/* ── Answers (collapsible) ── */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-5 pb-5 ml-11">
          {/* Divider */}
          <div className="h-px bg-neutral-100 mb-4" />

          {hasAnswers ? (
            <div className="space-y-4">
              {q.answers.map((answer, ai) => (
                <div
                  key={answer.id}
                  className="flex gap-3"
                >
                  {/* Answer number badge */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center mt-0.5">
                    {ai + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {highlightText(answer.answer)}
                    </p>

                    {/* Answer meta */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {answer.answerDate && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                          <span className="material-symbols-outlined text-[12px]">
                            schedule
                          </span>
                          {formatDate(answer.answerDate)}
                        </span>
                      )}
                      {answer.likes > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          <span
                            className="material-symbols-outlined text-[12px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            favorite
                          </span>
                          {answer.likes} helpful
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <span
                className="material-symbols-outlined text-[20px] text-amber-500 flex-shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pending
              </span>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-0.5">
                  No answers yet
                </p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  This question hasn&apos;t been answered yet. Register as a
                  student to answer and help other aspirants.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Accordion ───────────────────────────────────────────────────────────

interface QuestionsAccordionProps {
  questions: QuestionWithAnswers[];
  examTitle: string;
}

export default function QuestionsAccordion({
  questions,
  examTitle,
}: QuestionsAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(
    questions[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">(
    "all",
  );

  const filteredQuestions = useMemo(() => {
    let result = questions;

    // Apply answered/unanswered filter
    if (filter === "answered") {
      result = result.filter((q) => q.answers.length > 0);
    } else if (filter === "unanswered") {
      result = result.filter((q) => q.answers.length === 0);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answers.some((a) => a.answer.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [questions, filter, searchQuery]);

  const answeredCount = questions.filter((q) => q.answers.length > 0).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="space-y-4">
      {/* ── Controls bar ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-neutral-400 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={`Search ${questions.length} questions about ${examTitle}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder-neutral-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { key: "all", label: `All (${questions.length})`, icon: "apps" },
              {
                key: "answered",
                label: `Answered (${answeredCount})`,
                icon: "check_circle",
              },
              {
                key: "unanswered",
                label: `Unanswered (${unansweredCount})`,
                icon: "pending",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                filter === tab.key
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search result count ── */}
      {searchQuery.trim() && (
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-[15px] text-neutral-400">
            filter_list
          </span>
          <p className="text-xs text-neutral-500">
            {filteredQuestions.length === 0 ? (
              <span className="font-semibold text-amber-600">
                No results for &ldquo;{searchQuery}&rdquo;
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-neutral-700">
                  {filteredQuestions.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-neutral-700">
                  {questions.length}
                </span>{" "}
                questions
              </>
            )}
          </p>
        </div>
      )}

      {/* ── Question list ── */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[26px] text-neutral-300">
              search_off
            </span>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">
            No matching questions
          </p>
          <p className="text-xs text-neutral-400">
            Try a different keyword or{" "}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
            >
              clear filters
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, i) => (
            <QuestionItem
              key={q.id}
              q={q}
              index={i}
              isOpen={openId === q.id}
              onToggle={() => setOpenId((prev) => (prev === q.id ? null : q.id))}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      <p className="text-[11px] text-neutral-400 px-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[13px]">info</span>
        {questions.length} question{questions.length !== 1 ? "s" : ""} about{" "}
        <span className="font-semibold text-neutral-500">{examTitle}</span>.
        Answers are from the community — verify important details from official
        sources.
      </p>
    </div>
  );
}
