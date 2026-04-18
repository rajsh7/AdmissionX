"use client";

// Overview Tab Component with Integrated Profile Management

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import type { TabId } from "../CollegeDashboardClient";
import ManagementTab from "./ManagementTab";
import SettingsTab from "./SettingsTab";

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
    website?: string;
    universityType?: string;
    collegecode?: string;
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
  recentApplications: any[]; 
  quickActions: any[];
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
      <label className="absolute -top-2.5 left-6 px-2 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <div className="relative">
        {isSelect ? (
          <select
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-700 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
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

export default function OverviewTab({ college, onNavigate }: Props) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile Form States
  const [activeSubTab, setActiveSubTab] = useState<"institute" | "settings">("institute");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
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

  const SUB_TABS = [
    { id: "institute", label: "Institute Profile", icon: "edit_square" },
    { id: "settings", label: "Account Settings / Change Password", icon: "edit_square" },
  ] as const;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/overview`);
      if (!res.ok) throw new Error("Failed to load overview data.");
      const json = await res.json();
      setData(json);
      
      const p = json.profile;
      setEstyear(p.estyear?.toString() || "");
      setWebsite(p.website || "");
      setUniversityType(p.universityType || "");
      setCollegeCode(p.collegecode || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [college.slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`, {
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save profile.");
      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(null), 4000);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 pb-24">
        {/* Header Skeleton */}
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-[10px] border border-slate-100 dark:border-slate-700 p-6 animate-pulse h-[140px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
        <button onClick={load} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "Total Applications", value: data.stats.applications.total, sub: "+12.5% this week", icon: "description", id: "apps" },
    { label: "Active Courses", value: data.stats.courses.total, sub: "Check courses", icon: "menu_book", id: "courses" },
    { label: "Avg. Rating", value: data.profile.rating || "—", sub: "Reviews", icon: "star", id: "rating" },
    { label: "Faculty Members", value: data.stats.faculty.total, sub: "View team", icon: "groups", id: "faculty" },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-black text-slate-800 tracking-tight leading-none">Dashboard</h1>
        <p className="text-slate-400 font-bold text-sm tracking-wide">Welcome back!</p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-[10px] border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">TOTAL APPLICATION</p>
                <div className="flex items-center gap-1">
                  <span className="text-[24px] font-black text-slate-900 leading-none">-</span>
                  <p className="text-[26px] font-black text-slate-900 leading-none tabular-nums">{card.value}</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#E95252' }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.id === 'faculty' ? 'groups' : 'school'}
                </span>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-1">
               <span className="material-symbols-outlined text-[18px] text-emerald-500 font-bold">trending_up</span>
               <span className="text-[13px] font-black text-emerald-500 tracking-tight">+12.5%</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm p-12 min-h-[140px] flex items-center mb-8">
         <h2 className="text-[26px] font-black text-slate-700 tracking-tight">Hi! {college.name}</h2>
      </div>

      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div style={{ borderColor: '#8B3D3D' }} className="flex flex-col sm:flex-row items-center border rounded-[5px] overflow-hidden bg-white mb-8">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={isActive ? { backgroundColor: '#8B3D3D' } : {}}
              className={`w-full sm:flex-1 flex items-center justify-center gap-3 py-3 text-[13px] font-bold transition-all border-b sm:border-b-0 sm:border-r last:border-0 ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <span className="truncate px-2">{tab.label}</span>
              <span className="material-symbols-outlined text-[18px] shrink-0">{tab.icon}</span>
            </button>
          );
        })}
      </div>

      {/* ── Profile Forms ─────────────────────────────────────────────────── */}
      <div className="mt-8 transition-all duration-300">
        {activeSubTab === "settings" ? (
          <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm p-6 md:p-10">
            <SettingsTab college={college} />
          </div>
        ) : (
          <div className="space-y-6">
            {saveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[5px] text-emerald-600 text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {saveSuccess}
              </div>
            )}
            <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm p-8 md:p-12">
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
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-[#FF3B3B] text-white px-10 py-3 rounded-[8px] font-black text-[16px] hover:bg-[#ff2525] transition-all flex items-center justify-center min-w-[160px] shadow-sm active:scale-[0.98]"
                  >
                    {saving ? "..." : "Submit"}
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div className="flex justify-center pt-10">
        <button onClick={load} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh Overview
        </button>
      </div>
    </div>
  );
}
