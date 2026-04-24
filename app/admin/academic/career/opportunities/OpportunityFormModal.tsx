"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface CareerStream {
  id: number;
  title: string;
}

interface OpportunityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  opportunity?: any;
  careerStreams: CareerStream[];
}

export default function OpportunityFormModal({
  isOpen,
  onClose,
  onSubmit,
  opportunity,
  careerStreams,
}: OpportunityFormModalProps) {
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
      title={opportunity ? "Edit Opportunity" : "Add New Opportunity"}
    >
      <form action={handleAction} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        {opportunity && <input type="hidden" name="id" value={opportunity.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Job Role / Title</label>
          <input
            name="title"
            defaultValue={opportunity?.title || ""}
            required
            placeholder="e.g. Senior Software Architect"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Career Stream</label>
          <select
            name="careerDetailsId"
            defaultValue={opportunity?.careerDetailsId || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Career Stream</option>
            {careerStreams.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Avg. Salary</label>
          <input
            name="avgSalery" // Typo in DB
            defaultValue={opportunity?.avgSalery || ""}
            placeholder="e.g. 15-25 LPA"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Top Companies</label>
          <textarea
            name="topCompany"
            defaultValue={opportunity?.topCompany || ""}
            placeholder="e.g. Microsoft, Google, Meta, Netflix..."
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
          />
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
            {isPending ? "Saving..." : opportunity ? "Update Opportunity" : "Create Opportunity"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




