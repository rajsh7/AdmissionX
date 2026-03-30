"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

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

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function ProfileTab({ user }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields — mirror ProfileData
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [dob, setDob]         = useState("");
  const [gender, setGender]   = useState("");
  const [city, setCity]       = useState("");
  const [state, setState]     = useState("");
  const [country, setCountry] = useState("India");
  const [hobbies, setHobbies] = useState("");
  const [interest, setInterest] = useState("");
  const [about, setAbout]     = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${user.id}/profile`);
      if (!res.ok) throw new Error("Failed to load profile");
      const data: ProfileData = await res.json();
      setProfile(data);
      // Populate form
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
      setDob(data.dob ? data.dob.slice(0, 10) : "");
      setGender(data.gender ?? "");
      setCity(data.city ?? "");
      setState(data.state ?? "");
      setCountry(data.country ?? "India");
      setHobbies(data.hobbies ?? "");
      setInterest(data.interest ?? "");
      setAbout(data.about ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/student/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          dob: dob || null,
          gender: gender || null,
          city: city.trim() || null,
          state: state || null,
          country: country || "India",
          hobbies: hobbies.trim() || null,
          interest: interest.trim() || null,
          about: about.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");
      setSuccess(true);
      // Refresh profile_complete
      await load();
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // Initials for avatar placeholder
  const initials = (name || user?.name || "S")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1">
          Keep your profile up-to-date to improve your admission chances.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700">
          <SkeletonForm />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">

          {/* ── Avatar + basic info card ───────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
                  {profile?.photo ? (
                    <Image
                      src={profile.photo}
                      alt={name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-primary">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-white text-[16px]">
                    photo_camera
                  </span>
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {name || user?.name || "Student"}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">badge</span>
                    ADX-{String(user?.id ?? 0).padStart(5, "0")}
                  </span>
                  {profile?.member_since && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      Member since {new Date(profile.member_since).getFullYear()}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile strength */}
              <div className="shrink-0 text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                      className="stroke-slate-100 dark:stroke-slate-700" />
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 15}
                      strokeDashoffset={2 * Math.PI * 15 * (1 - (profile?.profile_complete ?? 0) / 100)}
                      stroke="#135bec" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-black text-primary leading-none">
                      {profile?.profile_complete ?? 0}%
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
                  Profile
                </p>
              </div>
            </div>

            {/* Section: Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Full Name">
                  <InputField
                    value={name}
                    onChange={setName}
                    placeholder="Your full name"
                  />
                </FieldGroup>

                <FieldGroup label="Email Address" hint="Email cannot be changed here.">
                  <InputField
                    value={user?.email ?? ""}
                    disabled
                    placeholder="Email address"
                  />
                </FieldGroup>

                <FieldGroup label="Phone Number">
                  <InputField
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+91 98765 43210"
                  />
                </FieldGroup>

                <FieldGroup label="Date of Birth">
                  <InputField
                    type="date"
                    value={dob}
                    onChange={setDob}
                  />
                </FieldGroup>

                <FieldGroup label="Gender">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* ── Location card ─────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldGroup label="City">
                <InputField
                  value={city}
                  onChange={setCity}
                  placeholder="Your city"
                />
              </FieldGroup>

              <FieldGroup label="State">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="Country">
                <InputField
                  value={country}
                  onChange={setCountry}
                  placeholder="Country"
                />
              </FieldGroup>
            </div>
          </div>

          {/* ── About & Interests card ────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
              About &amp; Interests
            </h3>

            <div className="space-y-6">
              <FieldGroup
                label="About You"
                hint="A short bio that colleges can read. Max 500 characters."
              >
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell colleges a bit about yourself — your goals, aspirations, and what makes you unique…"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                />
                <div className="flex justify-end">
                  <span className={`text-xs font-semibold ${about.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
                    {about.length}/500
                  </span>
                </div>
              </FieldGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup
                  label="Hobbies"
                  hint="Comma-separated, e.g. Reading, Cricket, Coding"
                >
                  <InputField
                    value={hobbies}
                    onChange={setHobbies}
                    placeholder="Reading, Painting, Football…"
                  />
                </FieldGroup>

                <FieldGroup
                  label="Academic Interests"
                  hint="Subject areas you are passionate about"
                >
                  <InputField
                    value={interest}
                    onChange={setInterest}
                    placeholder="Machine Learning, Finance, Biology…"
                  />
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* ── Feedback + Save ───────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
              <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">error</span>
              <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
              <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                Profile saved successfully!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-50"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
