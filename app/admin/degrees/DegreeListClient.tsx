"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import DegreeFormModal from "./DegreeFormModal";

interface Degree {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  bannerimage: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  functionalarea_id: number;
  stream_name?: string;
  pagetitle?: string | null;
  pagedescription?: string | null;
  created_at: string;
  updated_at: string;
}

interface Stream {
  id: number;
  name: string;
}

interface DegreeListClientProps {
  degrees: Degree[];
  streams: Stream[];
  offset: number;
  createDegree: (formData: FormData) => Promise<void>;
  updateDegree: (formData: FormData) => Promise<void>;
  deleteDegree: (id: number) => Promise<void>;
  toggleDegreeTop: (formData: FormData) => Promise<void>;
  toggleDegreeHome: (formData: FormData) => Promise<void>;
}

export default function DegreeListClient({
  degrees,
  streams,
  offset,
  createDegree,
  updateDegree,
  deleteDegree,
  toggleDegreeTop,
  toggleDegreeHome,
}: DegreeListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingDegree(null);
    setIsModalOpen(true);
  }

  function handleEdit(degree: Degree) {
    setEditingDegree(degree);
    setIsModalOpen(true);
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return "—"; }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>
              school
            </span>
            Degrees
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage academic degrees and their stream associations.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Degree
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left w-10">#</th>
                <th className="px-4 py-3 text-left">Degree Info</th>
                <th className="px-4 py-3 text-left">Stream</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Slug</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Assets</th>
                <th className="px-4 py-3 text-center">Top</th>
                <th className="px-4 py-3 text-center">Home</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {degrees.map((row, idx) => (
                <tr key={row.id} className="hover:bg-teal-50/20 transition-colors group">
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {offset + idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-rounded text-teal-600 text-[16px]" style={ICO_FILL}>
                          school
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          ID: #{row.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                        {row.stream_name || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {row.pageslug ? (
                      <span className="text-xs font-mono text-slate-500 truncate block max-w-[150px]">
                        /{row.pageslug}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">no slug</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                       <span title="Logo" className={`text-[13px] material-symbols-rounded ${row.logoimage ? "text-teal-500" : "text-slate-200"}`} style={ICO_FILL}>image</span>
                       <span title="Banner" className={`text-[13px] material-symbols-rounded ${row.bannerimage ? "text-teal-500" : "text-slate-200"}`} style={ICO_FILL}>panorama</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <form action={toggleDegreeTop} className="inline-block">
                      <input type="hidden" name="id"  value={row.id} />
                      <input type="hidden" name="cur" value={row.isShowOnTop} />
                      <button type="submit" className={`p-1 rounded-md transition-colors ${row.isShowOnTop ? "text-teal-600 bg-teal-50" : "text-slate-300 hover:bg-slate-50"}`}>
                        <span className="material-symbols-rounded text-[18px]" style={row.isShowOnTop ? ICO_FILL : {}}>star</span>
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <form action={toggleDegreeHome} className="inline-block">
                      <input type="hidden" name="id"  value={row.id} />
                      <input type="hidden" name="cur" value={row.isShowOnHome} />
                      <button type="submit" className={`p-1 rounded-md transition-colors ${row.isShowOnHome ? "text-emerald-600 bg-emerald-50" : "text-slate-300 hover:bg-slate-50"}`}>
                        <span className="material-symbols-rounded text-[18px]" style={row.isShowOnHome ? ICO_FILL : {}}>home</span>
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(row.updated_at || row.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-teal-600 transition-colors">
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <DeleteButton action={deleteDegree.bind(null, row.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DegreeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingDegree ? updateDegree : createDegree}
        degree={editingDegree}
        streams={streams}
      />
    </>
  );
}




