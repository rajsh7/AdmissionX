"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: number; name: string; email: string } | null;
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
  status: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  progressColor: string;
  payment_status: string;
  fees: number;
  submittedOn: string | null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
    </div>
  );
}

const PROGRESS_STEPS = [
  { key: "profile",  label: "Profile Setup",  phase: "Phase 1" },
  { key: "marks",    label: "Academic Marks", phase: "Phase 2" },
  { key: "docs",     label: "Documents",      phase: "Phase 3" },
  { key: "apply",    label: "Apply",          phase: "Phase 4" },
  { key: "enroll",   label: "Enrolment",      phase: "Phase 5" },
];

export default function OverviewTab({ user }: Props) {
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [stats, setStats]       = useState<AppStats | null>(null);
  const [recent, setRecent]     = useState<RecentApp[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

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
      setRecent((appData.applications ?? []).slice(0, 3));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const firstName = (profile?.name ?? user?.name ?? "Student").split(" ")[0];

  // ── Derive journey progress ──────────────────────────────────────────────
  const profileDone = (profile?.profile_complete ?? 0) >= 60;
  const appDone     = (stats?.total ?? 0) > 0;
  const enrollDone  = (stats?.enrolled ?? 0) > 0;

  const stepsDone = [
    profileDone,
    false, // marks — TODO: hook into marks API
    false, // docs  — TODO: hook into docs API
    appDone,
    enrollDone,
  ];
  const currentStep = stepsDone.lastIndexOf(true) + 1;

  // ── Status breakdown data ────────────────────────────────────────────────
  const statusBreakdown = stats
    ? [
        { label: "Submitted",    count: stats.submitted,    color: "bg-blue-500",    text: "text-blue-600"    },
        { label: "Under Review", count: stats.under_review, color: "bg-amber-400",   text: "text-amber-600"   },
        { label: "Verified",     count: stats.verified,     color: "bg-emerald-500", text: "text-emerald-600" },
        { label: "Enrolled",     count: stats.enrolled,     color: "bg-purple-500",  text: "text-purple-600"  },
        { label: "Rejected",     count: stats.rejected,     color: "bg-red-400",     text: "text-red-600"     },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="lg:col-span-4 space-y-4">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
        <button
          onClick={load}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      {/* ── Welcome banner ──────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            {stats?.total
              ? <>You have <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.total} application{stats.total !== 1 ? "s" : ""}</span> tracked on AdmissionX.</>
              : "Welcome to AdmissionX! Start by completing your profile and submitting your first application."
            }
            {stats?.pending_pay ? (
              <> <span className="font-semibold text-amber-600">{stats.pending_pay} payment{stats.pending_pay !== 1 ? "s" : ""} pending.</span></>
            ) : null}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Student ID:{" "}
            <span className="font-bold text-primary">
              ADX-{String(user?.id ?? 0).padStart(5, "0")}
            </span>
            {profile?.city && profile?.state && (
              <span className="ml-4">
                <span className="material-symbols-outlined text-[11px] align-middle mr-1">location_on</span>
                {profile.city}, {profile.state}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); }}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all text-sm"
          >
            View Timeline
          </a>
          <a
            href="#apply"
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Application
          </a>
        </div>
      </section>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Applications */}
        <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border-l-4 border-primary border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">description</span>
            <span className="text-sm font-bold text-emerald-500">
              {stats?.submitted ? `+${stats.submitted} submitted` : "No apps yet"}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Applications</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {String(stats?.total ?? 0).padStart(2, "0")}
          </p>
        </div>

        {/* Profile Completion */}
        <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border-l-4 border-amber-400 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-amber-500 bg-amber-100 p-2 rounded-lg">person</span>
            <span className="text-sm font-bold text-amber-500">
              {profile?.profile_complete ?? 0}% complete
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Profile Strength</p>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {profile?.profile_complete ?? 0}
              <span className="text-lg">%</span>
            </p>
            <div className="flex-1 pb-1">
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${profile?.profile_complete ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled / Verified */}
        <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-2 rounded-lg">school</span>
            <span className="text-sm font-bold text-emerald-500">
              {stats?.verified ? `${stats.verified} verified` : "Pending review"}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Enrolled / Confirmed</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {String(stats?.enrolled ?? 0).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left column ────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Recent Applications
              </h2>
            </div>

            {recent.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 block mb-3">
                  description
                </span>
                <p className="text-slate-500 font-medium mb-4">No applications yet</p>
                <p className="text-slate-400 text-sm mb-6">
                  Browse colleges and submit your first application to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recent.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-2xl">
                            account_balance
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {app.college_name ?? "College"}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {[app.degree_name, app.course_name].filter(Boolean).join(" • ") || "Course not specified"}
                            {app.submittedOn && <> &nbsp;·&nbsp; {app.submittedOn}</>}
                          </p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider ${app.statusClass}`}>
                        <span className="material-symbols-outlined text-[13px]">{app.statusIcon}</span>
                        {app.statusLabel}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-900 dark:text-white">{app.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-primary"
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                    </div>

                    {app.payment_status === "pending" && app.fees > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-fit">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Fee payment pending — ₹{app.fees.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Status Breakdown */}
          {stats && stats.total > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">donut_small</span>
                Application Status Breakdown
              </h2>
              <div className="space-y-4">
                {statusBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">{s.label}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${s.color} h-full rounded-full transition-all duration-700`}
                        style={{ width: stats.total > 0 ? `${(s.count / stats.total) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className={`text-sm font-black w-6 text-right ${s.text}`}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">

          {/* Profile Completion Card */}
          <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              Profile Checklist
            </h2>
            <div className="space-y-3">
              {[
                { label: "Full Name",    done: !!profile?.name,     icon: "badge"       },
                { label: "Phone Number", done: !!profile?.phone,    icon: "phone"       },
                { label: "Date of Birth",done: !!profile?.dob,      icon: "cake"        },
                { label: "Gender",       done: !!profile?.gender,   icon: "person"      },
                { label: "City / State", done: !!(profile?.city && profile?.state), icon: "location_on" },
                { label: "About You",    done: !!profile?.about,    icon: "edit_note"   },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.done
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {item.done ? "check" : item.icon}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    item.done
                      ? "line-through text-slate-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {(profile?.profile_complete ?? 0) < 100 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 mb-3">
                  Complete your profile to increase your chances of acceptance.
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700"
                    style={{ width: `${profile?.profile_complete ?? 0}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-primary mt-1">
                  {profile?.profile_complete ?? 0}% complete
                </p>
              </div>
            )}
          </div>

          {/* Journey Progress */}
          <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">timeline</span>
              Your Journey
            </h2>
            <div className="relative pl-8">
              {/* Vertical track */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
              {/* Progress fill */}
              <div
                className="absolute left-3 top-0 w-0.5 bg-primary transition-all duration-700"
                style={{ height: `${Math.min(100, (currentStep / (PROGRESS_STEPS.length - 1)) * 100)}%` }}
              />

              <div className="space-y-6">
                {PROGRESS_STEPS.map((step, i) => {
                  const isDone   = stepsDone[i];
                  const isActive = i === currentStep;
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Dot */}
                      <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        isDone
                          ? "bg-primary border-primary text-white"
                          : isActive
                            ? "bg-white dark:bg-slate-900 border-primary text-primary ring-4 ring-primary/10"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-400"
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {isDone ? "check" : "radio_button_unchecked"}
                        </span>
                      </div>

                      <div>
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                          isDone || isActive ? "text-primary" : "text-slate-400"
                        }`}>
                          {step.phase}
                        </p>
                        <p className={`text-sm font-semibold ${
                          isActive
                            ? "text-slate-900 dark:text-white"
                            : isDone
                              ? "text-slate-500"
                              : "text-slate-400"
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick links card */}
          <div className="bg-primary p-6 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Need Help?</h3>
            <p className="text-white/80 text-sm mb-5 relative z-10">
              Our counselors are available 24/7 to guide you through the admission process.
            </p>
            <div className="flex flex-col gap-2 relative z-10">
              <button className="w-full py-2.5 bg-white text-primary font-bold rounded-xl shadow hover:bg-slate-50 transition-colors text-sm">
                Chat with Counselor
              </button>
              <button className="w-full py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20">
                View FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
