"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminModal from "@/app/admin/_components/AdminModal";
import FacilityForm from "./FacilityForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";

import PaginationFixed from "@/app/components/PaginationFixed";

interface FacilityRow {
  id: string;
  collegeprofile_id: string;
  facilities_id: string | null;
  facility_name_raw: string | null;
  facility_name: string;
  description: string | null;
  created_at?: string | null;
}

interface FacilitiesClientProps {
  facilitiesList: FacilityRow[];
  colleges: { id: string; name: string }[];
  facilityTypes: { id: string; name: string }[];
  offset: number;
  total: number;
  pageSize: number;
  page?: number;
  totalPages?: number;
  onDelete: (id: string) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  q: string;
  collegeId: string;
  facilityTypeId: string;
  displayName: string;
  description: string;
}

export default function FacilitiesClient({
  facilitiesList, colleges, facilityTypes, offset, total, pageSize,
  page = 1, totalPages = 1,
  onDelete, onAdd, q, collegeId, facilityTypeId, displayName, description,
}: FacilitiesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(Boolean(q || collegeId || facilityTypeId || displayName || description));
  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visibleCount when facilitiesList changes
  useEffect(() => {
    setVisibleCount(15);
  }, [facilitiesList[0]?.id]);

  const showMore = visibleCount < facilitiesList.length;
  const showPagination = !showMore && totalPages > 1;

  function openAdd() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);

  function formatDate(value?: string | null) {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-800">College Facilities</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and monitor all college facility records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilter((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filters
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
          >
            Add college facility +
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-4">
          <form method="GET" action="/admin/colleges/facilities" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">College</label>
              <div className="relative">
                <select
                  name="collegeId"
                  defaultValue={collegeId}
                  className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all text-slate-700 appearance-none"
                >
                  <option value="">All colleges</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Facility Type</label>
              <div className="relative">
                <select
                  name="facilityTypeId"
                  defaultValue={facilityTypeId}
                  className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all text-slate-700 appearance-none"
                >
                  <option value="">All types</option>
                  <option value="custom">Custom / None</option>
                  {facilityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search facilities..."
                className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Name</label>
              <input
                type="text"
                name="displayName"
                defaultValue={displayName}
                placeholder="Search display name"
                className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700"
              />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <input
                type="text"
                name="description"
                defaultValue={description}
                placeholder="Search description"
                className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/colleges/facilities"
                className="px-5 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Clear
              </Link>
              <button
                type="submit"
                className="px-5 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white">
        <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
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
                facilities
              </>
            ) : (
              "No facilities found"
            )}
          </p>
        </div>

        {facilitiesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                location_city
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No facility records found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilitiesList.slice(0, visibleCount).map((f, idx) => {
                const college = colleges.find((c) => c.id === f.collegeprofile_id);
                const facilityType = facilityTypes.find((ft) => ft.id === f.facilities_id);
                const displayName = f.facility_name_raw || facilityType?.name || "General Facility";
                const collegeName = college?.name || "Unnamed College";

                return (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                        {offset + idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {f.description || "No description"}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {collegeName}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        {facilityType?.name || "Custom"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] text-slate-500">
                        {formatDate(f.created_at)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-row items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/colleges/facilities/${f.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                          title="Edit facility"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                          Edit
                        </Link>
                        <DeleteButton
                          action={async () => {
                            await onDelete(f.id);
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal isOpen={isModalOpen} onClose={closeModal} title="Add New Campus Facility">
        <FacilityForm colleges={colleges} facilityTypes={facilityTypes} initialData={null} onSubmitAction={onAdd} onSuccess={closeModal} />
      </AdminModal>

      {/* Show More */}
      {showMore && (
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
          <button onClick={() => setVisibleCount((c) => Math.min(c + 15, facilitiesList.length))} className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors" type="button">
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{offset + 1}</strong>–<strong>{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> facilities
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
