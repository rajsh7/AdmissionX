"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface PlacementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  placement?: any;
  colleges?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function PlacementFormModal({
  isOpen,
  onClose,
  onSubmit,
  placement,
  colleges = [],
}: PlacementFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Placement form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={placement ? "Edit Placement Record" : "Add Placement Record"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {placement && <input type="hidden" name="id" value={placement.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={placement?.collegeprofile_id || ""}
              required
              className={SELECT}
            >
              <option value="">Select a college…</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* CTC Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Highest CTC</label>
            <input
              name="ctchighest"
              defaultValue={placement?.highest_ctc || ""}
              placeholder="e.g. 4500000"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Lowest CTC</label>
            <input
              name="ctclowest"
              defaultValue={placement?.lowest_ctc || ""}
              placeholder="e.g. 400000"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Average CTC</label>
            <input
              name="ctcaverage"
              defaultValue={placement?.average_ctc || ""}
              placeholder="e.g. 1200000"
              className={INPUT}
            />
          </div>
        </div>

        {/* Recruiting Companies */}
        <div>
          <label className={LABEL}>Number of Recruiting Companies</label>
          <input
            type="number"
            name="numberofrecruitingcompany"
            defaultValue={placement?.recruiting_companies || ""}
            placeholder="e.g. 150"
            min={0}
            className={INPUT}
          />
        </div>

        {/* Additional Info */}
        <div>
          <label className={LABEL}>Placement Info</label>
          <textarea
            name="placementinfo"
            defaultValue={placement?.placement_info || ""}
            placeholder="Enter additional placement details, trends, etc."
            className={INPUT + " min-h-[100px] py-3 resize-none"}
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
            {isPending ? "Saving…" : placement ? "Update Record" : "Add Record"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
