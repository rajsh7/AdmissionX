"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface PlacementData {
  id: number | null;
  numberofrecruitingcompany: string;
  numberofplacementlastyear: string;
  ctchighest: string;
  ctclowest: string;
  ctcaverage: string;
  placementinfo: string;
}

const EMPTY: PlacementData = {
  id: null,
  numberofrecruitingcompany: "",
  numberofplacementlastyear: "",
  ctchighest: "",
  ctclowest: "",
  ctcaverage: "",
  placementinfo: "",
};

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

export default function PlacementTab({ college }: Props) {
  const [form, setForm] = useState<PlacementData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/placement`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setForm(data.placement as PlacementData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const update = (field: keyof PlacementData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const body = {
        numberofrecruitingcompany: form.numberofrecruitingcompany,
        numberofplacementlastyear: form.numberofplacementlastyear,
        ctchighest: form.ctchighest,
        ctclowest: form.ctclowest,
        ctcaverage: form.ctcaverage,
        placementinfo: form.placementinfo,
      };

      const res = await fetch(`/api/college/dashboard/${slug}/placement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Placement details saved successfully!");
      load();
    } catch (e) {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove these placement details?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/placement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(EMPTY), // Send empty values to clear
      });
      if (!res.ok) throw new Error("Remove failed");
      alert("Placement details removed.");
      setForm(EMPTY);
      load();
    } catch (e) {
      alert("Remove failed.");
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

  const hasData = form.numberofrecruitingcompany || form.placementinfo;

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = tab.id === "placement";
          return (
            <div
              key={tab.id}
              className={`flex items-center justify-center gap-2 py-3 px-6 text-[13px] font-bold transition-all cursor-pointer border-r border-slate-100 flex-1 min-w-[140px] ${isActive ? "bg-[#FF3C3C] text-white" : "text-slate-500 hover:bg-slate-50"
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

        {/* Section 1: Placement Records */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-[22px] font-bold text-[#333]">Placement Records</h2>
            <button className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm">
              + Add New Placement Record
            </button>
          </div>

          {hasData && (
            <div className="bg-white border border-slate-200 rounded-[10px] p-8 shadow-sm">
              <div className="space-y-3 text-[14px] text-slate-700 font-medium">
                <p>Number Of Recruiting Companies : <span className="font-bold">{form.numberofrecruitingcompany || "—"}</span></p>
                <p>Number Of placements & Year : <span className="font-bold">{form.numberofplacementlastyear || "—"}</span></p>
                <p>Placement Information : <span className="font-bold">{form.placementinfo || "—"}</span></p>
                <p>CTC Highest : <span className="font-bold">{form.ctchighest || "—"}</span></p>
                <p>CTC Lowest : <span className="font-bold">{form.ctclowest || "—"}</span></p>
                <p>CTC Average : <span className="font-bold">{form.ctcaverage || "—"}</span></p>
              </div>

              <div className="flex items-center gap-4 mt-10">
                <button
                  onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}
                  className="bg-[#00A3FF] hover:bg-[#0092e6] text-white px-10 py-2.5 rounded-[6px] font-bold text-[14px] shadow-sm transition-all"
                >
                  Update
                </button>
                <button
                  onClick={handleRemove}
                  className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-10 py-2.5 rounded-[6px] font-bold text-[14px] shadow-sm transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Placement Information */}
        <div>
          <h2 className="text-[22px] font-bold text-[#333] mb-10">Placement Information</h2>

          <div className="max-w-4xl">
            <LegendInput label="Placement Description">
              <textarea
                value={form.placementinfo}
                onChange={(e) => update("placementinfo", e.target.value)}
                placeholder="Please enter placement info here"
                rows={8}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 resize-none"
              />
            </LegendInput>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <LegendInput label="Number od recruiting Companies">
                <input
                  type="text"
                  value={form.numberofrecruitingcompany}
                  onChange={(e) => update("numberofrecruitingcompany", e.target.value)}
                  placeholder="Please enter number of recruiting companies here"
                  className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                />
              </LegendInput>
              <LegendInput label="Number of Placement & year">
                <input
                  type="text"
                  value={form.numberofplacementlastyear}
                  onChange={(e) => update("numberofplacementlastyear", e.target.value)}
                  placeholder="Please enter number of placement & year here"
                  className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                />
              </LegendInput>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <LegendInput label="CTC Highest">
                <input
                  type="text"
                  value={form.ctchighest}
                  onChange={(e) => update("ctchighest", e.target.value)}
                  placeholder="Please enter CTC highest here"
                  className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                />
              </LegendInput>
              <LegendInput label="CTC Lowest">
                <input
                  type="text"
                  value={form.ctclowest}
                  onChange={(e) => update("ctclowest", e.target.value)}
                  placeholder="Please enter CTC lowest here"
                  className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                />
              </LegendInput>
              <LegendInput label="CTC Average">
                <input
                  type="text"
                  value={form.ctcaverage}
                  onChange={(e) => update("ctcaverage", e.target.value)}
                  placeholder="Please enter CTC average here"
                  className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
                />
              </LegendInput>
            </div>

            <div className="flex justify-center pt-8">
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
    </div>
  );
}
