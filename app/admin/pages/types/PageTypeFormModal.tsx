"use client";

import { useState, useEffect } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface PageTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function PageTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PageTypeFormModalProps) {
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
      title={initialData ? "Edit Page Type" : "Add New Page Type"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Category Name
          </label>
          <div className="relative group">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px] group-focus-within:text-blue-500 transition-colors"
              style={ICO}
            >
              label
            </span>
            <input
              required
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="e.g. Hero Section, Footer, landing_page"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Active Status
          </label>
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value="1"
                defaultChecked={initialData ? initialData.status === 1 : true}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                Active
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value="0"
                defaultChecked={initialData ? initialData.status === 0 : false}
                className="w-4 h-4 text-slate-400 border-slate-300 focus:ring-slate-500"
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-600 transition-colors">
                Inactive
              </span>
            </label>
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
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
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
