"use client";

import { useState, useMemo } from "react";

// --- Types --------------------------------------------------------------------

export interface ExamFAQ {
  id: number;
  question: string | null;
  answer: string | null;
  refLinks: string | null;
}

// --- Helpers ------------------------------------------------------------------

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

// --- Single FAQ item ----------------------------------------------------------

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
  searchQuery,
}: {
  faq: ExamFAQ;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const question = stripHtml(faq.question) || `Question ${index + 1}`;
  const answer = stripHtml(faq.answer);

  const links: string[] = faq.refLinks
    ? faq.refLinks
        .split(/[\n,;]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 3)
    : [];

  function highlightText(text: string): React.ReactNode {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
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
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "border-red-200 shadow-md shadow-red-500/5"
          : "border-neutral-100 hover:border-red-100"
      }`}
    >
      {/* Question trigger */}
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
              ? "bg-red-600 text-white"
              : "bg-neutral-100 text-neutral-500 group-hover:bg-red-50 group-hover:text-red-600"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Question text */}
        <span
          className={`flex-1 text-sm font-bold leading-snug transition-colors ${
            isOpen
              ? "text-red-600"
              : "text-neutral-800 group-hover:text-red-600"
          }`}
        >
          {highlightText(question)}
        </span>

        {/* Chevron */}
        <span
          className={`flex-shrink-0 material-symbols-outlined text-[20px] mt-0.5 transition-all duration-300 ${
            isOpen
              ? "text-red-500 rotate-180"
              : "text-neutral-300 group-hover:text-red-400"
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Answer (collapsible) */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-5 pb-5 ml-11">
          <div className="h-px bg-neutral-100 mb-4" />

          {answer ? (
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {highlightText(answer)}
            </p>
          ) : (
            <p className="text-sm text-neutral-400 italic">
              No answer provided yet.
            </p>
          )}

          {/* Reference links */}
          {links.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] text-blue-400">
                  link
                </span>
                Reference Links
              </p>
              <div className="flex flex-wrap gap-2">
                {links.map((link, i) => {
                  const isUrl =
                    link.startsWith("http") || link.startsWith("www");
                  const href = isUrl
                    ? link.startsWith("http")
                      ? link
                      : `https://${link}`
                    : null;

                  return href ? (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        open_in_new
                      </span>
                      {href
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")
                        .slice(0, 40)}
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        info
                      </span>
                      {link.slice(0, 50)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Accordion -----------------------------------------------------------

interface ExamFAQAccordionProps {
  faqs: ExamFAQ[];
  examTitle: string;
}

export default function ExamFAQAccordion({
  faqs,
  examTitle,
}: ExamFAQAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);
  const [expandAll, setExpandAll] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(
    new Set(faqs[0] ? [faqs[0].id] : []),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter((f) => {
      const question = stripHtml(f.question).toLowerCase();
      const answer = stripHtml(f.answer).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [faqs, searchQuery]);

  function handleToggle(id: number) {
    if (expandAll) {
      setOpenIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setOpenId((prev) => (prev === id ? null : id));
    }
  }

  function isOpen(id: number) {
    return expandAll ? openIds.has(id) : openId === id;
  }

  function handleExpandAll() {
    setExpandAll(true);
    setOpenIds(new Set(filteredFaqs.map((f) => f.id)));
  }

  function handleCollapseAll() {
    setExpandAll(false);
    setOpenId(null);
    setOpenIds(new Set());
  }

  return (
    <div className="space-y-4">
      {/* Search + controls */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-neutral-400 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={`Search ${faqs.length} FAQs about ${examTitle}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 placeholder-neutral-400 transition-all"
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

        {/* Expand / Collapse all */}
        <button
          type="button"
          onClick={expandAll ? handleCollapseAll : handleExpandAll}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-red-600 bg-neutral-100 hover:bg-red-50 px-3.5 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[15px]">
            {expandAll ? "unfold_less" : "unfold_more"}
          </span>
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Search results count */}
      {searchQuery.trim() && (
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-[15px] text-neutral-400">
            filter_list
          </span>
          <p className="text-xs text-neutral-500">
            {filteredFaqs.length === 0 ? (
              <span className="font-semibold text-red-500">
                No results for &ldquo;{searchQuery}&rdquo;
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-neutral-700">
                  {filteredFaqs.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-neutral-700">
                  {faqs.length}
                </span>{" "}
                FAQs matching &ldquo;
                <span className="text-red-600 font-semibold">
                  {searchQuery}
                </span>
                &rdquo;
              </>
            )}
          </p>
        </div>
      )}

      {/* No search results */}
      {filteredFaqs.length === 0 && searchQuery.trim() ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[26px] text-neutral-300">
              search_off
            </span>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">
            No matching FAQs
          </p>
          <p className="text-xs text-neutral-400">
            Try a different keyword or{" "}
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2"
            >
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              index={i}
              isOpen={isOpen(faq.id)}
              onToggle={() => handleToggle(faq.id)}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center gap-2 px-1">
        <span className="material-symbols-outlined text-[14px] text-neutral-300">
          info
        </span>
        <p className="text-[11px] text-neutral-400">
          {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold text-neutral-500">{examTitle}</span>.
          Information may change — always verify on the official website.
        </p>
      </div>
    </div>
  );
}
