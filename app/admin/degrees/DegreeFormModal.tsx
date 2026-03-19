"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Stream {
  id: number;
  name: string;
}

interface DegreeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  degree?: any;
  streams: Stream[];
}

export default function DegreeFormModal({
  isOpen,
  onClose,
  onSubmit,
  degree,
  streams,
}: DegreeFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={degree ? "Edit Degree" : "Add New Degree"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {degree && <input type="hidden" name="id" value={degree.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Degree Name</label>
          <input
            name="name"
            defaultValue={degree?.name || ""}
            required
            placeholder="e.g. B.Tech, MBA, MBBS"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Stream (Functional Area)</label>
          <select
            name="functionalarea_id"
            defaultValue={degree?.functionalarea_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Slug</label>
          <input
            name="pageslug"
            defaultValue={degree?.pageslug || ""}
            placeholder="e.g. bachelor-of-technology"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Logo URL</label>
            <input
              name="logoimage"
              defaultValue={degree?.logoimage || ""}
              placeholder="URL to icon/logo"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Banner URL</label>
            <input
              name="bannerimage"
              defaultValue={degree?.bannerimage || ""}
              placeholder="URL to banner"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Title (SEO)</label>
          <input
            name="pagetitle"
            defaultValue={degree?.pagetitle || ""}
            placeholder="SEO Meta Title"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Description (SEO)</label>
          <textarea
            name="pagedescription"
            defaultValue={degree?.pagedescription || ""}
            placeholder="SEO Meta Description"
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="isShowOnTop" 
                    defaultChecked={!!degree?.isShowOnTop} 
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Show on Top</span>
                    <span className="text-[10px] text-slate-400">Featured in lists</span>
                </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="isShowOnHome" 
                    defaultChecked={!!degree?.isShowOnHome} 
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Show on Home</span>
                    <span className="text-[10px] text-slate-400">Featured on homepage</span>
                </div>
            </label>
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : degree ? "Update Degree" : "Create Degree"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
