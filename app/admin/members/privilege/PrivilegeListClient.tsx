"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PrivilegeFormModal from "./PrivilegeFormModal";

interface Privilege {
  id: number;
  user_name: string;
  user_lastname: string;
  user_email: string;
  table_name: string;
  create: number;
  edit: number;
  update: number;
  delete: number;
  show: number;
  users_id?: string | number;
  allTableInformation_id?: string;
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Table {
  id: number;
  name: string;
}

interface PrivilegeListClientProps {
  privileges: Privilege[];
  users: User[];
  tables: Table[];
  offset: number;
  createPrivilege: (formData: FormData) => Promise<void>;
  updatePrivilege: (formData: FormData) => Promise<void>;
  deletePrivilege: (id: number) => Promise<void>;
}

export default function PrivilegeListClient({
  privileges,
  users,
  tables,
  offset,
  createPrivilege,
  updatePrivilege,
  deletePrivilege,
}: PrivilegeListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingPrivilege(null);
    setIsModalOpen(true);
  }

  function handleEdit(priv: Privilege) {
    setEditingPrivilege(priv);
    setIsModalOpen(true);
  }

  const RenderFlag = ({ val, label }: { val: number; label: string }) => (
    <div className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
      <span className="material-symbols-rounded text-[16px]">
        {val ? 'check_circle' : 'cancel'}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              admin_panel_settings
            </span>
            User Table Privileges
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure row-level access permissions for platform tables per user.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add Table Privilege
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Table</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-80">Permissions</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {privileges.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{p.user_name} {p.user_lastname}</p>
                    <p className="text-xs text-slate-400 font-mono tracking-tight">{p.user_email || "N/A"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs border border-blue-100 uppercase tracking-wider">
                      {p.table_name || "all"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center gap-2">
                       <RenderFlag val={p.create} label="Create" />
                       <RenderFlag val={p.show} label="View" />
                       <RenderFlag val={p.edit} label="Edit" />
                       <RenderFlag val={p.update} label="Update" />
                       <RenderFlag val={p.delete} label="Delete" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                       <button 
                         onClick={() => handleEdit(p)}
                         className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors hover:text-emerald-600"
                        >
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <DeleteButton action={deletePrivilege.bind(null, p.id)} size="sm" label="" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PrivilegeFormModal
        key={editingPrivilege?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingPrivilege ? updatePrivilege : createPrivilege}
        privilege={editingPrivilege}
        users={users}
        tables={tables}
      />
    </>
  );
}




