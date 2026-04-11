"use client";

import Link from "next/link";
import { useState } from "react";

export interface ExamItem {
  id: number;
  title: string;
  slug: string;
  streamSlug: string;
  streamName: string | null;
  description: string;
  applicationTo: string | null;
  exminationDate: string | null;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 4;
const SHOW_MORE_LIMIT = 12;
const CATEGORIES = ["All Exams", "Engineering", "Medical", "Management", "Government", "Law"];

export default function ExamListClient({ exams, search = "" }: { exams: ExamItem[]; search?: string }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All Exams");

  const filtered = exams.filter((e) => {
    const query = search.toLowerCase().trim();
    const searchMatch = !query || 
      e.title.toLowerCase().includes(query) || 
      (e.streamName?.toLowerCase() || "").includes(query) || 
      (e.description?.toLowerCase() || "").includes(query);
    
    const catMatch = activeFilter === "All Exams" || 
      (e.streamName?.toLowerCase() || "").includes(activeFilter.toLowerCase());
      
    return searchMatch && catMatch;
  });

  const totalPages = Math.ceil(filtered.length / SHOW_MORE_LIMIT);
  const pageExams = filtered.slice((page - 1) * SHOW_MORE_LIMIT, page * SHOW_MORE_LIMIT);
  const visible = pageExams.slice(0, visibleCount);
  const hasMore = visibleCount < pageExams.length;

  function goToPage(p: number) {
    setPage(p);
    setVisibleCount(PAGE_SIZE);
  }

  function handleFilter(cat: string) {
    setActiveFilter(cat);
    setPage(1);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3 sm:gap-4 items-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-4 sm:px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 border shadow-sm ${
              activeFilter === cat
                ? "bg-red-500 text-white border-[#d32f2f]"
                : "bg-[#ffebee] text-black border-red-200 hover:bg-red-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-md p-8 text-center text-neutral-500 border border-neutral-200 shadow-sm">
          No exams found for <span className="font-bold text-neutral-700">{activeFilter}</span>.
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {visible.map((exam) => (
              <div key={exam.id} className="bg-white pt-4 flex flex-col gap-5 rounded-md border border-neutral-200 shadow-sm relative pt-7 pb-6 px-5 sm:px-7 hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-md z-10">
                  Closing in 2 Days
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="pr-16 sm:pr-24">
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#444] mb-1 leading-snug">{exam.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-neutral-500 font-medium leading-relaxed">
                      {exam.description ? (exam.description.length > 80 ? exam.description.substring(0, 80) + "..." : exam.description) : "Joint Entrance Examination for admission to NITs, IITs."}
                    </p>
                  </div>
                  <div className="text-center mt-3 sm:mt-1 min-w-[90px] flex-shrink-0">
                    <p className="text-[9px] text-neutral-400 font-medium mb-0.5 tracking-wide">Exam Date</p>
                    <p className="text-neutral-800 font-bold text-[12px] sm:text-[13px] tracking-tight">
                      {exam.exminationDate ? formatDate(exam.exminationDate) : "24 Jan 2026"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 mb-6 pr-0 sm:pr-8">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-neutral-400 mt-0.5">calendar_month</span>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium mb-0.5 tracking-wide">Application Deadline</p>
                      <p className="text-[#f8312f] font-bold text-[14px]">
                        {exam.applicationTo ? formatDate(exam.applicationTo) : "30 Nov 2026"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:mr-10">
                    <span className="material-symbols-outlined text-[20px] text-neutral-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium mb-0.5 tracking-wide text-left">Eligibility</p>
                      <p className="text-[#107c41] font-bold text-[14px]">10+2 With PCM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link href={`/examination/${exam.streamSlug}/${exam.slug}`} className="bg-red-500 hover:bg-[#b30000] text-white text-[12px] font-bold px-6 py-2 rounded-[4px] transition-colors flex items-center gap-2">
                    Apply Now <span className="material-symbols-outlined text-[13px] font-black">arrow_forward</span>
                  </Link>
                  <Link href={`/examination/${exam.streamSlug}/${exam.slug}#syllabus`} className="border border-red-300 text-[#f8312f] hover:bg-red-50 text-[12px] font-bold px-7 py-2 rounded-[4px] transition-colors">
                    View Syllabus
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMore ? (
            <div
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="mt-6 flex flex-row justify-center items-center gap-1.5 cursor-pointer select-none group"
            >
              <span className="text-sm font-bold text-neutral-500 group-hover:text-red-500 transition-colors">Show More</span>
              <span className="material-symbols-outlined text-[18px] text-neutral-400 group-hover:text-red-500 transition-colors animate-bounce">expand_more</span>
            </div>
          ) : totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4 text-[13px] font-bold text-neutral-600">
              <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-200 bg-white rounded-sm transition-colors shadow-sm disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              {(() => {
                const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
                const items: (number | string)[] = [];
                pages.forEach((p, idx) => {
                  if (idx > 0 && p - pages[idx - 1] > 1) items.push(`dots-${p}`);
                  items.push(p);
                });
                return items.map((p) =>
                  typeof p === "string" ? (
                    <span key={p} className="px-1 text-neutral-400 tracking-widest">...</span>
                  ) : (
                    <button key={`page-${p}`} onClick={() => goToPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${page === p ? "bg-red-500 text-white shadow-sm" : "border border-neutral-300 bg-white hover:bg-neutral-50"}`}>
                      {p}
                    </button>
                  )
                );
              })()}
              <button onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-200 bg-white rounded-sm transition-colors shadow-sm disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
