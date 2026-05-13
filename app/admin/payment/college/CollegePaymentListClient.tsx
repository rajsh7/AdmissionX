"use client";

import PaginationFixed from "@/app/components/PaginationFixed";

interface Payment {
  _id: string;
  college_name: string;
  transaction_id: string;
  service_type: string;
  amount: number;
  payment_status: string;
  created_at: Date;
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

export default function CollegePaymentListClient({ payments, offset, total, page, totalPages, pageSize }: Props) {
  return (
    <>
      <div className="overflow-x-auto">
        {payments.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>account_balance</span>
            <p className="text-slate-500 font-semibold text-sm">No payment records found.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p, idx) => (
                <tr key={p._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-800 text-sm">{p.college_name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-slate-600">{p.transaction_id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-600">{p.service_type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-blue-600">₹{p.amount.toLocaleString("en-IN")}</span>
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
    </>
  );
}
