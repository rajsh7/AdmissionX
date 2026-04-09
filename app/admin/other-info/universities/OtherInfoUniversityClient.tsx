"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";
import DeleteButton from "@/app/admin/_components/DeleteButton";

interface UniversityRow {
  id: number;
  name: string;
  image: string | null;
}

interface Props {
  data: UniversityRow[];
  createUniversity: (formData: FormData) => Promise<void>;
  updateUniversity: (formData: FormData) => Promise<void>;
  deleteUniversity: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

function imgUrl(raw: string | null) {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
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
          <label className="text-xs font-bold text-slate-500 uppercase">University Name</label>
          <input
            name="name"
            defaultValue={university?.name || ""}
            required
            placeholder="e.g. Delhi University"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <ImageUpload
          name="image_file"
          label="University Logo / Image"
          initialImage={imgUrl(university?.image ?? null)}
          existingName="image_existing"
        />

        <div className="pt-2 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : university ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

export default function OtherInfoUniversityClient({ data, createUniversity, updateUniversity, deleteUniversity }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UniversityRow | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(u: UniversityRow) { setEditing(u); setModalOpen(true); }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <p className="text-sm font-semibold text-slate-600">{data.length} universities</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            Add University
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">Image</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">University Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">No universities found.</td>
                </tr>
              ) : (
                data.map((r) => (
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
                    <td className="px-4 py-3 font-bold text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-indigo-600 transition-colors"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
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

      <UniversityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? updateUniversity : createUniversity}
        university={editing}
      />
    </>
  );
}
