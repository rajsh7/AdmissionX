"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Props {
  user: { id: number; name: string; email: string } | null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  collegemaster_id: number;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number | null;
  seats: number | null;
  courseduration: string | null;
  min_percent: string | null;
}

interface College {
  collegeprofile_id: number;
  college_name: string;
  slug: string;
  image: string | null;
  address: string;
  rating: string | null;
  totalRatingUser: number;
  college_type: string;
  university_type: string;
  admission_open: boolean | null;
  admission_start: string | null;
  admission_end: string | null;
  total_courses: number;
  min_fees: number | null;
  courses: Course[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  streams: string[];
  degrees: string[];
}

interface ApplicationResult {
  id: number;
  application_ref: string;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  fees: number;
  status: string;
  payment_status: string;
}

interface PaymentReceipt {
  transaction_id: string;
  application_ref: string;
  college_name: string;
  course_name: string;
  degree_name?: string;
  amount_paid: number;
  card_last4: string;
  card_name: string;
  paid_at: string;
  status: string;
}

type Step = "browse" | "form" | "payment" | "receipt";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(amount: number | null) {
  if (amount === null) return "Contact College";
  if (amount === 0) return "Free";
  return `₹${amount.toLocaleString("en-IN")}`;
}

function StarRating({ rating }: { rating: string | null }) {
  const r = parseFloat(rating ?? "0");
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined text-[14px] ${
            s <= Math.round(r)
              ? "text-amber-400"
              : "text-slate-200 dark:text-slate-700"
          }`}
          style={{
            fontVariationSettings: s <= Math.round(r) ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
      {r > 0 && (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
          {r.toFixed(1)}
        </span>
      )}
    </div>
  );
}

function SkeletonCollegeCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse border border-slate-100 dark:border-slate-700">
      <div className="h-36 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ── Step indicator bar ────────────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  const steps: { key: Step; label: string; icon: string }[] = [
    { key: "browse", label: "Browse", icon: "search" },
    { key: "form", label: "Apply", icon: "edit" },
    { key: "payment", label: "Payment", icon: "payments" },
    { key: "receipt", label: "Confirmed", icon: "check_circle" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto mb-10">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  done
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : active
                      ? "bg-primary text-white ring-4 ring-primary/20 shadow-lg shadow-primary/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={
                    done || active ? { fontVariationSettings: "'FILL' 1" } : {}
                  }
                >
                  {done ? "check" : s.icon}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                  active
                    ? "text-primary"
                    : done
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                  done ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Browse Colleges
// ══════════════════════════════════════════════════════════════════════════════
function BrowseStep({
  onSelectCourse,
}: {
  onSelectCourse: (college: College, course: Course | null) => void;
}) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>({ streams: [], degrees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [stream, setStream] = useState("");
  const [degree, setDegree] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: "9",
      ...(q ? { q } : {}),
      ...(stream ? { stream } : {}),
      ...(degree ? { degree } : {}),
    });
    try {
      const res = await fetch(`/api/student/colleges?${params}`);
      if (!res.ok) throw new Error("Failed to load colleges");
      const data = await res.json();
      setColleges(data.colleges ?? []);
      setPagination(data.pagination ?? null);
      setFilters(data.filters ?? { streams: [], degrees: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [q, stream, degree, page]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleSearch = (val: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQ(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search colleges or courses…"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none transition-all"
          />
        </div>
        <select
          value={stream}
          onChange={(e) => {
            setStream(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[160px]"
        >
          <option value="">All Streams</option>
          {filters.streams.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={degree}
          onChange={(e) => {
            setDegree(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[150px]"
        >
          <option value="">All Degrees</option>
          {filters.degrees.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter pills */}
      {(stream || degree) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Active:</span>
          {stream && (
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {stream}
              <button
                onClick={() => {
                  setStream("");
                  setPage(1);
                }}
                className="hover:opacity-70"
              >
                <span className="material-symbols-outlined text-[12px]">
                  close
                </span>
              </button>
            </span>
          )}
          {degree && (
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {degree}
              <button
                onClick={() => {
                  setDegree("");
                  setPage(1);
                }}
                className="hover:opacity-70"
              >
                <span className="material-symbols-outlined text-[12px]">
                  close
                </span>
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setStream("");
              setDegree("");
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-400 hover:text-primary underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      {!loading && !error && pagination && (
        <p className="text-sm text-slate-500 font-medium">
          Showing{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {colleges.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {pagination.total}
          </span>{" "}
          college{pagination.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center py-20 gap-4">
          <span className="material-symbols-outlined text-5xl text-red-400">
            error_outline
          </span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {error}
          </p>
          <button
            onClick={fetchColleges}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* College grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <SkeletonCollegeCard key={i} />
            ))
          : colleges.map((college) => {
              const isExpanded = expandedId === college.collegeprofile_id;
              return (
                <div
                  key={college.collegeprofile_id}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  {/* Banner */}
                  <div className="relative h-36 bg-gradient-to-br from-primary/20 to-slate-300 dark:from-slate-700 dark:to-slate-900 overflow-hidden">
                    {college.image ? (
                      <Image
                        src={college.image}
                        alt={college.college_name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-white/30">
                          account_balance
                        </span>
                      </div>
                    )}
                    {college.admission_open !== null && (
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          college.admission_open
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {college.admission_open
                          ? "Admissions Open"
                          : "Admissions Closed"}
                      </span>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                      {college.college_type}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {college.college_name}
                    </h3>
                    {college.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-[12px]">
                          location_on
                        </span>
                        {college.address}
                      </p>
                    )}

                    <StarRating rating={college.rating} />

                    <div className="flex items-center justify-between mt-3 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Fees from
                        </p>
                        <p className="text-sm font-black text-primary">
                          {formatCurrency(college.min_fees)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Courses
                        </p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {college.total_courses}
                        </p>
                      </div>
                    </div>

                    {/* Expanded course list */}
                    {isExpanded && college.courses.length > 0 && (
                      <div className="mb-4 space-y-2 max-h-64 overflow-y-auto pr-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Select a Course to Apply
                        </p>
                        {college.courses.map((course) => (
                          <button
                            key={course.collegemaster_id}
                            onClick={() => onSelectCourse(college, course)}
                            className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group/course"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/course:text-primary transition-colors truncate">
                                  {[course.degree_name, course.course_name]
                                    .filter(Boolean)
                                    .join(" ") || "Course"}
                                </p>
                                {course.stream_name && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {course.stream_name}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-x-3 mt-1.5">
                                  {course.courseduration && (
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[11px]">
                                        schedule
                                      </span>
                                      {course.courseduration}
                                    </span>
                                  )}
                                  {course.seats && (
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[11px]">
                                        chair
                                      </span>
                                      {course.seats} seats
                                    </span>
                                  )}
                                  {course.min_percent && (
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[11px]">
                                        percent
                                      </span>
                                      Min {course.min_percent}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-black text-primary">
                                  {formatCurrency(course.fees)}
                                </p>
                                <span className="material-symbols-outlined text-primary text-[14px] mt-1 block opacity-0 group-hover/course:opacity-100 transition-opacity">
                                  arrow_forward
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {isExpanded && college.courses.length === 0 && (
                      <div className="mb-4 text-center py-4 text-sm text-slate-400">
                        No course listings available.
                      </div>
                    )}

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedId(
                            isExpanded ? null : college.collegeprofile_id,
                          )
                        }
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          isExpanded
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            : "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
                        }`}
                      >
                        {isExpanded ? "Collapse" : "View Courses & Apply"}
                      </button>
                      {!isExpanded && (
                        <button
                          onClick={() => onSelectCourse(college, null)}
                          title="Apply without specific course"
                          className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            arrow_forward
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Empty state */}
      {!loading && !error && colleges.length === 0 && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-600 block mb-4">
            school
          </span>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            No colleges found
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Try different search terms or remove some filters.
          </p>
          <button
            onClick={() => {
              setStream("");
              setDegree("");
              setQ("");
              setPage(1);
            }}
            className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-semibold text-sm hover:bg-primary/20 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                Math.abs(p - page) <= 2 ||
                p === 1 ||
                p === pagination.totalPages,
            )
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - Number(arr[idx - 1]) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    page === p
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Application Form
// ══════════════════════════════════════════════════════════════════════════════
function ApplicationFormStep({
  user,
  college,
  course,
  onBack,
  onSubmitted,
}: {
  user: Props["user"];
  college: College;
  course: Course | null;
  onBack: () => void;
  onSubmitted: (app: ApplicationResult) => void;
}) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fees = course?.fees ?? 0;
  const courseLabel =
    [course?.degree_name, course?.course_name].filter(Boolean).join(" ") ||
    "General Application";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeprofile_id: college.collegeprofile_id,
          collegemaster_id: course?.collegemaster_id ?? undefined,
          college_name: college.college_name,
          course_name: course?.course_name ?? undefined,
          degree_name: course?.degree_name ?? undefined,
          stream_name: course?.stream_name ?? undefined,
          fees,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.application_ref) {
          setError(
            `You already have an active application here (Ref: ${data.application_ref}). Check My Applications tab.`,
          );
        } else {
          setError(data.error ?? "Failed to submit. Please try again.");
        }
        return;
      }

      onSubmitted(data.application);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-semibold text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to Colleges
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* College banner */}
        <div className="relative h-32 bg-gradient-to-br from-primary to-blue-700 overflow-hidden">
          {college.image && (
            <Image
              src={college.image}
              alt={college.college_name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 800px"
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-white font-black text-xl leading-tight">
              {college.college_name}
            </h2>
            {college.address && (
              <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">
                  location_on
                </span>
                {college.address}
              </p>
            )}
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">
            Confirm Your Application
          </h3>

          {/* Selected course info card */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Course
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {courseLabel}
              </span>
            </div>
            {course?.stream_name && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Stream
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  {course.stream_name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Annual Fees
              </span>
              <span className="font-black text-primary text-base">
                {formatCurrency(fees)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notes / Special Requirements
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any additional information for the college, special requirements, or questions…"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">
                  error
                </span>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Application
                    <span className="material-symbols-outlined text-lg">
                      send
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Payment
// ══════════════════════════════════════════════════════════════════════════════
function PaymentStep({
  user,
  application,
  onBack,
  onPaid,
}: {
  user: Props["user"];
  application: ApplicationResult;
  onBack: () => void;
  onPaid: (receipt: PaymentReceipt) => void;
}) {
  const [cardName, setCardName] = useState(user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };
  const maskedDisplay = cardNumber
    ? "•••• •••• •••• " + cardNumber.replace(/\s/g, "").slice(-4)
    : "•••• •••• •••• ••••";

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    if (last4.length < 4) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/student/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          application_id: application.id,
          card_name: cardName.trim(),
          card_last4: last4,
          amount: application.fees,
          save_card: saveCard,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment failed. Please try again.");
        return;
      }
      onPaid(data.receipt);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-semibold text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to Application
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Checkout
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Secure &amp; encrypted payment
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">
              Order Summary
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  account_balance
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {application.college_name ?? "College"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {[application.degree_name, application.course_name]
                    .filter(Boolean)
                    .join(" ") || "General Application"}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Ref: {application.application_ref}
                </p>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Application Fee</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(application.fees)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Fee</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Total
              </span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(application.fees)}
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "verified_user", label: "PCI DSS" },
              { icon: "lock", label: "256-bit SSL" },
              { icon: "support_agent", label: "24/7 Help" },
            ].map((b) => (
              <div
                key={b.label}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <span className="material-symbols-outlined text-primary text-xl block mb-1">
                  {b.icon}
                </span>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Card form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg p-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">
            Payment Details
          </h3>

          {/* Card visualisation */}
          <div className="relative w-full aspect-[1.7/1] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 text-white shadow-2xl mb-8 overflow-hidden hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-60">
                  AdmissionX
                </p>
                <div className="h-7 w-10 bg-yellow-400/20 rounded mt-1 border border-yellow-500/40" />
              </div>
              <span className="material-symbols-outlined text-3xl opacity-80">
                contactless
              </span>
            </div>
            <p className="text-lg tracking-[0.18em] font-medium mb-6">
              {maskedDisplay}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] uppercase tracking-tighter opacity-60">
                  Card Holder
                </p>
                <p className="text-sm font-bold uppercase truncate max-w-[160px]">
                  {cardName || user?.name || "YOUR NAME"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-tighter opacity-60">
                  Expires
                </p>
                <p className="text-sm font-bold">{expiry || "MM/YY"}</p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Name on Card
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Card Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  credit_card
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expiry
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="•••"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-slate-500">
                Save card for future payments
              </span>
            </label>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">
                  error
                </span>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Processing…
                </>
              ) : (
                <>
                  Pay {formatCurrency(application.fees)}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              By clicking &apos;Pay&apos; you agree to AdmissionX&apos;s Terms
              of Service and Refund Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Receipt
// ══════════════════════════════════════════════════════════════════════════════
function ReceiptStep({
  receipt,
  onDone,
}: {
  receipt: PaymentReceipt;
  onDone: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto text-center py-8">
      {/* Success animation */}
      <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
        <span
          className="material-symbols-outlined text-5xl text-emerald-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>

      <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
        Payment Successful!
      </h2>
      <p className="text-slate-500 mb-8">
        Your application has been confirmed. A confirmation email will be sent
        shortly.
      </p>

      {/* Receipt card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg p-6 text-left space-y-4 mb-8">
        <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            receipt_long
          </span>
          Payment Receipt
        </h3>

        {[
          {
            label: "Transaction ID",
            value: receipt.transaction_id,
            mono: true,
          },
          {
            label: "Application Ref",
            value: receipt.application_ref,
            mono: true,
          },
          { label: "College", value: receipt.college_name },
          {
            label: "Course",
            value:
              [receipt.degree_name, receipt.course_name]
                .filter(Boolean)
                .join(" ") || receipt.course_name,
          },
          {
            label: "Amount Paid",
            value: formatCurrency(receipt.amount_paid),
            highlight: true,
          },
          { label: "Card", value: `•••• •••• •••• ${receipt.card_last4}` },
          {
            label: "Paid At",
            value: new Date(receipt.paid_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <span className="text-xs font-semibold text-slate-500 shrink-0">
              {row.label}
            </span>
            <span
              className={`text-sm font-bold text-right break-all ${
                row.mono
                  ? "font-mono text-slate-600 dark:text-slate-300 text-xs"
                  : row.highlight
                    ? "text-primary text-base"
                    : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print Receipt
        </button>
        <button
          onClick={onDone}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          View My Applications
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — ApplyTab
// ══════════════════════════════════════════════════════════════════════════════
export default function ApplyTab({ user }: Props) {
  const [step, setStep] = useState<Step>("browse");
  const [college, setCollege] = useState<College | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [application, setApplication] = useState<ApplicationResult | null>(
    null,
  );
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  function handleSelectCourse(col: College, cou: Course | null) {
    setCollege(col);
    setCourse(cou);
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleApplicationSubmitted(app: ApplicationResult) {
    setApplication(app);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePaid(rec: PaymentReceipt) {
    setReceipt(rec);
    setStep("receipt");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDone() {
    // Reset everything back to browse
    setStep("browse");
    setCollege(null);
    setCourse(null);
    setApplication(null);
    setReceipt(null);
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Apply &amp; Pay
        </h1>
        <p className="text-slate-500 mt-1">
          Browse colleges, submit your application, and pay fees — all in one
          place.
        </p>
      </div>

      {/* Step indicator */}
      <StepBar step={step} />

      {/* Step content */}
      {step === "browse" && <BrowseStep onSelectCourse={handleSelectCourse} />}

      {step === "form" && college && (
        <ApplicationFormStep
          user={user}
          college={college}
          course={course}
          onBack={() => setStep("browse")}
          onSubmitted={handleApplicationSubmitted}
        />
      )}

      {step === "payment" && application && (
        <PaymentStep
          user={user}
          application={application}
          onBack={() => setStep("form")}
          onPaid={handlePaid}
        />
      )}

      {step === "receipt" && receipt && (
        <ReceiptStep receipt={receipt} onDone={handleDone} />
      )}
    </div>
  );
}
