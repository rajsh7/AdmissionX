"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import Image from "next/image";

interface Props {
  college: CollegeUser;
}

interface StreamOption {
  id: number;
  name: string;
}

interface FacultyMember {
  id: number;
  name: string;
  suffix: string | null;
  designation: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  languageKnown: string | null;
  imagename: string | null;
  session: string | null;
  sortorder: number;
  created_at: string;
  stream_name: string | null;
  image_url: string | null;
  // New fields
  dob?: string | null;
  personal_contact?: string | null;
  address1?: string | null;
  address2?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  qualifications?: string[] | string | null;
  experience?: any[] | string | null;
}

const EMPTY_FORM = {
  name: "",
  suffix: "",
  designation: "",
  description: "",
  email: "",
  phone: "",
  gender: "",
  languageKnown: "",
  session: "2024-25",
  sortorder: "0",
  functionalarea_id: "",
  // New fields
  dob: "",
  personal_contact: "",
  address1: "",
  address2: "",
  landmark: "",
  pincode: "",
  country: "",
  state: "",
  city: "",
};

const SUFFIX_OPTIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Er."];
const GENDER_OPTIONS = ["Male", "Female", "Other"];

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function LegendInput({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="w-full mb-6">
      <div className="relative border border-slate-200 dark:border-slate-700 rounded-[5px] px-4 pt-5 pb-2 focus-within:border-primary transition-colors bg-white dark:bg-slate-900">
        <label className="absolute -top-[12px] left-3 bg-white dark:bg-slate-900 px-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400 z-10">
          {label}
        </label>
        {children}
      </div>
      {hint && <p className="text-[12px] text-slate-400 mt-1 italic pl-1">{hint}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-8 mb-6">
      <h3 className="text-[15px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
        {title}
      </h3>
    </div>
  );
}

// ── Photo picker ───────────────────────────────────────────────────────────────
function PhotoPicker({
  currentUrl,
  onChange,
}: {
  currentUrl: string | null;
  onChange: (file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File | null) {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
    if (f.size > 2 * 1024 * 1024) return;
    onChange(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  const shown = preview ?? currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative w-24 h-24 rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
          ${dragging ? "border-primary bg-primary/5" : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"}`}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        {shown ? (
          <Image src={shown} alt="photo" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-1">
            <span
              className="material-symbols-rounded text-2xl text-slate-400"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              person
            </span>
            <span className="text-[10px] text-slate-400 text-center px-1">
              Add Photo
            </span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {shown && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onChange(null);
          }}
          className="text-xs text-red-500 hover:underline"
        >
          Remove photo
        </button>
      )}
      <p className="text-[10px] text-slate-400 text-center">
        JPEG, PNG or WebP · max 2 MB
      </p>
    </div>
  );
}

// ── Add/Edit Modal ─────────────────────────────────────────────────────────────
function FacultyForm({
  member,
  streams,
  slug,
  onCancel,
  onSaved,
}: {
  member: FacultyMember | null;
  streams: StreamOption[];
  slug: string;
  onCancel: () => void;
  onSaved: (m: FacultyMember) => void;
}) {
  const isEdit = !!member;
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(member
      ? {
        name: member.name,
        suffix: member.suffix ?? "",
        designation: member.designation ?? "",
        description: member.description ?? "",
        email: member.email ?? "",
        phone: member.phone ?? "",
        gender: member.gender ?? "",
        languageKnown: member.languageKnown ?? "",
        session: member.session ?? "2024-25",
        sortorder: String(member.sortorder ?? "0"),
        functionalarea_id: "",
        dob: member.dob ?? "",
        address1: member.address1 ?? "",
        address2: member.address2 ?? "",
        landmark: member.landmark ?? "",
        pincode: member.pincode ?? "",
        country: member.country ?? "",
        state: member.state ?? "",
        city: member.city ?? "",
      }
      : {}),
  });

  const [qualifications, setQualifications] = useState<string[]>(
    member ? (typeof member.qualifications === 'string' ? JSON.parse(member.qualifications) : (member.qualifications || [])) : []
  );
  const [experiences, setExperiences] = useState<any[]>(
    member ? (typeof member.experience === 'string' ? JSON.parse(member.experience) : (member.experience || [])) : []
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [contactFile, setContactFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof EMPTY_FORM, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addQualification() {
    setQualifications([...qualifications, ""]);
  }

  function updateQualification(idx: number, val: string) {
    const next = [...qualifications];
    next[idx] = val;
    setQualifications(next);
  }

  function removeQualification(idx: number) {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  }

  function addExperience() {
    setExperiences([...experiences, { organization: "", role: "", from_year: "", to_year: "", city: "" }]);
  }

  function updateExperience(idx: number, field: string, val: string) {
    const next = [...experiences];
    next[idx] = { ...next[idx], [field]: val };
    setExperiences(next);
  }

  function removeExperience(idx: number) {
    setExperiences(experiences.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Faculty name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") fd.append(k, v);
    });
    fd.append("qualifications", JSON.stringify(qualifications));
    fd.append("experience", JSON.stringify(experiences));

    if (photoFile) fd.append("file", photoFile);
    if (contactFile) fd.append("contact_file", contactFile);

    const url = isEdit
      ? `/api/college/dashboard/${slug}/faculty?facultyId=${member!.id}`
      : `/api/college/dashboard/${slug}/faculty`;

    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", body: fd });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      setSaving(false);
      return;
    }

    onSaved(data.faculty);
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors group mr-2"
            title="Go back to list"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
          </button>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span
              className="material-symbols-rounded text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
              {isEdit ? "Edit Faculty Member" : "Add Faculty Member"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit ? "Update details below" : "Fill in the details below"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-2"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-2">
        {/* Section 1: Personal Details */}
        <SectionHeader title="Faculty Personal Details" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LegendInput label="Profile Picture">
            <input
              type="file"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="w-full text-[13px] text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 appearance-none"
            />
          </LegendInput>

          <LegendInput label="Suffix">
            <select
              value={form.suffix}
              onChange={(e) => set("suffix", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">-- Select on option --</option>
              {SUFFIX_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </LegendInput>

          <LegendInput label="Faculty Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Enter Faculty name"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LegendInput label="Faculty Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Enter faculty email address"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput label="Date of Birth">
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput label="Gender">
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">-- Select on option --</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </LegendInput>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LegendInput label="Faculty CV / Contact Doc">
            <input
              type="file"
              onChange={(e) => setContactFile(e.target.files?.[0] ?? null)}
              className="w-full text-[13px] text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </LegendInput>

          <LegendInput label="Designation">
            <select
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">-- Select on option --</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="HOD">HOD</option>
              <option value="Principal">Principal</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </LegendInput>
        </div>

        <LegendInput label="Language Known ( If add multiple language please use comma ( , ) ex : English, Hindi, Urdu etc... )">
          <input
            type="text"
            value={form.languageKnown}
            onChange={(e) => set("languageKnown", e.target.value)}
            placeholder="Enter Language known here"
            className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
          />
        </LegendInput>

        {/* Section 2: Address Details */}
        <SectionHeader title="Faculty Address Details" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LegendInput label="Address Line 1">
            <input
              type="text"
              value={form.address1}
              onChange={(e) => set("address1", e.target.value)}
              placeholder="Enter address line 1"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>
          <LegendInput label="Address Line 2">
            <input
              type="text"
              value={form.address2}
              onChange={(e) => set("address2", e.target.value)}
              placeholder="Enter address line 2"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>
          <LegendInput label="Landmark">
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => set("landmark", e.target.value)}
              placeholder="Enter landmark"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LegendInput label="Pin code">
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              placeholder="Enter Pin code"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>
          <LegendInput label="Country">
            <select
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">-- Select on option --</option>
              <option value="India">India</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </LegendInput>
          <LegendInput label="State">
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">-- Select on option --</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </LegendInput>
        </div>

        <LegendInput label="City">
          <select
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
          >
            <option value="">-- Select on option --</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Lucknow">Lucknow</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none text-[18px]">expand_more</span>
        </LegendInput>

        {/* Section 3: Bio/Description */}
        <SectionHeader title="Faculty Description / Bio" />
        <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex gap-4">
            <button type="button" className="font-bold hover:text-primary transition-colors">B</button>
            <button type="button" className="font-bold underline hover:text-primary transition-colors">U</button>
            <button type="button" className="italic hover:text-primary transition-colors">I</button>
            <div className="w-px h-4 bg-slate-300 mx-1 align-middle mt-1" />
            <button type="button" className="hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
            <button type="button" className="hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
            </button>
            <button type="button" className="hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">format_align_left</span>
            </button>
          </div>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="write here..."
            className="w-full px-4 py-3 outline-none text-[14px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 resize-none font-poppins"
          />
        </div>

        {/* Section 4: Qualification */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-slate-700 dark:text-slate-200">Faculty Qualification</h3>
            <button
              type="button"
              onClick={addQualification}
              className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-5 py-2 rounded-[5px] font-bold text-[13px] transition-all shadow-sm"
            >
              + Add Qualification
            </button>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">LIST OF ALL QUALIFICATION</p>

          <div className="space-y-4 mb-10">
            {qualifications.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-400">No qualifications added yet.</p>
              </div>
            ) : (
              qualifications.map((q, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-1">
                    <LegendInput label={`Qualification #${idx + 1}`}>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateQualification(idx, e.target.value)}
                        placeholder="e.g. PhD in Computer Science"
                        className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                      />
                    </LegendInput>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQualification(idx)}
                    className="h-[58px] w-[58px] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 5: Experience */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-slate-700 dark:text-slate-200">Faculty Experience</h3>
            <button
              type="button"
              onClick={addExperience}
              className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-5 py-2 rounded-[5px] font-bold text-[13px] transition-all shadow-sm"
            >
              + Add Experience
            </button>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">LIST OF ALL Experience</p>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl mb-10">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">Organization Name</th>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">Role</th>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">From Year</th>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">To Year</th>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">City</th>
                  <th className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {experiences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400 italic">No experience records added.</td>
                  </tr>
                ) : (
                  experiences.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <input className="w-full px-2 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded outline-none focus:border-primary/30" value={exp.organization} onChange={e => updateExperience(idx, "organization", e.target.value)} placeholder="Org Name" />
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full px-2 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded outline-none focus:border-primary/30" value={exp.role} onChange={e => updateExperience(idx, "role", e.target.value)} placeholder="Role" />
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full px-2 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded outline-none focus:border-primary/30" value={exp.from_year} onChange={e => updateExperience(idx, "from_year", e.target.value)} placeholder="YYYY" />
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full px-2 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded outline-none focus:border-primary/30" value={exp.to_year} onChange={e => updateExperience(idx, "to_year", e.target.value)} placeholder="YYYY" />
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full px-2 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded outline-none focus:border-primary/30" value={exp.city} onChange={e => updateExperience(idx, "city", e.target.value)} placeholder="City" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => removeExperience(idx)} className="text-red-500 font-bold hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Department Connection */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-[14px] font-bold text-slate-700 dark:text-slate-200 mb-3">Which departments are connected, add them here</h3>
          <div className="bg-[#FFF4F4] border border-[#FFDADA] rounded-[5px] px-5 py-4 mb-12">
            <p className="text-[12px] text-[#FF3C3C] font-semibold leading-relaxed">
              THE COLLEGE HAS NOT ADDED ANY COURSE, UPDATE THE COURSE FIRST, THEN YOU CAN ASSOCIATE WITH THAT COURSE.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Submit Footer */}
        <div className="flex justify-center pt-8 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-28 py-4 rounded-[8px] font-bold text-[18px] transition-all shadow-xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50 min-w-[300px]"
          >
            {saving ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({
  member,
  slug,
  onClose,
  onDeleted,
}: {
  member: FacultyMember;
  slug: string;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const res = await fetch(
      `/api/college/dashboard/${slug}/faculty?facultyId=${member.id}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to delete.");
      setDeleting(false);
      return;
    }
    onDeleted(member.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <span
            className="material-symbols-rounded text-3xl text-red-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            delete
          </span>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            Remove Faculty Member?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {member.suffix ? `${member.suffix} ` : ""}
              {member.name}
            </span>{" "}
            will be permanently removed.
          </p>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing…
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Faculty Card ───────────────────────────────────────────────────────────────
function FacultyCard({
  member,
  onEdit,
  onDelete,
}: {
  member: FacultyMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const displayName = [member.suffix, member.name].filter(Boolean).join(" ");
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-primary/5">
          {member.image_url ? (
            <Image
              src={member.image_url}
              alt={member.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug truncate">
            {displayName}
          </h3>
          {member.designation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {member.designation}
            </p>
          )}
          {member.stream_name && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
              <span
                className="material-symbols-rounded text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              {member.stream_name}
            </span>
          )}
          {/* Contact row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            {member.email && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span
                  className="material-symbols-rounded text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  mail
                </span>
                <span className="truncate max-w-[140px]">{member.email}</span>
              </span>
            )}
            {member.phone && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span
                  className="material-symbols-rounded text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  call
                </span>
                {member.phone}
              </span>
            )}
          </div>
          {member.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {member.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            title="Edit"
            className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-primary text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              edit
            </span>
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-red-500 text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function FacultyTab({ college }: Props) {
  const slug = college.slug;

  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [streams, setStreams] = useState<StreamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"list" | "form">("list");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<FacultyMember | null>(null);
  const [deleting, setDeleting] = useState<FacultyMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/faculty`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setFaculty(data.faculty ?? []);
      setStreams(data.options?.streams ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load faculty.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(m: FacultyMember) {
    setFaculty((prev) => {
      const idx = prev.findIndex((f) => f.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = m;
        return next;
      }
      return [m, ...prev];
    });
    setEditing(null);
    setView("list");
  }

  function handleDeleted(id: number) {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    setDeleting(null);
  }

  function openAdd() {
    setEditing(null);
    setView("form");
  }

  function openEdit(m: FacultyMember) {
    setEditing(m);
    setView("form");
  }

  const filtered = faculty.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.designation ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.stream_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    { id: "address", label: "Address" },
    { id: "gallery", label: "Gallery" },
    { id: "achievements", label: "Achievements" },
    { id: "courses", label: "Course" },
    { id: "faculty", label: "Our Faculty" },
    { id: "facilities", label: "Facilities" },
    { id: "events", label: "Events" },
    { id: "scholarships", label: "Scholarship" },
    { id: "placement", label: "Placement" },
    { id: "sports", label: "Sports" },
    { id: "cutoffs", label: "Cutoffs" },
  ];

  return (
    <div className="space-y-6 pb-20 w-full overflow-x-hidden">
      <div className="bg-[#fcfcfc] dark:bg-[#0f1623] min-h-[600px] border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden shadow-sm font-poppins">
        {/* ── Sub-navigation ────────────────────────────────────────────────── */}
        <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === "faculty"; // We are in Faculty Tab
            return (
              <div
                key={tab.id}
                className={`flex items-center gap-2 py-3 px-5 text-[13px] font-bold transition-all cursor-pointer border-r border-slate-100 dark:border-slate-800 shrink-0 ${isActive ? "bg-[#8B3D3D] text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className={`material-symbols-outlined text-[17px] ${isActive ? "text-white" : "text-slate-400"}`}>
                  edit_square
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-8 md:p-12">
          {view === "list" ? (
            <>
              {/* ── Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                    Add New Faculty Member
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your teaching staff with comprehensive details
                  </p>
                </div>
                <button
                  onClick={openAdd}
                  className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  + Add New Faculty member
                </button>
              </div>

              <p className="text-[14px] text-slate-600 dark:text-slate-400 font-bold mb-10">
                College Name : <span className="text-slate-800 dark:text-white font-black">{college.name}</span>
              </p>

              <div className="mb-10">
                {/* Search box */}
                {!loading && faculty.length > 0 && (
                  <div className="relative mb-8 max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search faculty..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                )}

                {/* Content states */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">person_search</span>
                    <p className="text-slate-500 font-bold">No faculty members found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((m) => (
                      <FacultyCard
                        key={m.id}
                        member={m}
                        onEdit={() => openEdit(m)}
                        onDelete={() => setDeleting(m)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <FacultyForm
              member={editing}
              streams={streams}
              slug={slug}
              onCancel={() => {
                setEditing(null);
                setView("list");
              }}
              onSaved={handleSaved}
            />
          )}
        </div>
      </div>


      {deleting && (
        <DeleteConfirm
          member={deleting}
          slug={slug}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
