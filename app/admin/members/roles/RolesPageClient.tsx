"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserList from "./AdminUserList";
import RoleDefinitionList from "./RoleDefinitionList";
import type { AdminUserRow, RoleDefinition } from "./page";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

interface Props {
  users: AdminUserRow[];
  roles: RoleDefinition[];
  offset: number;
  page: number;
  totalPages: number;
  searchQuery: string;
  createAdminUser: (f: FormData) => Promise<void>;
  updateAdminUser: (f: FormData) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  createRole:      (f: FormData) => Promise<void>;
  updateRole:      (f: FormData) => Promise<void>;
  deleteRole:      (id: string) => Promise<void>;
}

export default function RolesPageClient({
  users, roles, offset, page, totalPages, searchQuery,
  createAdminUser, updateAdminUser, deleteAdminUser,
  createRole, updateRole, deleteRole,
}: Props) {
  const [tab, setTab] = useState<"users" | "roles">("users");
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>admin_panel_settings</span>
            Admin Users & Roles
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage admin accounts and define custom access roles.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "users", icon: "group",            label: "Admin Users" },
          { key: "roles", icon: "shield_with_heart", label: "Role Definitions" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]" style={tab === t.key ? ICO_FILL : ICO}>{t.icon}</span>
            {t.label}
            {t.key === "users" && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">{users.length}</span>
            )}
            {t.key === "roles" && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">{roles.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Admin Users */}
      {tab === "users" && (
        <>
          {/* Search */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
            <form method="GET" className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
                />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                Search
              </button>
              {searchQuery && (
                <button type="button" onClick={() => router.push("/admin/members/roles")} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                  Clear
                </button>
              )}
            </form>
          </div>

          <AdminUserList
            users={users}
            roles={roles}
            offset={offset}
            createAdminUser={createAdminUser}
            updateAdminUser={updateAdminUser}
            deleteAdminUser={deleteAdminUser}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between rounded-2xl shadow-sm">
              <p className="text-xs text-slate-500">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </p>
              <div className="flex gap-1">
                {page > 1 && (
                  <button onClick={() => router.push(`/admin/members/roles?page=${page - 1}${searchQuery ? `&q=${searchQuery}` : ""}`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</button>
                )}
                {page < totalPages && (
                  <button onClick={() => router.push(`/admin/members/roles?page=${page + 1}${searchQuery ? `&q=${searchQuery}` : ""}`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Role Definitions */}
      {tab === "roles" && (
        <RoleDefinitionList
          roles={roles}
          createRole={createRole}
          updateRole={updateRole}
          deleteRole={deleteRole}
        />
      )}
    </>
  );
}
