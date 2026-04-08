"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: string; name: string; }

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  event?: any;
  colleges?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  event,
  colleges = [],
}: EventFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Event form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  // Convert MySQL DATETIME to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? "Edit College Event" : "Add College Event"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {event && <input type="hidden" name="id" value={event.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={event?.collegeprofile_id || ""}
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

        {/* Name */}
        <div>
          <label className={LABEL}>Event Name *</label>
          <input
            name="name"
            defaultValue={event?.name || ""}
            placeholder="e.g. Annual Tech Nest 2024"
            required
            className={INPUT}
          />
        </div>

        {/* Date & Venue */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Date & Time</label>
            <input
              type="datetime-local"
              name="datetime"
              defaultValue={formatForInput(event?.datetime)}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Venue</label>
            <input
              name="venue"
              defaultValue={event?.venue || ""}
              placeholder="e.g. Main Auditorium"
              className={INPUT}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>Description</label>
          <textarea
            name="description"
            defaultValue={event?.description || ""}
            placeholder="About the event..."
            className={INPUT + " min-h-[100px] py-3 resize-none"}
          />
        </div>

        {/* Link */}
        <div>
          <label className={LABEL}>Registration Link</label>
          <input
            name="link"
            defaultValue={event?.link || ""}
            placeholder="https://example.com/register"
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
            {isPending ? "Saving…" : event ? "Update Event" : "Add Event"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




