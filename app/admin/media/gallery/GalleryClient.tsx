"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import GalleryForm from "./GalleryForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import AdminImg from "@/app/admin/_components/AdminImg";

interface GalleryClientProps {
  items: any[];
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function GalleryClient({
  items,
  onDelete,
  onAdd,
  onEdit
}: GalleryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const getGalleryImgSrc = (fullimage: string | null, users_id?: number | null) => {
    if (!fullimage) return "";
    
    // If it's already an absolute URL or starts with /, use as-is
    if (fullimage.startsWith("http") || fullimage.startsWith("/")) return fullimage;
    
    // If it includes a folder (locally uploaded), prepend /uploads/
    if (fullimage.includes("/")) return `/uploads/${fullimage}`;
    
    // Legacy logic: if it's just a filename and we have a users_id
    if (users_id) {
      // Determine the folder name: [prefix]-[users_id]
      // Filename pattern is usually: [prefix]-[users_id]-[timestamp].ext
      const parts = fullimage.split("-");
      // Find where the users_id is in the filename to get the prefix
      const idIdx = parts.findIndex(p => p === String(users_id));
      if (idIdx !== -1) {
        const prefix = parts.slice(0, idIdx + 1).join("-");
        // Use the legacy server's gallery path which has subdirectories
        return `https://admissionx.info/gallery/${prefix}/${fullimage}`;
      }
      
      // Fallback if ID not found in filename but we have the ID
      // Some filenames might not match exactly, so we just return it and let AdminImg handle it
    }
  
    // Final fallback: handle via AdminImg's default behavior
    return fullimage;
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_a_photo</span>
          Add Photo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Image</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400 font-semibold">
                     No gallery items found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden relative group-hover:shadow-md transition-shadow border border-slate-200/50 flex items-center justify-center">
                         {r.fullimage ? (
                           r.fullimage.toLowerCase().endsWith(".pdf") ? (
                             <div className="flex flex-col items-center justify-center text-red-500 gap-0.5">
                               <span className="material-symbols-rounded text-[24px]">picture_as_pdf</span>
                               <span className="text-[8px] font-bold uppercase">PDF</span>
                             </div>
                           ) : (
                             <AdminImg 
                               src={getGalleryImgSrc(r.fullimage, r.users_id)} 
                               alt={r.name || "Gallery Item"} 
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                               fallbackType="div"
                               fallbackValue="No Img"
                             />
                           )
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <span className="material-symbols-rounded text-[20px]">image</span>
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="px-5 py-4">
                       <div>
                         <p className="font-bold text-slate-800 leading-snug">{r.name}</p>
                         <p className="text-[11px] text-slate-400 mt-1 font-medium line-clamp-1 italic">{r.caption || "No caption provided."}</p>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(r)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
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
        title={editingItem ? "Update Gallery Photo" : "Add to Media Gallery"}
      >
        <GalleryForm 
          initialData={editingItem}
          onSubmitAction={editingItem ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}




