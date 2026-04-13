"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Course {
  id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number | null;
  seats: number | null;
  courseduration: string | null;
  twelvemarks: number | null;
  description: string | null;
}

interface Option {
  id: number;
  name: string;
}

interface Options {
  courses: Option[];
  degrees: Option[];
  streams: Option[];
}

const EMPTY_FORM = {
  course_id: "",
  degree_id: "",
  functionalarea_id: "",
  fees: "",
  seats: "",
  courseduration_from: "",
  courseduration_to: "",
  twelvemarks: "",
  description: "",
  entrance_exam: "",
  seats_admissionx: "",
};

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
    <div className="w-full mb-8">
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

export default function CoursesTab({ college }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Options>({
    courses: [],
    degrees: [],
    streams: [],
  });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  
  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses`);
      if (!res.ok) throw new Error("Failed to load courses.");
      const data = await res.json();
      setCourses(data.courses ?? []);
      setOptions(data.options ?? { courses: [], degrees: [], streams: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Note: This connects to the existing POST/PUT API. 
    // We map the UI fields back to the schema.
    const payload = {
      course_id: Number(form.course_id),
      degree_id: Number(form.degree_id),
      functionalarea_id: Number(form.functionalarea_id),
      fees: form.fees ? Number(form.fees) : null,
      seats: form.seats ? Number(form.seats) : null,
      courseduration: `${form.courseduration_from}-${form.courseduration_to}`.replace(/-$/, ""),
      twelvemarks: form.twelvemarks ? Number(form.twelvemarks) : null,
      description: form.description || null,
    };

    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");
      alert("Course added successfully!");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
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

  const durationOptions = ["1 Year", "2 Year", "3 Year", "4 Year", "5 Year"];

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = tab.id === "courses";
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
           <h2 className="text-[22px] font-bold text-[#333]">Manage Your College Course</h2>
           <button className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-6 py-2.5 rounded-[5px] font-bold text-[14px] transition-all shadow-sm">
             + Add New Course Details
           </button>
        </div>

        {/* Tip Banner */}
        <div className="bg-[#FFF4F4] border border-[#FFDADA] rounded-[3px] px-4 py-1.5 mb-8">
           <p className="text-[12px] text-[#FF3C3C] font-semibold">
             College are advised to inncrease fees, from lowest to highest and start with lowest fees as low as 25%.
           </p>
        </div>

        <p className="text-[14px] text-slate-600 font-bold mb-10">
          College Name : <span className="text-slate-800 font-black">{college.name}</span>
        </p>

        {/* Form Grid */}
        <div className="max-w-4xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <LegendInput label="Course Duration From">
              <select 
                value={form.courseduration_from} 
                onChange={(e) => update("courseduration_from", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
              >
                <option value="">Select Course Duration</option>
                {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
            </LegendInput>

            <LegendInput label="Course Duration">
              <select 
                value={form.courseduration_to} 
                onChange={(e) => update("courseduration_to", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
              >
                <option value="">Select Course Duration</option>
                {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
            </LegendInput>
          </div>

          <LegendInput label="Stream">
            <select 
              value={form.functionalarea_id} 
              onChange={(e) => update("functionalarea_id", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">Select Stream</option>
              {options.streams.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
          </LegendInput>

          <LegendInput label="Course">
            <select 
              value={form.course_id} 
              onChange={(e) => update("course_id", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">Select degree first for course selection</option>
              {options.courses.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
          </LegendInput>

          <LegendInput label="Degree Level">
            <select 
              value={form.degree_id} 
              onChange={(e) => update("degree_id", e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">Select Degree level</option>
              {options.degrees.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
          </LegendInput>

          <LegendInput label="Course Type">
            <select 
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1"
            >
              <option value="">Select course type</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Distance">Distance</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-[18px] text-slate-400 pointer-events-none">expand_more</span>
          </LegendInput>

          <LegendInput label="Description">
            <textarea 
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Enter the description"
              rows={4}
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 resize-none"
            />
          </LegendInput>

          <LegendInput label="Total Fees ( per year )">
            <input 
              type="text" 
              value={form.fees}
              onChange={(e) => update("fees", e.target.value)}
              placeholder="Enter seats" // Matches image: "Enter seats" placeholder in fees box? weird but following.
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput label="Total available seats in the course( per year )">
            <input 
              type="text"
              value={form.seats}
              onChange={(e) => update("seats", e.target.value)}
              placeholder="Enter seats"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput label="Seats Allocated To Admission X">
            <input 
              type="text"
              value={form.seats_admissionx}
              onChange={(e) => update("seats_admissionx", e.target.value)}
              placeholder="Enter seats allocated to admission X"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput label="Course Eligibility ( please enter minimum required 12th percentage )">
            <input 
              type="text"
              value={form.twelvemarks}
              onChange={(e) => update("twelvemarks", e.target.value)}
              placeholder="Enter course eligibility"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <LegendInput 
            label="Course Eligibility ( please mention entrance exams and their score, if any )"
            hint="( Please enter in this formate : Exam name - Marks/percentage )"
          >
            <input 
              type="text"
              value={form.entrance_exam}
              onChange={(e) => update("entrance_exam", e.target.value)}
              placeholder="Enter course eligibility"
              className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1"
            />
          </LegendInput>

          <div className="flex justify-center pt-12">
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-24 py-3.5 rounded-[6px] font-bold text-[18px] transition-all shadow-md active:scale-95 disabled:opacity-50 min-w-[200px]"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
