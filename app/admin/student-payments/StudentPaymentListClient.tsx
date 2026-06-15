"use client";

import { useState } from "react";
import PaginationFixed from "@/app/components/PaginationFixed";

interface Payment {
  _id: string;
  application_ref: string;
  transaction_id: string;
  college_name: string;
  course_name: string;
  degree_name: string;
  amount_paid: number;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
  student_name?: string;
  student_email?: string;
}

interface Props {
  payments: Payment[];
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function StudentPaymentListClient({ payments, offset, total, page, totalPages, pageSize }: Props) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        {payments.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>payments</span>
            <p className="text-slate-500 font-semibold text-sm">No payment records found.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Application Ref</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College / Course</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p, idx) => (
                <tr key={p._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-800 text-xs">{p.application_ref}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-xs leading-snug">{p.student_name || "—"}</span>
                      {p.student_email && <span className="text-[10px] text-slate-400 truncate leading-snug">{p.student_email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-slate-600 select-all break-all" title={p.transaction_id}>{p.transaction_id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-sm">{p.college_name}</span>
                      <span className="text-xs text-slate-500">{p.course_name}</span>
                      {p.degree_name && <span className="text-[10px] text-blue-600 font-bold">{p.degree_name}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-emerald-600">₹{p.amount_paid.toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.payment_status === "paid" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-500">{formatDate(p.created_at)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPayment(p)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-slate-900">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-900">{total.toLocaleString()}</span> records
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 relative p-6 animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:p-0 print:m-0 print:absolute print:inset-0">
            {/* Close button (hidden when printing) */}
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print:hidden transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            {/* Receipt Content */}
            <div className="space-y-6">
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-dashed border-gray-200">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                  <span className="text-[#e31e24]">Admission</span><span className="text-slate-800">X</span>
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Enrollment Receipt</p>
              </div>

              {/* Status & Txn ID */}
              <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Transaction ID</p>
                  <p className="text-[12.5px] font-mono font-bold text-slate-700 mt-0.5">
                    {selectedPayment.payment_status === "paid" ? (selectedPayment.transaction_id || "N/A") : "ADX-PREVIEW-994400"}
                  </p>
                </div>
                <div>
                  {selectedPayment.payment_status === "paid" ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                      Paid
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200 animate-pulse">
                      Preview
                    </span>
                  )}
                </div>
              </div>

              {/* Receipt Details Block */}
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Applicant Details</h4>
                  <p className="font-bold text-slate-800">{selectedPayment.student_name || "Student Name"}</p>
                  <p className="text-xs text-slate-500">{selectedPayment.student_email || "student@example.com"}</p>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Course & College Details</h4>
                  <p className="font-black text-slate-800 text-base">{selectedPayment.college_name || "—"}</p>
                  <p className="font-semibold text-slate-600 text-xs mt-0.5">
                    {[selectedPayment.degree_name, selectedPayment.course_name].filter(Boolean).join(" · ") || "General Admission"}
                  </p>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Application Fee</span>
                    <span>₹{selectedPayment.amount_paid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Processing & Taxes</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-800 border-t border-dashed border-gray-200 pt-3">
                    <span>Total Amount Paid</span>
                    <span className="text-emerald-600 text-lg">₹{selectedPayment.amount_paid.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Hidden when printing) */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
