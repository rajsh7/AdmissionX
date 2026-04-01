"use client";

import { useTransition } from "react";

interface CityFormProps {
  countries: { id: number; name: string }[];
  states: { id: number; name: string; country_id: number | null }[];
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function CityForm({ 
  countries,
  states,
  initialData, 
  onSubmitAction,
  onSuccess 
}: CityFormProps) {
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
      
      {/* City Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">City Name</label>
        <input 
          type="text"
          name="name"
          defaultValue={initialData?.name || ""}
          required
          placeholder="e.g. Mumbai"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium text-slate-700"
        />
      </div>

      {/* Country Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Country</label>
        <div className="relative">
          <select 
            name="country_id"
            defaultValue={initialData?.country_id || ""}
            required
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none font-medium text-slate-700"
          >
            <option value="" disabled>Choose a country...</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-half -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* State Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select State</label>
        <div className="relative">
          <select 
            name="state_id"
            defaultValue={initialData?.state_id || ""}
            required
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none font-medium text-slate-700"
          >
            <option value="" disabled>Choose a state...</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-half -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>save</span>
            {initialData ? "Update City" : "Add City"}
          </>
        )}
      </button>
    </form>
  );
}




