"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Option {
  id: number;
  name: string;
}

interface Options {
  degrees: Option[];
  courses: Option[];
  streams: Option[];
}

interface Cutoff {
  id: number;
  title: string;
  description: string | null;
  degree_id: number | null;
  course_id: number | null;
  functionalarea_id: number | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
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

export default function CutoffsTab({ college }: Props) {
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [options, setOptions] = useState<Options>({
    degrees: [],
    courses: [],
    streams: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/cutoffs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setCutoffs(data.cutoffs ?? []);
      setOptions(data.options ?? { degrees: [], courses: [], streams: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        degree_id: degreeId ? Number(degreeId) : null,
        course_id: courseId ? Number(courseId) : null,
        functionalarea_id: streamId ? Number(streamId) : null,
      };

      const res = await fetch(`/api/college/dashboard/${slug}/cutoffs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed.");

      alert("Cut-off entry added successfully!");
      setTitle("");
      setStreamId("");
      setDegreeId("");
      setCourseId("");
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
          const isActive = tab.id === "cutoffs";
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <h2 className="text-[22px] font-bold text-[#333]">Manage Your College Cut Offs</h2>
          <button className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm">
            + Add New Cut Offs
          </button>
        </div>

        {/* Status Banner */}
        <div className="bg-[#f2f2f2] border border-slate-200 rounded-[3px] px-4 py-1.5 mb-12">
          <p className="text-[12px] text-[#FF3C3C] font-semibold italic">
            {loading ? "Loading cut-offs..." : cutoffs.length > 0 ? `${cutoffs.length} Cut-off entry listed` : "No Cutoffs listed"}
          </p>
        </div>

        {/* Form Grid */}
        <div className="max-w-4xl">

          <LegendInput label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter cut offs title here"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 font-medium"
            />
          </LegendInput>

          <LegendInput label="Stream">
            <div className="relative">
              <select
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer"
              >
                <option value="">Select stream</option>
                {options.streams.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </LegendInput>

          <LegendInput label="Degree">
            <div className="relative">
              <select
                value={degreeId}
                onChange={(e) => setDegreeId(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer"
              >
                <option value="">Select degree</option>
                {options.degrees.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </LegendInput>

          <LegendInput label="Course">
            <div className="relative">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer"
              >
                <option value="">Select course</option>
                {options.courses.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </LegendInput>

          {/* Placeholder fields as per mockup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <LegendInput label="Degree Level" hint="Optional placeholder">
              <div className="relative">
                <select className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer">
                  <option value="">Select degree level</option>
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </LegendInput>
            <LegendInput label="Course Type" hint="Optional placeholder">
              <div className="relative">
                <select className="w-full bg-transparent outline-none text-[14px] text-slate-400 font-medium py-1 appearance-none cursor-pointer">
                  <option value="">Select course type</option>
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </LegendInput>
          </div>

          <LegendInput label="Description">
            {/* Simple toolbar mockup */}
            <div className="flex items-center gap-1 mb-4 pb-2 border-b border-slate-100">
              <button className="p-1 px-3 border rounded-[4px] font-bold text-[14px] hover:bg-slate-50 transition-all">B</button>
              <button className="p-1 px-3 border rounded-[4px] underline text-[14px] hover:bg-slate-50 transition-all font-serif italic">U</button>
              <button className="p-1 px-3 border rounded-[4px] italic text-[14px] hover:bg-slate-50 transition-all">I</button>
              <div className="w-[1px] h-6 bg-slate-200 mx-1" />
              <span className="material-symbols-outlined text-slate-400 text-[20px] p-1 cursor-pointer">list</span>
              <span className="material-symbols-outlined text-slate-400 text-[20px] p-1 cursor-pointer">format_list_numbered</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="write here..."
              rows={12}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 resize-none font-medium leading-relaxed"
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

        {/* Existing Cut-offs List */}
        {cutoffs.length > 0 && (
          <div className="mt-24 border-t border-slate-200 pt-16">
            <h3 className="text-[18px] font-bold text-slate-700 mb-8">Existing Cut-off Entries</h3>
            <div className="space-y-4">
              {cutoffs.map((c) => (
                <div key={c.id} className="bg-white border border-slate-200 p-6 rounded-[8px] flex items-start justify-between shadow-sm hover:border-slate-300 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {c.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-slate-800 tracking-tight">{c.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {c.stream_name && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{c.stream_name}</span>}
                        {c.degree_name && <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{c.degree_name}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors cursor-pointer">edit</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
