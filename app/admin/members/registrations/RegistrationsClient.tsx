"use client";

import { useState, useEffect, useCallback } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface Registration {
  _id: string;
  type: "student" | "college";
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function RegistrationsClient() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [studentTotal, setStudentTotal] = useState(0);
  const [collegeTotal, setCollegeTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Registration | null>(null);
  const [saving, setSaving] = useState(false);

  const PAGE_SIZE = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type, page: String(page), q });
    const res = await fetch(`/api/admin/registrations?${params}`);
    const data = await res.json();
    setRows(data.rows || []);
    setTotal(data.total || 0);
    setStudentTotal(data.studentTotal || 0);
    setCollegeTotal(data.collegeTotal || 0);
    setLoading(false);
  }, [type, page, q]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleStatusChange(row: Registration, status: string) {
    const res = await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: row._id, type: row.type, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to update status.");
      return;
    }
    if (data.message) alert(data.message);
    fetchData();
  }

  async function handleDelete(row: Registration) {
    if (!confirm(`Delete ${row.name}?`)) return;
    await fetch("/api/admin/registrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: row._id, type: row.type }),
    });
    fetchData();
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: editing._id,
        type: editing.type,
        status: fd.get("status"),
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
      }),
    });
    setSaving(false);
    setEditing(null);
    fetchData();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Registrations", value: studentTotal + collegeTotal, icon: "how_to_reg", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Students", value: studentTotal, icon: "school", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Colleges", value: collegeTotal, icon: "account_balance", color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2 rounded-xl`}>
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-tight">{s.value.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1); }} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700">Search</button>
          {q && <button type="button" onClick={() => { setQ(""); setSearch(""); setPage(1); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200">Clear</button>}
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "all", l: "All" }, { v: "student", l: "Students" }, { v: "college", l: "Colleges" }].map((opt) => (
            <button
              key={opt.v}
              onClick={() => { setType(opt.v); setPage(1); }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${type === opt.v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[20px]" style={ICO_FILL}>how_to_reg</span>
            Registrations
          </h1>
          <span className="text-xs text-slate-400">{total} total</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No registrations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 text-center">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date & Time</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-slate-400 font-mono">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                          {(row.name || "?")[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{row.name}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1 rounded inline-block mt-0.5">ID: {row._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${row.type === "student" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-violet-50 text-violet-700 border-violet-100"}`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell">{row.email}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{row.phone || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${STATUS_COLORS[row.status] || STATUS_COLORS.pending}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden sm:table-cell">
                      {row.created_at ? new Date(row.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.status !== "approved" && (
                          <button onClick={() => handleStatusChange(row, "approved")} className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Approve">
                            <span className="material-symbols-rounded text-[18px]">check_circle</span>
                          </button>
                        )}
                        {row.status !== "rejected" && (
                          <button onClick={() => handleStatusChange(row, "rejected")} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="Reject">
                            <span className="material-symbols-rounded text-[18px]">cancel</span>
                          </button>
                        )}
                        <button onClick={() => setEditing(row)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Edit">
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                          <span className="material-symbols-rounded text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(page * PAGE_SIZE, total)}</strong> of <strong>{total}</strong>
            </p>
            <div className="flex gap-1">
              {page > 1 && <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</button>}
              {page < totalPages && <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AdminModal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Registration">
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
              <input name="name" defaultValue={editing.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input name="email" type="email" defaultValue={editing.email} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
              <input name="phone" defaultValue={editing.phone} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select name="status" defaultValue={editing.status} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </>
  );
}
