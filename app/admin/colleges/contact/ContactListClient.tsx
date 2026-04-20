"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ContactActions from "./ContactActions";
import PaginationFixed from "@/app/components/PaginationFixed";

interface ContactRow {
  _id: string;
  college_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  college_type: string;
  _source: "old" | "new";
}

interface Props {
  rows: ContactRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  onDelete: (id: string, src: string) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const STEP = 15;

export default function ContactListClient({
  rows, total, page, totalPages, offset, pageSize, q, onDelete,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  // Reset when page changes (rows change)
  useEffect(() => {
    setVisibleCount(STEP);
  }, [rows[0]?._id]);

  const showMore = visibleCount < rows.length;
  const showPagination = !showMore && totalPages > 1;

  const start = total > 0 ? offset + 1 : 0;
  const end   = total > 0 ? Math.min(offset + pageSize, total) : 0;

  return (
    <>
      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
          <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>contact_mail</span>
          <p className="text-slate-500 font-bold text-sm">
            {q ? `No contacts matching "${q}"` : "No contact records found."}
          </p>
          {q && (
            <Link href="/admin/colleges/contact" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {rows.slice(0, visibleCount).map((c) => (
              <div key={c._id} className="bg-white rounded-[5px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-[137px] h-[127px] bg-white rounded-[5px] shrink-0 flex items-center justify-center p-2 border border-slate-100">
                      <img
                        src="/seglogo.webp"
                        alt="Saroje Education Group"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fb = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <span className="text-xl font-black text-slate-500 uppercase hidden">
                        {(c.college_name || "?")[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#6C6C6C] text-[16px] leading-tight uppercase truncate">
                        {c.college_name || "Unknown College"}
                      </h3>
                      {c.college_type && (
                        <p className="text-[13px] font-medium text-[#6C6C6C] leading-tight mt-1">
                          {c.college_type}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.address && (
                    <div className="border-t border-slate-100 pt-4 mb-4">
                      <p className="text-[14px] font-semibold text-[#6C6C6C] truncate">
                        {c.address}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(c.city || c.state || c.pincode) && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>location_on</span>
                        <span className="text-[13px] font-normal leading-tight text-[#6C6C6C]">
                          {[c.city, c.state, c.pincode].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>mail</span>
                        <span className="text-[13px] font-normal leading-tight truncate text-[#6C6C6C]">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>call</span>
                        <span className="text-[13px] font-normal leading-tight tracking-wide text-[#6C6C6C]">{c.phone}</span>
                      </div>
                    )}
                    {c.contact_name && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>person</span>
                        <span className="text-[13px] font-normal leading-tight text-[#6C6C6C]">{c.contact_name}</span>
                      </div>
                    )}
                  </div>

                  <ContactActions email={c.email} collegeName={c.college_name} contactName={c.contact_name} />

                  <div className="mt-3 flex justify-center">
                    <DeleteButton action={onDelete.bind(null, c._id, c._source)} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More */}
          {showMore && (
            <div className="mt-6 mb-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => Math.min(c + STEP, rows.length))}
                className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
                <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">
                  keyboard_arrow_down
                </span>
              </button>
            </div>
          )}

          {/* Pagination — shown only after all cards are visible */}
          {showPagination && (
            <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
              <p className="text-sm text-slate-400 font-medium">
                Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total.toLocaleString()}</strong> contacts
              </p>
              <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
            </div>
          )}
        </>
      )}
    </>
  );
}
