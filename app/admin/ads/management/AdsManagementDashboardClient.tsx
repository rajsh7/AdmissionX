"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import AdminModal from "@/app/admin/_components/AdminModal";
import AdminImg from "@/app/admin/_components/AdminImg";
import ImageUpload from "@/app/admin/_components/ImageUpload";
import {
  toggleAdAction,
  createAdManagement,
  updateAdManagement,
} from "./actions";

interface AdRow {
  id: number;
  title: string | null;
  img: string | null;
  description: string | null;
  isactive: number;
  slug: string | null;
  redirectto: string | null;
  start: string | null;
  end: string | null;
  ads_position: string | null;
  users_id: number | null;
  college_banner: string | null;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  ads: AdRow[];
  total: number;
  offset: number;
  pageSize: number;
  q: string;
}

export default function AdsManagementDashboardClient({
  ads,
  total,
  offset,
  pageSize,
  q,
}: PageProps) {
  const [mounted, setMounted] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingAd, setEditingAd] = useState<AdRow | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  function handleDelete(id: number) {
    if (!confirm("Delete this ad?")) return;
    startTransition(async () => {
      await fetch("/api/admin/ads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      window.location.reload();
    });
  }

  function handleAdd() {
    setEditingAd(null);
    setModalMode("add");
  }

  function handleEdit(ad: AdRow) {
    setEditingAd(ad);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingAd(null);
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "—";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return "—";
    }
  }

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center animate-pulse">
        <p className="text-slate-400 font-medium tracking-wide">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Create New Ad
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        {ads.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>
              ad_units
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No ads matching "${q}"` : "No ads found."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                <th className="px-5 py-3 w-10">#</th>
                <th key="banner-th" className="px-4 py-3">Banner</th>
                <th key="title-th" className="px-4 py-3">Title & Desc</th>
                <th key="slug-th" className="px-4 py-3">Slug / Redirect</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Timeline</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {ads.map((ad, idx) => (
                <tr key={ad.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  
                   <td className="px-4 py-4">
                    <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shadow-sm group">
                      <AdminImg 
                        src={ad.img || ad.college_banner || ""} 
                        alt={ad.title || "Ad"} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        fallbackType="symbol" 
                        fallbackValue="image" 
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 max-w-[200px]">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{ad.title || "Untitled"}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{ad.description || "No description"}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4 max-w-[150px]">
                     <p className="text-xs font-medium text-slate-700 truncate" title={ad.slug || ""}>{ad.slug || "—"}</p>
                     {ad.redirectto && (
                       <a href={ad.redirectto} target="_blank" rel="noreferrer" className="text-[10px] text-rose-500 hover:underline truncate block mt-1" title={ad.redirectto}>
                         {ad.redirectto}
                       </a>
                     )}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider">
                      {ad.ads_position || "default"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                     <form action={toggleAdAction} className="inline-block">
                        <input type="hidden" name="id" value={ad.id} />
                        <input type="hidden" name="cur" value={ad.isactive} />
                        <button type="submit" className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          ad.isactive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          {ad.isactive ? "Active" : "Inactive"}
                        </button>
                     </form>
                  </td>

                  <td className="px-4 py-4" suppressHydrationWarning>
                    <p className="text-[10px] text-emerald-600 font-bold mb-0.5">S: {ad.start ? new Date(ad.start).toLocaleDateString() : '—'}</p>
                    <p className="text-[10px] text-rose-500 font-bold">E: {ad.end ? new Date(ad.end).toLocaleDateString() : '—'}</p>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs">
                    {ad.users_id ? `#${ad.users_id}` : "—"}
                  </td>

                  <td className="px-4 py-4 text-xs font-mono text-slate-400" suppressHydrationWarning>
                    {new Date(ad.updated_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleEdit(ad)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                         <span className="material-symbols-rounded text-[18px]">edit</span>
                       </button>
                       <button
                         onClick={() => handleDelete(ad.id)}
                         disabled={isPending}
                         className="text-xs font-semibold px-2 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-40"
                       >
                         Delete
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === "add" ? "Create New Ad" : "Edit Ad"}
      >
        <form action={modalMode === "add" ? createAdManagement : updateAdManagement} className="space-y-4" onSubmit={() => setTimeout(closeModal, 100)}>
          {editingAd && <input type="hidden" name="id" value={editingAd.id} />}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
              <input name="title" defaultValue={editingAd?.title || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Slug</label>
              <input name="slug" defaultValue={editingAd?.slug || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" required />
            </div>
          </div>

          <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
             <textarea name="description" defaultValue={editingAd?.description || ""} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none"></textarea>
          </div>

          <div>
             <ImageUpload 
               name="img_file" 
               label="Ad Banner Image" 
               initialImage={
                 editingAd?.img 
                   ? (editingAd.img.startsWith("/") ? editingAd.img : `/uploads/${editingAd.img}`)
                   : (editingAd?.college_banner || null)
               }
               existingName="img_existing"
             />
          </div>

          <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Redirect URL</label>
             <input name="redirectto" defaultValue={editingAd?.redirectto || ""} type="url" placeholder="https://" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
               <input name="start" type="datetime-local" defaultValue={formatDate(editingAd?.start || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
               <input name="end" type="datetime-local" defaultValue={formatDate(editingAd?.end || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Position</label>
              <select name="ads_position" defaultValue={editingAd?.ads_position || "default"} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none">
                <option value="default">Default</option>
                <option value="home">Home Page</option>
                <option value="home_ticker">Home Ticker Strip</option>
                <option value="top">Top</option>
                <option value="sidebar">Sidebar</option>
                <option value="banner">Banner</option>
                <option value="bottom">Bottom</option>
                <option value="popup">Popup</option>
                <option value="inline">Inline</option>
              </select>
            </div>
            <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target User ID (Optional)</label>
               <input name="users_id" type="number" defaultValue={editingAd?.users_id || ""} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" placeholder="e.g. 42" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" name="isactive" value="1" id="isactiveAd" defaultChecked={editingAd?.isactive === 1} className="w-4 h-4 text-rose-600 rounded bg-slate-50 border-slate-200 focus:ring-rose-500/30 outline-none" />
            <label htmlFor="isactiveAd" className="text-sm font-bold text-slate-700">Currently Active Ad</label>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm">
              {modalMode === "add" ? "Create Ad" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}




