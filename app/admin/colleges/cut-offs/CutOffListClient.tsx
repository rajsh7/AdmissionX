"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CutOffFormModal from "./CutOffFormModal";

interface Option { id: number; name: string; }

interface CutOffRow {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
  title: string;
  description: string;
}

interface CutOffListClientProps {
  cutoffs: CutOffRow[];
  colleges: Option[];
  courses: Option[];
  degrees: Option[];
  offset: number;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function CutOffListClient({
  cutoffs,
  colleges,
  courses,
  degrees,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: CutOffListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCutoff, setEditingCutoff] = useState<CutOffRow | null>(null);

  function openAdd() {
    setEditingCutoff(null);
    setIsModalOpen(true);
  }

  function openEdit(cutoff: CutOffRow) {
    setEditingCutoff(cutoff);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCutoff(null);
  }

  return (
    <>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add Cut-off
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cutoffs.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>data_exploration</span>
            <p className="text-slate-500 font-semibold text-sm">No cut-off records found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trend Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College & Program</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cutoffs.map((co, idx) => (
                  <tr key={co.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{co.title}</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Admission Trend</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-medium truncate max-w-[200px] block">{co.college_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {co.course_name || "General"} ({co.degree_name || "Any"})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-[300px]">{co.description || "No description provided"}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(co)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, co.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CutOffFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingCutoff ? onEdit : onAdd}
        cutoff={editingCutoff}
        colleges={colleges}
        courses={courses}
        degrees={degrees}
      />
    </>
  );
}
