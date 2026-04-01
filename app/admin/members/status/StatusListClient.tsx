"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StatusFormModal from "./StatusFormModal";

interface Status {
  id: number;
  name: string;
  created_at: string;
}

interface StatusListClientProps {
  statuses: Status[];
  offset: number;
  createStatus: (formData: FormData) => Promise<void>;
  updateStatus: (formData: FormData) => Promise<void>;
  deleteStatus: (id: number) => Promise<void>;
}

export default function StatusListClient({
  statuses,
  offset,
  createStatus,
  updateStatus,
  deleteStatus,
}: StatusListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingStatus(null);
    setIsModalOpen(true);
  }

  function handleEdit(status: Status) {
    setEditingStatus(status);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              settings_accessibility
            </span>
            User Statuses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage account status levels for platform members.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Status
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        {statuses.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>settings_accessibility</span>
            <p className="text-slate-500 font-medium">No statuses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {statuses.map((status, idx) => (
                  <tr key={status.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-3.5 flex items-center gap-2">
                       <span className="text-slate-800 font-semibold">{status.name}</span>
                       <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1 rounded inline-block">ID: #{status.id}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs text-nowrap">
                      {status.created_at ? new Date(status.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleEdit(status)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                         >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton 
                           action={deleteStatus.bind(null, status.id)} 
                           size="sm" 
                           label="" 
                         />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StatusFormModal
        key={editingStatus?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingStatus ? updateStatus : createStatus}
        status={editingStatus}
      />
    </>
  );
}




