"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface BoardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  board?: any;
}

export default function BoardFormModal({
  isOpen,
  onClose,
  onSubmit,
  board,
}: BoardFormModalProps) {
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
      title={board ? "Edit Board" : "Add New Board"}
    >
      <form action={handleAction} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {board && <input type="hidden" name="id" value={board.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Board Name</label>
          <input
            name="name"
            defaultValue={board?.name || ""}
            required
            placeholder="e.g. CBSE, ICSE, WBCHSE"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Board Title</label>
          <input
            name="title"
            defaultValue={board?.title || ""}
            placeholder="Full board title/description"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Slug</label>
          <input
            name="slug"
            defaultValue={board?.slug || ""}
            placeholder="e.g. cbse-board"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Misc Info</label>
          <input
            name="misc"
            defaultValue={board?.misc || ""}
            placeholder="Any additional details"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input 
                    type="checkbox" 
                    name="status" 
                    defaultChecked={!!board?.status} 
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Set as Live</span>
                    <span className="text-[10px] text-slate-400">Mark board as active and visible</span>
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
            {isPending ? "Saving..." : board ? "Update Board" : "Create Board"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
