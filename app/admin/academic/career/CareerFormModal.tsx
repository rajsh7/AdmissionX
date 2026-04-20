"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface CareerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function CareerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CareerFormModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  }

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const inputClass = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Career Path" : "Create New Career Path"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Career Title</label>
            <input required name="title" defaultValue={initialData?.title || ""} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Slug</label>
            <input name="slug" defaultValue={initialData?.slug || ""} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Salary Range</label>
            <input name="salery" defaultValue={initialData?.salery || ""} placeholder="e.g. 5-10 LPA" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Academic Difficulty</label>
            <select name="academicDifficulty" defaultValue={initialData?.academicDifficulty || "Medium"} className={inputClass}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Mandatory Subjects</label>
          <input name="mandatorySubject" defaultValue={initialData?.mandatorySubject || ""} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Career Image URL</label>
          <input name="image" defaultValue={initialData?.image || ""} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Description / Description (HTML allowed)</label>
          <textarea name="description" defaultValue={initialData?.description || ""} rows={5} className={inputClass} />
        </div>

        <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Career Path"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
