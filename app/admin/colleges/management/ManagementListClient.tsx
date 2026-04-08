"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ManagementFormModal from "./ManagementFormModal";
import Image from "next/image";
import { createManagementMember, updateManagementMember, deleteManagementRow } from "./actions";

interface Option { id: number; name: string; }

interface ManagementRow {
  id: number;
  collegeprofile_id: number;
  name: string;
  suffix: string;
  designation: string;
  emailaddress: string;
  phoneno: string;
  picture: string;
  college_name: string;
}

interface ManagementListClientProps {
  members: ManagementRow[];
  colleges: Option[];
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  search?: string;
  selectedCollegeId?: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function ManagementListClient({
  members,
  colleges,
  offset,
  total,
  page,
  totalPages,
  search = "",
  selectedCollegeId = "",
}: ManagementListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagementRow | null>(null);

  function openAdd() {
    setEditingMember(null);
    setIsModalOpen(true);
  }

  function openEdit(member: ManagementRow) {
    setEditingMember(member);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingMember(null);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3E3E3E] hover:bg-[#2a2a2a] text-white font-semibold rounded-[5px] shadow-lg transition-all text-base"
        >
          Add management member +
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {members.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>groups</span>
            <p className="text-slate-500 font-semibold text-sm">No management records found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role & College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-100">
                          <Image
                            src={m.picture ? (m.picture.startsWith('http') ? m.picture : `https://admin.admissionx.in/uploads/${m.picture}`) : '/placeholder.png'}
                            alt={m.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            loading="lazy"
                            unoptimized={Boolean(m.picture)}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 leading-none truncate">
                            {m.name}
                            {m.suffix && <span className="ml-1 text-[10px] text-slate-400 font-medium">({m.suffix})</span>}
                          </span>
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">{m.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{m.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[11px] empty:hidden">
                        {m.emailaddress && <span className="text-slate-600 font-medium truncate max-w-[150px]">{m.emailaddress}</span>}
                        {m.phoneno && <span className="text-slate-400">{m.phoneno}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteManagementRow.bind(null, m.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ManagementFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingMember ? updateManagementMember : createManagementMember}
        member={editingMember}
        colleges={colleges}
      />
    </>
  );
}




