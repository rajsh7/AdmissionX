"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Facility {
  id: number;
  name: string;
  iconname: string | null;
  enabled: boolean;
  custom_name: string | null;
  description: string | null;
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

export default function FacilitiesTab({ college }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [description, setDescription] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/facilities`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load facilities.");
      setFacilities(data.facilities ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!selectedFacilityId) {
      alert("Please select a facility type.");
      return;
    }
    setSaving(true);
    try {
      // Logic: Update the specific facility's description and marked as enabled
      const updates = [{
        facilities_id: Number(selectedFacilityId),
        enabled: true,
        description: description,
      }];

      const res = await fetch(`/api/college/dashboard/${slug}/facilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("Save failed.");
      
      alert("Facility updated successfully!");
      setSelectedFacilityId("");
      setDescription("");
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
          const isActive = tab.id === "facilities";
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
           <h2 className="text-[22px] font-bold text-[#333]">Manage Your College Facilities</h2>
           <button className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm">
             + Add New College Facility Details
           </button>
        </div>

        {/* Status Banner */}
        <div className="bg-[#f2f2f2] border border-slate-200 rounded-[3px] px-4 py-1.5 mb-8">
           <p className="text-[12px] text-[#FF3C3C] font-semibold italic">
             {loading ? "Loading facilities..." : facilities.some(f => f.enabled) ? "College facilities updated" : "No college facilities listed"}
           </p>
        </div>

        <p className="text-[14px] text-slate-600 font-bold mb-10">
          College Name : <span className="text-slate-800 font-black">{college.name}</span>
        </p>

        {/* Form Grid */}
        <div className="max-w-4xl">
          
          <LegendInput label="Facility Type">
            <select 
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">Select Facilities type</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
          </LegendInput>

          <LegendInput label="Description">
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              rows={8}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 resize-none overflow-hidden"
            />
          </LegendInput>

          <div className="flex justify-center pt-12">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-24 py-3.5 rounded-[6px] font-bold text-[18px] transition-all shadow-md active:scale-95 disabled:opacity-50 min-w-[240px]"
            >
              {saving ? "Submitting..." : "Submit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
