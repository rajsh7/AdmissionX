"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string | null;
  marks12: number | null;
  is_active: number;
  created_at: string | null;
}

interface Props {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  q: string;
  statusFilter: string;
  deleteStudent: (id: string) => Promise<void>;
  toggleActive: (id: string, current: number) => Promise<void>;
  updateStudent: (id: string, data: { name: string; email: string; phone: string; dob: string; marks12: number | null }) => Promise<void>;
}

function formatDate(val: string | null) {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

export default function StudentProfileClient({
  students, total, page, totalPages, pageSize,
  q, statusFilter, deleteStudent, toggleActive,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      page: String(page),
      ...overrides,
    });
    return `${pathname}?${params.toString()}`;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this student permanently?")) return;
    setDeletingId(id);
    await deleteStudent(id);
    setDeletingId(null);
  }

  async function handleToggle(id: string, current: number) {
    setTogglingId(id);
    await toggleActive(id, current);
    setTogglingId(null);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-lg font-black text-slate-800">Student Profiles</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage all registered students</p>
        </div>
        <div className="flex items-center gap-2 bg-[#008080]/10 px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-[18px] text-[#008080]">school</span>
          <span className="text-sm font-black text-[#008080]">{total.toLocaleString()} Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
            router.push(buildUrl({ q: val, page: "1" }));
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input name="q" defaultValue={q} placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => router.push(buildUrl({ status: e.target.value, page: "1" }))}
              className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-[#008080] appearance-none cursor-pointer">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">expand_more</span>
          </div>
          <button type="submit" className="h-10 px-5 rounded-xl bg-[#008080] text-white text-sm font-bold hover:bg-[#006666] transition-colors">Search</button>
          {(q || statusFilter) && (
            <Link href={pathname} className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 flex items-center transition-colors">Clear</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white">
        <div className="px-6 py-3 border-b border-slate-100">
          <p className="text-sm text-slate-500">
            {total > 0
              ? <>Showing <span className="font-bold text-slate-800">{start}–{end}</span> of <span className="font-bold text-slate-800">{total.toLocaleString()}</span> students</>
              : "No students found"}
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Date of Birth</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">12th Marks</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[40px] text-slate-200">person_search</span>
                      <p className="text-slate-400 font-medium text-sm">No students found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-bold text-slate-400">{(page - 1) * pageSize + i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#008080]/10 flex items-center justify-center flex-shrink-0 text-[#008080] font-black text-sm">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {s.phone !== "—" ? s.phone : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {s.dob ? formatDate(s.dob) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.marks12 != null
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[12px] font-bold">{s.marks12}%</span>
                        : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(s.id, s.is_active)} disabled={togglingId === s.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          s.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        } disabled:opacity-50`}>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {s.is_active ? "check_circle" : "pending"}
                        </span>
                        {togglingId === s.id ? "..." : s.is_active ? "Active" : "Pending"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/${s.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors">
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-[11px] font-bold hover:bg-red-50 transition-colors disabled:opacity-50">
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          {deletingId === s.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <Link key={p} href={buildUrl({ page: String(p) })}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                      p === page ? "bg-[#008080] text-white" : "border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] bg-white"
                    }`}>
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
