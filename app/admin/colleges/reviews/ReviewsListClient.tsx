"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";
import ReviewFormModal from "./ReviewFormModal";

interface CollegeOption { id: string; name: string; }

interface ReviewsListClientProps {
  reviews: any[];
  colleges: CollegeOption[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  collegeName?: string;
  studentName?: string;
  createReview: (data: FormData) => Promise<void>;
  updateReview: (data: FormData) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

function StarRating({ label, value }: { label: string; value: number }) {
  const v = parseFloat(String(value || 0));
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span style={{ color: "#f59e0b", fontSize: "13px" }}>★</span>
      <span className="text-slate-600">{label} : {v}/5</span>
    </div>
  );
}

export default function ReviewsListClient({
  reviews, colleges, total, page, totalPages, offset, pageSize, q,
  collegeName, studentName,
  createReview, updateReview, deleteReview,
}: ReviewsListClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const router = useRouter();
  const searchParams = useSearchParams();

  const listKey = reviews[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) { setLastKey(listKey); setVisibleCount(15); }

  const showMore = visibleCount < reviews.length;
  const showPagination = !showMore && totalPages > 1;

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    ["collegeName", "studentName", "q"].forEach(f => {
      const v = fd.get(f) as string;
      if (v?.trim()) params.set(f, v.trim());
      else params.delete(f);
    });
    router.push(`/admin/colleges/reviews?${params.toString()}`);
  }

  function handleClear() {
    router.push("/admin/colleges/reviews");
  }

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(r: any) { setEditing(r); setModalOpen(true); }

  return (
    <>
      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 font-semibold text-[13px] text-white rounded-sm transition-colors"
          style={{ backgroundColor: "#3F434A" }}
        >
          Add new college review
          <span style={{ fontSize: "16px" }}>+</span>
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white border border-slate-200 rounded-sm px-6 pt-6 pb-8 w-full mb-6">
        <h1 className="text-[22px] font-medium text-slate-500 mb-8 border-b border-slate-100 pb-4">
          Search College Reviews
        </h1>

        <form method="GET" action="/admin/colleges/reviews" onSubmit={handleSearch} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative w-full">
              <div className="relative group">
                <select 
                  name="collegeName" 
                  defaultValue={collegeName} 
                  className="w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-red-500 shadow-sm appearance-none cursor-pointer pr-10"
                  style={{ color: "black" }}
                >
                  <option value="" style={{ color: "black" }}>All Colleges</option>
                  {colleges && colleges.length > 0 ? (
                    colleges.map(c => (
                      <option key={c.id} value={c.name} style={{ color: "black" }}>{c.name}</option>
                    ))
                  ) : (
                    <option value="" disabled style={{ color: "black" }}>No colleges available</option>
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Student Name</label>
              <input type="text" name="studentName" defaultValue={studentName} placeholder="Search student..." className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-black bg-transparent focus:outline-none focus:border-red-500" />
            </div>
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Search Any</label>
              <input type="text" name="q" defaultValue={q} placeholder="Search anything..." className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm text-black bg-transparent focus:outline-none focus:border-red-500" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-10 py-2.5 rounded-sm font-semibold text-[15px] text-white transition-colors"
              style={{ backgroundColor: "#9aa0b0" }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-10 py-2.5 rounded-sm font-semibold text-[15px] text-white transition-colors"
              style={{ backgroundColor: "#e53e3e" }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-slate-200 rounded-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm font-semibold">No review records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#3F434A" }}>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">S.NO</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">College Name</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">Student Name</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">Review Date</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">Vote</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide">Rating</th>
                  <th className="px-4 py-3 text-left text-white text-[13px] font-semibold tracking-wide whitespace-nowrap">Last Updated</th>
                  <th className="px-4 py-3 text-center text-white text-[13px] font-semibold tracking-wide w-20">Show</th>
                  <th className="px-4 py-3 text-center text-white text-[13px] font-semibold tracking-wide w-20">Edit</th>
                  <th className="px-4 py-3 text-center text-white text-[13px] font-semibold tracking-wide w-20">Delete</th>
                </tr>
              </thead>
              <tbody>
                  {reviews.slice(0, visibleCount).map((r, idx) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                      {/* S.NO */}
                      <td className="px-4 py-4 text-slate-600 text-[13px]">{offset + idx + 1}</td>

                      {/* College Name + colored buttons */}
                      <td className="px-4 py-4" style={{ minWidth: "220px" }}>
                        <p style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px", lineHeight: "1.4", letterSpacing: "-0.01em" }}>
                          {r.college_name || "Unknown College"}
                        </p>
                        <div style={{ width: "100%", height: "1px", backgroundColor: "#e2e8f0", marginBottom: "8px" }}></div>
                        <div className="flex flex-col gap-1.5">
                          <Link 
                            href={`/colleges/${r.college_slug || r.collegeprofile_id}`} 
                            target="_blank"
                            className="text-white text-[10.5px] font-bold py-[6px] px-3 rounded-[2px] flex items-center gap-1.5 w-full justify-center uppercase tracking-wider hover:brightness-95 transition-all shadow-sm" 
                            style={{ backgroundColor: "#24b29b" }}
                          >
                            👁 College Public View
                          </Link>
                          <button 
                            onClick={() => openEdit(r)} 
                            className="text-white text-[10.5px] font-bold py-[6px] px-3 rounded-[2px] flex items-center gap-1.5 w-full justify-center uppercase tracking-wider hover:brightness-95 transition-all shadow-sm" 
                            style={{ backgroundColor: "#fbca40" }}
                          >
                            ✎ College Profile
                          </button>
                          <Link 
                            href={`/admin/students?email=${r.student_email || ""}`}
                            className="text-white text-[10.5px] font-bold py-[6px] px-3 rounded-[2px] flex items-center gap-1.5 w-full justify-center uppercase tracking-wider hover:brightness-95 transition-all shadow-sm" 
                            style={{ backgroundColor: "#fa4366" }}
                          >
                            👤 User Details
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-[13px] font-semibold text-slate-700">{r.student_name || "Anonymous"}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">"{r.title || "No Title"}"</div>
                      </td>

                      <td className="px-4 py-4 text-[13px] text-slate-600 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full border border-green-100 uppercase tracking-tight">
                          <span className="text-[12px]">👍</span>
                          {r.vote && r.vote > 0 ? `Liked (${r.vote})` : "Liked"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <StarRating label="Academic" value={r.academic} />
                          <StarRating label="Accommodation" value={r.accommodation} />
                          <StarRating label="Faculty" value={r.faculty} />
                          <StarRating label="Infra" value={r.infrastructure} />
                          <StarRating label="Placement" value={r.placement} />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                        {r.updated_at ? new Date(r.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-white text-[10.5px] font-bold px-3 py-1.5 rounded-[2px] uppercase tracking-wider shadow-sm hover:bg-blue-600 transition-colors"
                          style={{ backgroundColor: "#3b82f6", minWidth: "65px" }}
                        >
                          Show
                        </button>
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-white text-[10.5px] font-bold px-3 py-1.5 rounded-[2px] uppercase tracking-wider shadow-sm hover:brightness-95 transition-all"
                          style={{ backgroundColor: "#fbca40", minWidth: "65px" }}
                        >
                          Edit
                        </button>
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <button
                          onClick={async () => { if (confirm("Delete this review?")) await deleteReview(r.id); }}
                          className="text-white text-[10.5px] font-bold px-3 py-1.5 rounded-[2px] uppercase tracking-wider shadow-sm hover:brightness-95 transition-all w-[65px] flex justify-center items-center"
                          style={{ backgroundColor: "#fa4366" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Show More */}
      {showMore && (
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + 15, reviews.length))}
            className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{offset + 1}</strong>–<strong>{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> reviews
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

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
