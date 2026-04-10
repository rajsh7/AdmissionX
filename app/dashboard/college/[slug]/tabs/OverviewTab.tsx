"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

import type { TabId } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
  onNavigate: (tab: TabId) => void;
}

interface OverviewData {
  profile: {
    college_name: string;
    rating: number | null;
    totalRatingUser: number;
    verified: number;
    address: string;
    bannerimage: string | null;
    estyear: number | null;
    admissionStatus: "open" | "closed" | "unknown";
    profileComplete: number;
  };
  stats: {
    applications: {
      total: number;
      submitted: number;
      under_review: number;
      verified: number;
      enrolled: number;
      rejected: number;
      paid: number;
      new_this_week: number;
    };
    courses: {
      total: number;
      streams: number;
      degrees: number;
      min_fees: number;
      max_fees: number;
      total_seats: number;
    };
    gallery: { total: number };
    faculty: { total: number };
  };
  placement: {
    companies: string;
    placed_last_year: string;
    ctc_highest: string;
    ctc_average: string;
  } | null;
  recentApplications: {
    id: number;
    application_ref: string;
    course_name: string | null;
    degree_name: string | null;
    stream_name: string | null;
    status: string;
    payment_status: string;
    statusLabel: string;
    statusClass: string;
    statusIcon: string;
    fees: number;
    amount_paid: number;
    student_name: string | null;
    student_email: string | null;
    submittedOn: string | null;
  }[];
  quickActions: {
    icon: string;
    label: string;
    tab: string;
    urgent: boolean;
  }[];
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
    </div>
  );
}

function formatCurrency(n: number) {
  if (!n) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function OverviewTab({ college, onNavigate }: Props) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/college/dashboard/${college.slug}/overview`,
      );
      if (!res.ok) throw new Error("Failed to load overview data.");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [college.slug]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Time-based greeting ───────────────────────────────────────────────────
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  const firstName = college.name.split(" ")[0];

  if (loading) {
    return (
      <div className="space-y-8 pb-24">
        {/* Greeting skeleton */}
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
        </div>
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        {/* Two-col skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse h-72" />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <span className="material-symbols-outlined text-6xl text-red-400">
          error_outline
        </span>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {error}
        </p>
        <button
          onClick={load}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats, placement, recentApplications, quickActions } = data;

  // ── Stat cards config ─────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Applications",
      value: stats.applications.total,
      sub:
        stats.applications.new_this_week > 0
          ? `+${stats.applications.new_this_week} this week`
          : "No new this week",
      icon: "description",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      ring: "ring-blue-100 dark:ring-blue-800",
      onClick: () => onNavigate("applications"),
    },
    {
      label: "Active Courses",
      value: stats.courses.total,
      sub:
        stats.courses.total_seats > 0
          ? `${stats.courses.total_seats.toLocaleString()} seats total`
          : `${stats.courses.streams} stream${stats.courses.streams !== 1 ? "s" : ""}`,
      icon: "menu_book",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      ring: "ring-emerald-100 dark:ring-emerald-800",
      onClick: () => onNavigate("courses"),
    },
    {
      label: "Avg. Rating",
      value: profile.rating ? Number(profile.rating).toFixed(1) : "—",
      sub:
        profile.totalRatingUser > 0
          ? `${profile.totalRatingUser.toLocaleString()} review${profile.totalRatingUser !== 1 ? "s" : ""}`
          : "No reviews yet",
      icon: "star",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      ring: "ring-amber-100 dark:ring-amber-800",
      onClick: undefined,
    },
    {
      label: "Faculty Members",
      value: stats.faculty.total,
      sub: `${stats.gallery.total} gallery photo${stats.gallery.total !== 1 ? "s" : ""}`,
      icon: "groups",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      ring: "ring-violet-100 dark:ring-violet-800",
      onClick: () => onNavigate("faculty"),
    },
  ];

  // ── Application status breakdown ──────────────────────────────────────────
  const appBreakdown = [
    {
      label: "Submitted",
      count: stats.applications.submitted,
      color: "bg-blue-500",
      text: "text-blue-700",
    },
    {
      label: "Under Review",
      count: stats.applications.under_review,
      color: "bg-amber-500",
      text: "text-amber-700",
    },
    {
      label: "Verified",
      count: stats.applications.verified,
      color: "bg-emerald-500",
      text: "text-emerald-700",
    },
    {
      label: "Enrolled",
      count: stats.applications.enrolled,
      color: "bg-purple-500",
      text: "text-purple-700",
    },
    {
      label: "Rejected",
      count: stats.applications.rejected,
      color: "bg-red-400",
      text: "text-red-600",
    },
  ];
  const totalForBar = stats.applications.total || 1;

  return (
    <div className="space-y-8 pb-24">
      {/* ── Greeting + admission status ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Here's a snapshot of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {profile.college_name}
            </span>
          </p>
          {profile.address && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">
                location_on
              </span>
              {profile.address}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Admission status badge */}
          {profile.admissionStatus !== "unknown" && (
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${
                profile.admissionStatus === "open"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.admissionStatus === "open"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              Admissions{" "}
              {profile.admissionStatus === "open" ? "Open" : "Closed"}
            </span>
          )}

          {/* Verified badge */}
          {profile.verified ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold border border-primary/20">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800">
              <span className="material-symbols-outlined text-[14px]">
                pending
              </span>
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() =>
                onNavigate(
                  action.tab as import("../CollegeDashboardClient").TabId,
                )
              }
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:shadow-md group ${
                action.urgent
                  ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30"
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  action.urgent
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                } group-hover:scale-110 transition-transform`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {action.icon}
                </span>
              </div>
              <span
                className={`text-xs font-semibold leading-tight ${
                  action.urgent
                    ? "text-primary"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {action.label}
              </span>
              {action.urgent && (
                <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Stats cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-all ${
              card.onClick ? "cursor-pointer hover:-translate-y-0.5 group" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`${card.bg} ${card.color} p-3 rounded-xl ring-4 ${card.ring} group-hover:scale-105 transition-transform`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {card.icon}
                </span>
              </div>
              {card.onClick && (
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors text-[18px]">
                  arrow_forward
                </span>
              )}
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1 tabular-nums">
              {card.value}
            </p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {card.label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main two-column content ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent applications */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              Recent Applications
            </h2>
            <button
              onClick={() => onNavigate("applications")}
              className="text-xs font-bold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
            >
              View all
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <span
                className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 mb-3"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                No applications yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Student applications will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-black text-sm shrink-0">
                      {(app.student_name ?? "?").charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                          {app.student_name ?? "Anonymous Student"}
                        </p>
                        <span
                          className={`shrink-0 flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${app.statusClass}`}
                        >
                          <span className="material-symbols-outlined text-[11px]">
                            {app.statusIcon}
                          </span>
                          {app.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {[app.stream_name, app.degree_name, app.course_name]
                          .filter(Boolean)
                          .join(" · ") || "No course specified"}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {app.application_ref}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {app.submittedOn}
                        </span>
                        {app.fees > 0 && (
                          <span
                            className={`text-[10px] font-bold ${
                              app.payment_status === "paid"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {app.amount_paid > 0
                              ? `₹${app.amount_paid.toLocaleString()} paid`
                              : `₹${app.fees.toLocaleString()} pending`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Profile completeness */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
            <h2 className="font-black text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              Profile Health
            </h2>

            {/* Ring + percentage */}
            <div className="flex items-center gap-5 mb-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - profile.profileComplete / 100)}`}
                    className={
                      profile.profileComplete >= 80
                        ? "stroke-emerald-500"
                        : profile.profileComplete >= 50
                          ? "stroke-amber-500"
                          : "stroke-red-400"
                    }
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {profile.profileComplete}%
                  </span>
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">
                  {profile.profileComplete >= 80
                    ? "Great profile!"
                    : profile.profileComplete >= 50
                      ? "Looking good"
                      : "Needs attention"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {profile.profileComplete < 100
                    ? "Complete your profile to attract more students."
                    : "Your profile is 100% complete. 🎉"}
                </p>
              </div>
            </div>

            {/* Checklist items */}
            {[
              { label: "College name", done: !!profile.college_name },
              { label: "Courses added", done: stats.courses.total > 0 },
              { label: "Faculty listed", done: stats.faculty.total > 0 },
              { label: "Gallery photos", done: stats.gallery.total > 0 },
              {
                label: "Admission dates set",
                done: profile.admissionStatus !== "unknown",
              },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2.5 py-1.5">
                <span
                  className={`material-symbols-outlined text-[16px] shrink-0 ${
                    done
                      ? "text-emerald-500"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                  style={done ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {done ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span
                  className={`text-sm ${
                    done
                      ? "text-slate-500 dark:text-slate-400 line-through"
                      : "text-slate-700 dark:text-slate-200 font-medium"
                  }`}
                >
                  {label}
                </span>
                {!done && (
                  <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    To-do
                  </span>
                )}
              </div>
            ))}

            <button
              onClick={() => onNavigate("profile")}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Edit Profile
            </button>
          </div>

          {/* Application breakdown */}
          {stats.applications.total > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h2 className="font-black text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bar_chart
                </span>
                Applications
              </h2>
              <div className="space-y-3">
                {appBreakdown
                  .filter((b) => b.count > 0)
                  .map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between mb-1">
                        <span
                          className={`text-xs font-bold ${b.text} dark:opacity-80`}
                        >
                          {b.label}
                        </span>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                          {b.count}
                          <span className="text-slate-400 font-normal ml-1">
                            ({Math.round((b.count / totalForBar) * 100)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${b.color} transition-all duration-700`}
                          style={{ width: `${(b.count / totalForBar) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Courses & fees snapshot */}
          {stats.courses.total > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h2 className="font-black text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-emerald-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  menu_book
                </span>
                Courses Snapshot
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Courses",
                    value: stats.courses.total,
                    icon: "menu_book",
                  },
                  {
                    label: "Streams",
                    value: stats.courses.streams,
                    icon: "category",
                  },
                  {
                    label: "Min Fees",
                    value: formatCurrency(stats.courses.min_fees),
                    icon: "payments",
                  },
                  {
                    label: "Max Fees",
                    value: formatCurrency(stats.courses.max_fees),
                    icon: "trending_up",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary mb-1 block">
                      {item.icon}
                    </span>
                    <p className="text-xl font-black text-slate-800 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("courses")}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
                Manage Courses
              </button>
            </div>
          )}

          {/* Placement snapshot */}
          {placement && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h2 className="font-black text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-cyan-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
                Placement Snapshot
              </h2>
              <div className="space-y-2">
                {[
                  { label: "Recruiting Companies", value: placement.companies },
                  {
                    label: "Placed Last Year",
                    value: placement.placed_last_year,
                  },
                  { label: "Highest CTC", value: placement.ctc_highest },
                  { label: "Average CTC", value: placement.ctc_average },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("placement")}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-xl font-bold text-xs hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  edit
                </span>
                Update Placement Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-center pt-2">
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh Overview
        </button>
      </div>
    </div>
  );
}
