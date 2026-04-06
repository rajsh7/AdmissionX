"use client";

import { useState } from "react";
import Link from "next/link";
import StudentProfileFormModal from "./StudentProfileFormModal";
import { formatDate } from "@/lib/utils";

interface StudentProfileClientProps {
  profiles: any[];
  users: any[];
  offset: number;
  PAGE_SIZE: number;
  total: number;
  totalPages: number;
  q: string;
  createProfile: (data: FormData) => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

export default function StudentProfileClient({
  profiles,
  users,
  offset,
  PAGE_SIZE,
  total,
  totalPages,
  q,
  createProfile,
  updateProfile,
  deleteProfile,
}: StudentProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);

  function openAddModal() {
    setEditingProfile(null);
    setIsModalOpen(true);
  }

  function openEditModal(p: any) {
    setEditingProfile(p);
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this profile?")) {
      await deleteProfile(id);
    }
  }

  return (
    <>
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-2">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <form method="GET" className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-admin-blue transition-colors">search</span>
            <input 
              name="q"
              defaultValue={q}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-blue/20 focus:border-admin-blue transition-all"
            />
          </form>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-admin-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-0 mt-2 px-2">
        <button className="flex items-center justify-between !bg-admin-dark !text-white px-8 py-3 rounded-t-lg font-bold text-[13px] min-w-[200px]">
          Profile Information
          <span className="material-symbols-outlined text-[18px] ml-4">expand_more</span>
        </button>
        <button className="flex items-center justify-between !bg-admin-dark !text-white px-8 py-3 rounded-t-lg font-bold text-[13px] min-w-[200px]">
          Bookmarks
          <span className="material-symbols-outlined text-[18px] ml-4">chevron_right</span>
        </button>
      </div>

      {/* Main Table Interface */}
      <div className="bg-white border-[2.5px] border-admin-blue overflow-hidden shadow-sm mx-2">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-admin-header text-white">
                <th className="px-2 py-3.5 font-bold border-r border-[#666666] w-16 text-center text-[12px] uppercase">ID</th>
                <th className="px-4 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">Student name</th>
                <th className="px-4 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">Phone No.</th>
                <th className="px-4 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">Email Address</th>
                <th className="px-3 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">Gender</th>
                <th className="px-3 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">DOB</th>
                <th className="px-4 py-3.5 font-bold border-r border-[#666666] text-center text-[12px] uppercase">Last Update by</th>
                <th className="px-4 py-3.5 font-bold text-center text-[12px] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="border-t border-admin-blue">
              {profiles.length > 0 ? (
                profiles.map((profile, i) => (
                  <tr key={profile.id} className={`${i % 2 === 1 ? "bg-admin-stripe" : "bg-white"} border-b border-[#D1E1F5] last:border-0`}>
                    <td className="px-2 py-3.5 text-center border-r border-[#D1E1F5] text-slate-500 font-medium">
                      {String(profile.id).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] font-normal text-slate-700">
                      {profile.student_name}
                    </td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-600">
                      {profile.parentsnumber ? (profile.parentsnumber.startsWith('+') ? profile.parentsnumber : `+91 ${profile.parentsnumber}`) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-500">
                      {profile.student_email}
                    </td>
                    <td className="px-3 py-3.5 text-center border-r border-[#D1E1F5] text-slate-600">
                      {profile.gender}
                    </td>
                    <td className="px-3 py-3.5 text-center border-r border-[#D1E1F5] text-slate-500">
                      {formatDate(profile.dateofbirth)}
                    </td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-600">
                      Amit Tyagi
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2.5">
                        <button 
                          onClick={() => openEditModal(profile)} 
                          className="w-[32px] h-[32px] flex items-center justify-center bg-admin-dark text-white rounded-[4px] hover:bg-black transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>
                        <div className="w-[1px] h-5 bg-slate-300 mx-1" />
                        <button 
                          onClick={() => handleDelete(profile.id)} 
                          className="w-[32px] h-[32px] flex items-center justify-center bg-admin-blue text-white rounded-[4px] hover:bg-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">description</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                offset === 0 && Array(15).fill(null).map((_, i) => (
                  <tr key={`placeholder-${i}`} className={`${i % 2 === 1 ? "bg-admin-stripe" : "bg-white"} border-b border-[#D1E1F5] last:border-0 opacity-40 grayscale`}>
                    <td className="px-2 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400 font-medium">0101</td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] font-normal text-slate-400">Ankarya</td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400">+91 823-281-8292</td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400">ankarya@gmail...</td>
                    <td className="px-3 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400">Female</td>
                    <td className="px-3 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400">11 Jan 2002</td>
                    <td className="px-4 py-3.5 text-center border-r border-[#D1E1F5] text-slate-400">Amit Tyagi</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-[30px] h-[30px] bg-slate-200 rounded-[4px]" />
                        <div className="w-[1px] h-5 bg-slate-200 mx-1" />
                        <div className="w-[30px] h-[30px] bg-slate-200 rounded-[4px]" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {profiles.length === 0 && offset > 0 && (
                 <tr>
                    <td colSpan={8} className="text-center py-20 text-slate-400 font-medium">
                      No more records found on this page.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> profiles
            </p>
            <div className="flex gap-1">
              {offset / PAGE_SIZE + 1 > 1 && (
                <Link href={`?page=${offset / PAGE_SIZE}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded hover:bg-slate-50">
                  Prev
                </Link>
              )}
              {offset / PAGE_SIZE + 1 < totalPages && (
                <Link href={`?page=${offset / PAGE_SIZE + 2}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <StudentProfileFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingProfile ? updateProfile : createProfile}
        profile={editingProfile}
        users={users}
      />
    </>
  );
}
