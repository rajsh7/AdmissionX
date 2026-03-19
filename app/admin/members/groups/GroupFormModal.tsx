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

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  group?: any;
  users: User[];
  tables: Table[];
}

export default function GroupFormModal({
  isOpen,
  onClose,
  onSubmit,
  group,
  users,
  tables,
}: GroupFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    // Convert checkbox values to 1 or 0
    const actions = ["create_action", "show_action", "edit_action", "update_action", "delete_action"];
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
      title={group ? "Edit Group Access" : "Add Group Access"}
    >
      <form action={handleAction} className="space-y-4">
        {group && <input type="hidden" name="id" value={group.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Group Name</label>
          <input
            name="name"
            defaultValue={group?.name || ""}
            required
            placeholder="e.g. Content Managers"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Assigned User</label>
          <select
            name="users_id"
            defaultValue={group?.users_id || ""}
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
          <label className="text-xs font-bold text-slate-500 uppercase">Resource Scope</label>
          <select
            name="alltableinformations_id"
            defaultValue={group?.allTableInformation_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
          >
            <option value="">Select Scope (Table)</option>
            <option value="global">Global (All Tables)</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase block">Default Actions</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "create_action", label: "Create" },
              { id: "show_action", label: "View / Show" },
              { id: "edit_action", label: "Edit" },
              { id: "update_action", label: "Update" },
              { id: "delete_action", label: "Delete" },
            ].map((act) => (
              <label key={act.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  name={act.id}
                  defaultChecked={!!group?.[act.id]}
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
            {isPending ? "Saving..." : group ? "Update Group" : "Create Group"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
