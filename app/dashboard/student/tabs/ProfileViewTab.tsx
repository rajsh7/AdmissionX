"use client";

import { useState, useEffect, useCallback } from "react";

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
  country: string;
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

interface MarksData {
  class10_board: string;
  class10_school: string;
  class10_year: string;
  class10_percent: string;
  class12_board: string;
  class12_school: string;
  class12_year: string;
  class12_percent: string;
  class12_stream: string;
  grad_university: string;
  grad_college: string;
  grad_program: string;
  grad_year: string;
  grad_percent: string;
}

function RingProgress({ percent }: { percent: number }) {
  const size = 100;
  const stroke = 9;
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central"
        fontSize="18" fontWeight="900" fill={color} fontFamily="Lexend, sans-serif">
        {clamped}%
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central"
        fontSize="8" fontWeight="700" fill="#94a3b8" fontFamily="Lexend, sans-serif">
        PROFILE
      </text>
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="material-symbols-outlined text-green-600 text-[15px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, count }: { icon: string; title: string; count?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-green-600 text-[16px]">{icon}</span>
      </div>
      <h2 className="font-black text-slate-800 text-[15px]">{title}</h2>
      {count && (
        <span className="ml-auto text-[10px] font-black text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default function ProfileViewTab({ user }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats,   setStats]   = useState<AppStats | null>(null);
  const [marks,   setMarks]   = useState<MarksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [profRes, appRes, marksRes] = await Promise.all([
        fetch(`/api/student/${user.id}/profile`),
        fetch(`/api/student/${user.id}/applications`),
        fetch(`/api/student/${user.id}/marks`),
      ]);
      if (!profRes.ok) throw new Error("Failed to load profile");
      const profData  = await profRes.json();
      const appData   = appRes.ok  ? await appRes.json()  : null;
      const marksData = marksRes.ok ? await marksRes.json() : null;
      setProfile(profData);
      setStats(appData?.stats ?? null);
      setMarks(marksData?.marks ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const initials = (profile?.name ?? user?.name ?? "ST")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  const dob = profile?.dob
    ? new Date(profile.dob).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "";

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        {/* Avatar skeleton */}
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-6 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 bg-green-50 rounded-2xl" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-green-50 rounded-lg w-1/3" />
              <div className="h-4 bg-green-50 rounded-lg w-1/2" />
              <div className="h-4 bg-green-50 rounded-lg w-1/4" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-green-50 shadow-sm p-6 animate-pulse h-40" />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-green-50 shadow-sm p-6 animate-pulse h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 max-w-5xl">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-red-400">error_outline</span>
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

  const profilePct = profile?.profile_complete ?? 0;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── PROFILE HERO CARD ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
        {/* Cover banner */}
        <div
          className="h-28 bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 relative"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Edit profile button */}
          <div className="absolute top-3 right-4">
            <span className="text-[10px] font-black text-white/70 bg-white/15 px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">visibility</span>
              Profile View
            </span>
          </div>
        </div>

        {/* Avatar + basic info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-white font-black text-2xl sm:text-3xl">
                  {initials}
                </span>
              </div>
              {profilePct >= 80 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-white text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {profile?.name ?? user?.name ?? "Student"}
                </h1>
                {profilePct >= 80 && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span
                      className="material-symbols-outlined text-[11px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  ADX-{String(user?.id ?? 0).padStart(5, "0")}
                </span>
                {profile?.city && profile?.state && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                    {profile.city}, {profile.state}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-slate-300">calendar_month</span>
                    Joined {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Profile strength */}
            <div className="flex-shrink-0 sm:pb-1">
              <RingProgress percent={profilePct} />
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Applications", value: stats.total,        icon: "description",   color: "text-green-600",  bg: "bg-green-50",  accent: "border-l-green-500"  },
            { label: "Under Review",       value: stats.under_review, icon: "manage_search", color: "text-blue-600",   bg: "bg-blue-50",   accent: "border-l-blue-500"   },
            { label: "Verified",           value: stats.verified,     icon: "check_circle",  color: "text-purple-600", bg: "bg-purple-50", accent: "border-l-purple-500" },
            { label: "Enrolled",           value: stats.enrolled,     icon: "school",        color: "text-amber-600",  bg: "bg-amber-50",  accent: "border-l-amber-500"  },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-2xl p-4 border border-green-50 shadow-sm border-l-4 ${s.accent} flex items-center gap-3`}
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <span
                  className={`material-symbols-outlined text-[20px] ${s.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 leading-none">{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (8 cols) ──────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
            <SectionHeader icon="person" title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow icon="badge"       label="Full Name"      value={profile?.name ?? ""} />
                <InfoRow icon="mail"        label="Email Address"  value={profile?.email ?? ""} />
                <InfoRow icon="phone"       label="Phone Number"   value={profile?.phone ?? ""} />
                <InfoRow icon="cake"        label="Date of Birth"  value={dob} />
              </div>
              <div>
                <InfoRow icon="person"      label="Gender"         value={profile?.gender ?? ""} />
                <InfoRow icon="location_on" label="City"           value={profile?.city ?? ""} />
                <InfoRow icon="map"         label="State"          value={profile?.state ?? ""} />
                <InfoRow icon="public"      label="Country"        value={profile?.country ?? ""} />
              </div>
            </div>
            {!profile?.phone && !profile?.dob && !profile?.gender && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="font-semibold">Some personal details are missing. Complete your profile to improve your admission chances.</span>
              </div>
            )}
          </div>

          {/* About */}
          {profile?.about && (
            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
              <SectionHeader icon="edit_note" title="About Me" />
              <div className="flex gap-3">
                <div className="w-1 bg-green-400 rounded-full flex-shrink-0 self-stretch" />
                <p className="text-sm text-slate-600 leading-relaxed">{profile.about}</p>
              </div>
            </div>
          )}

          {/* Academic Marks */}
          {marks && (marks.class10_board || marks.class12_board || marks.grad_university) && (
            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
              <SectionHeader icon="grade" title="Academic Qualifications" />
              <div className="space-y-4">

                {/* Class 10 */}
                {marks.class10_board && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600 text-[15px]">school</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">Class 10 — Secondary</span>
                      </div>
                      {marks.class10_percent && (
                        <span className="text-lg font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                          {marks.class10_percent}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {marks.class10_board && (
                        <div>
                          <p className="text-slate-400 font-semibold">Board</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class10_board}</p>
                        </div>
                      )}
                      {marks.class10_school && (
                        <div>
                          <p className="text-slate-400 font-semibold">School</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class10_school}</p>
                        </div>
                      )}
                      {marks.class10_year && (
                        <div>
                          <p className="text-slate-400 font-semibold">Year</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class10_year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Class 12 */}
                {marks.class12_board && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-purple-600 text-[15px]">school</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">Class 12 — Senior Secondary</span>
                      </div>
                      {marks.class12_percent && (
                        <span className="text-lg font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                          {marks.class12_percent}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {marks.class12_board && (
                        <div>
                          <p className="text-slate-400 font-semibold">Board</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class12_board}</p>
                        </div>
                      )}
                      {marks.class12_school && (
                        <div>
                          <p className="text-slate-400 font-semibold">School</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class12_school}</p>
                        </div>
                      )}
                      {marks.class12_year && (
                        <div>
                          <p className="text-slate-400 font-semibold">Year</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class12_year}</p>
                        </div>
                      )}
                      {marks.class12_stream && (
                        <div>
                          <p className="text-slate-400 font-semibold">Stream</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.class12_stream}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Graduation */}
                {marks.grad_university && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-green-600 text-[15px]">account_balance</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">Graduation</span>
                      </div>
                      {marks.grad_percent && (
                        <span className="text-lg font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                          {marks.grad_percent}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {marks.grad_university && (
                        <div>
                          <p className="text-slate-400 font-semibold">University</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.grad_university}</p>
                        </div>
                      )}
                      {marks.grad_college && (
                        <div>
                          <p className="text-slate-400 font-semibold">College</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.grad_college}</p>
                        </div>
                      )}
                      {marks.grad_program && (
                        <div>
                          <p className="text-slate-400 font-semibold">Program</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.grad_program}</p>
                        </div>
                      )}
                      {marks.grad_year && (
                        <div>
                          <p className="text-slate-400 font-semibold">Year</p>
                          <p className="text-slate-700 font-bold mt-0.5">{marks.grad_year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interests & Hobbies */}
          {(profile?.interest || profile?.hobbies) && (
            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
              <SectionHeader icon="interests" title="Interests &amp; Hobbies" />
              <div className="space-y-4">
                {profile?.interest && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Fields of Interest
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interest.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile?.hobbies && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Hobbies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (4 cols) ─────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-5">

          {/* Profile Completion Card */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
            <SectionHeader icon="manage_accounts" title="Profile Completion" />
            <div className="flex flex-col items-center py-3">
              <RingProgress percent={profilePct} />
              <p className="text-sm font-black text-slate-700 mt-3 text-center">
                {profilePct >= 100
                  ? "Profile Complete!"
                  : profilePct >= 80
                  ? "Almost There!"
                  : profilePct >= 50
                  ? "Good Progress"
                  : "Keep Going!"}
              </p>
            </div>
            {/* Checklist */}
            <div className="space-y-2 mt-2 pt-3 border-t border-slate-50">
              {[
                { label: "Name",         done: !!profile?.name,                          icon: "badge"       },
                { label: "Phone",        done: !!profile?.phone,                         icon: "phone"       },
                { label: "Date of Birth",done: !!profile?.dob,                           icon: "cake"        },
                { label: "Gender",       done: !!profile?.gender,                        icon: "person"      },
                { label: "City & State", done: !!(profile?.city && profile?.state),      icon: "location_on" },
                { label: "About Me",     done: !!profile?.about,                         icon: "edit_note"   },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-300"
                  }`}>
                    <span
                      className="material-symbols-outlined text-[13px]"
                      style={item.done ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.done ? "check_circle" : item.icon}
                    </span>
                  </div>
                  <span className={"text-xs font-semibold " + (item.done ? "line-through text-slate-400" : "text-slate-700")}>
                    {item.label}
                  </span>
                  {item.done ? (
                    <span className="ml-auto text-[9px] font-black text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Done</span>
                  ) : (
                    <span className="ml-auto text-[9px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-5">
            <SectionHeader icon="bolt" title="Quick Actions" />
            <div className="space-y-2">
              {[
                { label: "Edit Profile",          icon: "edit",              href: "#account-details" },
                { label: "Update Address",        icon: "location_on",       href: "#address"         },
                { label: "Add Academic Marks",    icon: "grade",             href: "#academic-details"},
                { label: "Upload Documents",      icon: "upload_file",       href: "#academic-certificates" },
                { label: "Browse Colleges",       icon: "account_balance",   href: "/colleges"        },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <span className="material-symbols-outlined text-green-600 text-[16px]">{action.icon}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-green-700 transition-colors flex-1">{action.label}</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-green-400 transition-colors">chevron_right</span>
                </a>
              ))}
            </div>
          </div>

          {/* Share profile card */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg shadow-green-200 p-5 text-white relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-white text-[22px]">share</span>
              </div>
              <h3 className="font-black text-base mb-1">Share Your Profile</h3>
              <p className="text-white/70 text-xs mb-4 leading-relaxed">
                Share your AdmissionX profile with colleges and counselors to get personalised guidance.
              </p>
              <button className="w-full py-2.5 bg-white text-green-700 text-xs font-black rounded-xl shadow hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Profile Link
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}




