"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Activity {
  id: number;
  typeOfActivity: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// ── Components ───────────────────────────────────────────────────────────────

function LegendInput({
  label,
  children,
  hint,
  className = "mb-8",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative border border-slate-200 rounded-[5px] px-4 pt-5 pb-2 focus-within:border-red-300 transition-colors">
        <label className="absolute -top-[12px] left-3 bg-white px-2 text-[13px] font-semibold text-slate-500 z-10">
          {label}
        </label>
        {children}
      </div>
      {hint && <p className="text-[12px] text-slate-400 mt-1 italic pl-1">{hint}</p>}
    </div>
  );
}

export default function SportsTab({ college }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [type, setType] = useState("");
  const [name, setName] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      
      // Flatten grouped data if nested from API
      let list: Activity[] = [];
      if (data.grouped) {
        list = Object.values(data.grouped).flat() as Activity[];
      } else if (Array.isArray(data.activities)) {
        list = data.activities;
      }
      setActivities(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!type) {
      alert("Please select a type of activity.");
      return;
    }
    if (!name.trim()) {
      alert("Please enter an activity name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), typeOfActivity: type }),
      });
      if (!res.ok) throw new Error("Save failed.");
      
      alert("Activity added successfully!");
      setName("");
      load();
    } catch (e) {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "address", label: "Address", icon: "location_on" },
    { id: "gallery", label: "Gallery", icon: "image" },
    { id: "achievements", label: "Achievements", icon: "emoji_events" },
    { id: "courses", label: "Courses", icon: "menu_book" },
    { id: "facilities", label: "Facilities", icon: "apartment" },
    { id: "events", label: "Events", icon: "event" },
    { id: "scholarships", label: "Scholarships", icon: "payments" },
    { id: "placement", label: "Placements", icon: "work" },
    { id: "letters", label: "Letters", icon: "description" },
    { id: "sports", label: "Sports", icon: "sports_soccer" },
    { id: "cutoffs", label: "Cut Offs", icon: "assignment" },
    { id: "faculty", label: "Faculties", icon: "groups" },
  ];

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = tab.id === "sports";
          return (
            <div
              key={tab.id}
              className={`flex items-center justify-center gap-2 py-3 px-6 text-[13px] font-bold transition-all cursor-pointer border-r border-slate-100 flex-1 min-w-[140px] ${
                isActive ? "bg-[#FF3C3C] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-white" : "text-slate-400"}`}>
                {tab.icon}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="p-8 md:p-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
           <h2 className="text-[22px] font-bold text-[#333]">Manage Your College Sports & Activity</h2>
           <button className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm">
             + Add New College Sports & Activity
           </button>
        </div>

        {/* Status Banner */}
        <div className="bg-[#f2f2f2] border border-slate-200 rounded-[3px] px-4 py-1.5 mb-12">
           <p className="text-[12px] text-[#FF3C3C] font-semibold italic">
             {loading ? "Loading activities..." : activities.length > 0 ? `${activities.length} activity listed` : "No college sports & activity listed"}
           </p>
        </div>

        {/* Form Grid */}
        <div className="max-w-4xl">
          
          <LegendInput label="Type of Activity">
            <div className="relative">
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer"
              >
                <option value="">Select type of activity</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Academic">Academic</option>
                <option value="Other">Other</option>
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </LegendInput>

          <LegendInput label="Activity Name">
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter activity name"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <div className="flex justify-center pt-8">
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-24 py-3.5 rounded-[6px] font-bold text-[18px] transition-all shadow-md active:scale-95 disabled:opacity-50 min-w-[240px]"
            >
              {saving ? "Submitting..." : "Submit"}
            </button>
          </div>

        </div>

        {/* Existing Activities List */}
        {activities.length > 0 && (
           <div className="mt-16 border-t border-slate-200 pt-12">
              <h3 className="text-[18px] font-bold text-slate-700 mb-6">Current List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {activities.map((act) => (
                   <div key={act.id} className="bg-white border border-slate-200 p-4 rounded-[5px] flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-[12px] font-black text-primary/60 uppercase tracking-tighter">{act.typeOfActivity}</p>
                        <p className="text-[14px] font-bold text-slate-800">{act.name}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 text-[18px]">verified</span>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
