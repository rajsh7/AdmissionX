"use client";

import { useTransition } from "react";

interface BlogFormProps {
  initialData?: any;
  onSubmitAction: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function BlogForm({ 
  initialData, 
  onSubmitAction,
  onSuccess 
}: BlogFormProps) {
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
      
      {/* Blog Topic/Title */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Blog Topic</label>
        <input 
          type="text"
          name="topic"
          defaultValue={initialData?.topic || ""}
          required
          placeholder="e.g. How to Choose the Right College"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-medium text-slate-700"
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Slug (URL identifier)</label>
        <input 
          type="text"
          name="slug"
          defaultValue={initialData?.slug || ""}
          required
          placeholder="e.g. how-to-choose-college"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-slate-600"
        />
      </div>

      {/* Description / Content */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Content (Description)</label>
        <textarea 
          name="description"
          defaultValue={initialData?.description || ""}
          rows={6}
          placeholder="Write your blog content here..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-medium text-slate-700"
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
        <div className="relative">
          <select 
            name="isactive"
            defaultValue={initialData?.isactive ?? 1}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none font-medium text-slate-700"
          >
            <option value={1}>Active (Live)</option>
            <option value={0}>Inactive (Draft)</option>
          </select>
          <span className="absolute right-3 top-half -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>save</span>
            {initialData ? "Update Blog Post" : "Publish Blog Post"}
          </>
        )}
      </button>
    </form>
  );
}
