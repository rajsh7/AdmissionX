"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StreamFormModal from "./StreamFormModal";
import PaginationFixed from "@/app/components/PaginationFixed";

const STEP = 25;

function buildImgSrc(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t || t.toUpperCase() === "NULL") return null;
  if (t.startsWith("/")) return `/api/image-proxy?url=${encodeURIComponent(t)}`;
  if (t.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(t)}`;
  return `/api/image-proxy?url=${encodeURIComponent(`https://admin.admissionx.in/uploads/${t}`)}`;
}

interface Stream {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  bannerimage: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  pagetitle?: string | null;
  pagedescription?: string | null;
  created_at: string;
  updated_at: string;
}

interface StreamListClientProps {
  streams: Stream[];
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  createStream: (formData: FormData) => Promise<void>;
  updateStream: (formData: FormData) => Promise<void>;
  deleteStream: (id: number) => Promise<void>;
  toggleStreamTop: (formData: FormData) => Promise<void>;
  toggleStreamHome: (formData: FormData) => Promise<void>;
}

export default function StreamListClient({
  streams,
  offset,
  total,
  page,
  totalPages,
  pageSize,
  createStream,
  updateStream,
  deleteStream,
  toggleStreamTop,
  toggleStreamHome,
}: StreamListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page changes
  const pageKey = `${page}-${streams[0]?.id}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < streams.length;
  const showPagination = !showMore && totalPages > 1;

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse mt-6" />;

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingStream(null);
    setIsModalOpen(true);
  }

  function handleEdit(stream: Stream) {
    setEditingStream(stream);
    setIsModalOpen(true);
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    try {
      const date = new Date(d);
      const day = date.getUTCDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      return `${day} ${month} ${year}`;
    } catch { return "—"; }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>
              hub
            </span>
            Streams
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage functional area streams and their homepage visibility.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Stream
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left w-10">#</th>
                <th className="px-4 py-3 text-left">Stream Name</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Slug</th>
                <th className="px-4 py-3 text-center">Show on Top</th>
                <th className="px-4 py-3 text-center">Show on Home</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {streams.slice(0, visibleCount).map((row, idx) => (
                <tr key={row.id} className="hover:bg-teal-50/20 transition-colors group">
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {offset + idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-rounded text-teal-600 text-[16px]" style={ICO_FILL}>
                          hub
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono text-nowrap">
                          ID: #{row.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {row.pageslug ? (
                      <span className="text-xs font-mono text-slate-500 truncate block max-w-[160px]">
                        /{row.pageslug}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">no slug</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <form action={toggleStreamTop} className="inline-block">
                      <input type="hidden" name="id"  value={row.id} />
                      <input type="hidden" name="cur" value={row.isShowOnTop} />
                      <button
                        type="submit"
                        title={row.isShowOnTop ? "Remove from top" : "Add to top"}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                          row.isShowOnTop
                            ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>
                          {row.isShowOnTop ? "star" : "star_border"}
                        </span>
                        {row.isShowOnTop ? "Yes" : "No"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <form action={toggleStreamHome} className="inline-block">
                      <input type="hidden" name="id"  value={row.id} />
                      <input type="hidden" name="cur" value={row.isShowOnHome} />
                      <button
                        type="submit"
                        title={row.isShowOnHome ? "Remove from homepage" : "Add to homepage"}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                          row.isShowOnHome
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>
                          home
                        </span>
                        {row.isShowOnHome ? "Yes" : "No"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell" suppressHydrationWarning>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(row.updated_at || row.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEdit(row)}
                         className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-teal-600 transition-colors"
                        >
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <DeleteButton action={deleteStream.bind(null, row.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StreamFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingStream ? updateStream : createStream}
        stream={editingStream}
      />

      {/* Show More */}
      {showMore && (
        <div className="py-6 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, streams.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-teal-600 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Show More ({streams.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[36px] animate-bounce group-hover:text-teal-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination after all shown */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + pageSize, total)}</span> of <span className="text-slate-700 font-bold">{total}</span> streams
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </div>
  );
}




