"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CareerStreamFormModal from "./CareerStreamFormModal";

interface CareerStream {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  descrition?: string | null;
  functionalarea_id: number;
  stream_name?: string;
  created_at: string;
  updated_at?: string | null;
}

interface Stream {
  id: number;
  name: string;
}

interface CareerStreamListClientProps {
  careerStreams: CareerStream[];
  streams: Stream[];
  createCareer: (formData: FormData) => Promise<void>;
  updateCareer: (formData: FormData) => Promise<void>;
  deleteCareer: (id: number) => Promise<void>;
}

export default function CareerStreamListClient({
  careerStreams,
  streams,
  createCareer,
  updateCareer,
  deleteCareer,
}: CareerStreamListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerStream | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingCareer(null);
    setIsModalOpen(true);
  }

  function handleEdit(c: CareerStream) {
    setEditingCareer(c);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              explore
            </span>
            Career Streams
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage popular career stream details and information.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Career
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Career Title</th>
                <th className="px-4 py-3 text-left">Functional Area</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {careerStreams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No career streams found.
                  </td>
                </tr>
              ) : (
                careerStreams.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-emerald-600 text-[16px]" style={ICO_FILL}>
                            explore
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[250px]">
                            {row.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: #{row.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                       <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                         {row.stream_name || "Unassigned"}
                       </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.slug ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 truncate block max-w-[150px]">
                           /{row.slug}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${row.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{row.status ? 'check_circle' : 'motion_photos_off'}</span>
                          {row.status ? 'Live' : 'Draft'}
                       </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      <div className="flex items-center justify-end gap-2 text-slate-800">
                         <button 
                           onClick={() => handleEdit(row)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-emerald-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteCareer.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CareerStreamFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingCareer ? updateCareer : createCareer}
        careerStream={editingCareer}
        streams={streams}
      />
    </>
  );
}




