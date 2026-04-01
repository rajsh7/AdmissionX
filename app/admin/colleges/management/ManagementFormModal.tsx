"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface ManagementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  member?: any;
  colleges?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function ManagementFormModal({
  isOpen,
  onClose,
  onSubmit,
  member,
  colleges = [],
}: ManagementFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Management form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? "Edit Management Member" : "Add Management Member"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {member && <input type="hidden" name="id" value={member.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={member?.collegeprofile_id || ""}
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

        {/* Name & Suffix */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={LABEL}>Full Name *</label>
            <input
              name="name"
              defaultValue={member?.name || ""}
              placeholder="e.g. Dr. Satish Kumar"
              required
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Suffix</label>
            <input
              name="suffix"
              defaultValue={member?.suffix || ""}
              placeholder="e.g. PhD, MBA"
              className={INPUT}
            />
          </div>
        </div>

        {/* Designation */}
        <div>
          <label className={LABEL}>Designation *</label>
          <input
            name="designation"
            defaultValue={member?.designation || ""}
            placeholder="e.g. Director / Dean"
            required
            className={INPUT}
          />
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Email Address</label>
            <input
              type="email"
              name="emailaddress"
              defaultValue={member?.emailaddress || ""}
              placeholder="director@college.edu"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Phone Number</label>
            <input
              type="tel"
              name="phoneno"
              defaultValue={member?.phoneno || ""}
              placeholder="+91 98765 43210"
              className={INPUT}
            />
          </div>
        </div>

        {/* Picture */}
        <div>
          <label className={LABEL}>Picture URL / Filename</label>
          <input
            name="picture"
            defaultValue={member?.picture || ""}
            placeholder="e.g. satish-kumar.jpg"
            className={INPUT}
          />
          <p className="text-[10px] text-slate-400 mt-1.5 ml-0.5 italic">Images should be uploaded to the server's upload directory.</p>
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
            {isPending ? "Saving…" : member ? "Update Member" : "Add Member"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




