"use client";

import { useState } from "react";
import Link from "next/link";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";

interface AdCollegeRow {
  id: number;
  method_type: string | null;
  status: number;
  created_at: string;
  college_name: string;
  degree_name: string | null;
  course_name: string | null;
  city_name: string | null;
  
  collegeprofile_id: number | null;
  functionalarea_id: number | null;
  degree_id: number | null;
  course_id: number | null;
  educationlevel_id: number | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  university_id: number | null;
  employee_id: number | null;
  updated_at: string;
}

interface PageProps {
  adsRows: AdCollegeRow[];
  total: number;
  offset: number;
  pageSize: number;
  q: string;
  createAction: (data: FormData) => Promise<void>;
  updateAction: (data: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  toggleAction: (data: FormData) => Promise<void>;
}

export default function AdsCollegeClient({
  adsRows,
  total,
  offset,
  pageSize,
  q,
  createAction,
  updateAction,
  deleteAction,
  toggleAction,
}: PageProps) {
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingRow, setEditingRow] = useState<AdCollegeRow | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingRow(null);
    setModalMode("add");
  }

  function handleEdit(row: AdCollegeRow) {
    setEditingRow(row);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingRow(null);
  }

  function formatDate(d: string | null | undefined) {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString();
  }

  const totalPages = Math.ceil(total / pageSize);
  const page = Math.floor(offset / pageSize) + 1;

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/colleges/ads-list${qs ? "?" + qs : ""}`;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Create New Ad Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        {adsRows.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="material-symbols-rounded text-6xl block mb-4 text-slate-200" style={ICO}>format_list_numbered</span>
            <p className="text-sm font-semibold">
              {q ? `No college ads matching "${q}"` : "No college ads records found."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                <th className="px-5 py-3 w-10">#</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Method & Status</th>
                <th className="px-4 py-3">Profile / Funct / Degree / Course</th>
                <th className="px-4 py-3">EduLevel / City / State / Ctry</th>
                <th className="px-4 py-3">Uni / Emp</th>
                <th className="px-4 py-3 min-w-[100px]">Dates</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {adsRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{offset + idx + 1}</td>
                  <td className="px-4 py-4 min-w-[200px]">
                    <p className="font-semibold text-slate-800">{row.college_name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">{row.degree_name || "No degree"} • {row.course_name || "No course"}</p>
                  </td>
                  <td className="px-4 py-4">
                     <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">{row.method_type || "No Method"}</p>
                     <form action={toggleAction} className="inline-block">
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value={row.status} />
                        <button type="submit" className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          row.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          {row.status ? "Active" : "Inactive"}
                        </button>
                     </form>
                  </td>
                  
                  <td className="px-4 py-4 font-mono text-xs text-slate-500 space-y-1">
                    <p title="collegeprofile_id">CP: {row.collegeprofile_id ?? "—"}</p>
                    <p title="functionalarea_id">FA: {row.functionalarea_id ?? "—"}</p>
                    <p title="degree_id">Deg: {row.degree_id ?? "—"}</p>
                    <p title="course_id">Crs: {row.course_id ?? "—"}</p>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-500 space-y-1">
                     <p title="educationlevel_id">Edu: {row.educationlevel_id ?? "—"}</p>
                     <p title="city_id">City: {row.city_id ?? "—"}</p>
                     <p title="state_id">State: {row.state_id ?? "—"}</p>
                     <p title="country_id">Ctry: {row.country_id ?? "—"}</p>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-500 space-y-1">
                     <p title="university_id">Uni: {row.university_id ?? "—"}</p>
                     <p title="employee_id">Emp: {row.employee_id ?? "—"}</p>
                  </td>

                  <td className="px-4 py-4 text-xs font-mono text-slate-500">
                    <p><span className="text-slate-400">Add:</span> {formatDate(row.created_at)}</p>
                    <p><span className="text-slate-400">Upd:</span> {formatDate(row.updated_at)}</p>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <DeleteButton action={deleteAction.bind(null, row.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing <strong>{offset + 1}-{Math.min(offset + pageSize, total)}</strong> of <strong>{total}</strong></p>
            <div className="flex gap-1">
              {page > 1 && <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</Link>}
              {page < totalPages && <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</Link>}
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === "add" ? "Create College Ad" : "Edit College Ad"}
      >
        <form action={modalMode === "add" ? createAction : updateAction} className="space-y-4" onSubmit={() => setTimeout(closeModal, 100)}>
          {editingRow && <input type="hidden" name="id" value={editingRow.id} />}
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Method Type</label>
            <input name="method_type" defaultValue={editingRow?.method_type || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" required />
          </div>

          {/* Database IDs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CollegeProfile ID</label>
               <input name="collegeprofile_id" type="number" defaultValue={editingRow?.collegeprofile_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Funct.Area ID</label>
               <input name="functionalarea_id" type="number" defaultValue={editingRow?.functionalarea_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Degree ID</label>
               <input name="degree_id" type="number" defaultValue={editingRow?.degree_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course ID</label>
               <input name="course_id" type="number" defaultValue={editingRow?.course_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Edu Level ID</label>
               <input name="educationlevel_id" type="number" defaultValue={editingRow?.educationlevel_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">City ID</label>
               <input name="city_id" type="number" defaultValue={editingRow?.city_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">State ID</label>
               <input name="state_id" type="number" defaultValue={editingRow?.state_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country ID</label>
               <input name="country_id" type="number" defaultValue={editingRow?.country_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">University ID</label>
               <input name="university_id" type="number" defaultValue={editingRow?.university_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Employee ID</label>
               <input name="employee_id" type="number" defaultValue={editingRow?.employee_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
             </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" name="status" value="1" id="isActiveTopCol" defaultChecked={editingRow?.status === 1} className="w-4 h-4 text-blue-600 rounded bg-slate-50 border-slate-200 focus:ring-blue-500/30 outline-none" />
            <label htmlFor="isActiveTopCol" className="text-sm font-bold text-slate-700">Currently Active List Record</label>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              {modalMode === "add" ? "Create Record" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}




