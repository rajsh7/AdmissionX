"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Application {
  id: number;
  application_ref: string;
  student_id: number;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number;
  status: string;
  payment_status: string;
  transaction_id: string | null;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  paymentLabel: string;
  paymentClass: string;
  paymentIcon: string;
  submittedOn: string | null;
}

interface Stats {
  total: number;
  submitted: number;
  under_review: number;
  verified: number;
  enrolled: number;
  rejected: number;
  paid: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ALLOWED_STATUSES = [
  {
    value: "submitted",
    label: "Submitted",
    icon: "send",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: "schedule",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    value: "verified",
    label: "Verified",
    icon: "check_circle",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: "cancel",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  {
    value: "enrolled",
    label: "Enrolled",
    icon: "school",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
];

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  if (!n) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ── Status chip ────────────────────────────────────────────────────────────────
function StatusChip({
  label,
  icon,
  cls,
}: {
  label: string;
  icon: string;
  cls: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}
    >
      <span
        className="material-symbols-rounded text-[13px]"
        style={{
          fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
        }}
      >
        {icon}
      </span>
      {label}
    </span>
  );
}

// ── Status dropdown ────────────────────────────────────────────────────────────
function StatusDropdown({
  appId,
  current,
  slug,
  onUpdated,
}: {
  appId: number;
  current: string;
  slug: string;
  onUpdated: (id: number, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const meta = ALLOWED_STATUSES.find((s) => s.value === current);

  async function changeTo(status: string) {
    if (status === current) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: appId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      onUpdated(appId, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={saving}
        className="flex items-center gap-1.5 focus:outline-none"
        title="Change status"
      >
        <StatusChip
          label={meta?.label ?? current}
          icon={meta?.icon ?? "help"}
          cls={meta?.cls ?? "bg-slate-100 text-slate-600"}
        />
        {saving ? (
          <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
        ) : (
          <span
            className={`material-symbols-rounded text-sm text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            expand_more
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-40 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 overflow-hidden">
            {ALLOWED_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => changeTo(s.value)}
                disabled={s.value === current}
                className={`
                  w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-left transition-colors
                  ${
                    s.value === current
                      ? "opacity-50 cursor-default"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
                  }
                `}
              >
                <span
                  className={`material-symbols-rounded text-base`}
                  style={{
                    fontVariationSettings:
                      "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
                  }}
                >
                  {s.icon}
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {s.label}
                </span>
                {s.value === current && (
                  <span
                    className="ml-auto material-symbols-rounded text-sm text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 shadow border border-red-100 z-50 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Application row ────────────────────────────────────────────────────────────
function AppRow({
  app,
  slug,
  onStatusUpdated,
}: {
  app: Application;
  slug: string;
  onStatusUpdated: (id: number, status: string) => void;
}) {
  const initials = (app.student_name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const payMeta = ALLOWED_STATUSES.find(() => true); // just for shape
  void payMeta;

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
      {/* Ref + student */}
      <td className="px-4 py-3.5 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-primary">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
              {app.student_name ?? "Unknown Student"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {app.student_email ?? "—"}
            </p>
          </div>
        </div>
      </td>

      {/* Ref */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="inline-block font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
          {app.application_ref}
        </span>
      </td>

      {/* Course */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
            {app.course_name ?? "—"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {app.degree_name && (
              <span className="text-[11px] text-slate-400 font-medium">
                {app.degree_name}
              </span>
            )}
            {app.stream_name && (
              <span className="text-[11px] text-slate-400">
                · {app.stream_name}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Fees */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {formatCurrency(app.fees)}
        </span>
      </td>

      {/* Payment */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${app.paymentClass}`}
        >
          <span
            className="material-symbols-rounded text-[13px]"
            style={{
              fontVariationSettings:
                "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20",
            }}
          >
            {app.paymentIcon}
          </span>
          {app.paymentLabel}
        </span>
      </td>

      {/* Status — with dropdown */}
      <td className="px-4 py-3.5">
        <StatusDropdown
          appId={app.id}
          current={app.status}
          slug={slug}
          onUpdated={onStatusUpdated}
        />
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {app.submittedOn ?? "—"}
        </span>
      </td>
    </tr>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/60 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
      </td>
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
      </td>
    </tr>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ApplicationsTab({ college }: Props) {
  const slug = college.slug;

  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    verified: 0,
    enrolled: 0,
    rejected: 0,
    paid: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(
        `/api/college/dashboard/${slug}/applications?${sp}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Failed to load applications.");
      setApplications(data.applications ?? []);
      setStats(data.stats ?? stats);
      setPagination(data.pagination ?? pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, filterStatus, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [filterStatus, debouncedSearch]);

  function handleStatusUpdated(id: number, status: string) {
    const meta = ALLOWED_STATUSES.find((s) => s.value === status)!;
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              statusLabel: meta.label,
              statusClass: meta.cls,
              statusIcon: meta.icon,
            }
          : a,
      ),
    );
  }

  const STAT_CARDS = [
    {
      key: "total",
      label: "Total",
      icon: "description",
      accent:
        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
      val: stats.total,
    },
    {
      key: "submitted",
      label: "Submitted",
      icon: "send",
      accent:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
      val: stats.submitted,
    },
    {
      key: "under_review",
      label: "Under Review",
      icon: "schedule",
      accent:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
      val: stats.under_review,
    },
    {
      key: "verified",
      label: "Verified",
      icon: "check_circle",
      accent:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
      val: stats.verified,
    },
    {
      key: "enrolled",
      label: "Enrolled",
      icon: "school",
      accent:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
      val: stats.enrolled,
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: "cancel",
      accent: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
      val: stats.rejected,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Applications
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Review and manage all student applications
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setFilterStatus(s.key === "total" ? "" : s.key);
              setPage(1);
            }}
            className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border-2 text-left transition-all
              ${
                filterStatus === s.key ||
                (s.key === "total" && filterStatus === "")
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30"
              }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.accent}`}
            >
              <span
                className="material-symbols-rounded text-base"
                style={{
                  fontVariationSettings:
                    "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20",
                }}
              >
                {s.icon}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
              {s.val}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* ── Search + filter row ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, email, ref, course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto shrink-0">
          {FILTER_TABS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilterStatus(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === f.value
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 text-red-700 dark:text-red-400">
          <span className="material-symbols-rounded text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={load}
            className="ml-auto text-xs font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Ref
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Fees
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <span
                      className="material-symbols-rounded text-5xl text-slate-300 dark:text-slate-600 block mb-3"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      description
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                      {search || filterStatus
                        ? "No applications match your filter."
                        : "No applications received yet."}
                    </p>
                    {(search || filterStatus) && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setFilterStatus("");
                          setPage(1);
                        }}
                        className="mt-3 text-sm text-primary font-semibold hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <AppRow
                    key={app.id}
                    app={app}
                    slug={slug}
                    onStatusUpdated={handleStatusUpdated}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {pagination.total}
              </span>{" "}
              applications
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span
                  className="material-symbols-rounded text-lg"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  chevron_left
                </span>
              </button>

              {/* Page number pills */}
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const half = 2;
                  let start = Math.max(1, page - half);
                  const end = Math.min(pagination.totalPages, start + 4);
                  start = Math.max(1, end - 4);
                  const p = start + i;
                  if (p > pagination.totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? "bg-primary text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                },
              )}

              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span
                  className="material-symbols-rounded text-lg"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
