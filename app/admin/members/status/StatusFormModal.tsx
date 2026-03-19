"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface StatusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  status?: any;
}

export default function StatusFormModal({
  isOpen,
  onClose,
  onSubmit,
  status,
}: StatusFormModalProps) {
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
      title={status ? "Edit Status" : "Add New Status"}
    >
      <form action={handleAction} className="space-y-4">
        {status && <input type="hidden" name="id" value={status.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Status Label</label>
          <input
            name="name"
            defaultValue={status?.name || ""}
            required
            placeholder="e.g. Active, Suspended, Pending"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="pt-4 flex gap-3">
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
            {isPending ? "Saving..." : status ? "Update Status" : "Create Status"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
