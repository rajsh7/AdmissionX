"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface NewsTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function NewsTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: NewsTypeFormModalProps) {
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

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit News Type" : "Add New News Type"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Type Name
          </label>
          <div className="relative group">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px] group-focus-within:text-amber-500 transition-colors"
              style={ICO}
            >
              label
            </span>
            <input
              required
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="e.g. Breaking News, Campus Life"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Slug (Optional)
          </label>
          <div className="relative group">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px] group-focus-within:text-amber-500 transition-colors"
              style={ICO}
            >
              link
            </span>
            <input
              name="slug"
              defaultValue={initialData?.slug || ""}
              placeholder="e.g. breaking-news"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-rounded text-[20px]" style={ICO}>
                check
              </span>
            )}
            {initialData ? "Save Changes" : "Create Type"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




