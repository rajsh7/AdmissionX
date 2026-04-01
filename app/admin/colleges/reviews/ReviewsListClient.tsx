"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ReviewFormModal from "./ReviewFormModal";

interface CollegeOption { id: number; name: string; }

interface ReviewsListClientProps {
  reviews: any[];
  colleges: CollegeOption[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  createReview: (data: FormData) => Promise<void>;
  updateReview: (data: FormData) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

function RatingBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between gap-2 text-[10px] font-bold uppercase tracking-tighter">
      <span className="text-slate-400">{label}:</span>
      <span className={color}>{parseFloat(String(value || 0)).toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsListClient({
  reviews, colleges, total, page, totalPages, offset, pageSize, q,
  createReview, updateReview, deleteReview,
}: ReviewsListClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(r: any) { setEditing(r); setModalOpen(true); }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>forum</span>
            College Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage student feedback and ratings across various categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/reviews" className="w-full sm:w-72">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input type="text" name="q" defaultValue={q} placeholder="Search reviews, colleges..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
          </form>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all shrink-0">
            <span className="material-symbols-rounded text-[18px]">add_circle</span>
            Add Review
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>forum</span>
            <p className="text-slate-500 font-semibold text-sm">No review records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Review Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ratings</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{r.title || "Untitled Review"}</span>
                        <span className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">"{r.description || "No detail"}"</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{r.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <RatingBadge label="Acad" value={r.academic} color="text-blue-600" />
                        <RatingBadge label="Infra" value={r.infrastructure} color="text-amber-600" />
                        <RatingBadge label="Plcmt" value={r.placement} color="text-green-600" />
                        <RatingBadge label="Social" value={r.social} color="text-purple-600" />
                        <RatingBadge label="Faculty" value={r.faculty} color="text-rose-600" />
                        <RatingBadge label="Accom" value={r.accommodation} color="text-cyan-600" />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(r)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteReview.bind(null, r.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}–{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> reviews
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/reviews?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/reviews?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>

      <ReviewFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? updateReview : createReview}
        review={editing}
        colleges={colleges}
      />
    </>
  );
}




