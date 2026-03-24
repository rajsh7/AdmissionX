"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function TestimonialFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TestimonialFormModalProps) {
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

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Testimonial" : "Add New Testimonial"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Author Name</label>
            <input required name="author" defaultValue={initialData?.author || ""} placeholder="e.g. John Doe" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Title / Role</label>
            <input name="misc" defaultValue={initialData?.misc || ""} placeholder="e.g. Student @ Stanford" className={inputClass} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Quote Heading</label>
          <input name="title" defaultValue={initialData?.title || ""} placeholder="Short catchy phrase..." className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Slug</label>
          <input name="slug" defaultValue={initialData?.slug || ""} placeholder="john-doe" className={inputClass} />
        </div>

        <ImageUpload 
          name="image_file" 
          existingName="featuredimage" 
          initialImage={initialData?.featuredimage} 
          label="Author Image"
        />

        <div className="space-y-1.5">
          <label className={labelClass}>Testimonial Content</label>
          <textarea required name="description" defaultValue={initialData?.description || ""} rows={4} className={inputClass} placeholder="The full quote from the user..." />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-rounded text-[20px]" style={ICO}>save</span>}
            {initialData ? "Update Testimonial" : "Save Testimonial"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
