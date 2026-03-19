"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface FAQFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  faq?: any;
  colleges?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function FAQFormModal({
  isOpen,
  onClose,
  onSubmit,
  faq,
  colleges = [],
}: FAQFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("FAQ form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={faq ? "Edit FAQ" : "Add FAQ"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {faq && <input type="hidden" name="id" value={faq.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={faq?.collegeprofile_id || ""}
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

        {/* Question */}
        <div>
          <label className={LABEL}>Question *</label>
          <input
            name="question"
            defaultValue={faq?.question || ""}
            placeholder="e.g. What is the intake for CSE?"
            required
            className={INPUT}
          />
        </div>

        {/* Answer */}
        <div>
          <label className={LABEL}>Answer</label>
          <textarea
            name="answer"
            defaultValue={faq?.answer || ""}
            placeholder="Provide a detailed answer..."
            className={INPUT + " min-h-[150px] py-3 resize-none"}
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
            {isPending ? "Saving…" : faq ? "Update FAQ" : "Add FAQ"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
