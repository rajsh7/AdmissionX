"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Table {
  id: number;
  name: string;
}

interface PrivilegeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  privilege?: any;
  users: User[];
  tables: Table[];
}

export default function PrivilegeFormModal({
  isOpen,
  onClose,
  onSubmit,
  privilege,
  users,
  tables,
}: PrivilegeFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    // Convert checkbox values to 1 or 0
    const actions = ["create", "show", "edit", "update", "delete"];
    actions.forEach(a => {
      if (!formData.has(a)) {
        formData.append(a, "0");
      } else {
        formData.set(a, "1");
      }
    });

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
      title={privilege ? "Edit Privilege" : "Add Table Privilege"}
    >
      <form action={handleAction} className="space-y-4">
        {privilege && <input type="hidden" name="id" value={privilege.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Target User</label>
          <select
            name="users_id"
            defaultValue={privilege?.users_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstname} {u.lastname} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Target Table</label>
          <select
            name="alltableinformations_id"
            defaultValue={privilege?.allTableInformation_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
          >
            <option value="">Select Table</option>
            <option value="global">Global (Full Dashboard Access)</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase block">Permissions</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "create", label: "Create" },
              { id: "show", label: "View / Show" },
              { id: "edit", label: "Edit" },
              { id: "update", label: "Update" },
              { id: "delete", label: "Delete" },
            ].map((act) => (
              <label key={act.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  name={act.id}
                  defaultChecked={!!privilege?.[act.id]}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">{act.label}</span>
              </label>
            ))}
          </div>
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
            {isPending ? "Saving..." : privilege ? "Update Privilege" : "Create Privilege"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




