"use client";

import { useState } from "react";
import Link from "next/link";
import AdminModal from "@/app/admin/_components/AdminModal";
import FacilityForm from "./FacilityForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminImg from "@/app/admin/_components/AdminImg";

interface FacilitiesClientProps {
  facilitiesList: any[];
  colleges: { id: number; name: string }[];
  facilityTypes: { id: number; name: string }[];
  offset: number;
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  q: string;
  collegeId: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function FacilitiesClient({
  facilitiesList,
  colleges,
  facilityTypes,
  offset,
  onDelete,
  onAdd,
  onEdit,
  q,
  collegeId
}: FacilitiesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);

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
      <div className="relative">
        {/* Add Button */}
        <div className="flex justify-start mb-4">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
          >
            Add new college facilities +
          </button>
        </div>

        {/* Table Container with Courses Border */}
        <div className="bg-white border-[3px] border-[#3498db] shadow-sm overflow-hidden">
          
          <div className="bg-white border-b border-slate-200 p-4 flex justify-end">
             <button 
               onClick={() => setShowFilter(!showFilter)}
               className="px-4 py-1.5 bg-[#444444] text-white text-[11px] font-bold rounded shadow hover:bg-black transition-all uppercase tracking-widest"
             >
               Filter Options
             </button>
          </div>

          {showFilter && (
            <div className="bg-white p-6 border-b border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <form method="GET" action="/admin/colleges/facilities" className="flex flex-col sm:flex-row items-end gap-6 text-black">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">College Name</label>
                  <select name="collegeId" defaultValue={collegeId} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-black">
                    <option value="">Select college</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Query</label>
                  <input type="text" name="q" defaultValue={q} placeholder="Facility name..." className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-black" />
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/colleges/facilities" className="px-6 py-2 bg-slate-400 text-white text-xs font-bold rounded-sm hover:bg-slate-500 flex items-center justify-center">CLEAR</Link>
                  <button type="submit" className="px-6 py-2 bg-[#0799fb] text-white text-xs font-bold rounded-sm hover:bg-blue-600">SUBMIT</button>
                </div>
              </form>
            </div>
          )}

          {facilitiesList.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm font-semibold">No facility records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#444444] text-white uppercase text-[11px] font-black tracking-widest">
                    <th className="px-4 py-4 border-r border-white/10 w-16">ID</th>
                    <th className="px-4 py-4 border-r border-white/10">College Profile</th>
                    <th className="px-4 py-4 border-r border-white/10">Facilities</th>
                    <th className="px-4 py-4 border-r border-white/10">Last Update by</th>
                    <th className="px-4 py-5 w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilitiesList.map((f, idx) => {
                    const college = colleges.find(c => c.id === f.collegeprofile_id);
                    const facilityType = facilityTypes.find(ft => ft.id === f.facilities_id);
                    const displayName = f.facility_name_raw || facilityType?.name || "General Facility";
                    const collegeName = college?.name || "Unnamed College";
                    
                    return (
                      <tr 
                        key={f.id} 
                        className={`transition-colors text-[13px] font-medium ${idx % 2 === 0 ? "bg-[#e8f4fd]" : "bg-white"} hover:bg-blue-100/30`}
                      >
                        <td className="px-4 py-4 border-r border-slate-200/60 font-bold text-slate-400">
                          {String(idx + 1 + offset).padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-200/60 font-bold text-slate-700 uppercase">
                          {collegeName}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-200/60 font-semibold text-slate-500">
                          {displayName}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-200/60">
                          <div className="text-blue-400 font-bold mb-1">Amit Tyagi</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {f.created_at ? new Date(f.created_at).toISOString().replace('T', ' ').split('.')[0] : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 flex items-center justify-center gap-1.5 min-w-[120px]">
                          <button 
                            onClick={() => handleEdit(f)}
                            className="w-9 h-9 flex items-center justify-center bg-[#444444] text-white rounded hover:bg-black transition-all"
                            title="Update"
                          >
                            <span className="material-symbols-rounded text-[18px]">edit_square</span>
                          </button>
                          <DeleteButton 
                             action={onDelete.bind(null, f.id)} 
                             size="sm" 
                             variant="classic"
                             label="Delete"
                             icon={<span className="material-symbols-rounded text-[20px]">delete</span>}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
            name: editingFacility.facility_name_raw,
            description: editingFacility.description
          } : null}
          onSubmitAction={editingFacility ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}




