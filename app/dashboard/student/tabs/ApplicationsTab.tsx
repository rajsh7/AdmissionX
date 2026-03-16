"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: number; name: string; email: string } | null;
  initialFilter?: string;
}

interface Application {
  id: number;
  application_ref: string;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number;
  status: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  progressColor: string;
  payment_status: string;
  paymentLabel: string;
  paymentClass: string;
  paymentIcon: string;
  transaction_id: string | null;
  amount_paid: number;
  actionLabel: string;
  notes: string | null;
  submittedOn: string | null;
  created_at: string;
}

interface AppStats {
  total: number;
  submitted: number;
  under_review: number;
  verified: number;
  enrolled: number;
  rejected: number;
  pending_pay: number;
}

// ── Circular progress ring ────────────────────────────────────────────────────
function CircularProgress({ percent }: { percent: number }) {
  const r      = 16;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  const stroke =
    percent >= 85
      ? "#10b981"
      : percent >= 50
        ? "#f59e0b"
        : "#135bec";

  const textCls =
    percent >= 85
      ? "text-emerald-500"
      : percent >= 50
        ? "text-amber-500"
        : "text-primary";

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r={r} fill="none" strokeWidth="3"
          className="stroke-slate-100 dark:stroke-slate-700"
        />
        <circle
          cx="18" cy="18" r={r} fill="none" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          stroke={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-[10px] font-bold ${textCls}`}>{percent}%</span>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse border border-slate-100 dark:border-slate-700">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

// ── Filter chip config ────────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: "all",          label: "All",          icon: "apps"          },
  { id: "submitted",    label: "Submitted",    icon: "send"          },
  { id: "under_review", label: "Under Review", icon: "schedule"      },
  { id: "verified",     label: "Verified",     icon: "check_circle"  },
  { id: "enrolled",     label: "Enrolled",     icon: "school"        },
  { id: "rejected",     label: "Rejected",     icon: "cancel"        },
];

const TIMELINE_PHASES = [
  { label: "Profile Setup",  phase: "Phase 1", icon: "person"       },
  { label: "Documentation",  phase: "Phase 2", icon: "folder"       },
  { label: "Submission",     phase: "Phase 3", icon: "send"         },
  { label: "Response",       phase: "Phase 4", icon: "mail"         },
  { label: "Enrolment",      phase: "Phase 5", icon: "school"       },
];

export default function ApplicationsTab({ user, initialFilter = "all" }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats]               = useState<AppStats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState<"newest" | "status" | "fees">("newest");

  // For inline receipt / detail drawer
  const [expandedId, setExpandedId]     = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${user.id}/applications`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data.applications ?? []);
      setStats(data.stats ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // ── Delete draft ──────────────────────────────────────────────────────────
  async function deleteDraft(appId: number) {
    if (!user?.id) return;
    if (!confirm("Remove this draft application? This cannot be undone.")) return;
    try {
      const res = await fetch(
        `/api/student/${user.id}/applications?appId=${appId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Could not delete application.");
        return;
      }
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch {
      alert("Network error. Please try again.");
    }
  }

  // ── Filter + search + sort ────────────────────────────────────────────────
  const filtered = applications
    .filter((app) => {
      if (activeFilter !== "all" && app.status !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (app.college_name ?? "").toLowerCase().includes(q) ||
          (app.course_name  ?? "").toLowerCase().includes(q) ||
          (app.degree_name  ?? "").toLowerCase().includes(q) ||
          app.application_ref.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "fees")  return b.fees - a.fees;
      if (sortBy === "status") {
        const ORDER: Record<string, number> = {
          enrolled: 0, verified: 1, under_review: 2,
          submitted: 3, draft: 4, rejected: 5,
        };
        return (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9);
      }
      return 0;
    });

  // ── Derive journey step from stats ────────────────────────────────────────
  const journeyStep =
    stats?.enrolled     ? 4 :
    stats?.verified     ? 3 :
    stats?.under_review ? 2 :
    stats?.submitted    ? 2 :
    1;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-24">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black tracking-tight">
            My Applications
          </h1>
          {!loading && (
            <p className="text-primary font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {applications.length > 0
                ? `Tracking ${applications.length} application${applications.length !== 1 ? "s" : ""}`
                : "No applications yet — browse colleges to get started"}
            </p>
          )}
        </div>

        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college or course…"
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="newest">Sort: Newest</option>
            <option value="status">Sort: Status</option>
            <option value="fees">Sort: Fees</option>
          </select>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      {!loading && stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total",        count: stats.total,        color: "bg-slate-100 dark:bg-slate-800",   text: "text-slate-700 dark:text-slate-200" },
            { label: "Submitted",    count: stats.submitted,    color: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-600 dark:text-blue-400"   },
            { label: "Under Review", count: stats.under_review, color: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
            { label: "Verified",     count: stats.verified,     color: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
            { label: "Enrolled",     count: stats.enrolled,     color: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
            { label: "Rejected",     count: stats.rejected,     color: "bg-red-50 dark:bg-red-900/20",    text: "text-red-600 dark:text-red-400"     },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveFilter(s.label.toLowerCase().replace(" ", "_") === "total" ? "all" : s.label.toLowerCase().replace(" ", "_"))}
              className={`${s.color} rounded-xl px-4 py-3 text-center transition-all hover:scale-105 cursor-pointer`}
            >
              <p className={`text-2xl font-black ${s.text}`}>{s.count}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {FILTER_CHIPS.map((chip) => {
          const count =
            chip.id === "all"
              ? applications.length
              : applications.filter((a) => a.status === chip.id).length;

          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all ${
                activeFilter === chip.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
              {chip.label}
              {!loading && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeFilter === chip.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
          <button
            onClick={load}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-600 block mb-4">
            {searchQuery || activeFilter !== "all" ? "search_off" : "description"}
          </span>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : activeFilter !== "all"
                ? `No ${FILTER_CHIPS.find((c) => c.id === activeFilter)?.label ?? ""} applications`
                : "No applications yet"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {activeFilter !== "all" || searchQuery
              ? "Try adjusting your filters or search query."
              : "Head to the Apply tab to browse colleges and submit your first application."}
          </p>
          {activeFilter !== "all" && (
            <button
              onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
              className="px-5 py-2 bg-primary/10 text-primary rounded-xl font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Application Cards ─────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((app) => {
            const isExpanded = expandedId === app.id;
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col"
              >
                {/* Circular progress — top right */}
                <div className="absolute top-4 right-4">
                  <CircularProgress percent={app.progress} />
                </div>

                {/* College / course header */}
                <div className="flex items-start gap-4 mb-5 pr-16">
                  <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {app.college_name ?? "College"}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">
                      {[app.degree_name, app.course_name].filter(Boolean).join(" · ") || "Course not specified"}
                    </p>
                    {app.stream_name && (
                      <p className="text-xs text-primary/70 font-medium mt-0.5">{app.stream_name}</p>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="space-y-3 flex-1">
                  {/* Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider ${app.statusClass}`}>
                      <span className="material-symbols-outlined text-[13px]">{app.statusIcon}</span>
                      {app.statusLabel}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Payment</span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${app.paymentClass}`}>
                      <span className="material-symbols-outlined text-[13px]">{app.paymentIcon}</span>
                      {app.paymentLabel}
                    </span>
                  </div>

                  {/* Fees */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Fees</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {app.fees > 0 ? `₹${app.fees.toLocaleString("en-IN")}` : "Not specified"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Applied On</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {app.submittedOn ?? "—"}
                    </span>
                  </div>

                  {/* Ref */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Ref #</span>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {app.application_ref}
                    </span>
                  </div>

                  {/* Expandable detail */}
                  {isExpanded && (
                    <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2 text-sm">
                      {app.transaction_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transaction ID</span>
                          <span className="font-mono text-xs font-semibold text-emerald-600 break-all text-right max-w-[180px]">
                            {app.transaction_id}
                          </span>
                        </div>
                      )}
                      {app.amount_paid > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Amount Paid</span>
                          <span className="font-bold text-emerald-600">
                            ₹{app.amount_paid.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      {app.notes && (
                        <div>
                          <span className="text-slate-500 block mb-1">Notes</span>
                          <p className="text-slate-700 dark:text-slate-300 text-xs">{app.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <button className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    {app.actionLabel}
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    title={isExpanded ? "Hide details" : "Show details"}
                    className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isExpanded ? "expand_less" : "more_horiz"}
                    </span>
                  </button>
                  {app.status === "draft" && (
                    <button
                      onClick={() => deleteDraft(app.id)}
                      title="Delete draft"
                      className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Journey timeline ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto hide-scrollbar">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">timeline</span>
          Application Journey
        </h2>

        <div className="min-w-[640px] flex items-center justify-between relative px-6">
          {/* Background track */}
          <div className="absolute h-1 bg-slate-100 dark:bg-slate-700 w-full left-0 top-[22px] z-0" />
          {/* Progress fill */}
          <div
            className="absolute h-1 bg-primary left-0 top-[22px] z-0 transition-all duration-700"
            style={{ width: `${(journeyStep / (TIMELINE_PHASES.length - 1)) * 100}%` }}
          />

          {TIMELINE_PHASES.map((phase, i) => {
            const isDone   = i < journeyStep;
            const isActive = i === journeyStep;
            return (
              <div key={phase.label} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`flex items-center justify-center font-bold shadow-sm transition-all ${
                  isDone
                    ? "w-11 h-11 rounded-full bg-primary text-white shadow-primary/30"
                    : isActive
                      ? "w-12 h-12 rounded-full bg-primary text-white ring-8 ring-primary/10"
                      : "w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 border-2 border-slate-200 dark:border-slate-600"
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {isDone ? "check" : phase.icon}
                  </span>
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    isDone || isActive ? "text-primary" : "text-slate-400"
                  }`}>
                    {phase.phase}
                  </p>
                  <p className={`text-xs font-semibold mt-0.5 ${
                    isActive
                      ? "text-slate-900 dark:text-white font-bold"
                      : isDone
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-slate-400"
                  }`}>
                    {phase.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Refresh button ────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex justify-center">
          <button
            onClick={load}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh Applications
          </button>
        </div>
      )}
    </div>
  );
}
