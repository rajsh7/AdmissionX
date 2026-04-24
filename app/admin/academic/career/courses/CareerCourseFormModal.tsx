"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface CareerStream {
  id: number;
  title: string;
}

interface CareerCourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  careerCourse?: any;
  careerStreams: CareerStream[];
}

export default function CareerCourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  careerCourse,
  careerStreams,
}: CareerCourseFormModalProps) {
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
      title={careerCourse ? "Edit Career Course" : "Add New Career Course"}
    >
      <form action={handleAction} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        {careerCourse && <input type="hidden" name="id" value={careerCourse.id} />}
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Course Name</label>
          <input
            name="courseName"
            defaultValue={careerCourse?.courseName || ""}
            required
            placeholder="e.g. Master of Business Administration"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Career Category (Stream)</label>
          <select
            name="coursesDetailsId"
            defaultValue={careerCourse?.coursesDetailsId || ""}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-sm appearance-none"
          >
            <option value="">Select a Career Stream</option>
            {careerStreams.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Avg. Salary</label>
            <input
              name="avgSalery" // Typo in DB
              defaultValue={careerCourse?.avgSalery || ""}
              placeholder="e.g. 5-10 LPA"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Top Companies</label>
            <input
              name="topCompany"
              defaultValue={careerCourse?.topCompany || ""}
              placeholder="e.g. Google, Amazon, TCS"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Job Profiles</label>
          <textarea
            name="jobProfiles"
            defaultValue={careerCourse?.jobProfiles || ""}
            placeholder="e.g. Software Developer, Data Analyst..."
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
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
            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : careerCourse ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




