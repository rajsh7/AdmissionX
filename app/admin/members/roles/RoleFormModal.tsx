"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  role?: any;
}

export default function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
}: RoleFormModalProps) {
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
      title={role ? "Edit Role" : "Add New Role"}
    >
      <form action={handleAction} className="space-y-4">
        {role && <input type="hidden" name="id" value={role.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Role Name</label>
          <input
            name="name"
            defaultValue={role?.name || ""}
            required
            placeholder="e.g. ROLE_EDITOR"
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
            {isPending ? "Saving..." : role ? "Update Role" : "Create Role"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




