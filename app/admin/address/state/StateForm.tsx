"use client";

import { useTransition } from "react";

interface StateFormProps {
  countries: { id: number; name: string }[];
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function StateForm({ 
  countries,
  initialData, 
  onSubmitAction,
  onSuccess 
}: StateFormProps) {
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
      
      {/* State Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">State Name</label>
        <input 
          type="text"
          name="name"
          defaultValue={initialData?.name || ""}
          required
          placeholder="e.g. Maharashtra"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700"
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
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none font-medium text-slate-700"
          >
            <option value="" disabled>Choose a country...</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-half -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>save</span>
            {initialData ? "Update State" : "Add State"}
          </>
        )}
      </button>
    </form>
  );
}




