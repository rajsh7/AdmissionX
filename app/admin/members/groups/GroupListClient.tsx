"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import GroupFormModal from "./GroupFormModal";

interface Group {
  id: number;
  name: string;
  user_name: string;
  user_lastname: string;
  user_email: string;
  table_name: string;
  create_action: number;
  edit_action: number;
  update_action: number;
  delete_action: number;
  show_action: number;
  users_id?: number;
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

interface GroupListClientProps {
  groups: Group[];
  users: User[];
  tables: Table[];
  offset: number;
  createGroup: (formData: FormData) => Promise<void>;
  updateGroup: (formData: FormData) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
}

export default function GroupListClient({
  groups,
  users,
  tables,
  offset,
  createGroup,
  updateGroup,
  deleteGroup,
}: GroupListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingGroup(null);
    setIsModalOpen(true);
  }

  function handleEdit(group: Group) {
    setEditingGroup(group);
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
              group_work
            </span>
            User Groups & Access
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define organizational groups and their standard access policies.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add Group Access
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Group / User</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scope</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-80">Default Actions</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groups.map((g, idx) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 underline decoration-slate-200 underline-offset-4">{g.name || "Untitled Group"}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">
                      User: {g.user_name} {g.user_lastname}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs border border-blue-100 uppercase tracking-wider">
                      {g.table_name || "global"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center gap-2">
                       <RenderFlag val={g.create_action} label="Create" />
                       <RenderFlag val={g.show_action} label="View" />
                       <RenderFlag val={g.edit_action} label="Edit" />
                       <RenderFlag val={g.update_action} label="Update" />
                       <RenderFlag val={g.delete_action} label="Delete" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEdit(g)}
                         className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                       >
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <DeleteButton 
                         action={deleteGroup.bind(null, g.id)} 
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
      </div>

      <GroupFormModal
        key={editingGroup?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingGroup ? updateGroup : createGroup}
        group={editingGroup}
        users={users}
        tables={tables}
      />
    </>
  );
}




