"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  category: string;
}

const CATEGORIES = ["Award", "Ranking", "Accreditation", "Recognition", "Other"];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const EMPTY: Omit<Achievement, "id"> = { title: "", description: "", year: "", category: "Other" };

const inputCls = "w-full bg-white border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] font-medium text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 outline-none transition-all placeholder:text-slate-300";
const selectCls = `${inputCls} appearance-none`;

const CATEGORY_COLORS: Record<string, string> = {
  Award: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Ranking: "bg-blue-50 text-blue-700 border-blue-200",
  Accreditation: "bg-green-50 text-green-700 border-green-200",
  Recognition: "bg-purple-50 text-purple-700 border-purple-200",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function AchievementsTab({ college }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/achievements`);
      const d = await res.json();
      setAchievements(d.achievements ?? []);
    } catch {}
    finally { setLoading(false); }
  }, [college.slug]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowForm(true);
    setError(null);
  }

  function openEdit(a: Achievement) {
    setEditing(a);
    setForm({ title: a.title, description: a.description, year: a.year, category: a.category });
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/achievements`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess(editing ? "Achievement updated!" : "Achievement added!");
      setTimeout(() => setSuccess(null), 3000);
      closeForm();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this achievement?")) return;
    try {
      await fetch(`/api/college/dashboard/${college.slug}/achievements?id=${id}`, { method: "DELETE" });
      setAchievements(prev => prev.filter(a => a.id !== id));
      setSuccess("Achievement deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Achievements</h2>
          <p className="text-slate-400 text-sm mt-0.5">Add awards, rankings, accreditations and recognitions.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Achievement
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}
        {error && !showForm && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-slate-700">{editing ? "Edit Achievement" : "New Achievement"}</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. NAAC A+ Accreditation" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={selectCls}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
                  <div className="relative">
                    <select value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} className={selectCls}>
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this achievement…" rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add Achievement"}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-[8px] font-bold text-[14px] hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
          </div>
        ) : achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">emoji_events</span>
            <p className="text-slate-500 font-semibold">No achievements added yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Achievement" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map(a => (
              <div key={a.id} className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-yellow-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[15px] font-bold text-slate-800 truncate">{a.title}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[a.category] ?? CATEGORY_COLORS.Other}`}>
                      {a.category}
                    </span>
                    {a.year && <span className="text-[11px] font-semibold text-slate-400">{a.year}</span>}
                  </div>
                  {a.description && <p className="text-[13px] text-slate-500 line-clamp-2">{a.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
