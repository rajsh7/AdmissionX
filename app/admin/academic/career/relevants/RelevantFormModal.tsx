"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Stream {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  title: string;
}

interface RelevantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  relevant?: any;
  streams: Stream[];
  interests: Interest[];
}

export default function RelevantFormModal({
  isOpen,
  onClose,
  onSubmit,
  relevant,
  streams,
  interests,
}: RelevantFormModalProps) {
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
      title={relevant ? "Edit Career Post" : "Add New Career Post"}
    >
      <form action={handleAction} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        {relevant && <input type="hidden" name="id" value={relevant.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Post Title</label>
          <input
            name="title"
            defaultValue={relevant?.title || ""}
            required
            placeholder="e.g. Senior Data Scientist"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Stream/Category</label>
            <input
              name="stream"
              defaultValue={relevant?.stream || ""}
              placeholder="e.g. Science, Engineering"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Avg. Salary</label>
            <input
              name="salery" // Typo in DB
              defaultValue={relevant?.salery || ""}
              placeholder="e.g. 10 LPA"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Difficulty</label>
            <select
              name="academicDifficulty"
              defaultValue={relevant?.academicDifficulty || "Easy"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Slug</label>
            <input
              name="slug"
              defaultValue={relevant?.slug || ""}
              placeholder="e.g. senior-data-scientist"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Career Interest</label>
          <select
            name="careerInterest"
            defaultValue={relevant?.careerInterest || ""}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none"
          >
            <option value="">Select an Interest</option>
            {interests.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Functional Area</label>
          <select
            name="functionalarea_id"
            defaultValue={relevant?.functionalarea_id || ""}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Functional Area</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={!!relevant?.status} 
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Active Status</span>
                    <span className="text-[10px] text-slate-400">Make this career post visible</span>
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
            className="flex-1 px-4 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : relevant ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




