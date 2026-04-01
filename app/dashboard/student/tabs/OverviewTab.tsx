"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  photo: string;
  hobbies: string;
  interest: string;
  about: string;
  member_since: string;
  profile_complete: number;
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

interface RecentApp {
  id: number;
  application_ref: string;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  status: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  payment_status: string;
  paymentLabel: string;
  fees: number;
  submittedOn: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-green-50 shadow-sm animate-pulse space-y-3">
      <div className="h-3 bg-green-50 rounded-lg w-1/2" />
      <div className="h-8 bg-green-50 rounded-lg w-1/3" />
      <div className="h-2 bg-green-50 rounded-lg w-2/3" />
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  accent,
  trend,
  trendUp,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-green-50 shadow-sm border-l-4 ${accent} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${iconColor}`}
          >
            {icon}
          </span>
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trendUp ? "▲" : "▼"} {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
      {sub && (
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{sub}</p>
      )}
    </div>
  );
}

function RingProgress({
  percent,
  size = 130,
  stroke = 11,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circ - (clamped / 100) * circ;
  const color =
    clamped >= 80 ? "#16a34a" : clamped >= 50 ? "#f59e0b" : "#ef4444";
  const track =
    clamped >= 80 ? "#dcfce7" : clamped >= 50 ? "#fef3c7" : "#fee2e2";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={track}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="900"
        fill={color}
        fontFamily="Lexend, sans-serif"
      >
        {clamped}%
      </text>
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontWeight="700"
        fill="#94a3b8"
        fontFamily="Lexend, sans-serif"
      >
        COMPLETE
      </text>
    </svg>
  );
}

const JOURNEY_STEPS = [
  { key: "profile", label: "Profile Setup",  phase: "Phase 1", icon: "person"  },
  { key: "marks",   label: "Academic Marks", phase: "Phase 2", icon: "grade"   },
  { key: "docs",    label: "Documents",      phase: "Phase 3", icon: "folder"  },
  { key: "apply",   label: "Apply",          phase: "Phase 4", icon: "send"    },
  { key: "enroll",  label: "Enrolment",      phase: "Phase 5", icon: "school"  },
];

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function OverviewTab({ user }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats,   setStats]   = useState<AppStats | null>(null);
  const [recent,  setRecent]  = useState<RecentApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [profRes, appRes] = await Promise.all([
        fetch(`/api/student/${user.id}/profile`),
        fetch(`/api/student/${user.id}/applications`),
      ]);
      if (!profRes.ok) throw new Error("Failed to load profile");
      if (!appRes.ok)  throw new Error("Failed to load applications");

      const profData = await profRes.json();
      const appData  = await appRes.json();

      setProfile(profData);
      setStats(appData.stats);
      setRecent((appData.applications ?? []).slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const firstName   = (profile?.name ?? user?.name ?? "Student").split(" ")[0];
  const profilePct  = profile?.profile_complete ?? 0;
  const appDone     = (stats?.total ?? 0) > 0;
  const enrollDone  = (stats?.enrolled ?? 0) > 0;
  const stepsDone   = [profilePct >= 60, false, false, appDone, enrollDone];
  const currentStep = stepsDone.lastIndexOf(true) + 1;

  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  const reportRows = stats
    ? [
        { label: "Submitted",    count: stats.submitted,    icon: "send",         color: "text-blue-600",   bg: "bg-blue-50",   bar: "bg-blue-500"   },
        { label: "Under Review", count: stats.under_review, icon: "schedule",     color: "text-amber-600",  bg: "bg-amber-50",  bar: "bg-amber-400"  },
        { label: "Verified",     count: stats.verified,     icon: "check_circle", color: "text-green-600",  bg: "bg-green-50",  bar: "bg-green-500"  },
        { label: "Enrolled",     count: stats.enrolled,     icon: "school",       color: "text-purple-600", bg: "bg-purple-50", bar: "bg-purple-500" },
        { label: "Rejected",     count: stats.rejected,     icon: "cancel",       color: "text-red-500",    bg: "bg-red-50",    bar: "bg-red-400"    },
      ]
    : [];

  const checklistItems = [
    { label: "Full Name",     done: !!profile?.name,                      icon: "badge"       },
    { label: "Phone Number",  done: !!profile?.phone,                     icon: "phone"       },
    { label: "Date of Birth", done: !!profile?.dob,                       icon: "cake"        },
    { label: "Gender",        done: !!profile?.gender,                    icon: "person"      },
    { label: "City & State",  done: !!(profile?.city && profile?.state),  icon: "location_on" },
    { label: "About You",     done: !!profile?.about,                     icon: "edit_note"   },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-red-400">
            error_outline
          </span>
        </div>
        <p className="text-slate-600 font-semibold">{error}</p>
        <button
          onClick={load}
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md shadow-green-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════════════════════════════════════
          WELCOME BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-500 rounded-2xl p-6 overflow-hidden shadow-lg shadow-green-200">
        {/* Decorative blobs */}
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-28 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 bottom-2 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/70 text-sm font-medium">
                {getGreeting()} 👋
              </span>
              {memberSince && (
                <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full tracking-wide">
                  Member since {memberSince}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Welcome back, {firstName}!
            </h1>

            <p className="text-white/75 text-sm max-w-md leading-relaxed">
              {stats?.total
                ? (
                  <>
                    You have{" "}
                    <span className="font-bold text-white">{stats.total}</span>{" "}
                    application{stats.total !== 1 ? "s" : ""} on AdmissionX.
                    {(stats.pending_pay ?? 0) > 0 && (
                      <>
                        {" "}
                        <span className="text-yellow-200 font-bold">
                          {stats.pending_pay} payment{stats.pending_pay !== 1 ? "s" : ""} pending.
                        </span>
                      </>
                    )}
                  </>
                )
                : "Start your journey — complete your profile and apply to top colleges."
              }
            </p>

            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <span className="text-[11px] text-white/60 font-semibold">
                ID:{" "}
                <span className="font-black text-white/90">
                  ADX-{String(user?.id ?? 0).padStart(5, "0")}
                </span>
              </span>
              {profile?.city && profile?.state && (
                <span className="text-[11px] text-white/60 font-medium inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">
                    location_on
                  </span>
                  {profile.city}, {profile.state}
                </span>
              )}
              <span className="text-[11px] text-white/60 font-medium inline-flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">mail</span>
                {user?.email}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2.5 flex-shrink-0 flex-wrap">
            <button className="px-4 py-2.5 bg-white/15 border border-white/30 text-white font-bold rounded-xl text-sm hover:bg-white/25 transition-colors backdrop-blur-sm">
              View Timeline
            </button>
            <a
              href="/colleges"
              className="px-4 py-2.5 bg-white text-green-700 font-bold rounded-xl text-sm shadow-md hover:shadow-lg hover:bg-green-50 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Application
            </a>
          </div>
        </div>
      </div>

      {/* ── Pending payment alert bar ───────────────────────────────────────── */}
      {(stats?.pending_pay ?? 0) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-amber-500 text-[20px] flex-shrink-0">
            notifications_active
          </span>
          <p className="text-amber-700 text-sm font-semibold flex-1">
            You have{" "}
            <strong>{stats!.pending_pay}</strong>{" "}
            verified application{stats!.pending_pay !== 1 ? "s" : ""} awaiting fee payment.
            Pay now to confirm your seat!
          </p>
          <button className="flex-shrink-0 text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap">
            Pay Now
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ROW 1 — Four Stat Cards
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={String(stats?.total ?? 0).padStart(2, "0")}
          sub={stats?.submitted ? `${stats.submitted} submitted` : "No apps yet"}
          icon="description"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          accent="border-l-green-500"
          trend={stats?.submitted ? `${stats.submitted} new` : undefined}
          trendUp
        />
        <StatCard
          title="Profile Strength"
          value={`${profilePct}%`}
          sub={profilePct >= 100 ? "Profile complete!" : `${100 - profilePct}% remaining`}
          icon="manage_accounts"
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          accent="border-l-amber-400"
          trend={profilePct >= 80 ? "Strong" : profilePct >= 50 ? "Fair" : "Weak"}
          trendUp={profilePct >= 60}
        />
        <StatCard
          title="Under Review"
          value={String(stats?.under_review ?? 0).padStart(2, "0")}
          sub={stats?.verified ? `${stats.verified} verified` : "Awaiting review"}
          icon="manage_search"
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          accent="border-l-blue-500"
        />
        <StatCard
          title="Enrolled / Confirmed"
          value={String(stats?.enrolled ?? 0).padStart(2, "0")}
          sub={stats?.rejected ? `${stats.rejected} rejected` : "Keep applying!"}
          icon="school"
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          accent="border-l-purple-500"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ROW 2 — Main grid: Left (report + table) / Right (ring + journey)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (8 cols) ─────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* ── General Report Card ── */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-[16px]">
                    bar_chart
                  </span>
                </div>
                <h2 className="font-black text-slate-800 text-[15px]">
                  General Report
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
                All Time
              </span>
            </div>

            <div className="p-6">
              {stats && stats.total > 0 ? (
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Big total number */}
                  <div className="flex-shrink-0 min-w-[140px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      Total Applications
                    </p>
                    <p className="text-6xl font-black text-green-600 leading-none">
                      {stats.total}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-green-600">
                        Active Tracking
                      </span>
                    </div>
                    <div className="mt-4 space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                        Success Rate
                      </p>
                      <p className="text-2xl font-black text-slate-700">
                        {stats.total > 0
                          ? `${Math.round(
                              ((stats.enrolled + stats.verified) / stats.total) * 100,
                            )}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>

                  {/* Vertical divider */}
                  <div className="hidden sm:block w-px bg-slate-100 self-stretch" />

                  {/* Status rows */}
                  <div className="flex-1 space-y-4">
                    {reportRows.map((row) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 ${row.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] ${row.color}`}
                          >
                            {row.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-500">
                              {row.label}
                            </span>
                            <span className={`text-xs font-black ${row.color}`}>
                              {row.count}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`${row.bar} h-full rounded-full transition-all duration-700`}
                              style={{
                                width:
                                  stats.total > 0
                                    ? `${(row.count / stats.total) * 100}%`
                                    : "0%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">
                    bar_chart
                  </span>
                  <p className="text-slate-400 text-sm font-medium">
                    No data yet. Submit your first application to see analytics.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-100">
                  <span className="material-symbols-outlined text-[14px]">
                    download
                  </span>
                  Download Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                  <span className="material-symbols-outlined text-[14px]">
                    table_chart
                  </span>
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* ── Recent Applications Table ── */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-[16px]">
                    list_alt
                  </span>
                </div>
                <h2 className="font-black text-slate-800 text-[15px]">
                  Weekly Top Applications
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">download</span>
                  Export to Excel
                </button>
                <button className="text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">picture_as_pdf</span>
                  Export to PDF
                </button>
              </div>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-green-300">
                    description
                  </span>
                </div>
                <p className="text-slate-600 font-bold text-sm">
                  No applications yet
                </p>
                <p className="text-slate-400 text-xs text-center max-w-xs">
                  Browse colleges and click &ldquo;Apply&rdquo; to start your admission journey.
                </p>
                <a
                  href="/colleges"
                  className="mt-1 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                >
                  Browse Colleges
                </a>
              </div>
            ) : (

              <>
                {/* ── Table header ── */}
                <div className="hidden sm:grid grid-cols-[auto_2fr_1.2fr_1fr_auto] gap-3 px-6 py-2.5 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <span className="w-9">IMG</span>
                  <span>College / Course</span>
                  <span>Stock / Ref</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {/* ── Table body ── */}
                <div className="divide-y divide-slate-50">
                  {recent.map((app) => (
                    <div
                      key={app.id}
                      className="grid grid-cols-1 sm:grid-cols-[auto_2fr_1.2fr_1fr_auto] gap-3 items-center px-6 py-4 hover:bg-green-50/40 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-green-200 items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-green-600 text-[18px]">account_balance</span>
                      </div>

                      {/* College + Course */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-green-700 transition-colors">
                          {app.college_name ?? "College"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {[app.degree_name, app.course_name].filter(Boolean).join(" · ") || "Course N/A"}
                        </p>
                      </div>

                      {/* Ref + progress bar */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-600 font-mono">#{app.application_ref}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-700"
                              style={{ width: app.progress + "%" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{app.progress}%</span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider " + app.statusClass}>
                          <span className="material-symbols-outlined text-[11px]">{app.statusIcon}</span>
                          {app.statusLabel}
                        </span>
                        {app.payment_status === "pending" && app.fees > 0 && (
                          <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">payments</span>
                            &#8377;{app.fees.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button className="text-[11px] font-bold text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors border border-green-200">
                          Edit
                        </button>
                        <button className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors border border-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Pagination ── */}
                <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-600">{recent.length}</strong>{" "}
                    of{" "}
                    <strong className="text-slate-600">{stats?.total ?? 0}</strong>{" "}
                    applications
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      1
                    </button>
                    <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                    <select className="ml-2 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:ring-1 focus:ring-green-300">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT COLUMN (4 cols)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Profile Strength Ring — Rubick "Users by Age" style */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-[16px]">manage_accounts</span>
                </div>
                <h2 className="font-black text-slate-800 text-[15px]">Profile Strength</h2>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Active
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                  Inactive
                </span>
              </div>
            </div>

            {/* Circular ring */}
            <div className="flex flex-col items-center py-4">
              <RingProgress percent={profilePct} size={140} stroke={12} />
              <p className="text-center mt-3 text-sm font-black text-slate-700">
                {profilePct >= 100
                  ? "Profile Complete!"
                  : profilePct >= 60
                  ? "Almost There!"
                  : "Complete Your Profile"}
              </p>
              <p className="text-center text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                {profilePct < 100
                  ? "Fill in missing fields to strengthen your profile."
                  : "Great job! Your profile is fully complete."}
              </p>
            </div>

            {/* Breakdown legend */}
            <div className="space-y-2.5 pt-3 border-t border-slate-50">
              {[
                { label: "17 – 30 Yrs", pct: profilePct,                  color: "bg-green-500" },
                { label: "31 – 50 Yrs", pct: Math.max(0, 100 - profilePct), color: "bg-green-200" },
                { label: "50+ Yrs",     pct: 0,                            color: "bg-slate-100" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 text-xs pt-1">
                  <span className="text-slate-500 w-20 flex-shrink-0 font-medium">{row.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={row.color + " h-full rounded-full transition-all duration-700"}
                      style={{ width: row.pct + "%" }}
                    />
                  </div>
                  <span className="font-bold text-slate-600 w-8 text-right">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Journey Timeline — Rubick "Schedules" style */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-[16px]">timeline</span>
                </div>
                <h2 className="font-black text-slate-800 text-[15px]">Your Journey</h2>
              </div>
              <button className="text-[10px] font-bold text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">add</span>
                Add New
              </button>
            </div>

            <div className="relative pl-8">
              {/* Track */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />
              {/* Progress fill */}
              <div
                className="absolute left-3 top-2 w-0.5 bg-green-500 rounded-full transition-all duration-700"
                style={{
                  height:
                    Math.min(95, (currentStep / Math.max(1, JOURNEY_STEPS.length - 1)) * 95) + "%",
                }}
              />

              <div className="space-y-5">
                {JOURNEY_STEPS.map((step, i) => {
                  const isDone   = stepsDone[i];
                  const isActive = i === currentStep;
                  const dotCls = isDone
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-white border-green-500 text-green-600 ring-4 ring-green-50"
                    : "bg-white border-slate-200 text-slate-300";
                  const phaseCls = isDone || isActive ? "text-green-500" : "text-slate-300";
                  const labelCls = isActive
                    ? "text-slate-900"
                    : isDone
                    ? "text-slate-400"
                    : "text-slate-300";
                  return (
                    <div key={step.key} className="relative flex items-start gap-3">
                      <div className={"absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 " + dotCls}>
                        <span className="material-symbols-outlined text-[12px]">
                          {isDone ? "check" : step.icon}
                        </span>
                      </div>
                      <div className="min-w-0 pb-0.5">
                        <p className={"text-[9px] font-extrabold uppercase tracking-widest " + phaseCls}>
                          {step.phase}
                        </p>
                        <p className={"text-sm font-bold " + labelCls}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 3 — Important Notes + Transactions + Quick Help
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── "Important Notes" — Profile Checklist ── */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-green-50 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-[16px]">checklist</span>
            </div>
            <h2 className="font-black text-slate-800 text-[15px]">Important Notes</h2>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 pl-9">
            Complete all profile sections to boost your admission chances.
          </p>

          <div className="space-y-2">
            {checklistItems.map((item) => {
              const rowCls   = "flex items-center gap-3 p-2.5 rounded-xl transition-colors " + (item.done ? "bg-green-50/70" : "bg-slate-50");
              const iconWrap = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " + (item.done ? "bg-green-100 text-green-600" : "bg-white border border-slate-200 text-slate-300");
              const textCls  = "text-sm font-semibold " + (item.done ? "line-through text-slate-400" : "text-slate-700");
              const badgeCls = "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full " + (item.done ? "text-green-600 bg-green-100" : "text-amber-500 bg-amber-50");
              return (
                <div key={item.label} className={rowCls}>
                  <div className={iconWrap}>
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={item.done ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.done ? "check_circle" : item.icon}
                    </span>
                  </div>
                  <span className={textCls}>{item.label}</span>
                  <span className={badgeCls}>{item.done ? "Done" : "Pending"}</span>
                </div>
              );
            })}
          </div>

          {profilePct < 100 && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Profile Completion</span>
                <span className="font-black text-green-600">{profilePct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-700"
                  style={{ width: profilePct + "%" }}
                />
              </div>
              <button className="mt-3 w-full py-2.5 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-100">
                Complete Profile Now
              </button>
            </div>
          )}
        </div>

        {/* ── "Transactions" — Recent App Activity ── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-green-50 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[16px]">receipt_long</span>
              </div>
              <h2 className="font-black text-slate-800 text-[15px]">Transactions</h2>
            </div>
            <button className="text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg">
              Show More
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="material-symbols-outlined text-3xl text-slate-200">receipt_long</span>
              <p className="text-slate-400 text-xs font-medium">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.slice(0, 4).map((app) => {
                const amtCls =
                  app.payment_status === "paid"
                    ? "text-green-600"
                    : app.payment_status === "pending"
                    ? "text-amber-500"
                    : "text-red-500";
                return (
                  <div key={app.id} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-green-600 text-[16px]">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-green-700 transition-colors">
                        {app.college_name ?? "College"}
                      </p>
                      <p className="text-[10px] text-slate-400">{app.submittedOn ?? "—"}</p>
                    </div>
                    <span className={"text-xs font-black flex-shrink-0 " + amtCls}>
                      {app.fees > 0
                        ? "₹" + app.fees.toLocaleString("en-IN")
                        : "Free"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Help CTA — Rubick banner style ── */}
        <div className="col-span-12 lg:col-span-3 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg shadow-green-200 p-5 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-white text-[22px]">support_agent</span>
            </div>
            <h3 className="text-base font-black mb-1 leading-tight">Need Help?</h3>
            <p className="text-white/75 text-xs mb-4 leading-relaxed">
              Our counselors are available 24/7 to guide you through the entire admission process.
            </p>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-white text-green-700 text-xs font-black rounded-xl shadow hover:bg-green-50 transition-colors">
                Chat with Counselor
              </button>
              <button className="w-full py-2.5 bg-white/10 text-white text-xs font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                View FAQs
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}




