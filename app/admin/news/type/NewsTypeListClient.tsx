"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import NewsTypeFormModal from "./NewsTypeFormModal";

interface NewsTypeRow {
  id: number;
  name: string;
  slug: string | null;
}

interface NewsTypeListClientProps {
  data: NewsTypeRow[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
}

export default function NewsTypeListClient({
  data,
  createAction,
  updateAction,
  deleteAction,
}: NewsTypeListClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsTypeRow | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-sm w-full text-slate-400">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[20px]" style={ICO}>search</span>
          <input 
            placeholder="Search news types..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-800"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO}>add</span>
          Add News Type
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">News Type / Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <span className="material-symbols-rounded text-6xl" style={ICO}>category</span>
                      <p className="font-bold">No News Types Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                           <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>category</span>
                        </div>
                        <span className="font-bold text-slate-800 text-base">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-tight">
                        {item.slug || "—"}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button
                         onClick={() => setEditingItem(item)}
                         className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-amber-100 hover:shadow-sm"
                         title="Edit Type"
                       >
                         <span className="material-symbols-rounded text-[20px]" style={ICO}>edit</span>
                       </button>
                       <DeleteButton action={deleteAction.bind(null, item.id)} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewsTypeFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={createAction}
      />

      <NewsTypeFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={updateAction}
        initialData={editingItem}
      />
    </div>
  );
}
