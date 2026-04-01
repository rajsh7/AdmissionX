"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StreamFormModal from "./StreamFormModal";

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
  createStream: (formData: FormData) => Promise<void>;
  updateStream: (formData: FormData) => Promise<void>;
  deleteStream: (id: number) => Promise<void>;
  toggleStreamTop: (formData: FormData) => Promise<void>;
  toggleStreamHome: (formData: FormData) => Promise<void>;
}

export default function StreamListClient({
  streams,
  offset,
  createStream,
  updateStream,
  deleteStream,
  toggleStreamTop,
  toggleStreamHome,
}: StreamListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <th className="px-4 py-3 text-center hidden md:table-cell">Images</th>
                <th className="px-4 py-3 text-center">Show on Top</th>
                <th className="px-4 py-3 text-center">Show on Home</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {streams.map((row, idx) => (
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
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center justify-center gap-2">
                      {/* Logo Thumbnail */}
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm group/img relative" title="Logo">
                        {row.logoimage ? (
                          <img 
                            src={row.logoimage} 
                            alt="" 
                            className="w-full h-full object-contain p-1"
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=100"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>image</span>
                          </div>
                        )}
                      </div>
                      {/* Banner Thumbnail */}
                      <div className="w-16 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm group/img relative" title="Banner">
                        {row.bannerimage ? (
                          <img 
                            src={row.bannerimage} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=160"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>panorama</span>
                          </div>
                        )}
                      </div>
                    </div>
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
    </div>
  );
}




