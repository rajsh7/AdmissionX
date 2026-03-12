"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface ProfileData {
  id: number;
  slug: string;
  college_name: string;
  description: string;
  estyear: string;
  website: string;
  collegecode: string;
  contactpersonname: string;
  contactpersonemail: string;
  contactpersonnumber: string;
  registeredSortAddress: string;
  registeredFullAddress: string;
  campusSortAddress: string;
  campusFullAddress: string;
  mediumOfInstruction: string;
  studyForm: string;
  admissionStart: string;
  admissionEnd: string;
  totalStudent: string;
  universityType: string;
  ranking: string;
  facebookurl: string;
  twitterurl: string;
  bannerimage: string | null;
  rating: number | null;
  totalRatingUser: number;
  verified: number;
  profileComplete: number;
  college_type_name: string | null;
  city_name: string | null;
}

function FieldGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <span
          className="material-symbols-outlined text-[20px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({
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

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
        >
          <div className="h-14 bg-slate-100 dark:bg-slate-800" />
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const MEDIUM_OPTIONS = [
  "English",
  "Hindi",
  "English & Hindi",
  "Regional Language",
  "Other",
];
const STUDY_FORM_OPTIONS = ["Full Time", "Part Time", "Distance", "Online"];
const UNIVERSITY_TYPE_OPTIONS = [
  "Central University",
  "State University",
  "Deemed University",
  "Private University",
  "Open University",
  "Institute of National Importance",
  "Other",
];

export default function ProfileTab({ college }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Banner upload
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields — basic
  const [collegeName, setCollegeName] = useState("");
  const [description, setDescription] = useState("");
  const [estyear, setEstyear] = useState("");
  const [website, setWebsite] = useState("");
  const [collegecode, setCollegecode] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Address
  const [regShort, setRegShort] = useState("");
  const [regFull, setRegFull] = useState("");
  const [campShort, setCampShort] = useState("");
  const [campFull, setCampFull] = useState("");

  // Academics
  const [medium, setMedium] = useState("");
  const [studyForm, setStudyForm] = useState("");
  const [uniType, setUniType] = useState("");
  const [totalStudent, setTotalStudent] = useState("");
  const [ranking, setRanking] = useState("");
  const [admStart, setAdmStart] = useState("");
  const [admEnd, setAdmEnd] = useState("");

  // Social
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/profile`);
      if (!res.ok) throw new Error("Failed to load profile.");
      const data = await res.json();
      const p: ProfileData = data.profile;
      setProfile(p);

      // Populate form
      setCollegeName(p.college_name ?? "");
      setDescription(p.description ?? "");
      setEstyear(p.estyear ?? "");
      setWebsite(p.website ?? "");
      setCollegecode(p.collegecode ?? "");
      setContactName(p.contactpersonname ?? "");
      setContactEmail(p.contactpersonemail ?? "");
      setContactPhone(p.contactpersonnumber ?? "");
      setRegShort(p.registeredSortAddress ?? "");
      setRegFull(p.registeredFullAddress ?? "");
      setCampShort(p.campusSortAddress ?? "");
      setCampFull(p.campusFullAddress ?? "");
      setMedium(p.mediumOfInstruction ?? "");
      setStudyForm(p.studyForm ?? "");
      setUniType(p.universityType ?? "");
      setTotalStudent(p.totalStudent ?? "");
      setRanking(p.ranking ?? "");
      setAdmStart(p.admissionStart ? p.admissionStart.split("T")[0] : "");
      setAdmEnd(p.admissionEnd ? p.admissionEnd.split("T")[0] : "");
      setFacebook(p.facebookurl ?? "");
      setTwitter(p.twitterurl ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college_name: collegeName.trim(),
          description: description.trim(),
          estyear: estyear || null,
          website: website.trim(),
          collegecode: collegecode.trim(),
          contactpersonname: contactName.trim(),
          contactpersonemail: contactEmail.trim(),
          contactpersonnumber: contactPhone.trim(),
          registeredSortAddress: regShort.trim(),
          registeredFullAddress: regFull.trim(),
          campusSortAddress: campShort.trim(),
          campusFullAddress: campFull.trim(),
          mediumOfInstruction: medium,
          studyForm,
          universityType: uniType,
          totalStudent: totalStudent || null,
          ranking: ranking || null,
          admissionStart: admStart || null,
          admissionEnd: admEnd || null,
          facebookurl: facebook.trim(),
          twitterurl: twitter.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile.");
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
      // Re-fetch to sync
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setBannerUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/college/dashboard/${slug}/profile`, {
        method: "PATCH",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Image upload failed.");
      setSuccess("Banner image updated!");
      setTimeout(() => setSuccess(null), 3000);
      setProfile((prev) => (prev ? { ...prev, bannerimage: data.url } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
      setBannerPreview(null);
    } finally {
      setBannerUploading(false);
    }
  }

  if (loading) return <SkeletonForm />;

  const bannerSrc =
    bannerPreview ??
    (profile?.bannerimage
      ? profile.bannerimage.startsWith("http") ||
        profile.bannerimage.startsWith("/")
        ? profile.bannerimage
        : `${process.env.NEXT_PUBLIC_IMAGE_BASE ?? ""}${profile.bannerimage}`
      : null);

  const completePct = profile?.profileComplete ?? 0;
  const completeColor =
    completePct >= 80
      ? "bg-emerald-500"
      : completePct >= 50
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            College Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Edit your college information visible on the public listing page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
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
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4">
          <span
            className="material-symbols-outlined text-red-500 text-[20px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-4">
          <span
            className="material-symbols-outlined text-emerald-500 text-[20px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {success}
          </p>
        </div>
      )}

      {/* Profile completeness */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[18px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              analytics
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Profile Completeness
            </span>
          </div>
          <span
            className={`text-sm font-black ${
              completePct >= 80
                ? "text-emerald-600"
                : completePct >= 50
                  ? "text-amber-500"
                  : "text-red-500"
            }`}
          >
            {completePct}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${completeColor}`}
            style={{ width: `${completePct}%` }}
          />
        </div>
        {completePct < 80 && (
          <p className="text-xs text-slate-400 mt-2">
            Fill in more fields below to improve your profile visibility.
          </p>
        )}
      </div>

      {/* ── Banner Image ────────────────────────────────────────────── */}
      <FieldGroup title="Banner / Logo Image" icon="image">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Preview */}
          <div
            className="w-full sm:w-64 h-36 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 relative group"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            {bannerSrc ? (
              <>
                <img
                  src={bannerSrc}
                  alt="Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">
                    edit
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center px-4">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-1">
                  add_photo_alternate
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Click to upload
                </span>
              </div>
            )}
            {bannerUploading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                  progress_activity
                </span>
              </div>
            )}
          </div>

          {/* Upload info */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              College Banner / Logo
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a high-quality image representing your college (banner
              photo, campus, or logo). Recommended size: 1200×400px. Max 3 MB.
              Formats: JPEG, PNG, WebP.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={bannerUploading}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">
                  upload
                </span>
                {bannerUploading ? "Uploading…" : "Choose Image"}
              </button>
              {bannerSrc && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerPreview(null);
                    setProfile((prev) =>
                      prev ? { ...prev, bannerimage: null } : prev,
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-500 text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    delete
                  </span>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleBannerChange}
        />
      </FieldGroup>

      {/* ── Basic Information ──────────────────────────────────────── */}
      <FieldGroup title="Basic Information" icon="domain">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="College Name"
            value={collegeName}
            onChange={setCollegeName}
            placeholder="Full official name"
            required
          />
          <InputField
            label="Established Year"
            value={estyear}
            onChange={setEstyear}
            type="number"
            placeholder="e.g. 1995"
          />
          <InputField
            label="College Code"
            value={collegecode}
            onChange={setCollegecode}
            placeholder="DTE/AICTE code"
          />
          <InputField
            label="Website"
            value={website}
            onChange={setWebsite}
            type="url"
            placeholder="https://www.yourcollege.edu"
          />
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Brief description about your college, its history, vision, and mission…"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* ── Academic Details ───────────────────────────────────────── */}
      <FieldGroup title="Academic Details" icon="school">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SelectField
            label="University Type"
            value={uniType}
            onChange={setUniType}
            options={UNIVERSITY_TYPE_OPTIONS}
            placeholder="Select type…"
          />
          <SelectField
            label="Medium of Instruction"
            value={medium}
            onChange={setMedium}
            options={MEDIUM_OPTIONS}
            placeholder="Select medium…"
          />
          <SelectField
            label="Study Form"
            value={studyForm}
            onChange={setStudyForm}
            options={STUDY_FORM_OPTIONS}
            placeholder="Select study form…"
          />
          <InputField
            label="Total Students"
            value={totalStudent}
            onChange={setTotalStudent}
            type="number"
            placeholder="e.g. 5000"
          />
          <InputField
            label="National Ranking"
            value={ranking}
            onChange={setRanking}
            type="number"
            placeholder="e.g. 42"
          />
        </div>
      </FieldGroup>

      {/* ── Admission Window ───────────────────────────────────────── */}
      <FieldGroup title="Admission Window" icon="event">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Admission Start Date"
            value={admStart}
            onChange={setAdmStart}
            type="date"
          />
          <InputField
            label="Admission End Date"
            value={admEnd}
            onChange={setAdmEnd}
            type="date"
          />
        </div>
        {admStart && admEnd && new Date(admEnd) < new Date(admStart) && (
          <p className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">
              warning
            </span>
            End date cannot be before start date.
          </p>
        )}
      </FieldGroup>

      {/* ── Contact Person ─────────────────────────────────────────── */}
      <FieldGroup title="Contact Person" icon="person">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Contact Person Name"
            value={contactName}
            onChange={setContactName}
            placeholder="e.g. Dr. Rajesh Kumar"
          />
          <InputField
            label="Contact Email"
            value={contactEmail}
            onChange={setContactEmail}
            type="email"
            placeholder="admissions@college.edu"
          />
          <InputField
            label="Contact Phone"
            value={contactPhone}
            onChange={setContactPhone}
            type="tel"
            placeholder="+91 98765 43210"
          />
        </div>
      </FieldGroup>

      {/* ── Address ────────────────────────────────────────────────── */}
      <FieldGroup title="Registered Address" icon="location_on">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Short Address"
            value={regShort}
            onChange={setRegShort}
            placeholder="City, State"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Full Address
            </label>
            <textarea
              value={regFull}
              onChange={(e) => setRegFull(e.target.value)}
              rows={2}
              placeholder="Street, Area, City, State, PIN"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      </FieldGroup>

      {/* ── Campus Address ─────────────────────────────────────────── */}
      <FieldGroup title="Campus Address" icon="place">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Campus Short Address"
            value={campShort}
            onChange={setCampShort}
            placeholder="Same as registered or different"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Campus Full Address
            </label>
            <textarea
              value={campFull}
              onChange={(e) => setCampFull(e.target.value)}
              rows={2}
              placeholder="Street, Area, City, State, PIN"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      </FieldGroup>

      {/* ── Social Media ───────────────────────────────────────────── */}
      <FieldGroup title="Social Media" icon="share">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Facebook URL
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <span className="px-3 text-slate-400 text-sm shrink-0">
                facebook.com/
              </span>
              <input
                type="text"
                value={facebook.replace(
                  /^https?:\/\/(www\.)?facebook\.com\//,
                  "",
                )}
                onChange={(e) =>
                  setFacebook(`https://facebook.com/${e.target.value}`)
                }
                placeholder="yourpage"
                className="flex-1 py-2.5 pr-4 bg-transparent text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Twitter / X URL
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <span className="px-3 text-slate-400 text-sm shrink-0">
                twitter.com/
              </span>
              <input
                type="text"
                value={twitter
                  .replace(/^https?:\/\/(www\.)?twitter\.com\//, "")
                  .replace(/^https?:\/\/(www\.)?x\.com\//, "")}
                onChange={(e) =>
                  setTwitter(`https://twitter.com/${e.target.value}`)
                }
                placeholder="yourhandle"
                className="flex-1 py-2.5 pr-4 bg-transparent text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* ── Save button (bottom) ──────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
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
              Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
