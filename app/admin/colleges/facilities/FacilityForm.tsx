"use client";

import { useTransition } from "react";

interface FacilityFormProps {
  colleges: { id: number; name: string }[];
  facilityTypes: { id: number; name: string }[];
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function FacilityForm({ 
  colleges, 
  facilityTypes, 
  initialData, 
  onSubmitAction,
  onSuccess 
}: FacilityFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* College Selection */}
        <div className="relative w-full">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Select College</label>
          <div className="relative group">
            <select 
              name="collegeprofile_id"
              defaultValue={initialData?.collegeprofile_id || ""}
              required
              className="w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-red-500 shadow-sm appearance-none cursor-pointer pr-10"
              style={{ color: "black" }}
            >
              <option value="" disabled style={{ color: "black" }}>Choose a college...</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id} style={{ color: "black" }}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Facility Type */}
        <div className="relative w-full">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Facility Type</label>
          <div className="relative group">
            <select 
              name="facilities_id"
              defaultValue={initialData?.facilities_id || ""}
              className="w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-red-500 shadow-sm appearance-none cursor-pointer pr-10"
              style={{ color: "black" }}
            >
              <option value="" style={{ color: "black" }}>None / Custom</option>
              {facilityTypes.map(f => (
                <option key={f.id} value={f.id} style={{ color: "black" }}>{f.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Name */}
      <div className="relative w-full">
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Display Name</label>
        <input 
          type="text"
          name="name"
          defaultValue={initialData?.name || ""}
          placeholder="e.g. Modern Library"
          className="w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-red-500 shadow-sm"
        />
      </div>

      {/* Description */}
      <div className="relative w-full">
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500">Description</label>
        <textarea 
          name="description"
          defaultValue={initialData?.description || ""}
          rows={4}
          placeholder="Tell more about this facility..."
          className="w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-red-500 shadow-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button 
          type="submit"
          disabled={isPending}
          className="px-10 py-2.5 rounded-sm font-semibold text-[15px] text-white transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#e53e3e" }}
        >
          {isPending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {initialData ? "Update Facility" : "Submit"}
            </>
          )}
        </button>
      </div>
    </form>

  );
}




