"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdmissionFormModal from "./AdmissionFormModal";

interface Option { id: number; name: string; }

interface AdmissionRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  title: string;
  description: string;
}

interface AdmissionListClientProps {
  admissions: AdmissionRow[];
  colleges: Option[];
  offset: number;
  total: number;
  pageSize: number;
  searchQuery?: string;
  selectedCollegeId?: string;
  selectedTitle?: string;
  selectedDescription?: string;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function AdmissionListClient({
  admissions,
  colleges,
  offset,
  total,
  pageSize,
  searchQuery = "",
  selectedCollegeId = "",
  selectedTitle = "",
  selectedDescription = "",
  onAdd,
  onDelete,
}: AdmissionListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(
    Boolean(
      searchQuery ||
        selectedCollegeId ||
        selectedTitle ||
        selectedDescription,
    ),
  );

  function openAdd() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end mb-4">
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filters
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
          >
            Add admission +
          </button>
        </div>
      </div>

      {showFilters && (
        <form method="GET" action="/admin/colleges/admission" className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search procedure or college"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">College</label>
              <select
                name="collegeId"
                defaultValue={selectedCollegeId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All colleges</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={selectedTitle}
                placeholder="Procedure title"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</label>
              <input
                type="text"
                name="description"
                defaultValue={selectedDescription}
                placeholder="Search description"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </form>
      )}

      <div className="bg-white">
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {start}-{end}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>{" "}
                procedures
              </>
            ) : (
              "No admission procedures found"
            )}
          </p>
        </div>

        {admissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                assignment_ind
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No admission procedures found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.map((a, idx) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {offset + idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Enrollment workflow
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {a.college_name}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] text-slate-500 line-clamp-2">
                      {a.description || "No description provided"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/colleges/admission/${a.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                        title="Edit admission"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await onDelete(a.id);
                        }}
                        label="Delete"
                        size="xs"
                        icon={
                          <span className="material-symbols-outlined text-[13px]">
                            delete
                          </span>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdmissionFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onAdd}
        admission={undefined}
        colleges={colleges}
      />
    </>
  );
}
