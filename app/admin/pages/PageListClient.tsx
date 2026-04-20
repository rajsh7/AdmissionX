"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";
import { formatDate } from "@/lib/utils";

const STEP = 25;

interface PageRow {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  created_at: string | null;
}

interface PageListClientProps {
  data: PageRow[];
  deleteAction: (id: number) => Promise<void>;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
}

export default function PageListClient({
  data,
  deleteAction,
  total,
  page,
  totalPages,
  pageSize,
  offset,
}: PageListClientProps) {
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

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />;

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Page Title</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No pages found.
                  </td>
                </tr>
              ) : (
                data.slice(0, visibleCount).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                      {String(offset + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800">{r.title}</td>
                    <td className="px-4 py-4">
                      {r.slug ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
                           /{r.slug}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${r.status ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{r.status ? 'check_circle' : 'motion_photos_off'}</span>
                          {r.status ? 'Live' : 'Draft'}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteAction.bind(null, r.id)} size="sm" />
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
        <div className="py-6 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, data.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Show More ({data.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[36px] animate-bounce group-hover:text-blue-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination after all shown */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-700 font-bold">{total}</span> pages
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </div>
  );
}
