"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  course?: any;
}

export default function CourseFormModal({ isOpen, onClose, onSubmit, course }: CourseFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const imgUrl = (raw: string | null) => {
    if (!raw) return null;
    if (raw.startsWith("http") || raw.startsWith("/")) return raw;
    return `/uploads/${raw}`;
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={course ? "Edit Course" : "Add Course"}>
      <form action={handleAction} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {course && <input type="hidden" name="id" value={course.id} />}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Course Name</label>
          <input
            name="name"
            defaultValue={course?.name || ""}
            required
            placeholder="e.g. B.Tech Computer Science"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Page Slug</label>
          <input
            name="pageslug"
            defaultValue={course?.pageslug || ""}
            placeholder="e.g. btech-computer-science"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
        </div>

        <ImageUpload
          name="image_file"
          label="Course Image"
          initialImage={imgUrl(course?.image)}
          existingName="image_existing"
        />

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" name="isShowOnTop" defaultChecked={!!course?.isShowOnTop}
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Show on Top</span>
              <span className="text-[10px] text-slate-400">Featured in top lists</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" name="isShowOnHome" defaultChecked={!!course?.isShowOnHome}
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Show on Home</span>
              <span className="text-[10px] text-slate-400">Featured on homepage</span>
            </div>
          </label>
        </div>

        <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : course ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
