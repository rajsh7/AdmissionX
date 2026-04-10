"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";
import { useState } from "react";

interface StreamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  stream?: any;
}

export default function StreamFormModal({
  isOpen,
  onClose,
  onSubmit,
  stream,
}: StreamFormModalProps) {
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
      title={stream ? "Edit Stream" : "Add New Stream"}
    >
      <form action={handleAction} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {stream && <input type="hidden" name="id" value={stream.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Stream Name</label>
          <input
            name="name"
            defaultValue={stream?.name || ""}
            required
            placeholder="e.g. Engineering, Management"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Slug</label>
          <input
            name="pageslug"
            defaultValue={stream?.pageslug || ""}
            placeholder="e.g. engineering-courses"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <ImageUpload 
              name="logoimage_file"
              label="Logo Image"
              initialImage={stream?.logoimage}
            />
            {stream?.logoimage && (
              <input type="hidden" name="logoimage_existing" value={stream.logoimage} />
            )}
          </div>
          <div className="space-y-1.5">
            <ImageUpload 
              name="bannerimage_file"
              label="Banner Image"
              initialImage={stream?.bannerimage}
            />
            {stream?.bannerimage && (
              <input type="hidden" name="bannerimage_existing" value={stream.bannerimage} />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Title (SEO)</label>
          <input
            name="pagetitle"
            defaultValue={stream?.pagetitle || ""}
            placeholder="SEO Meta Title"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Description (SEO)</label>
          <textarea
            name="pagedescription"
            defaultValue={stream?.pagedescription || ""}
            placeholder="SEO Meta Description"
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="isShowOnTop" 
                    defaultChecked={!!stream?.isShowOnTop} 
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Show on Top</span>
                    <span className="text-[10px] text-slate-400">Featured in navbar/top lists</span>
                </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="isShowOnHome" 
                    defaultChecked={!!stream?.isShowOnHome} 
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
            {isPending ? "Saving..." : stream ? "Update Stream" : "Create Stream"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




