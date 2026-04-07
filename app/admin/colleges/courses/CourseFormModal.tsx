"use client";

import AdminModal from "@/app/admin/_components/AdminModal";
import { useState } from "react";

interface Option {
  id: number;
  name: string;
}

interface CourseFormValue {
  id?: number;
  course_name?: string | null;
  functionalarea_id?: number | null;
  collegeprofile_id?: number | null;
  degree_id?: number | null;
  course_id?: number | null;
  fees?: string | null;
  seats?: string | number | null;
  description?: string | null;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  course?: CourseFormValue;
  colleges?: Option[];
  courseOptions?: Option[];
  degrees?: Option[];
  streams?: Option[];
  optionsLoading?: boolean;
  optionsError?: string | null;
  onRetryOptions?: () => void;
}

const OUTLINED_WRAPPER = "relative mb-6 w-full";
const OUTLINED_LABEL =
  "absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-semibold text-slate-500 z-10 block pointer-events-none";
const OUTLINED_INPUT =
  "w-full border border-slate-200 rounded-sm px-3 py-3 text-[14px] text-slate-600 bg-white focus:outline-none focus:border-red-500 transition-colors shadow-sm placeholder:text-slate-300";
const OUTLINED_SELECT = `${OUTLINED_INPUT} appearance-none cursor-pointer`;

export default function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  colleges = [],
  courseOptions = [],
  degrees = [],
  streams = [],
  optionsLoading = false,
  optionsError = null,
  onRetryOptions,
}: CourseFormModalProps) {
  const [isPending, setIsPending] = useState(false);
  const selectsDisabled = isPending || optionsLoading;

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
      title={course ? "Update college course details" : "Add college course"}
    >
      <form action={handleAction} className="pt-2 pb-6 px-1">
        {course && <input type="hidden" name="id" value={course.id} />}

        {optionsLoading && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Loading course options...
          </div>
        )}

        {optionsError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div>{optionsError}</div>
            {onRetryOptions && (
              <button
                type="button"
                onClick={onRetryOptions}
                className="mt-2 text-sm font-semibold text-rose-700 underline underline-offset-2"
              >
                Retry loading options
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className={OUTLINED_WRAPPER}>
            <label className={OUTLINED_LABEL}>Stream</label>
            <div className="relative">
              <select
                name="functionalarea_id"
                defaultValue={course?.functionalarea_id || ""}
                className={OUTLINED_SELECT}
                disabled={selectsDisabled}
              >
                <option value="">Select stream</option>
                {streams.map((stream, idx) => (
                  <option key={`stream-${stream.id}-${idx}`} value={stream.id}>
                    {stream.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course Eligibility</label>
          <div className="relative">
            <select name="course_eligibility" className={OUTLINED_SELECT}>
              <option value="">Select Status</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Other Course Eligibility</label>
          <div className="relative">
            <select name="other_course_eligibility" className={OUTLINED_SELECT}>
              <option value="">Select Status</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Total fees ( per year in inr )</label>
          <input
            name="fees"
            defaultValue={course?.fees || ""}
            placeholder="Select Status"
            className={OUTLINED_INPUT}
          />
        </div>

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

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>College Profile</label>
          <div className="relative">
            <select
              name="collegeprofile_id"
              defaultValue={course?.collegeprofile_id || ""}
              required
              className={OUTLINED_SELECT}
              disabled={selectsDisabled}
            >
              <option value="">Select Status</option>
              {colleges.map((college, idx) => (
                <option key={`college-${college.id}-${idx}`} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Stream</label>
          <div className="relative">
            <select
              name="functionalarea_id_duplicate"
              defaultValue={course?.functionalarea_id || ""}
              className={OUTLINED_SELECT}
              disabled={selectsDisabled}
            >
              <option value="">Select stream</option>
              {streams.map((stream, idx) => (
                <option key={`stream-dup-${stream.id}-${idx}`} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Degree</label>
          <div className="relative">
            <select
              name="degree_id"
              defaultValue={course?.degree_id || ""}
              className={OUTLINED_SELECT}
              disabled={selectsDisabled}
            >
              <option value="">Select degree</option>
              {degrees.map((degree, idx) => (
                <option key={`degree-${degree.id}-${idx}`} value={degree.id}>
                  {degree.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course</label>
          <div className="relative">
            <select
              name="course_id"
              defaultValue={course?.course_id || ""}
              required
              className={OUTLINED_SELECT}
              disabled={selectsDisabled}
            >
              <option value="">Select Course</option>
              {courseOptions.map((courseOption, idx) => (
                <option key={`course-opt-${courseOption.id}-${idx}`} value={courseOption.id}>
                  {courseOption.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Degree Level</label>
          <div className="relative">
            <select name="degree_level" className={OUTLINED_SELECT}>
              <option value="">Select Course</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Course Type</label>
          <div className="relative">
            <select name="course_type" className={OUTLINED_SELECT}>
              <option value="">Select Course</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className={OUTLINED_WRAPPER}>
          <label className={OUTLINED_LABEL}>Description</label>
          <textarea
            name="description"
            rows={6}
            placeholder="Select Course"
            className={`${OUTLINED_INPUT} resize-none`}
            defaultValue={course?.description || ""}
          />
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={isPending || optionsLoading || !!optionsError}
            className="px-10 py-2.5 bg-[#a3a8b6] text-white text-[14px] font-bold rounded-sm shadow-md hover:bg-[#8e94a5] transition-all disabled:opacity-50 uppercase tracking-wide"
          >
            {isPending ? "Saving..." : course ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
