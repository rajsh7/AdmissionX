"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import SliderForm from "./SliderForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminImg from "@/app/admin/_components/AdminImg";

interface SlidersClientProps {
  sliders: any[];
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function SlidersClient({
  sliders,
  onDelete,
  onAdd,
  onEdit
}: SlidersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);

  const handleEdit = (slider: any) => {
    setEditingSlider(slider);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSlider(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add Slider
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slider Image</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title / Text</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sliders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-semibold">
                     No sliders found.
                  </td>
                </tr>
              ) : (
                sliders.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="w-20 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group-hover:border-amber-200 transition-colors">
                        {r.sliderImage ? (
                          <AdminImg 
                            src={`/uploads/sliders/${r.sliderImage}`} 
                            alt={r.sliderTitle || "Slider"} 
                            className="w-full h-full object-cover"
                            fallbackType="div"
                            fallbackValue="No Image"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No Image</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                       <p className="font-bold text-slate-800 leading-snug">{r.sliderTitle || "Untitled Slider"}</p>
                       <p className="text-xs text-slate-400 font-medium italic line-clamp-1">{r.bottomText || "No bottom text"}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${r.status ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                          {r.status ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(r)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                            title="Update"
                          >
                            <span className="material-symbols-rounded text-[18px]">edit</span>
                          </button>
                          <DeleteButton action={onDelete.bind(null, r.id)} size="sm" />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSlider ? "Update Slider" : "Add New Slider"}
      >
        <SliderForm 
          initialData={editingSlider}
          onSubmitAction={editingSlider ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}
