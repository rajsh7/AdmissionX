"use client";

import { useState } from "react";
import Link from "next/link";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";

interface CollegeAdRow {
  id: number;
  method_type: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  college_name: string;
  email: string | null;
  contact_name: string | null;
  phone: string | null;

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
}

interface Option { id: number; name: string; }

interface Props {
  colleges: CollegeAdRow[];
  total: number;
  offset: number;
  pageSize: number;
  q: string;
  toggleAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  options: {
    colleges: Option[];
    degrees: Option[];
    courses: Option[];
    cities: Option[];
    states: Option[];
  };
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function AdsCollegesListClient({
  colleges,
  total,
  offset,
  pageSize,
  q,
  toggleAction,
  deleteAction,
  updateAction,
  createAction,
  options,
}: Props) {
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingRow, setEditingRow] = useState<CollegeAdRow | null>(null);
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const buildUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams({ q });
    Object.entries(overrides).forEach(([k, v]) => params.set(k, v.toString()));
    return `/admin/ads/colleges-list?${params.toString()}`;
  };

  const handleEdit = (col: CollegeAdRow) => {
    setEditingRow(col);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setEditingRow(null);
    setModalMode("add");
  };

  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }

  const SELECT_STYLE = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none appearance-none cursor-pointer transition-all";
  const LABEL_STYLE = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-rounded text-[20px]">add_circle</span>
          Add Placement
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {colleges.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="material-symbols-rounded text-6xl block mb-4" style={ICO}>list_alt</span>
            <p className="text-sm font-semibold">No colleges found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 w-10">#</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Method Type</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Signup Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {colleges.map((col, idx) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{col.college_name}</p>
                      <p className="text-xs text-slate-400">{col.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{col.contact_name}</p>
                      <p className="text-xs text-slate-400">{col.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-slate-500">{col.method_type || "—"}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <form action={toggleAction}>
                        <input type="hidden" name="id" value={col.id} />
                        <input type="hidden" name="status" value={col.status} />
                        <button 
                          type="submit"
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                            col.status === 1 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {col.status === 1 ? 'active' : 'inactive'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4 text-xs">{formatDate(col.created_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(col)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteAction.bind(null, col.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}-{Math.min(offset + pageSize, total)}</strong> of <strong>{total}</strong>
            </p>
            <div className="flex gap-1">
              {currentPage > 1 ? (
                <Link href={buildUrl({ page: currentPage - 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</Link>
              ) : (
                <button disabled className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">Prev</button>
              )}
              {currentPage < totalPages ? (
                <Link href={buildUrl({ page: currentPage + 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</Link>
              ) : (
                <button disabled className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">Next</button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <AdminModal 
          isOpen={!!modalMode}
          title={modalMode === "add" ? "Add New Ads Placement" : "Edit Ads Placement"} 
          onClose={() => setModalMode(null)}
        >
          <form action={async (fd) => {
            if (modalMode === "add") await createAction(fd);
            else await updateAction(fd);
            setModalMode(null);
          }} className="space-y-4">
            {editingRow && <input type="hidden" name="id" value={editingRow.id} />}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className={LABEL_STYLE}>Method Type</label>
                <input 
                  name="method_type" defaultValue={editingRow?.method_type || ""} 
                  placeholder="e.g. sidebar, banner, top-list"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" 
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className={LABEL_STYLE}>College Profile *</label>
                <div className="relative">
                  <select name="collegeprofile_id" defaultValue={editingRow?.collegeprofile_id || ""} className={SELECT_STYLE} required>
                    <option value="">Select a college...</option>
                    {options.colleges.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>Degree</label>
                <div className="relative">
                  <select name="degree_id" defaultValue={editingRow?.degree_id || ""} className={SELECT_STYLE}>
                    <option value="">Select degree...</option>
                    {options.degrees.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>Course</label>
                <div className="relative">
                  <select name="course_id" defaultValue={editingRow?.course_id || ""} className={SELECT_STYLE}>
                    <option value="">Select course...</option>
                    {options.courses.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>City</label>
                <div className="relative">
                  <select name="city_id" defaultValue={editingRow?.city_id || ""} className={SELECT_STYLE}>
                    <option value="">Select city...</option>
                    {options.cities.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>State</label>
                <div className="relative">
                  <select name="state_id" defaultValue={editingRow?.state_id || ""} className={SELECT_STYLE}>
                    <option value="">Select state...</option>
                    {options.states.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="status" defaultChecked={editingRow ? editingRow.status === 1 : true} value="1" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-semibold text-slate-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" onClick={() => setModalMode(null)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              >
                {modalMode === "add" ? "Create Placement" : "Save Changes"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
