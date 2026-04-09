"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface TypeOption {
  id: number;
  name: string;
}

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  bookmark?: any;
  users?: UserOption[];
  types?: TypeOption[];
}

export default function BookmarkFormModal({
  isOpen,
  onClose,
  onSubmit,
  bookmark,
  users,
  types,
}: BookmarkFormModalProps) {
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
      title={bookmark ? "Edit Bookmark" : "Add Bookmark"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {bookmark && <input type="hidden" name="id" value={bookmark.id} />}

        {/* Student Binding */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Linked Student Account</label>
          <select
            name="student_id"
            defaultValue={bookmark?.student_id || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Student</option>
            {users?.map((u, idx) => (
              <option key={`${u.id}-${u.email ?? "email"}-${idx}`} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
            {bookmark && users && !users.find((u) => u.id === bookmark.student_id) && (
              <option key={`current-${bookmark.student_id}`} value={bookmark.student_id}>
                {bookmark.student_name} ({bookmark.student_email})
              </option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Bookmark Type</label>
            <select
              name="bookmarktypeinfo_id"
              defaultValue={bookmark?.bookmarktypeinfo_id || ""}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none"
            >
              <option value="">Select Type</option>
            {types?.map((t, idx) => (
              <option key={`${t.id}-${t.name ?? "type"}-${idx}`} value={t.id}>
                {t.name}
              </option>
            ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
            <input
              name="title"
              defaultValue={bookmark?.title || ""}
              required
              placeholder="e.g. Indian Institute of Technology Bombay"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">URL / Link</label>
          <input
            type="url"
            name="url"
            defaultValue={bookmark?.url || ""}
            required
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Optional Context IDs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">College ID (opt)</label>
            <input
              type="number"
              name="college_id"
              defaultValue={bookmark?.college_id || "0"}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Course ID (opt)</label>
            <input
              type="number"
              name="course_id"
              defaultValue={bookmark?.course_id || "0"}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Blog ID (opt)</label>
            <input
              type="number"
              name="blog_id"
              defaultValue={bookmark?.blog_id || "0"}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
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
            {isPending ? "Saving..." : bookmark ? "Update Bookmark" : "Create Bookmark"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
