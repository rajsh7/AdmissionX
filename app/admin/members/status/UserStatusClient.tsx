"use client";

import { useState } from "react";
import type { PlatformUser, UserStatus } from "./page";

const STATUS_OPTIONS: UserStatus[] = ["Active", "Inactive", "Disabled", "Blocked", "Deleted"];

const STATUS_STYLES: Record<UserStatus, string> = {
  Active:   "bg-green-100 text-green-700",
  Inactive: "bg-amber-100 text-amber-700",
  Disabled: "bg-orange-100 text-orange-700",
  Blocked:  "bg-red-100 text-red-700",
  Deleted:  "bg-slate-200 text-slate-500",
};

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

interface Props {
  users: PlatformUser[];
  offset: number;
  updateUserStatus: (f: FormData) => Promise<void>;
}

export default function UserStatusClient({ users, offset, updateUserStatus }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, UserStatus>>({});

  async function handleChange(user: PlatformUser, newStatus: UserStatus) {
    setPending(user.id);
    setLocalStatus(prev => ({ ...prev, [user.id]: newStatus }));
    try {
      const fd = new FormData();
      fd.set("id", user.id);
      fd.set("type", user.type);
      fd.set("status", newStatus);
      await updateUserStatus(fd);
    } catch {
      // revert on error
      setLocalStatus(prev => ({ ...prev, [user.id]: user.status }));
    } finally {
      setPending(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
        <span className="material-symbols-rounded text-6xl text-slate-100 mb-4 block" style={ICO_FILL}>manage_accounts</span>
        <p className="text-slate-500 font-medium">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user, idx) => {
              const currentStatus = localStatus[user.id] ?? user.status;
              const isLoading = pending === user.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{user.name || "—"}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{user.phone || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.type === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs text-nowrap">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-16 justify-center ${STATUS_STYLES[currentStatus]}`}>
                        {isLoading ? "..." : currentStatus}
                      </span>
                      <select
                        value={currentStatus}
                        disabled={isLoading}
                        onChange={e => handleChange(user, e.target.value as UserStatus)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
