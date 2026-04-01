"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface CollegeOption { id: number; name: string; }

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  review?: any;
  colleges?: CollegeOption[];
}

function RatingInput({ label, name, defaultValue }: { label: string; name: string; defaultValue?: number }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase">{label} (0–10)</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? 0}
        min="0"
        max="10"
        step="0.1"
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

export default function ReviewFormModal({ isOpen, onClose, onSubmit, review, colleges }: ReviewFormModalProps) {
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
    <AdminModal isOpen={isOpen} onClose={onClose} title={review ? "Edit Review" : "Add Review"}>
      <form action={handleAction} className="space-y-4 px-1">
        {review && <input type="hidden" name="id" value={review.id} />}

        {/* College */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">College</label>
          <select
            name="collegeprofile_id"
            defaultValue={review?.collegeprofile_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a College</option>
            {colleges?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {review && colleges && !colleges.find(c => c.id === parseInt(review.collegeprofile_id)) && (
              <option value={review.collegeprofile_id}>{review.college_name}</option>
            )}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Review Title</label>
          <input
            name="title"
            defaultValue={review?.title || ""}
            required
            placeholder="e.g. Great academic environment"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
          <textarea
            name="description"
            defaultValue={review?.description || ""}
            placeholder="Detailed review..."
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
        </div>

        {/* Ratings grid */}
        <div className="grid grid-cols-2 gap-4">
          <RatingInput label="Academic" name="academic" defaultValue={review?.academic} />
          <RatingInput label="Infrastructure" name="infrastructure" defaultValue={review?.infrastructure} />
          <RatingInput label="Faculty" name="faculty" defaultValue={review?.faculty} />
          <RatingInput label="Accommodation" name="accommodation" defaultValue={review?.accommodation} />
          <RatingInput label="Placement" name="placement" defaultValue={review?.placement} />
          <RatingInput label="Social" name="social" defaultValue={review?.social} />
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : review ? "Update Review" : "Add Review"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




