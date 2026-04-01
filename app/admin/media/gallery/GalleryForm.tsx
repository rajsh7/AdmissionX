"use client";

import { useTransition } from "react";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface GalleryFormProps {
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function GalleryForm({ 
  initialData, 
  onSubmitAction,
  onSuccess 
}: GalleryFormProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await onSubmitAction(formData);
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      {/* Item Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Item name</label>
        <input 
          type="text"
          name="name"
          defaultValue={initialData?.name || ""}
          required
          placeholder="e.g. Annual Sports Day 2024"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700"
        />
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Caption</label>
        <textarea 
          name="caption"
          defaultValue={initialData?.caption || ""}
          rows={2}
          placeholder="Sub-text or description for the photo..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 resize-none"
        />
      </div>

      {/* Item Image */}
      <div className="space-y-1.5">
        <ImageUpload 
          name="fullimage_file"
          label="Gallery Image"
          initialImage={initialData?.fullimage ? `https://admin.admissionx.in/uploads/${initialData.fullimage}` : null}
          existingName="fullimage_existing"
        />
        <p className="text-[10px] text-slate-400 ml-1 italic">Note: Uploaded images will be saved to /uploads/gallery/</p>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>save</span>
            {initialData ? "Update Gallery Item" : "Add to Gallery"}
          </>
        )}
      </button>
    </form>
  );
}




