"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Stream {
  id: number;
  name: string;
}

interface InterestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  interest?: any;
  streams: Stream[];
}

export default function InterestFormModal({
  isOpen,
  onClose,
  onSubmit,
  interest,
  streams,
}: InterestFormModalProps) {
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
      title={interest ? "Edit Career Interest" : "Add New Career Interest"}
    >
      <form action={handleAction} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        {interest && <input type="hidden" name="id" value={interest.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Interest Title</label>
          <input
            name="title"
            defaultValue={interest?.title || ""}
            required
            placeholder="e.g. Creative Writing, Problem Solving"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Functional Area (Stream)</label>
          <select
            name="functionalarea_id"
            defaultValue={interest?.functionalarea_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Functional Area</option>
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
            defaultValue={interest?.slug || ""}
            placeholder="e.g. creative-writing-interest"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
          <textarea
            name="description"
            defaultValue={interest?.description || ""}
            placeholder="What does this interest involve?"
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>

        <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={!!interest?.status} 
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Active Status</span>
                    <span className="text-[10px] text-slate-400">Make this interest visible for matching</span>
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
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : interest ? "Update Interest" : "Create Interest"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
