"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import ManagementTab from "./ManagementTab";
import SettingsTab from "./SettingsTab";

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
  universityType: string;
  college_type_name: string | null;
}

function SkeletonForm() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-12 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  isSelect = false,
  options = [],
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  isSelect?: boolean;
  options?: string[];
}) {
  return (
    <div className="relative mt-4">
      <label className="absolute -top-2 left-6 px-1.5 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <div className="relative">
        {isSelect ? (
          <select
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-400 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all appearance-none cursor-pointer disabled:bg-slate-50"
          >
             <option value="">{placeholder}</option>
             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
          />
        )}
        {isSelect && (
          <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
            expand_more
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfileTab({ college }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"institute" | "settings">("institute");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [estyear, setEstyear] = useState("");
  const [website, setWebsite] = useState("");
  const [universityType, setUniversityType] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [mediumOfInstruction, setMediumOfInstruction] = useState("");
  const [studyFrom, setStudyFrom] = useState("");
  const [studyTo, setStudyTo] = useState("");
  const [admissionStart, setAdmissionStart] = useState("");
  const [admissionEnd, setAdmissionEnd] = useState("");
  const [cctv, setCctv] = useState("No");
  const [acCampus, setAcCampus] = useState("No");
  const [totalStudents, setTotalStudents] = useState("No");

  const slug = college.slug;

  const SUB_TABS = [
    { id: "institute", label: "Institute Profile", icon: "edit_square" },
    { id: "settings", label: "Account Settings / Change Password", icon: "edit_square" },
  ] as const;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/profile`);
      if (!res.ok) throw new Error("Failed to load profile.");
      const data = await res.json();
      const p: ProfileData = data.profile;
      setProfile(p);
      setEstyear(p.estyear ?? "");
      setWebsite(p.website ?? "");
      setUniversityType(p.universityType || "");
      setCollegeCode(p.collegecode || "");
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
          estyear: estyear || null,
          website: website.trim(),
          universityType,
          collegecode: collegeCode,
          contactEmail,
          contactPhone,
          mediumOfInstruction,
          studyFrom,
          studyTo,
          admissionStart,
          admissionEnd,
          cctv,
          acCampus,
          totalStudents
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile.");
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonForm />;

  return (
    <div className="space-y-0 pb-24">
      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div 
        className="flex items-stretch border border-[#8B3D3D] rounded-t-[5px] overflow-hidden bg-white divide-x divide-[#8B3D3D] border-b-0"
      >
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={isActive ? { backgroundColor: '#8B3D3D' } : {}}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold transition-all m-0 border-none outline-none ${
                isActive ? "text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className="material-symbols-outlined text-[18px]">
                {tab.icon}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div className="transition-all duration-300">
        {activeSubTab === "settings" ? (
          <SettingsTab college={college} />
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[5px] text-red-600 text-sm font-bold flex items-center gap-2 mt-4 ml-4 mr-4">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[5px] text-emerald-600 text-sm font-bold flex items-center gap-2 mt-4 ml-4 mr-4">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {success}
              </div>
            )}

            {/* Institute Profile Form */}
            <div className="bg-white rounded-b-[5px] border border-slate-100 shadow-md p-8 md:p-12 border-t-0">
               <div className="grid grid-cols-1 gap-y-10">
                  <LegendInput label="Select University" value={universityType} onChange={setUniversityType} placeholder="Select University" isSelect options={["Amity", "Delhi", "IP", "Other"]} />
                  <LegendInput label="Select College Type" value="" placeholder="Select College Type" isSelect options={["Private", "Government"]} />
                  <LegendInput label="Website" value={website} onChange={setWebsite} placeholder="Enter your url here" />
                  <LegendInput label="Approved By" value="AICTE, UGC, NAAC" placeholder="Select approved type" disabled />
                  <LegendInput label="Established Year" value={estyear} onChange={setEstyear} placeholder="e.g. 1995" type="number" />
                  <LegendInput label="College code" value={collegeCode} onChange={setCollegeCode} placeholder="College code" />
                  <LegendInput label="Contact Person / Administrator office Name" value="" placeholder="Name" />
                  <LegendInput label="Contact Person / Administrator office Email" value={contactEmail} onChange={setContactEmail} placeholder="Email" type="email" />
                  <LegendInput label="Contact Person / Administrator office Phone" value={contactPhone} onChange={setContactPhone} placeholder="Phone" type="tel" />
                  <LegendInput label="Medium instruction" value={mediumOfInstruction} onChange={setMediumOfInstruction} placeholder="e.g. English" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                    <LegendInput label="Study Form" value={studyFrom} onChange={setStudyFrom} placeholder="Class start" />
                    <LegendInput label="Study To" value={studyTo} onChange={setStudyTo} placeholder="Class end" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                    <LegendInput label="Admission Start Date" value={admissionStart} onChange={setAdmissionStart} type="date" />
                    <LegendInput label="Admission End Date" value={admissionEnd} onChange={setAdmissionEnd} type="date" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
                    <LegendInput label="CCTV Surveillance" value={cctv} onChange={setCctv} isSelect options={["Yes", "No"]} />
                    <LegendInput label="AC Campus" value={acCampus} onChange={setAcCampus} isSelect options={["Yes", "No"]} />
                    <LegendInput label="Total No Of Students" value={totalStudents} onChange={setTotalStudents} isSelect options={["Yes", "No"]} />
                  </div>
               </div>

               <div className="mt-16 flex justify-start">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#FF3D3D] text-white px-10 py-3 rounded-[8px] font-black text-[16px] hover:bg-[#ff2d2d] transition-all flex items-center justify-center min-w-[160px] shadow-sm"
                  >
                    {saving ? "..." : "Submit"}
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
