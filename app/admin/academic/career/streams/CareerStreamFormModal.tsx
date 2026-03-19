"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Stream {
  id: number;
  name: string;
}

interface CareerStreamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  careerStream?: any;
  streams: Stream[];
}

export default function CareerStreamFormModal({
  isOpen,
  onClose,
  onSubmit,
  careerStream,
  streams,
}: CareerStreamFormModalProps) {
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
      title={careerStream ? "Edit Career Stream" : "Add New Career Stream"}
    >
      <form action={handleAction} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        {careerStream && <input type="hidden" name="id" value={careerStream.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Career Stream Title</label>
          <input
            name="title"
            defaultValue={careerStream?.title || ""}
            required
            placeholder="e.g. Software Engineering, Digital Marketing"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Functional Area (Stream)</label>
          <select
            name="functionalarea_id"
            defaultValue={careerStream?.functionalarea_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
          >
            <option value="">Select an Academic Stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Slug</label>
          <input
            name="slug"
            defaultValue={careerStream?.slug || ""}
            placeholder="e.g. software-engineering-careers"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
          <textarea
            name="descrition" // Typo in DB schema
            defaultValue={careerStream?.descrition || ""}
            placeholder="Detailed career information..."
            rows={5}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
        </div>

        <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={!!careerStream?.status} 
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Published Status</span>
                    <span className="text-[10px] text-slate-400">Make this career stream visible</span>
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
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : careerStream ? "Update Career" : "Create Career"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
