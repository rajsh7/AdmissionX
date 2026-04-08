"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface SportsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  activity?: any;
  colleges?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

const ACTIVITY_TYPES = ["Sports", "Cultural", "Association"] as const;

export default function SportsFormModal({
  isOpen,
  onClose,
  onSubmit,
  activity,
  colleges = [],
}: SportsFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Sports form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? "Edit Sports & Cultural Activity" : "Add Sports & Cultural Activity"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {activity && <input type="hidden" name="id" value={activity.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={activity?.collegeprofile_id || ""}
              required
              className={SELECT}
            >
              <option value="">Select a college…</option>
              {colleges.map((c, idx) => (
                <option key={`college-${c.id}-${idx}`} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className={LABEL}>Activity Type *</label>
          <div className="relative">
            <select
              name="typeOfActivity"
              defaultValue={activity?.typeOfActivity || "1"}
              required
              className={SELECT}
            >
              <option value="1">Sports</option>
              <option value="2">Cultural</option>
              <option value="3">Association</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={LABEL}>Activity Name *</label>
          <input
            name="name"
            defaultValue={activity?.name || ""}
            placeholder="e.g. Cricket, Robotics Club, Dramatics"
            required
            className={INPUT}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-1">
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
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : activity ? "Update Activity" : "Add Activity"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




