"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface StudentProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  profile?: any;
  users?: UserOption[];
}

export default function StudentProfileFormModal({
  isOpen,
  onClose,
  onSubmit,
  profile,
  users,
}: StudentProfileFormModalProps) {
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

  // Helper to format date for input type="date"
  const formattedDob = profile?.dateofbirth 
    ? new Date(profile.dateofbirth).toISOString().split('T')[0] 
    : "";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={profile ? "Edit Student Profile" : "Add Student Profile"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {profile && <input type="hidden" name="id" value={profile.id} />}
        
        {/* User Binding */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Linked User Account</label>
          <select
            name="users_id"
            defaultValue={profile?.users_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a User Account</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
            {/* If the current profile's user is not in the users list (e.g. if we only fetch ones without profiles), ensure they appear if editing */}
            {profile && users && !users.find(u => u.id === profile.users_id) && (
              <option value={profile.users_id}>{profile.student_name} ({profile.student_email})</option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
            <select
              name="gender"
              defaultValue={profile?.gender || "Male"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
            <input
              type="date"
              name="dateofbirth"
              defaultValue={formattedDob}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Parent's Name</label>
            <input
              name="parentsname"
              defaultValue={profile?.parentsname || ""}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Parent's Number</label>
            <input
              name="parentsnumber"
              defaultValue={profile?.parentsnumber || ""}
              placeholder="e.g. +91 9876543210"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Entrance Exam Name</label>
            <input
              name="entranceexamname"
              defaultValue={profile?.entranceexamname || ""}
              placeholder="e.g. JEE Main, NEET"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Entrance Exam Number</label>
            <input
              name="entranceexamnumber"
              defaultValue={profile?.entranceexamnumber || ""}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Hobbies</label>
          <input
            name="hobbies"
            defaultValue={profile?.hobbies || ""}
            placeholder="e.g. Reading, Coding"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Interests</label>
          <input
            name="interests"
            defaultValue={profile?.interests || ""}
            placeholder="e.g. Technology, Medicine"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Projects</label>
          <textarea
            name="projects"
            defaultValue={profile?.projects || ""}
            placeholder="Describe any projects or portfolio links..."
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
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
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




