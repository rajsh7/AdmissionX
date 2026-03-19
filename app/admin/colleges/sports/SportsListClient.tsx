"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import SportsFormModal from "./SportsFormModal";

interface Option { id: number; name: string; }

interface SportsRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  name: string;
  typeOfActivity: number;
}

interface SportsListClientProps {
  activities: SportsRow[];
  colleges: Option[];
  offset: number;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function SportsListClient({
  activities,
  colleges,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: SportsListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<SportsRow | null>(null);

  function openAdd() {
    setEditingActivity(null);
    setIsModalOpen(true);
  }

  function openEdit(activity: SportsRow) {
    setEditingActivity(activity);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingActivity(null);
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
          Add Activity
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activities.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>sports_basketball</span>
            <p className="text-slate-500 font-semibold text-sm">No sports or cultural records found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first activity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Activity Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activities.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800 leading-snug">{a.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.typeOfActivity === 1 ? 'bg-orange-100 text-orange-600' : 
                        a.typeOfActivity === 2 ? 'bg-purple-100 text-purple-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {a.typeOfActivity === 1 ? 'Sports' : a.typeOfActivity === 2 ? 'Cultural' : 'Association'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{a.college_name}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, a.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SportsFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingActivity ? onEdit : onAdd}
        activity={editingActivity}
        colleges={colleges}
      />
    </>
  );
}
