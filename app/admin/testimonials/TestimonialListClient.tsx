"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import TestimonialFormModal from "./TestimonialFormModal";

interface TestimonialRow {
  id: number;
  title: string;
  author: string;
  featuredimage: string;
  description: string;
  misc: string;
  slug: string;
  created_at: string;
}

interface TestimonialListClientProps {
  data: TestimonialRow[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  offset: number;
}

export default function TestimonialListClient({
  data,
  createAction,
  updateAction,
  deleteAction,
  offset,
}: TestimonialListClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialRow | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  const getImgUrl = (src: string | null) => {
    if (!src) return null;
    if (src.startsWith("/") || src.startsWith("http")) return src;
    // Legacy support for images stored in admin.admissionx.in/uploads/testimonials/
    // Use image proxy to handle SSL issues
    const url = `https://admin.admissionx.in/uploads/testimonials/${src}`;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO}>add</span>
          Add Testimonial
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 text-left w-12">#</th>
                <th className="px-6 py-4 text-left">Author</th>
                <th className="px-6 py-4 text-left">Feedback</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                    {String(offset + idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {item.featuredimage ? (
                        <img 
                          src={getImgUrl(item.featuredimage) || ""} 
                          alt={item.author} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" 
                          onError={(e) => {
                            // Fallback if the admin.admissionx.in URL fails
                            e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=100";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-rounded text-[20px]" style={ICO}>person</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{item.author}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.misc || "Reviewer"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-[500px]">
                      <p className="text-xs font-bold text-slate-600 mb-1">{item.title}</p>
                      <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">"{item.description}"</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                        title="Edit Testimonial"
                      >
                        <span className="material-symbols-rounded text-[20px]" style={ICO}>edit</span>
                      </button>
                      <DeleteButton action={deleteAction.bind(null, item.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>format_quote</span>
                      <p className="text-sm font-semibold text-slate-500 text-center">No testimonials found.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TestimonialFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={createAction}
      />

      <TestimonialFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={updateAction}
        initialData={editingItem}
      />
    </div>
  );
}




