"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import FacultyFormModal from "./FacultyFormModal";

interface CollegeOption { id: number; name: string; }

interface FacultyListClientProps {
  facultyMembers: any[];
  colleges: CollegeOption[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  createFaculty: (data: FormData) => Promise<void>;
  updateFaculty: (data: FormData) => Promise<void>;
  deleteFaculty: (id: number) => Promise<void>;
}

const REMOTE_BASE = "https://admin.admissionx.in/uploads/";

function buildAvatarUrl(raw: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${REMOTE_BASE}${raw}`;
}

function FacultyAvatar({ name, imagename }: { name: string; imagename: string | null }) {
  const url = buildAvatarUrl(imagename);
  const initial = (name || "F")[0].toUpperCase();
  const colors = ["#3b82f6","#10b981","#8b5cf6","#f43f5e","#f59e0b","#06b6d4"];
  const color = colors[initial.charCodeAt(0) % colors.length];
  const fbId = `faculty-fb-${(name||"").replace(/\s+/g,"-").slice(0,10)}-${(imagename||"x").slice(-4)}`;

  if (!url) {
    return (
      <div style={{ background: color }} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <div id={fbId} style={{ background: color, display: "none" }} className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm absolute inset-0">
        <span className="text-white font-black text-sm">{initial}</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fb = document.getElementById(fbId);
            if (fb) fb.style.display = "flex";
          }}
        />
      </div>
    </div>
  );
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function FacultyListClient({
  facultyMembers, colleges, total, page, totalPages, offset, pageSize, q,
  createFaculty, updateFaculty, deleteFaculty,
}: FacultyListClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(f: any) { setEditing(f); setModalOpen(true); }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>school</span>
            College Faculty
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage academic staff and professors across colleges.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/faculty" className="w-full sm:w-72">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input type="text" name="q" defaultValue={q} placeholder="Search faculty, colleges..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
          </form>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all shrink-0">
            <span className="material-symbols-rounded text-[18px]">add_circle</span>
            Add Faculty
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {facultyMembers.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>school</span>
            <p className="text-slate-500 font-semibold text-sm">No faculty records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Faculty Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {facultyMembers.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <FacultyAvatar name={f.name} imagename={f.imagename} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 leading-snug">{f.suffix ? `${f.suffix} ` : ""}{f.name}</span>
                          <span className="text-[11px] text-blue-600 font-bold uppercase tracking-tighter">{f.designation_name || "Academician"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{f.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-slate-700 font-medium truncate max-w-[180px]">{f.email || "No Email"}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{f.phone || "No Phone"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(f)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteFaculty.bind(null, f.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}–{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> faculty members
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/faculty?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/faculty?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>

      <FacultyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? updateFaculty : createFaculty}
        faculty={editing}
        colleges={colleges}
      />
    </>
  );
}
