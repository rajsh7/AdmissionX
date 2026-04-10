"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Course {
  id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number | null;
  seats: number | null;
  courseduration: string | null;
  twelvemarks: number | null;
  description: string | null;
}

interface Option {
  id: number;
  name: string;
}

interface Options {
  courses: Option[];
  degrees: Option[];
  streams: Option[];
}

const EMPTY_FORM = {
  course_id: "",
  degree_id: "",
  functionalarea_id: "",
  fees: "",
  seats: "",
  courseduration: "",
  twelvemarks: "",
  description: "",
};

function formatCurrency(n: number | null) {
  if (!n) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((opt) => (
          <option key={opt.id} value={String(opt.id)}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  hint = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CoursesTab({ college }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Options>({
    courses: [],
    degrees: [],
    streams: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search / filter
  const [searchQ, setSearchQ] = useState("");
  const [filterStream, setFilterStream] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses`);
      if (!res.ok) throw new Error("Failed to load courses.");
      const data = await res.json();
      setCourses(data.courses ?? []);
      setOptions(data.options ?? { courses: [], degrees: [], streams: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(course: Course) {
    setEditingId(course.id);
    setForm({
      course_id: course.course_id ? String(course.course_id) : "",
      degree_id: course.degree_id ? String(course.degree_id) : "",
      functionalarea_id: course.functionalarea_id
        ? String(course.functionalarea_id)
        : "",
      fees: course.fees != null ? String(course.fees) : "",
      seats: course.seats != null ? String(course.seats) : "",
      courseduration: course.courseduration ?? "",
      twelvemarks: course.twelvemarks != null ? String(course.twelvemarks) : "",
      description: course.description ?? "",
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
  }

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.course_id || !form.degree_id || !form.functionalarea_id) {
      setFormError("Stream, Degree, and Course are all required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      course_id: Number(form.course_id),
      degree_id: Number(form.degree_id),
      functionalarea_id: Number(form.functionalarea_id),
      fees: form.fees ? Number(form.fees) : null,
      seats: form.seats ? Number(form.seats) : null,
      courseduration: form.courseduration || null,
      twelvemarks: form.twelvemarks ? Number(form.twelvemarks) : null,
      description: form.description || null,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(
          `/api/college/dashboard/${slug}/courses?courseId=${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      } else {
        res = await fetch(`/api/college/dashboard/${slug}/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save course.");

      if (editingId) {
        setCourses((prev) =>
          prev.map((c) => (c.id === editingId ? (data.course as Course) : c)),
        );
      } else {
        setCourses((prev) => [...prev, data.course as Course]);
      }

      closeForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/college/dashboard/${slug}/courses?courseId=${deleteId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete course.");
      setCourses((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Filter / search ────────────────────────────────────────────────────────
  const filtered = courses.filter((c) => {
    const q = searchQ.toLowerCase();
    if (
      q &&
      !`${c.course_name} ${c.degree_name} ${c.stream_name}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    if (filterStream && c.stream_name !== filterStream) return false;
    return true;
  });

  // Group by stream
  const streamGroups = Array.from(
    new Set(filtered.map((c) => c.stream_name ?? "Other")),
  );

  const uniqueStreams = Array.from(
    new Set(courses.map((c) => c.stream_name).filter(Boolean)),
  ) as string[];

  return (
    <div className="space-y-6 pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Courses & Fees
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {loading
              ? "Loading…"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} listed`}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Course
        </button>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4">
          <span
            className="material-symbols-outlined text-red-500 text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <p className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ── Search + Filter ───────────────────────────────────────────────── */}
      {!loading && courses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search by course, degree, or stream…"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={filterStream}
            onChange={(e) => setFilterStream(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer sm:w-52"
          >
            <option value="">All Streams</option>
            {uniqueStreams.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Loading skeletons ─────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loading && courses.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <span
            className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-700 mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            No courses yet
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            Add your first course to let students know what programs you offer.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Your First Course
          </button>
        </div>
      )}

      {/* ── No filter results ─────────────────────────────────────────────── */}
      {!loading && courses.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 block mb-3">
            search_off
          </span>
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            No courses match your search
          </p>
          <button
            onClick={() => {
              setSearchQ("");
              setFilterStream("");
            }}
            className="mt-4 text-sm text-primary font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Courses grouped by stream ─────────────────────────────────────── */}
      {!loading &&
        filtered.length > 0 &&
        streamGroups.map((streamName) => {
          const group = filtered.filter(
            (c) => (c.stream_name ?? "Other") === streamName,
          );
          return (
            <div key={streamName} className="space-y-3">
              {/* Stream header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full">
                  <span className="material-symbols-outlined text-[15px]">
                    category
                  </span>
                  <span className="text-xs font-bold">{streamName}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {group.length} course{group.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Course cards */}
              {group.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 dark:text-white text-base">
                            {course.course_name ?? "Unnamed Course"}
                          </h3>
                          {course.degree_name && (
                            <span className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-0.5 rounded-full">
                              {course.degree_name}
                            </span>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {course.fees != null && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[13px]">
                                payments
                              </span>
                              {formatCurrency(course.fees)}
                            </span>
                          )}
                          {course.seats != null && (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[13px]">
                                event_seat
                              </span>
                              {course.seats} seats
                            </span>
                          )}
                          {course.courseduration && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[13px]">
                                schedule
                              </span>
                              {course.courseduration}
                            </span>
                          )}
                          {course.twelvemarks != null && (
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[13px]">
                                grade
                              </span>
                              Min {course.twelvemarks}%
                            </span>
                          )}
                        </div>

                        {course.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(course)}
                          title="Edit course"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteId(course.id)}
                          title="Delete course"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeForm}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId ? "Edit Course" : "Add New Course"}
                </h2>
                <button
                  onClick={closeForm}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">
                {formError && (
                  <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <span
                      className="material-symbols-outlined text-red-500 text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      error
                    </span>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {formError}
                    </p>
                  </div>
                )}

                {/* Required fields */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Course Identification — Required
                  </p>

                  <SelectInput
                    label="Stream / Functional Area"
                    value={form.functionalarea_id}
                    onChange={(v) => update("functionalarea_id", v)}
                    options={options.streams}
                    required
                    placeholder="Select stream…"
                  />
                  <SelectInput
                    label="Degree"
                    value={form.degree_id}
                    onChange={(v) => update("degree_id", v)}
                    options={options.degrees}
                    required
                    placeholder="Select degree…"
                  />
                  <SelectInput
                    label="Course"
                    value={form.course_id}
                    onChange={(v) => update("course_id", v)}
                    options={options.courses}
                    required
                    placeholder="Select course…"
                  />
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Annual Fees (₹)"
                    value={form.fees}
                    onChange={(v) => update("fees", v)}
                    type="number"
                    placeholder="e.g. 75000"
                  />
                  <TextInput
                    label="Total Seats"
                    value={form.seats}
                    onChange={(v) => update("seats", v)}
                    type="number"
                    placeholder="e.g. 60"
                  />
                  <TextInput
                    label="Duration"
                    value={form.courseduration}
                    onChange={(v) => update("courseduration", v)}
                    placeholder="e.g. 3 Years"
                  />
                  <TextInput
                    label="Min. 12th % Required"
                    value={form.twelvemarks}
                    onChange={(v) => update("twelvemarks", v)}
                    type="number"
                    placeholder="e.g. 50"
                    hint="Leave blank if not applicable"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Course Description (optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={3}
                    placeholder="Brief overview of the course, highlights, career prospects…"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
                <button
                  onClick={closeForm}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        save
                      </span>
                      {editingId ? "Update Course" : "Add Course"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {deleteId !== null && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-[26px] text-red-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    delete
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Delete Course?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    This will permanently remove the course from your listing.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200 dark:shadow-none"
                >
                  {deleting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      Deleting…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
