"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CourseFormModal from "./CourseFormModal";

import PaginationFixed from "@/app/components/PaginationFixed";

interface Option {
  id: number;
  name: string;
}

interface CourseRow {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
}

interface CourseListClientProps {
  courses: CourseRow[];
  total: number;
  pageSize: number;
  offset: number;
  page?: number;
  totalPages?: number;
  searchQuery?: string;
  selectedCollegeId?: string;
  selectedCourseId?: string;
  selectedDegreeId?: string;
  selectedStreamId?: string;
  selectedFees?: string;
  selectedSeats?: string;
  selectedDuration?: string;
  collegeOptions?: Option[];
  courseOptions?: Option[];
  degreeOptions?: Option[];
  streamOptions?: Option[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function CourseListClient({
  courses, total, pageSize, offset, page = 1, totalPages = 1,
  searchQuery = "", selectedCollegeId = "", selectedCourseId = "",
  selectedDegreeId = "", selectedStreamId = "", selectedFees = "",
  selectedSeats = "", selectedDuration = "",
  collegeOptions = [], courseOptions = [], degreeOptions = [], streamOptions = [],
  onAdd, onDelete,
}: CourseListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const listKey = courses[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(listKey);
  if (listKey !== lastKey) { setLastKey(listKey); setVisibleCount(15); }

  const showMore = visibleCount < courses.length;
  const showPagination = !showMore && totalPages > 1;
  const [options, setOptions] = useState<{
    colleges: Option[];
    courseOptions: Option[];
    degrees: Option[];
    streams: Option[];
  }>({
    colleges: [],
    courseOptions: [],
    degrees: [],
    streams: [],
  });
  const [optionsState, setOptionsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [optionsError, setOptionsError] = useState<string | null>(null);

  async function loadOptions(force = false) {
    if (optionsState === "loading") return;
    if (!force && optionsState === "ready") return;

    setOptionsState("loading");
    setOptionsError(null);

    try {
      const res = await fetch("/api/admin/colleges/courses/options", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load course form options.");

      const data = (await res.json()) as {
        success?: boolean;
        colleges?: Option[];
        courseOptions?: Option[];
        degrees?: Option[];
        streams?: Option[];
        error?: string;
      };

      if (!data.success) {
        throw new Error(data.error || "Failed to load course form options.");
      }

      setOptions({
        colleges: data.colleges ?? [],
        courseOptions: data.courseOptions ?? [],
        degrees: data.degrees ?? [],
        streams: data.streams ?? [],
      });
      setOptionsState("ready");
    } catch (error) {
      setOptionsState("error");
      setOptionsError(
        error instanceof Error ? error.message : "Failed to load course form options.",
      );
    }
  }

  function openAdd() {
    setIsModalOpen(true);
    void loadOptions();
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);

  const formatFee = (val: string | null) => {
    if (!val) return "-";
    const n = Number(val);
    if (Number.isFinite(n)) {
      return `INR ${n.toLocaleString("en-IN")}`;
    }
    return val;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-800">College Courses</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and monitor all college course listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filters
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
          >
            Add new college course +
          </button>
        </div>
      </div>

      {showFilters && (
        <form id="course-filter-form" method="GET" action="/admin/colleges/courses" className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 p-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search course, college, degree, stream"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">College</label>
              <select
                name="collegeId"
                defaultValue={selectedCollegeId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All colleges</option>
                {collegeOptions.map((college, idx) => (
                  <option key={`college-${college.id}-${idx}`} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Course</label>
              <select
                name="courseId"
                defaultValue={selectedCourseId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All courses</option>
                {courseOptions.map((course, idx) => (
                  <option key={`course-${course.id}-${idx}`} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Degree</label>
              <select
                name="degreeId"
                defaultValue={selectedDegreeId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All degrees</option>
                {degreeOptions.map((degree, idx) => (
                  <option key={`degree-${degree.id}-${idx}`} value={degree.id}>
                    {degree.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stream</label>
              <select
                name="streamId"
                defaultValue={selectedStreamId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All streams</option>
                {streamOptions.map((stream, idx) => (
                  <option key={`stream-${stream.id}-${idx}`} value={stream.id}>
                    {stream.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fees</label>
              <input
                type="text"
                name="fees"
                defaultValue={selectedFees}
                placeholder="e.g. 50000"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Seats</label>
              <input
                type="text"
                name="seats"
                defaultValue={selectedSeats}
                placeholder="e.g. 60"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Duration</label>
              <input
                type="text"
                name="duration"
                defaultValue={selectedDuration}
                placeholder="e.g. 2 Years"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </form>
      )}

      <div className="bg-white">
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {total > 0 ? (
              <>
                Showing <span className="font-bold text-slate-800">{start}-{end}</span> of{" "}
                <span className="font-bold text-slate-800">{total.toLocaleString()}</span> courses
              </>
            ) : (
              "No courses found"
            )}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                menu_book
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">No course records found</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Degree & Stream
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Fees & Seats
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.slice(0, visibleCount).map((course, idx) => (
                <tr key={course.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {offset + idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {course.course_name || "General Program"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        Course ID: {course.course_id ?? "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {course.college_name || "Unnamed College"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Profile #{course.collegeprofile_id || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {course.degree_name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold truncate max-w-full">
                          {course.degree_name}
                        </span>
                      )}
                      {course.stream_name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold truncate max-w-full">
                          {course.stream_name}
                        </span>
                      )}
                      {!course.degree_name && !course.stream_name && (
                        <span className="text-slate-300 text-sm">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                        {formatFee(course.fees)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        Seats: {course.seats || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {course.courseduration ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">
                        {course.courseduration}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/colleges/courses/${course.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                        title="Edit course"
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await onDelete(course.id);
                        }}
                        label="Delete"
                        size="xs"
                        icon={<span className="material-symbols-outlined text-[13px]">delete</span>}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onAdd}
        course={undefined}
        colleges={options.colleges}
        courseOptions={options.courseOptions}
        degrees={options.degrees}
        streams={options.streams}
        optionsLoading={optionsState === "loading"}
        optionsError={optionsError}
        onRetryOptions={() => { void loadOptions(true); }}
      />

      {/* Show More */}
      {showMore && (
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
          <button onClick={() => setVisibleCount((c) => Math.min(c + 15, courses.length))} className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors" type="button">
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">keyboard_arrow_down</span>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{offset + 1}</strong>–<strong>{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> courses
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}
