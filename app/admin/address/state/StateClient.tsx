"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import StateForm from "./StateForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";

interface StateClientProps {
  states: any[];
  countries: { id: number; name: string }[];
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function StateClient({
  states,
  countries,
  onDelete,
  onAdd,
  onEdit
}: StateClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<any>(null);

  const handleEdit = (state: any) => {
    setEditingState(state);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingState(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingState(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add State
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">State Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {states.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400 font-semibold">
                     No states found.
                  </td>
                </tr>
              ) : (
                states.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800 uppercase tracking-tight">{r.name}</td>
                    <td className="px-4 py-4">
                       <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter ring-1 ring-indigo-100">
                         <span className="material-symbols-rounded text-[14px]">flag</span>
                         {r.countryName || "Unknown"}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(r)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                            title="Update"
                          >
                            <span className="material-symbols-rounded text-[18px]">edit</span>
                          </button>
                          <DeleteButton action={onDelete.bind(null, r.id)} size="sm" />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingState ? "Update State" : "Add New State"}
      >
        <StateForm 
          countries={countries}
          initialData={editingState}
          onSubmitAction={editingState ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}
