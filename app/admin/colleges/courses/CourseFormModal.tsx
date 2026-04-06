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

const OUTLINED_WRAPPER = "relative mb-6 w-full";
const OUTLINED_LABEL = "absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500 z-10 block pointer-events-none";
const OUTLINED_INPUT = "w-full border border-slate-200 rounded-sm px-3 py-3 text-[14px] text-slate-600 bg-white focus:outline-none focus:border-red-500 transition-colors shadow-sm placeholder:text-slate-300";
const OUTLINED_SELECT = OUTLINED_INPUT + " appearance-none cursor-pointer";

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
      title="Update college course details"
    >
      <form action={handleAction} className="pt-2 pb-6 px-1">
        {course && <input type="hidden" name="id" value={course.id} />}

        {/* Row 1: Stream + Title */}
        <div className="grid grid-cols-2 gap-4">
          <div className={OUTLINED_WRAPPER}>
            <label className={OUTLINED_LABEL}>Stream</label>
            <div className="relative">
              <select
                name="functionalarea_id"
                defaultValue={course?.functionalarea_id || ""}
                className={OUTLINED_SELECT}
              >
                <option value="">Select stream</option>
                {streams.map((s, idx) => (
                  <option key={`stream-${s.id}-${idx}`} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          <div className={OUTLINED_WRAPPER}>
            <label className={OUTLINED_LABEL}>Title</label>
            <input
              name="course_title_custom"
              placeholder="Enter title"
              className={OUTLINED_INPUT}
              defaultValue={course?.course_name || ""}
            />
          </div>
        </div>

        {/* Course Eligibility */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course Eligibility</label>
          <div className="relative">
            <select name="course_eligibility" className={OUTLINED_SELECT}>
              <option value="">Select Status</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Other Course Eligibility */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Other Course Eligibility</label>
          <div className="relative">
            <select name="other_course_eligibility" className={OUTLINED_SELECT}>
              <option value="">Select Status</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Total Fees */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Total fees ( per year in inr )</label>
          <input
            name="fees"
            defaultValue={course?.fees || ""}
            placeholder="Select Status"
            className={OUTLINED_INPUT}
          />
        </div>

        {/* Seats */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Seats Allocated To Admission X</label>
          <input
            type="number"
            name="seats"
            defaultValue={course?.seats || ""}
            placeholder="Select Status"
            className={OUTLINED_INPUT}
          />
        </div>

        {/* College Profile */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>College Profile</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={course?.collegeprofile_id || ""}
              required
              className={OUTLINED_SELECT}
            >
              <option value="">Select Status</option>
              {colleges.map((c, idx) => (
                <option key={`college-${c.id}-${idx}`} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Stream (Middle) */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Stream</label>
          <div className="relative">
            <select
              name="functionalarea_id_duplicate"
              defaultValue={course?.functionalarea_id || ""}
              className={OUTLINED_SELECT}
            >
              <option value="">Select stream</option>
              {streams.map((s, idx) => (
                <option key={`stream-dup-${s.id}-${idx}`} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Degree */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Degree</label>
          <div className="relative">
            <select
              name="degree_id"
              defaultValue={course?.degree_id || ""}
              className={OUTLINED_SELECT}
            >
              <option value="">Select degree</option>
              {degrees.map((d, idx) => (
                <option key={`degree-${d.id}-${idx}`} value={d.id}>{d.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Course */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course</label>
          <div className="relative">
            <select
              name="course_id"
              defaultValue={course?.course_id || ""}
              required
              className={OUTLINED_SELECT}
            >
              <option value="">Select Course</option>
              {courseOptions.map((c, idx) => (
                <option key={`course-opt-${c.id}-${idx}`} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Degree Level */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Degree Level</label>
          <div className="relative">
            <select name="degree_level" className={OUTLINED_SELECT}>
              <option value="">Select Course</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Course Type */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course Type</label>
          <div className="relative">
            <select name="course_type" className={OUTLINED_SELECT}>
              <option value="">Select Course</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Description</label>
          <textarea
            name="description"
            rows={6}
            placeholder="Select Course"
            className={OUTLINED_INPUT + " resize-none"}
            defaultValue={course?.description || ""}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-10 py-2.5 bg-[#a3a8b6] text-white text-[14px] font-bold rounded-sm shadow-md hover:bg-[#8e94a5] transition-all disabled:opacity-50 uppercase tracking-wide"
          >
            {isPending ? "Updating…" : "Update"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}




