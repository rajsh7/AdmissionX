"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

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

interface Option { id: number; name: string; }

const EMPTY_FORM = {
  course_id: "", degree_id: "", functionalarea_id: "",
  fees: "", seats: "", courseduration: "", twelvemarks: "", description: "",
};

const DURATION_OPTIONS = ["6 Months", "1 Year", "2 Years", "3 Years", "4 Years", "5 Years"];

function LegendInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative mt-4 mb-6">
      <label className="absolute -top-[11px] left-3 bg-white px-2 text-[13px] font-semibold text-slate-500 z-10">{label}</label>
      <div className="border border-slate-200 rounded-[5px] px-4 pt-4 pb-2 focus-within:border-red-300 transition-colors relative">
        {children}
      </div>
    </div>
  );
}

export default function CoursesTab({ college }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<{ courses: Option[]; degrees: Option[]; streams: Option[] }>({ courses: [], degrees: [], streams: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses`);
      if (!res.ok) throw new Error("Failed to load.");
      const data = await res.json();
      setCourses(data.courses ?? []);
      setOptions(data.options ?? { courses: [], degrees: [], streams: [] });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const upd = (k: keyof typeof EMPTY_FORM, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || !form.degree_id || !form.functionalarea_id) {
      setError("Stream, Course and Degree are required."); return;
    }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: Number(form.course_id),
          degree_id: Number(form.degree_id),
          functionalarea_id: Number(form.functionalarea_id),
          fees: form.fees || null,
          seats: form.seats || null,
          courseduration: form.courseduration || null,
          twelvemarks: form.twelvemarks || null,
          description: form.description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");
      setSuccess("Course added successfully!");
      setTimeout(() => setSuccess(null), 4000);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this course?")) return;
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/courses?courseId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setCourses(prev => prev.filter(c => c.id !== id));
      setSuccess("Course deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Manage Your College Courses</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name}</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setError(null); }}
          className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-5 py-2.5 rounded-[5px] font-bold text-[14px] transition-all">
          {showForm ? "Cancel" : "+ Add New Course"}
        </button>
      </div>

      <div className="p-6 md:p-10">
        {/* Feedback */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Tip */}
        <div className="bg-[#FFF4F4] border border-[#FFDADA] rounded-[3px] px-4 py-1.5 mb-8">
          <p className="text-[12px] text-[#FF3C3C] font-semibold">
            Colleges are advised to increase fees from lowest to highest and start with lowest fees as low as 25%.
          </p>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm max-w-3xl">
            <h3 className="text-[15px] font-bold text-slate-700 mb-4">Add New Course</h3>

            <LegendInput label="Stream *">
              <select value={form.functionalarea_id} onChange={e => upd("functionalarea_id", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1">
                <option value="">Select Stream</option>
                {options.streams.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-4 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
            </LegendInput>

            <LegendInput label="Degree Level *">
              <select value={form.degree_id} onChange={e => upd("degree_id", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1">
                <option value="">Select Degree Level</option>
                {options.degrees.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-4 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
            </LegendInput>

            <LegendInput label="Course *">
              <select value={form.course_id} onChange={e => upd("course_id", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1">
                <option value="">Select Course</option>
                {options.courses.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-4 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
            </LegendInput>

            <LegendInput label="Course Duration">
              <select value={form.courseduration} onChange={e => upd("courseduration", e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 appearance-none cursor-pointer py-1">
                <option value="">Select Duration</option>
                {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-4 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
            </LegendInput>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <LegendInput label="Total Fees (per year)">
                <input type="number" value={form.fees} onChange={e => upd("fees", e.target.value)}
                  placeholder="e.g. 150000" className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1" />
              </LegendInput>
              <LegendInput label="Total Available Seats (per year)">
                <input type="number" value={form.seats} onChange={e => upd("seats", e.target.value)}
                  placeholder="e.g. 60" className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1" />
              </LegendInput>
            </div>

            <LegendInput label="Min. 12th Percentage Required">
              <input type="number" value={form.twelvemarks} onChange={e => upd("twelvemarks", e.target.value)}
                placeholder="e.g. 60" className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1" />
            </LegendInput>

            <LegendInput label="Description">
              <textarea value={form.description} onChange={e => upd("description", e.target.value)}
                placeholder="Enter course description" rows={3}
                className="w-full bg-transparent outline-none text-[14px] text-slate-600 py-1 resize-none" />
            </LegendInput>

            <div className="flex justify-center pt-4">
              <button type="submit" disabled={submitting}
                className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-16 py-3 rounded-[6px] font-bold text-[16px] transition-all disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        {/* Courses List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">menu_book</span>
            <p className="text-slate-500 font-semibold">No courses added yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">
              + Add your first course
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{courses.length} Course{courses.length !== 1 ? "s" : ""}</p>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Degree</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Stream</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Fees</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Seats</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{c.course_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.degree_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.stream_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.fees ? `₹${Number(c.fees).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.seats || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.courseduration || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
