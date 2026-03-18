"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import FacilityForm from "./FacilityForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminImage from "@/app/admin/_components/AdminImage";

interface FacilitiesClientProps {
  facilitiesList: any[];
  colleges: { id: number; name: string }[];
  facilityTypes: { id: number; name: string }[];
  offset: number;
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function FacilitiesClient({
  facilitiesList,
  colleges,
  facilityTypes,
  offset,
  onDelete,
  onAdd,
  onEdit
}: FacilitiesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);

  const handleEdit = (facility: any) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add Facility
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {facilitiesList.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>category</span>
            <p className="text-slate-500 font-semibold text-sm">No facility records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">Facility</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {facilitiesList.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono whitespace-nowrap">{offset + idx + 1}</td>
                    <td className="px-4 py-4 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100/50 overflow-hidden">
                          {String(f.icon || "").match(/\.(png|jpe?g|svg|webp)$/i) ? (
                            <AdminImage
                              src={`https://admin.admissionx.in/uploads/${f.icon}`}
                              alt=""
                              className="w-full h-full object-contain p-1"
                              fallbackType="symbol"
                              fallbackValue={f.icon && typeof f.icon === 'string' && !f.icon.includes('.') ? f.icon : 'category'}
                            />
                          ) : (
                            <span className="material-symbols-rounded text-blue-600 text-[20px]" style={ICO_FILL}>
                              {f.icon && typeof f.icon === 'string' && !f.icon.includes('.') ? f.icon : 'category'}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 leading-snug truncate" title={String(f.facility_name || "")}>
                          {f.facility_name || "Untitled Facility"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-0">
                      <span className="text-slate-600 font-medium truncate block" title={f.college_name}>
                        {f.college_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-0">
                      <span className="text-xs text-slate-500 line-clamp-1 truncate block" title={f.description || ""}>
                        {f.description || "No description provided"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(f)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Update"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, f.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingFacility ? "Update Facility" : "Add New campus Facility"}
      >
        <FacilityForm 
          colleges={colleges}
          facilityTypes={facilityTypes}
          initialData={editingFacility ? {
            id: editingFacility.id,
            collegeprofile_id: editingFacility.collegeprofile_id,
            facilities_id: editingFacility.facilities_id,
            name: editingFacility.facility_name_raw, // Need raw name for editing
            description: editingFacility.description
          } : null}
          onSubmitAction={editingFacility ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}
