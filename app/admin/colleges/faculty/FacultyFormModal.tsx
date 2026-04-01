"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface CollegeOption { id: number; name: string; }

interface FacultyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  faculty?: any;
  colleges?: CollegeOption[];
}

export default function FacultyFormModal({ isOpen, onClose, onSubmit, faculty, colleges }: FacultyFormModalProps) {
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
    <AdminModal isOpen={isOpen} onClose={onClose} title={faculty ? "Edit Faculty Member" : "Add Faculty Member"}>
      <form action={handleAction} className="space-y-4 px-1">
        {faculty && <input type="hidden" name="id" value={faculty.id} />}

        {/* College */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">College</label>
          <select
            name="collegeprofile_id"
            defaultValue={faculty?.collegeprofile_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a College</option>
            {colleges?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {faculty && colleges && !colleges.find(c => c.id === parseInt(faculty.collegeprofile_id)) && (
              <option value={faculty.collegeprofile_id}>{faculty.college_name}</option>
            )}
          </select>
        </div>

        {/* Name & Suffix */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Suffix</label>
            <input
              name="suffix"
              defaultValue={faculty?.suffix || ""}
              placeholder="Dr., Mr., Ms."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input
              name="name"
              defaultValue={faculty?.name || ""}
              required
              placeholder="e.g. John Smith"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
            <select
              name="gender"
              defaultValue={faculty?.gender ?? ""}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
            >
              <option value="">Select</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
              <option value="3">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
            <input
              type="date"
              name="dob"
              defaultValue={faculty?.dob ? new Date(faculty.dob).toISOString().split("T")[0] : ""}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={faculty?.email || ""}
              placeholder="faculty@college.edu"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
            <input
              name="phone"
              defaultValue={faculty?.phone || ""}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Languages & Sort Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Languages Known</label>
            <input
              name="languageKnown"
              defaultValue={faculty?.languageKnown || ""}
              placeholder="English, Hindi"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Sort Order</label>
            <input
              type="number"
              name="sortorder"
              defaultValue={faculty?.sortorder || "0"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Description / Bio</label>
          <textarea
            name="description"
            defaultValue={faculty?.description || ""}
            placeholder="Brief bio or academic background..."
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : faculty ? "Update Faculty" : "Add Faculty"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




