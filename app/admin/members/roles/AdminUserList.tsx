"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminModal from "@/app/admin/_components/AdminModal";
import type { AdminUserRow, RoleDefinition } from "./page";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

interface Props {
  users: AdminUserRow[];
  roles: RoleDefinition[];
  offset: number;
  createAdminUser: (f: FormData) => Promise<void>;
  updateAdminUser: (f: FormData) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
}

export default function AdminUserList({ users, roles, offset, createAdminUser, updateAdminUser, deleteAdminUser }: Props) {
  const [isOpen, setIsOpen]   = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [pending, setPending] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");

  // Roles available for assignment — exclude super_admin
  const assignableRoles = roles.filter(r => r.value !== "super_admin");

  function openCreate() { setEditing(null); setError(""); setShowPass(false); setIsOpen(true); }
  function openEdit(u: AdminUserRow) { setEditing(u); setError(""); setShowPass(false); setIsOpen(true); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      if (editing) await updateAdminUser(fd);
      else         await createAdminUser(fd);
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  function getRoleCfg(value: string) {
    return roles.find(r => r.value === value);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{users.length} admin account{users.length !== 1 ? "s" : ""}</p>
        <Link href="/admin/members/roles/create" className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-rounded text-[20px]">add</span>
          Create Admin User
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>group</span>
            <p className="text-slate-500 font-medium">No admin users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user, idx) => {
                  const cfg = getRoleCfg(user.admin_role);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{user.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{user.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg?.badgeColor ?? "bg-slate-100 text-slate-600"}`}>
                          <span className="material-symbols-rounded text-[11px]" style={ICO_FILL}>shield</span>
                          {cfg?.label ?? user.admin_role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: user.is_active ? "#16a34a" : "#dc2626" }} />
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs text-nowrap">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(user)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                            <span className="material-symbols-rounded text-[18px]">edit</span>
                          </button>
                          <DeleteButton action={deleteAdminUser.bind(null, user.id)} size="sm" label="" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Admin User" : "Create Admin User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input name="name" defaultValue={editing?.name ?? ""} required placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
            <input name="email" type="email" defaultValue={editing?.email ?? ""} required placeholder="e.g. admin@admissionx.in"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Password {editing && <span className="normal-case font-normal text-slate-400">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input name="password" type={showPass ? "text" : "password"} required={!editing}
                placeholder={editing ? "Leave blank to keep current" : "Min. 8 characters"} minLength={editing ? undefined : 8}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-10" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-rounded text-[18px]">{showPass ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Assign Role</label>
            {assignableRoles.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                No roles defined yet. Go to the <strong>Role Definitions</strong> tab to create roles first.
              </p>
            ) : (
              <div className="space-y-2">
                {assignableRoles.map(r => (
                  <label key={r.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all border-slate-200 bg-slate-50 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                    <input type="radio" name="admin_role" value={r.value} defaultChecked={editing ? editing.admin_role === r.value : r.value === assignableRoles[0]?.value}
                      className="mt-0.5 accent-emerald-600" required />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${r.badgeColor}`}>{r.label}</span>
                      </div>
                      {r.desc && <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {editing && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">Account Status</p>
                <p className="text-xs text-slate-400">Disabled accounts cannot log in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="is_active" value="true" defaultChecked={editing.is_active} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending || assignableRoles.length === 0} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {pending ? "Saving..." : editing ? "Update" : "Create Admin"}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
