"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { formatDate } from "@/lib/utils";
import NewsFormModal from "./NewsFormModal";

interface NewsRow {
  id: number;
  topic: string;
  slug: string | null;
  isactive: number;
  newstypeids: string | null;
  newstagsids: string | null;
  created_at: string;
  updated_at: string;
  description?: string;
  featimage?: string;
}

interface NewsListClientProps {
  data: NewsRow[];
  types: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  toggleAction: (formData: FormData) => Promise<void>;
  offset: number;
}

export default function NewsListClient({
  data,
  types,
  tags,
  createAction,
  updateAction,
  deleteAction,
  toggleAction,
  offset,
}: NewsListClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsRow | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  const typeMap = new Map(types.map(t => [t.id, t.name]));

  function resolveTypeNames(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw.split(",").map(id => typeMap.get(parseInt(id.trim(), 10))).filter(Boolean) as string[];
  }

  function parseIds(raw: string | null | undefined): number[] {
    if (!raw) return [];
    return raw.split(",").map(id => parseInt(id.trim(), 10)).filter(n => !isNaN(n));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO}>add</span>
          Write News Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-4 text-left w-12">#</th>
                <th className="px-6 py-4 text-left">Article Details</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">Categories</th>
                <th className="px-6 py-4 text-center">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => {
                const rowNum = offset + idx + 1;
                const typeNames = resolveTypeNames(item.newstypeids);
                const tagCount = parseIds(item.newstagsids).length;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                      {String(rowNum).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[400px]">
                        <p className="font-bold text-slate-800 text-base leading-tight mb-1 group-hover:text-cyan-600 transition-colors">
                          {item.topic}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-rounded text-[14px]" style={ICO}>calendar_today</span>
                            {formatDate(item.created_at)}
                          </span>
                          {item.slug && (
                             <span className="text-[10px] text-cyan-500 font-mono font-bold lowercase tracking-tighter">
                               /{item.slug}
                             </span>
                          )}
                          {tagCount > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight">
                              {tagCount} tags
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {typeNames.length > 0 ? (
                          typeNames.slice(0, 3).map((name) => (
                            <span key={name} className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg border border-cyan-100 uppercase tracking-tighter transition-all hover:bg-cyan-100">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-300 font-medium">No Category</span>
                        )}
                        {typeNames.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">+{typeNames.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <form action={async (fd) => { await toggleAction(fd); }}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="current" value={item.isactive} />
                        <button 
                          type="submit"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
                            item.isactive 
                              ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-200' 
                              : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-600/10 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isactive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                          {item.isactive ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-cyan-100"
                        >
                          <span className="material-symbols-rounded text-[20px]" style={ICO}>edit</span>
                        </button>
                        <DeleteButton action={deleteAction.bind(null, item.id)} size="sm" />
                        {item.slug && (
                          <Link
                            href={`/news/${item.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-blue-100"
                          >
                            <span className="material-symbols-rounded text-[20px]" style={ICO}>open_in_new</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewsFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={createAction}
        types={types}
        tags={tags}
      />

      <NewsFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={updateAction}
        initialData={editingItem}
        types={types}
        tags={tags}
      />
    </div>
  );
}
