"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

export interface MediaRow {
  id: number;
  college_name: string;
  banner_image: string | null;
  slug: string;
  created_at: string | null;
}

interface MediaListClientProps {
  profiles: MediaRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  deleteAction: (id: number) => Promise<void>;
}

const STEP = 25;
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
    if (!raw) return DEFAULT_IMAGE;
    if (raw.startsWith("/")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
    if (raw.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
    return `/api/image-proxy?url=${encodeURIComponent(`https://admin.admissionx.in/uploads/${raw}`)}`;
}

export default function MediaListClient({
  profiles,
  total,
  page,
  totalPages,
  offset,
  pageSize,
  q,
  deleteAction
}: MediaListClientProps) {
  const [visibleCount, setVisibleCount] = useState(STEP);

  const listKey = profiles[0]?.slug ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) {
    setLastKey(listKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < profiles.length;
  const showPagination = !showMore && totalPages > 1;

  const start = total > 0 ? offset + 1 : 0;
  const end   = total > 0 ? Math.min(offset + pageSize, total) : 0;

  function formatDate(d: string | null) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  }

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {profiles.length === 0 && (
        <div className="py-24 text-center">
          <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>image</span>
          <p className="text-slate-500 font-semibold text-sm">No colleges found with media records.</p>
        </div>
      )}
      {profiles.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College & Slug</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Banner Preview</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assets & Dates</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {profiles.slice(0, visibleCount).map((p, idx) => (
                <tr key={p.slug || idx} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold capitalize text-slate-800 leading-snug truncate max-w-[250px]">{p.college_name}</span>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{p.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative group/img">
                      <img 
                        src={buildImageUrl(p.banner_image)} 
                        alt={p.college_name}
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                      />
                      {!p.banner_image && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400">
                           NO BANNER
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                       <div>
                         <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${p.banner_image ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                            BANNER Image
                         </span>
                       </div>
                       <div className="text-[11px] font-medium text-slate-500">
                         Date: {formatDate(p.created_at)}
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Assets">
                         <span className="material-symbols-rounded text-[20px]">edit</span>
                      </button>
                      <DeleteButton action={deleteAction.bind(null, p.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show More */}
      {showMore && profiles.length > 0 && (
        <div className="mt-6 mb-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, profiles.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-blue-600 animate-bounce">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination Container */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 mt-auto rounded-b-2xl">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{start}–{end}</span> of <span className="text-slate-700 font-bold">{total}</span> colleges
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </div>
  );
}
