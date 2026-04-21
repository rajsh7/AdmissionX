"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

const STEP = 25;

interface PaymentRow {
  id: number;
  fees: string | null;
  seats: number | null;
  college_name: string;
  slug: string;
  course_name: string;
  degree_name: string;
  stream_name: string;
}

interface Props {
  payments: PaymentRow[];
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function PaymentListClient({ payments, offset, total, page, totalPages, pageSize, onDelete }: Props) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  // Reset visible count when payments change
  useEffect(() => {
    setVisibleCount(STEP);
  }, [payments[0]?.id]);

  const showMore = visibleCount < payments.length;
  const showPagination = !showMore && totalPages > 1;
  const visibleRows = payments.slice(0, visibleCount);

  return (
    <>
      <div className="overflow-x-auto">
        {payments.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>payments</span>
            <p className="text-slate-500 font-semibold text-sm">No payment records found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course / Degree / Stream</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Listed Fee</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((p, idx) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 leading-snug truncate max-w-[220px] block">{p.college_name || "—"}</span>
                      {p.slug && <span className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">{p.slug}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      {p.course_name ? (
                        <span className="font-semibold text-slate-700 line-clamp-1">{p.course_name}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No course</span>
                      )}
                      {p.degree_name && <span className="text-[11px] text-blue-600 font-bold">{p.degree_name}</span>}
                      {p.stream_name && <span className="text-[10px] text-slate-400 font-medium">{p.stream_name}</span>}
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.seats || 0} seats</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-blue-600">{p.fees ? `₹ ${p.fees}` : "N/A"}</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Listed Course Fee</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update Fee">
                        <span className="material-symbols-rounded text-[20px]">edit_note</span>
                      </button>
                      <DeleteButton action={onDelete.bind(null, p.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showMore && (
        <div className="mt-6 mb-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, payments.length))}
            className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-slate-900">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-900">{total.toLocaleString()}</span> records
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
