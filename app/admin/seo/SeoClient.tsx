"use client";

import { useState, useEffect } from "react";
import PaginationFixed from "@/app/components/PaginationFixed";

export interface SeoRow {
  id: number;
  slugurl: string | null;
  pagetitle: string | null;
  description: string | null;
  keyword: string | null;
  h1title: string | null;
  canonical: string | null;
  pageId: number | null;
  collegeId: number | null;
  examId: number | null;
  boardId: number | null;
  blogId: number | null;
  newsId: number | null;
  created_at: string;
  updated_at: string;
}

interface SeoClientProps {
  rows: SeoRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
}

const STEP = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

function truncate(str: string | null | undefined, len: number): string {
  if (!str) return "—";
  const s = str.trim();
  return s.length > len ? s.slice(0, len) + "…" : s;
}

function getEntityType(row: SeoRow): { label: string; cls: string } {
  if (row.collegeId) return { label: "College", cls: "bg-blue-100 text-blue-700" };
  if (row.blogId)    return { label: "Blog",    cls: "bg-violet-100 text-violet-700" };
  if (row.newsId)    return { label: "News",    cls: "bg-amber-100 text-amber-700" };
  if (row.examId)    return { label: "Exam",    cls: "bg-emerald-100 text-emerald-700" };
  if (row.boardId)   return { label: "Board",   cls: "bg-rose-100 text-rose-700" };
  if (row.pageId)    return { label: "Page",    cls: "bg-sky-100 text-sky-700" };
  return { label: "General", cls: "bg-slate-100 text-slate-600" };
}

export default function SeoClient({
  rows,
  total,
  page,
  totalPages,
  offset,
  pageSize,
  q
}: SeoClientProps) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  // Reset when data changes (new search or page)
  useEffect(() => {
    setVisibleCount(STEP);
  }, [rows[0]?.id]);

  const showMore = visibleCount < rows.length;
  const showPagination = !showMore && totalPages > 1;

  const start = total > 0 ? offset + 1 : 0;
  const end = total > 0 ? Math.min(offset + pageSize, total) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {rows.length === 0 ? (
        <div className="py-20 text-center">
          <span
            className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
            style={ICO_FILL}
          >
            travel_explore
          </span>
          <p className="text-sm font-semibold text-slate-500">
            {q ? `No SEO entries matching "${q}"` : "No SEO entries found."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left w-10">#</th>
                  <th className="px-4 py-3 text-left w-1/4">Page URL</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Description</th>
                  <th className="px-4 py-3 text-left hidden xl:table-cell">Keywords</th>
                  <th className="px-4 py-3 text-center">Entity</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.slice(0, visibleCount).map((row, idx) => {
                  const entity = getEntityType(row);
                  const hasTitle = !!(row.pagetitle?.trim());
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                        {offset + idx + 1}
                      </td>

                      {/* Page URL */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span
                              className="material-symbols-rounded text-slate-500 text-[14px]"
                              style={ICO_FILL}
                            >
                              link
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-600 truncate block max-w-[200px]">
                            {row.slugurl ? `/${row.slugurl}` : <span className="text-slate-300 italic">no slug</span>}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3.5">
                        {hasTitle ? (
                          <span className="text-xs text-slate-700 font-bold block max-w-[200px] leading-snug">
                            {truncate(row.pagetitle, 55)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>
                              warning
                            </span>
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 block truncate max-w-[220px]">
                          {truncate(row.description, 80)}
                        </span>
                      </td>

                      {/* Keywords */}
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <span className="text-xs text-slate-400 font-mono block truncate max-w-[180px]">
                          {truncate(row.keyword, 50)}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${entity.cls}`}
                        >
                          {entity.label}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {formatDate(row.updated_at || row.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show More */}
          {showMore && rows.length > 0 && (
            <div className="mt-6 mb-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => Math.min(c + STEP, rows.length))}
                className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
                <span className="material-symbols-outlined text-[36px] group-hover:text-blue-600 animate-bounce">
                  keyboard_arrow_down
                </span>
              </button>
            </div>
          )}

          {/* Pagination Fixed Container */}
          {showPagination && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 mt-auto rounded-b-2xl">
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="text-slate-700 font-bold">{start}–{end}</span> of <span className="text-slate-700 font-bold">{total}</span> entries
              </p>
              <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
            </div>
          )}
        </>
      )}
    </div>
  );
}
