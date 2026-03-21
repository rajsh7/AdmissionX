"use client";

import { useTransition } from "react";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface SliderFormProps {
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function SliderForm({ 
  initialData, 
  onSubmitAction,
  onSuccess 
}: SliderFormProps) {
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
      
      {/* Slider Title */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Slider Title</label>
        <input 
          type="text"
          name="sliderTitle"
          defaultValue={initialData?.sliderTitle || ""}
          placeholder="e.g. Welcome to AdmissionX"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700"
        />
      </div>

      {/* Bottom Text */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bottom Text</label>
        <textarea 
          name="bottomText"
          defaultValue={initialData?.bottomText || ""}
          rows={2}
          placeholder="Sub-text displayed below the title..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700 resize-none"
        />
      </div>

      {/* Slider Image */}
      <div className="space-y-1.5">
        <ImageUpload 
          name="sliderImage_file"
          label="Slider Image"
          initialImage={initialData?.sliderImage ? `https://admin.admissionx.in/uploads/sliders/${initialData.sliderImage}` : null}
          existingName="sliderImage_existing"
        />
        <p className="text-[10px] text-slate-400 ml-1 italic">Note: Uploaded images will be saved to /uploads/sliders/</p>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
        <div className="relative">
          <select 
            name="status"
            defaultValue={initialData?.status ?? 1}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none font-medium text-slate-700"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
          <span className="absolute right-3 top-half -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>save</span>
            {initialData ? "Update Slider" : "Add Slider"}
          </>
        )}
      </button>
    </form>
  );
}
