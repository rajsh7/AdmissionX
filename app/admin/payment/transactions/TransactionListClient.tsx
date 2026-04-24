"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

const STEP = 25;

interface TransactionRow {
  id: number;
  name: string | null;
  application_id: number | null;
  created_at: string | null;
  transactionHashKey: string | null;
  payment_status: string;
  amount: number;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  college_name: string | null;
  college_slug: string | null;
  course_name: string | null;
}

interface Props {
  rows: TransactionRow[];
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  type: string;
  onDelete: (id: number) => Promise<void>;
}

function formatAmount(val: number): string {
  if (!val || val === 0) return "—";
  return `₹${val.toLocaleString("en-IN")}`;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function TransactionListClient({ rows, offset, total, page, totalPages, pageSize, type, onDelete }: Props) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  // Reset visible count when the list changes
  useEffect(() => {
    setVisibleCount(STEP);
  }, [rows[0]?.id]);

  const showMore = visibleCount < rows.length;
  const showPagination = !showMore && totalPages > 1;
  const visibleRows = rows.slice(0, visibleCount);

  return (
    <>
      {rows.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <span className="material-symbols-rounded text-6xl block mb-4" style={ICO}>receipt_long</span>
          <p className="text-sm font-semibold">No transactions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-10">#</th>
                {type === "student" ? <th className="px-4 py-3">Student</th> : <th className="px-4 py-3">College / Course</th>}
                {type === "student" && <th className="px-4 py-3">College / Course</th>}
                {type === "college" && <th className="px-4 py-3">Student</th>}
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction Ref</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {visibleRows.map((t, idx) => (
                <tr key={`${t.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{offset + idx + 1}</td>

                  {type === "student" ? (
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 text-[13px]">{t.student_name?.trim() || "—"}</p>
                      {t.student_email && <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{t.student_email}</p>}
                      {t.student_phone && <p className="text-[10px] text-slate-400">{t.student_phone}</p>}
                      <p className="text-[10px] text-slate-300 font-mono">App #{t.application_id || "—"}</p>
                    </td>
                  ) : (
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 text-[13px] truncate max-w-[180px]">{t.college_name || "—"}</p>
                      {t.course_name && <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{t.course_name}</p>}
                      {t.college_slug && <p className="text-[10px] text-slate-300 font-mono truncate max-w-[180px]">{t.college_slug}</p>}
                    </td>
                  )}

                  {type === "student" ? (
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700 text-[12px] truncate max-w-[160px]">{t.college_name || "—"}</p>
                      {t.course_name && <p className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5">{t.course_name}</p>}
                    </td>
                  ) : (
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700 text-[12px]">{t.student_name?.trim() || "—"}</p>
                      {t.student_email && <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{t.student_email}</p>}
                    </td>
                  )}

                  <td className="px-4 py-3">
                    <span className="font-black text-slate-800 text-[13px]">{formatAmount(t.amount)}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.payment_status === "Success" ? "bg-emerald-100 text-emerald-700" :
                      t.payment_status === "Pending" ? "bg-amber-100 text-amber-700" :
                      t.payment_status === "Failed"  ? "bg-rose-100 text-rose-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>{t.payment_status}</span>
                  </td>

                  <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">{formatDate(t.created_at)}</td>

                  <td className="px-4 py-3">
                    {(() => {
                      const key = t.transactionHashKey?.toString().trim();
                      const hashValid = key && key !== "NULL" && key !== "null" && key.length > 3;
                      const display = hashValid ? key : t.name?.toString().trim() || null;
                      return display ? (
                        <code className="text-[11px] font-bold text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded select-all block max-w-[160px] break-all">{display}</code>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DeleteButton action={onDelete.bind(null, t.id)} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMore && (
        <div className="mt-6 mb-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, rows.length))}
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
