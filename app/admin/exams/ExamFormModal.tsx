"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
  examTypes: { id: number; name: string }[];
}

export default function ExamFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  examTypes,
}: ExamFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "dates" | "details">("basic");

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

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Entrance Exam" : "Create New Entrance Exam"}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        {[
          { id: "basic", label: "Basic Info", icon: "info" },
          { id: "dates", label: "Dates & Fees", icon: "calendar_today" },
          { id: "details", label: "Details & Syllabus", icon: "description" },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-h-[65vh] overflow-y-auto px-1 pb-4">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {/* Basic Info Tab */}
        <div className={activeTab === "basic" ? "space-y-4" : "hidden"}>
          <div className="space-y-1.5">
            <label className={labelClass}>Exam Title</label>
            <input required name="title" defaultValue={initialData?.title || ""} placeholder="e.g. JEE Main 2024" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Slug</label>
              <input name="slug" defaultValue={initialData?.slug || ""} placeholder="jee-main-2024" className={inputClass + " font-mono"} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Exam Type</label>
              <select name="examination_types_id" defaultValue={initialData?.examination_types_id || ""} className={inputClass}>
                <option value="">Select Type</option>
                {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Featured Image URL</label>
              <input name="featimage" defaultValue={initialData?.featimage || ""} placeholder="https://..." className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Full Image URL</label>
              <input name="fullimage" defaultValue={initialData?.fullimage || ""} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Short Description</label>
            <textarea name="description" defaultValue={initialData?.description || ""} rows={3} className={inputClass} placeholder="Brief overview of the exam..." />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Status</label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="1" defaultChecked={initialData ? initialData.status === 1 : true} className="w-4 h-4 text-green-600 border-slate-300" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-green-600">Active (Live)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="0" defaultChecked={initialData ? initialData.status === 0 : false} className="w-4 h-4 text-slate-400 border-slate-300" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-600">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dates & Fees Tab */}
        <div className={activeTab === "dates" ? "space-y-4" : "hidden"}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Application From</label>
              <input type="date" name="applicationFrom" defaultValue={initialData?.applicationFrom?.split('T')[0] || ""} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Application To</label>
              <input type="date" name="applicationTo" defaultValue={initialData?.applicationTo?.split('T')[0] || ""} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Application Fees</label>
            <textarea name="applicationFees" defaultValue={initialData?.applicationFees || ""} rows={2} className={inputClass} placeholder="e.g. Gen: 1000, SC/ST: 500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Official Website</label>
              <input name="website" defaultValue={initialData?.website || ""} placeholder="https://..." className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Brochure URL</label>
              <input name="brochure" defaultValue={initialData?.brochure || ""} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* Details & Syllabus Tab */}
        <div className={activeTab === "details" ? "space-y-4" : "hidden"}>
          <div className="space-y-1.5">
            <label className={labelClass}>Eligibility</label>
            <textarea name="eligibility" defaultValue={initialData?.eligibility || ""} rows={3} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Syllabus</label>
            <textarea name="syllabus" defaultValue={initialData?.syllabus || ""} rows={3} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Exam Pattern</label>
            <textarea name="pattern" defaultValue={initialData?.pattern || ""} rows={3} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>How to Prepare</label>
            <textarea name="prepare" defaultValue={initialData?.prepare || ""} rows={3} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Contact Info</label>
            <textarea name="contact" defaultValue={initialData?.contact || ""} rows={2} className={inputClass} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-rounded text-[20px]" style={ICO}>save</span>}
            {initialData ? "Update Exam" : "Create Exam"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
