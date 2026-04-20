"use client";

import { useState, useEffect } from "react";
import PaginationFixed from "@/app/components/PaginationFixed";
import DeleteButton from "@/app/admin/_components/DeleteButton";

const STEP = 25;

interface SubscriberRow {
  id: number;
  email: string;
  name: string | null;
  created_at: string | null;
}

interface Props {
  data: SubscriberRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
  deleteAction: (id: number) => Promise<void>;
}

export default function SubscribeListClient({
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscriber Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Subscribed</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>mail</span>
                    <p className="text-slate-500 font-semibold text-sm">No subscribers found.</p>
                  </td>
                </tr>
              ) : (
                data.slice(0, visibleCount).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                      {String(offset + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                          <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>mail</span>
                        </div>
                        <span className="font-bold text-slate-800">{r.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium">
                      {r.name || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 font-mono italic">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
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
            Showing <span className="text-slate-800 font-bold">{(page - 1) * pageSize + 1}–{Math.min((page - 1) * pageSize + pageSize, total)}</span> of <span className="text-slate-800 font-bold">{total.toLocaleString()}</span> subscribers
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
