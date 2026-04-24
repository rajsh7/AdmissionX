"use client";

import { useState, useEffect } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

const STEP = 25;

interface UniversityRow {
  id: number;
  name: string;
  image: string | null;
}

interface Props {
  data: UniversityRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  offset: number;
  createUniversity: (formData: FormData) => Promise<void>;
  updateUniversity: (formData: FormData) => Promise<void>;
  deleteUniversity: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

function imgUrl(raw: string | null) {
  if (!raw) return null;
  const s = raw.trim();
  if (!s || s === "NULL") return null;
  if (s.startsWith("http") || s.startsWith("/")) return s;
  const encoded = encodeURIComponent(`https://admin.admissionx.in/uploads/university/${s}`);
  return `/api/image-proxy?url=${encoded}`;
}

function UniversityModal({
  isOpen, onClose, onSubmit, university,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  university?: UniversityRow | null;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try { await onSubmit(formData); onClose(); }
    catch { alert("Something went wrong."); }
    finally { setIsPending(false); }
  }

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={university ? "Edit University" : "Add University"}>
      <form action={handleAction} className="space-y-4 px-1">
        {university && <input type="hidden" name="id" value={university.id} />}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">University Name</label>
          <input
            name="name"
            defaultValue={university?.name || ""}
            required
            placeholder="e.g. Delhi University"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        <ImageUpload
          name="image_file"
          label="University Logo / Image"
          initialImage={imgUrl(university?.image ?? null)}
          existingName="image_existing"
        />

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
            {isPending ? "Saving..." : university ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

export default function OtherInfoUniversityClient({ 
  data, total, page, totalPages, pageSize, offset,
  createUniversity, updateUniversity, deleteUniversity 
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UniversityRow | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page changes
  const pageKey = `${page}-${data[0]?.id}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (pageKey !== lastPageKey) {
    setLastPageKey(pageKey);
    setVisibleCount(STEP);
  }

  const showMore = visibleCount < data.length;
  const showPagination = !showMore && totalPages > 1;

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(u: UniversityRow) { setEditing(u); setModalOpen(true); }

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-900/10"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add University
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">Image</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">University Name</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>account_balance</span>
                    <p className="text-slate-500 font-semibold text-sm">No universities found.</p>
                  </td>
                </tr>
              ) : (
                data.slice(0, visibleCount).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                        {r.image ? (
                          <img src={imgUrl(r.image)!} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>account_balance</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-snug">{r.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono italic mt-0.5">ID: #{r.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <span className="material-symbols-rounded text-[20px]">edit</span>
                        </button>
                        <DeleteButton action={deleteUniversity.bind(null, r.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More */}
      {showMore && (
        <div className="py-8 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, data.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] ml-[0.2em]">
              Show More ({data.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[40px] animate-bounce group-hover:text-indigo-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Showing <span className="text-slate-800 font-bold">{(page - 1) * pageSize + 1}–{Math.min((page - 1) * pageSize + pageSize, total)}</span> of <span className="text-slate-800 font-bold">{total.toLocaleString()}</span> universities
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

      <UniversityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? updateUniversity : createUniversity}
        university={editing}
      />
    </>
  );
}
