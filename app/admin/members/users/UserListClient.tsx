"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import UserFormModal from "./UserFormModal";

interface Role {
  id: number;
  name: string;
}

interface Status {
  id: number;
  name: string;
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  type_of_user: string;
  created_at: string;
  status_name: string;
  role_name: string;
  userstatus_id: number;
  userrole_id: number;
}

interface UserListClientProps {
  users: User[];
  roles: Role[];
  statuses: Status[];
  offset: number;
  createUser: (formData: FormData) => Promise<void>;
  updateUser: (formData: FormData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export default function UserListClient({
  users,
  roles,
  statuses,
  offset,
  createUser,
  updateUser,
  deleteUser,
}: UserListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              groups
            </span>
            Platform Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and search all registered platform user accounts.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">person_add</span>
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>groups</span>
            <p className="text-slate-500 font-medium">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">
                      {offset + idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase text-center align-middle">
                          {(user.firstname || "U")[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.firstname} {user.lastname}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1 rounded inline-block mt-0.5">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100/50">
                        {user.role_name?.replace('ROLE_', '') || "MEMBER"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-slate-700">{user.email}</p>
                      <p className="text-[11px] text-slate-400">{user.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                        {user.type_of_user || "Member"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status_name === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className={`text-xs font-medium ${user.status_name === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {user.status_name || 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden sm:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleEdit(user)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                         >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton 
                           action={deleteUser.bind(null, user.id)} 
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

      <UserFormModal
        key={editingUser?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingUser ? updateUser : createUser}
        user={editingUser}
        roles={roles}
        statuses={statuses}
      />
    </>
  );
}
