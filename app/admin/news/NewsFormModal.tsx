"use client";

import { useState, useEffect } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
  types: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}

export default function NewsFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  types,
  tags,
}: NewsFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    if (initialData) {
      const typeIds = initialData.newstypeids
        ? initialData.newstypeids.split(",").map((id: string) => parseInt(id.trim(), 10)).filter(Boolean)
        : [];
      const tagIds = initialData.newstagsids
        ? initialData.newstagsids.split(",").map((id: string) => parseInt(id.trim(), 10)).filter(Boolean)
        : [];
      setSelectedTypes(typeIds);
      setSelectedTags(tagIds);
    } else {
      setSelectedTypes([]);
      setSelectedTags([]);
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("newstypeids", selectedTypes.join(","));
      formData.set("newstagsids", selectedTags.join(","));
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  }

  const toggleType = (id: number) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleTag = (id: number) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit News Article" : "Create New News Article"}
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Article Title / Topic
          </label>
          <input
            required
            name="topic"
            defaultValue={initialData?.topic || ""}
            placeholder="Enter the main headline..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium"
          />
        </div>

        {/* Slug & Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Slug
            </label>
            <input
              name="slug"
              defaultValue={initialData?.slug || ""}
              placeholder="news-article-slug"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Featured Image URL
            </label>
            <input
              name="featimage"
              defaultValue={initialData?.featimage || ""}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Content / Description
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description || ""}
            rows={5}
            placeholder="Write the article content..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Types & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              News Types
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[150px] overflow-y-auto space-y-2">
              {types.map(t => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              News Tags
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[150px] overflow-y-auto space-y-2">
              {tags.map(t => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes(t.id)}
                    onChange={() => toggleTag(t.id)}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Visibility Status
          </label>
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="isactive"
                value="1"
                defaultChecked={initialData ? initialData.isactive === 1 : true}
                className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-green-600 transition-colors">
                Published (Live)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="isactive"
                value="0"
                defaultChecked={initialData ? initialData.isactive === 0 : false}
                className="w-4 h-4 text-slate-400 border-slate-300 focus:ring-slate-500"
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-600 transition-colors">
                Draft (Hidden)
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
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
            className="px-6 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-rounded text-[20px]" style={ICO}>
                save
              </span>
            )}
            {initialData ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
