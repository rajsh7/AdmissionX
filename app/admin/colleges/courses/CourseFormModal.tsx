"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option { id: number; name: string; }

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  course?: any;
  colleges?: Option[];
  courseOptions?: Option[];
  degrees?: Option[];
  streams?: Option[];
}

const INPUT =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700";
const SELECT = INPUT + " appearance-none";
const LABEL = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-0.5 block mb-1.5";

export default function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  colleges = [],
  courseOptions = [],
  degrees = [],
  streams = [],
}: CourseFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Course form submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Edit College Course" : "Add College Course"}
    >
      <form action={handleAction} className="space-y-4 px-1">
        {course && <input type="hidden" name="id" value={course.id} />}

        {/* College */}
        <div>
          <label className={LABEL}>College *</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={course?.collegeprofile_id || ""}
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

        {/* Course */}
        <div>
          <label className={LABEL}>Course *</label>
          <div className="relative">
            <select
              name="course_id"
              defaultValue={course?.course_id || ""}
              required
              className={SELECT}
            >
              <option value="">Select a course…</option>
              {courseOptions.map((c) => (
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

        {/* Degree + Stream */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Degree</label>
            <div className="relative">
              <select
                name="degree_id"
                defaultValue={course?.degree_id || ""}
                className={SELECT}
              >
                <option value="">None</option>
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
          <div>
            <label className={LABEL}>Stream</label>
            <div className="relative">
              <select
                name="functionalarea_id"
                defaultValue={course?.functionalarea_id || ""}
                className={SELECT}
              >
                <option value="">None</option>
                {streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Fees + Seats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Fees (₹)</label>
            <input
              name="fees"
              defaultValue={course?.fees || ""}
              placeholder="e.g. 120000"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Seats</label>
            <input
              type="number"
              name="seats"
              defaultValue={course?.seats || ""}
              placeholder="e.g. 60"
              min={0}
              className={INPUT}
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={LABEL}>Duration</label>
          <input
            name="courseduration"
            defaultValue={course?.courseduration || ""}
            placeholder="e.g. 4 Years, 2 Semesters"
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
            {isPending ? "Saving…" : course ? "Update Course" : "Add Course"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
