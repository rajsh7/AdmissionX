"use client";

import { useState, useEffect } from "react";
import PaginationFixed from "@/app/components/PaginationFixed";
import DeleteButton from "@/app/admin/_components/DeleteButton";

const STEP = 25;

interface ExamInfoRow {
  id: number;
  title: string;
  slug: string | null;
  exminationDate: string | null;
  description: string | null;
}

interface Props {
  data: ExamInfoRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
  deleteAction: (id: number) => Promise<void>;
}

export default function ExamInfoListClient({
  data,
  total,
  page,
  totalPages,
  pageSize,
  offset,
  deleteAction,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page changes
  const pageKey = `${page}-${data[0]?.id}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < data.length;
  const showPagination = !showMore && totalPages > 1;

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>info_outline</span>
                    <p className="text-slate-500 font-semibold text-sm">No examinations found.</p>
                  </td>
                </tr>
              ) : (
                data.slice(0, visibleCount).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                      {String(offset + idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-snug">{r.title}</span>

                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
                        /{r.slug || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium">
                      {(r.exminationDate && r.exminationDate.length <= 40 && /\d/.test(r.exminationDate)) ? r.exminationDate : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DeleteButton action={deleteAction.bind(null, r.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More */}
      {showMore && (
        <div className="py-8 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, data.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] ml-[0.2em]">
              Show More ({data.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[40px] animate-bounce group-hover:text-blue-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Showing <span className="text-slate-800 font-bold">{(page - 1) * pageSize + 1}–{Math.min((page - 1) * pageSize + pageSize, total)}</span> of <span className="text-slate-800 font-bold">{total.toLocaleString()}</span> exams
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
