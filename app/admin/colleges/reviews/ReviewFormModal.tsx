"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface CollegeOption { id: string; name: string; }

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
      <form action={handleAction} className="px-1">
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "65vh" }}>
          {review && <input type="hidden" name="id" value={review.id} />}

          {/* College */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">College</label>
            <div className="relative group">
              <select
                name="collegeprofile_id"
                defaultValue={review?.collegeprofile_id || ""}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none cursor-pointer pr-10"
                style={{ color: "black" }}
              >
                <option value="" style={{ color: "black" }}>Select a College</option>
                {colleges && colleges.length > 0 ? (
                  colleges.map((c) => (
                    <option key={c.id} value={c.id} style={{ color: "black" }}>{c.name}</option>
                  ))
                ) : (
                  <option value="" disabled style={{ color: "black" }}>No colleges found in database</option>
                )}
                {review && colleges && !colleges.find(c => c.id === review.collegeprofile_id) && (
                  <option value={review.collegeprofile_id} style={{ color: "black" }}>{review.college_name}</option>
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
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
        </div>

        <div className="pt-4 flex gap-3 border-t border-slate-100 mt-4">
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




