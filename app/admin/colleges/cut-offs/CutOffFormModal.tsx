"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface CutOffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  cutoff?: any;
  colleges?: Option[];
  courses?: Option[];
  degrees?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function CutOffFormModal({
  isOpen,
  onClose,
  onSubmit,
  cutoff,
  colleges = [],
  courses = [],
  degrees = [],
}: CutOffFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Cut-off form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={cutoff ? "Edit Cut-off Record" : "Add Cut-off Record"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {cutoff && <input type="hidden" name="id" value={cutoff.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={cutoff?.collegeprofile_id || ""}
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

        {/* Course + Degree */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Course</label>
            <div className="relative">
              <select
                name="course_id"
                defaultValue={cutoff?.course_id || ""}
                className={SELECT}
              >
                <option value="">All/General</option>
                {courses.map((c) => (
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
          <div>
            <label className={LABEL}>Degree</label>
            <div className="relative">
              <select
                name="degree_id"
                defaultValue={cutoff?.degree_id || ""}
                className={SELECT}
              >
                <option value="">Any</option>
                {degrees.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={LABEL}>Trend Title *</label>
          <input
            name="title"
            defaultValue={cutoff?.title || ""}
            placeholder="e.g. JEE Main 2023 Cut-off (Round 1)"
            required
            className={INPUT}
          />
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>Description</label>
          <textarea
            name="description"
            defaultValue={cutoff?.description || ""}
            placeholder="Detailed cut-off marks, ranks, categories..."
            className={INPUT + " min-h-[120px] py-3 resize-none"}
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
            {isPending ? "Saving…" : cutoff ? "Update Record" : "Add Record"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
