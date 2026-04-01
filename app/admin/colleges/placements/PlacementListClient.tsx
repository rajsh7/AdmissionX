"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PlacementFormModal from "./PlacementFormModal";

interface Option { id: number; name: string; }

interface PlacementRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  recruiting_companies: string;
  highest_ctc: string;
  lowest_ctc: string;
  average_ctc: string;
  placement_info: string;
}

interface PlacementListClientProps {
  placements: PlacementRow[];
  colleges: Option[];
  offset: number;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function PlacementListClient({
  placements,
  colleges,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: PlacementListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<PlacementRow | null>(null);

  function openAdd() {
    setEditingPlacement(null);
    setIsModalOpen(true);
  }

  function openEdit(placement: PlacementRow) {
    setEditingPlacement(placement);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPlacement(null);
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
          Add Placement Stats
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {placements.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>monitoring</span>
            <p className="text-slate-500 font-semibold text-sm">No placement records found.</p>
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
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placement Data</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Additional Info</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {placements.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800 leading-snug">{p.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Avg:</span>
                          <span className="text-blue-600 font-bold">₹ {p.average_ctc || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Max:</span>
                          <span className="text-green-600 font-bold">₹ {p.highest_ctc || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {p.recruiting_companies ? `${p.recruiting_companies}+ Companies` : "No company data"}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[250px]">
                          {p.placement_info || "No extra info"}
                          </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, p.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlacementFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPlacement ? onEdit : onAdd}
        placement={editingPlacement}
        colleges={colleges}
      />
    </>
  );
}




