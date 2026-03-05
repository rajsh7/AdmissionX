"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: number; name: string; email: string } | null;
}

type TabId = "overview" | "applications" | "payment";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function CircularProgress({
  percent,
  color = "primary",
}: {
  percent: number;
  color?: "primary" | "amber" | "emerald";
}) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const strokeColor =
    color === "amber" ? "#f59e0b" : color === "emerald" ? "#10b981" : "#dc2626";
  const textColor =
    color === "amber"
      ? "text-amber-500"
      : color === "emerald"
        ? "text-emerald-500"
        : "text-primary";

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3"
          className="stroke-slate-100 dark:stroke-slate-700"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          stroke={strokeColor}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-[10px] font-bold ${textColor}`}>{percent}%</span>
      </div>
    </div>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const applications = [
  {
    id: 1,
    university: "Stanford University",
    degree: "B.Sc. Computer Science",
    status: "verified",
    statusLabel: "Verified",
    statusClass: "bg-emerald-100 text-emerald-700",
    statusIcon: "check_circle",
    submittedOn: "Oct 12, 2023",
    deadlineLabel: null,
    progress: 85,
    progressColor: "primary" as const,
    actionLabel: "View Details",
  },
  {
    id: 2,
    university: "MIT",
    degree: "M.S. Robotics Engineering",
    status: "pending",
    statusLabel: "Pending",
    statusClass: "bg-amber-100 text-amber-700",
    statusIcon: "schedule",
    submittedOn: "2 days ago",
    deadlineLabel: null,
    progress: 40,
    progressColor: "amber" as const,
    actionLabel: "Continue Application",
  },
  {
    id: 3,
    university: "Oxford University",
    degree: "B.A. Philosophy & Politics",
    status: "action",
    statusLabel: "Missing Docs",
    statusClass: "bg-red-100 text-primary",
    statusIcon: "warning",
    submittedOn: null,
    deadlineLabel: "In 3 days",
    progress: 95,
    progressColor: "primary" as const,
    actionLabel: "Upload Files",
  },
];

const deadlines = [
  {
    day: "24",
    month: "Oct",
    title: "Princeton Interview",
    sub: "Virtual • 2:00 PM",
    active: true,
  },
  {
    day: "01",
    month: "Nov",
    title: "Early Action Deadline",
    sub: "Harvard, Yale, MIT",
    active: false,
  },
  {
    day: "15",
    month: "Nov",
    title: "SAT Scores Report",
    sub: "College Board Submission",
    active: false,
  },
];

const timelinePhases = [
  { label: "Profile Setup", phase: "Phase 1", done: true, active: false },
  { label: "Documentation", phase: "Phase 2", done: true, active: false },
  { label: "Submission", phase: "Phase 3", done: false, active: true },
  { label: "Response", phase: "Phase 4", done: false, active: false },
  { label: "Enrolment", phase: "Phase 5", done: false, active: false },
];

const filterChips = [
  "All Applications",
  "Pending",
  "Verified",
  "Action Required",
  "Archived",
];

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — Overview
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ user }: { user: Props["user"] }) {
  const name = user?.name ?? "Student";

  return (
    <div className="space-y-10 pb-24">
      {/* Welcome */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {name.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            You're making great progress. You have{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              3 application tasks
            </span>{" "}
            due this week and{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              2 new college recommendations
            </span>{" "}
            waiting.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Student ID:{" "}
            <span className="font-bold text-primary">
              ADX-{String(user?.id ?? 0).padStart(5, "0")}
            </span>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all text-sm">
            View Deadlines
          </button>
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            New Application
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: "description",
            label: "Active Applications",
            value: "12",
            badge: "+2 this week",
            badgeClass: "text-emerald-500",
          },
          {
            icon: "event",
            label: "Upcoming Deadlines",
            value: "05",
            badge: "Next in 2 days",
            badgeClass: "text-primary",
          },
          {
            icon: "school",
            label: "College Matches",
            value: "24",
            badge: "Matches: 98%",
            badgeClass: "text-slate-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border-l-4 border-primary border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                {stat.icon}
              </span>
              <span className={`text-sm font-bold ${stat.badgeClass}`}>
                {stat.badge}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Application Progress */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Application Progress
              </h2>
              <button className="text-primary text-sm font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "Stanford University",
                  type: "Regular Decision",
                  date: "Jan 5, 2024",
                  label: "Finalizing Essays",
                  pct: 75,
                  badge: "High Priority",
                  badgeClass: "bg-primary/10 text-primary",
                  barClass: "bg-primary",
                },
                {
                  name: "MIT",
                  type: "Early Action",
                  date: "Nov 1, 2023",
                  label: "Submitted & Verified",
                  pct: 100,
                  badge: "Completed",
                  badgeClass: "bg-emerald-100 text-emerald-600",
                  barClass: "bg-emerald-500",
                },
              ].map((app) => (
                <div
                  key={app.name}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          school
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {app.type} • {app.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`${app.badgeClass} text-xs font-bold px-3 py-1 rounded-full`}
                    >
                      {app.badge}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {app.label}
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {app.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${app.barClass} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${app.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Colleges */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  match: "98% Match",
                  name: "UC Berkeley",
                  desc: "Computer Science • Public Ivy",
                  bg: "from-blue-900 to-blue-700",
                },
                {
                  match: "95% Match",
                  name: "Georgia Tech",
                  desc: "Engineering • Tech Hub",
                  bg: "from-slate-900 to-yellow-800",
                },
              ].map((col) => (
                <div
                  key={col.name}
                  className={`group relative overflow-hidden rounded-2xl h-48 bg-gradient-to-br ${col.bg}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                      {col.match}
                    </p>
                    <h3 className="text-white font-bold text-lg">{col.name}</h3>
                    <p className="text-white/70 text-sm">{col.desc}</p>
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Deadlines */}
          <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Upcoming Deadlines
            </h2>
            <div className="space-y-6">
              {deadlines.map((d) => (
                <div key={d.title} className="flex gap-4 items-start">
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl min-w-[56px] h-14 ${
                      d.active
                        ? "bg-primary/10"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`font-bold text-lg leading-none ${d.active ? "text-primary" : "text-slate-600 dark:text-slate-300"}`}
                    >
                      {d.day}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${d.active ? "text-primary" : "text-slate-500"}`}
                    >
                      {d.month}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {d.title}
                    </h4>
                    <p className="text-sm text-slate-500">{d.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm">
              <span className="material-symbols-outlined text-lg">
                calendar_today
              </span>
              Sync Calendar
            </button>
          </div>

          {/* Community card */}
          <div className="bg-primary p-6 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-xl font-bold mb-2 relative z-10">
              Join the Community
            </h3>
            <p className="text-white/80 text-sm mb-6 relative z-10">
              Connect with 50,000+ students and admission officers worldwide.
            </p>
            <button className="w-full py-2.5 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors relative z-10">
              Enter Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — My Applications
// ══════════════════════════════════════════════════════════════════════════════
function ApplicationsTab() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = applications.filter((app) => {
    const matchesSearch = searchQuery
      ? app.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.degree.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    if (!matchesSearch) return false;
    if (activeFilter === 0) return true;
    if (activeFilter === 1) return app.status === "pending";
    if (activeFilter === 2) return app.status === "verified";
    if (activeFilter === 3) return app.status === "action";
    return true;
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-slate-900 dark:text-slate-100 text-5xl font-black tracking-tight">
            My Applications
          </h1>
          <p className="text-primary font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            Active tracking for {applications.length} prestigious universities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative min-w-[300px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-300">
              tune
            </span>
            Filters
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {filterChips.map((chip, i) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(i)}
            className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all ${
              activeFilter === i
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-6xl mb-4 block">
            search_off
          </span>
          <p className="text-lg font-medium">No applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              {/* Circular progress */}
              <div className="absolute top-4 right-4">
                <CircularProgress
                  percent={app.progress}
                  color={app.progressColor}
                />
              </div>

              {/* University info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    account_balance
                  </span>
                </div>
                <div className="min-w-0 pr-14">
                  <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white truncate">
                    {app.university}
                  </h3>
                  <p className="text-slate-500 text-xs truncate">
                    {app.degree}
                  </p>
                </div>
              </div>

              {/* Status + date */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider ${app.statusClass}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {app.statusIcon}
                    </span>
                    {app.statusLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {app.submittedOn ? "Submitted on" : "Deadline"}
                  </span>
                  <span
                    className={`font-bold ${
                      app.deadlineLabel
                        ? "text-primary"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {app.submittedOn ?? app.deadlineLabel}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <button className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                  {app.actionLabel}
                </button>
                <button className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    more_horiz
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto hide-scrollbar">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">
            timeline
          </span>
          Global Application Timeline
        </h2>

        <div className="min-w-[700px] flex items-center justify-between relative px-4">
          {/* Background track */}
          <div className="absolute h-1 bg-slate-100 dark:bg-slate-700 w-full left-0 top-1/2 -translate-y-1/2 z-0" />
          {/* Progress fill — 65% done (phase 3 active) */}
          <div
            className="absolute h-1 bg-primary left-0 top-1/2 -translate-y-1/2 z-0 transition-all duration-700"
            style={{ width: "52%" }}
          />

          {timelinePhases.map((phase, i) => (
            <div
              key={phase.label}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <div
                className={`flex items-center justify-center font-bold shadow-sm ${
                  phase.done
                    ? "w-10 h-10 rounded-full bg-primary text-white shadow-primary/30"
                    : phase.active
                      ? "w-12 h-12 rounded-full bg-primary text-white ring-8 ring-primary/10"
                      : "w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 border-2 border-slate-200 dark:border-slate-600"
                }`}
              >
                {phase.done ? (
                  <span className="material-symbols-outlined text-sm">
                    done
                  </span>
                ) : phase.active ? (
                  <span className="material-symbols-outlined text-lg">
                    edit_square
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    {["mail", "school"][i - 3] ?? "radio_button_unchecked"}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-[11px] font-extrabold uppercase tracking-widest ${
                    phase.done || phase.active
                      ? "text-primary"
                      : "text-slate-400"
                  }`}
                >
                  {phase.phase}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    phase.active
                      ? "text-slate-900 dark:text-white font-bold"
                      : phase.done
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400"
                  }`}
                >
                  {phase.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — Apply & Pay
// ══════════════════════════════════════════════════════════════════════════════
function PaymentTab({ user }: { user: Props["user"] }) {
  const [cardName, setCardName] = useState(user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Format card number with spaces
  const formatCard = (val: string) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  // Format MM/YY
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const maskedDisplay = cardNumber
    ? "•••• •••• •••• " + cardNumber.replace(/\s/g, "").slice(-4)
    : "•••• •••• •••• ••••";

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    alert(
      "Payment simulation complete! In production this would connect to a payment gateway.",
    );
  };

  return (
    <div className="pb-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Sidebar: Stepper ── */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
              Checkout
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Finalize your enrollment securement
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="flex flex-col gap-0">
            {/* Step 1 — done */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                  <span className="material-symbols-outlined text-xl">
                    check
                  </span>
                </div>
                <div className="w-[3px] h-16 bg-primary" />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Personal Details
                </h3>
                <p className="text-sm text-primary font-semibold">
                  Verified & Saved
                </p>
              </div>
            </div>

            {/* Step 2 — active */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-4 border-primary bg-white dark:bg-slate-900 text-primary flex items-center justify-center shadow-xl z-10">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div className="w-[3px] h-16 bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Scholarship Selection
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  2 Applied successfully
                </p>
              </div>
            </div>

            {/* Step 3 — pending */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-xl">
                    payments
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-slate-400 dark:text-slate-600">
                  Payment & Finalize
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Awaiting input
                </p>
              </div>
            </div>
          </div>

          {/* Scholarships applied */}
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                redeem
              </span>
              Scholarships Applied
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    workspace_premium
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Merit Scholarship
                  </span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  -15%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">
                    schedule
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Early Bird Reward
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                  -$500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Payment Form ── */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Payment Details
                </h2>
                <p className="text-slate-500 text-sm">
                  Safe & Secure 256-bit encrypted checkout
                </p>
              </div>
              <div className="flex gap-2">
                {["visa", "mastercard", "apple_pay"].map((brand) => (
                  <div
                    key={brand}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      credit_card
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Card visual + summary */}
              <div className="flex flex-col gap-6">
                {/* Card visualization */}
                <div className="relative w-full aspect-[1.6/1] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 text-white shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest opacity-60">
                        AdmissionX Card
                      </span>
                      <div className="h-8 w-12 bg-yellow-400/20 rounded mt-1 border border-yellow-500/50" />
                    </div>
                    <span className="material-symbols-outlined text-3xl">
                      contactless
                    </span>
                  </div>
                  <p className="text-xl tracking-[0.2em] font-medium mb-8">
                    {maskedDisplay}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] uppercase tracking-tighter opacity-60">
                        Card Holder
                      </span>
                      <p className="text-sm font-bold uppercase tracking-wide truncate max-w-[140px]">
                        {cardName || user?.name || "YOUR NAME"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-tighter opacity-60">
                        Expires
                      </span>
                      <p className="text-sm font-bold">{expiry || "MM/YY"}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 blur-3xl pointer-events-none" />
                </div>

                {/* Payment summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tuition Deposit</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      $2,400.00
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Scholarship Credits</span>
                    <span className="font-bold text-primary">-$860.00</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Final Amount
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      $1,540.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Form fields */}
              <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
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
                      onChange={(e) =>
                        setCardNumber(formatCard(e.target.value))
                      }
                      placeholder="0000 0000 0000 0000"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="•••"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        help
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="save-card"
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700"
                  />
                  <label
                    htmlFor="save-card"
                    className="text-xs text-slate-500 cursor-pointer"
                  >
                    Save card information for future application fees
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-primary hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
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
                      PAY $1,540.00
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 px-4">
                  By clicking &apos;Pay&apos;, you agree to AdmissionX&apos;s
                  Terms of Service and Refund Policy.
                </p>
              </form>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                {
                  icon: "verified_user",
                  title: "Secure PCI",
                  sub: "Certified Payment",
                },
                { icon: "lock", title: "Encrypted", sub: "256-bit SSL" },
                {
                  icon: "support_agent",
                  title: "24/7 Support",
                  sub: "Help Center",
                },
              ].map((t) => (
                <div
                  key={t.title}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined text-primary shrink-0">
                    {t.icon}
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase">
                      {t.title}
                    </p>
                    <p className="text-[8px] text-slate-500">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main export — tab shell
// ══════════════════════════════════════════════════════════════════════════════
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "applications", label: "My Applications", icon: "description" },
  { id: "payment", label: "Apply & Pay", icon: "payments" },
];

export default function StudentDashboardClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#201212] font-display">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* ── Push content below the fixed floating navbar (~88px) ── */}
      <div className="pt-[112px]">
        {/* ── Sticky Tab Bar — rounded card with left/right margin ── */}
        <div className="sticky top-[80px] z-40 px-4 sm:px-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 px-2">
              <div className="flex items-center overflow-x-auto hide-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={
                        activeTab === tab.id
                          ? { fontVariationSettings: "'FILL' 1" }
                          : {}
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          {activeTab === "overview" && <OverviewTab user={user} />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "payment" && <PaymentTab user={user} />}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:hidden z-50">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-around py-3 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-slate-400"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={
                  activeTab === tab.id
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold">
                {tab.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
