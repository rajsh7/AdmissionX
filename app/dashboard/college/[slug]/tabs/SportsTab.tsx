"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }
interface Activity { id: number; typeOfActivity: string; name: string; }

const TYPES = ["Sports", "Cultural", "Technical", "Academic", "Other"];

const TYPE_COLORS: Record<string, string> = {
  Sports: "bg-blue-50 text-blue-700 border-blue-200",
  Cultural: "bg-purple-50 text-purple-700 border-purple-200",
  Technical: "bg-orange-50 text-orange-700 border-orange-200",
  Academic: "bg-green-50 text-green-700 border-green-200",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

const TYPE_ICONS: Record<string, string> = {
  Sports: "sports_soccer",
  Cultural: "theater_comedy",
  Technical: "computer",
  Academic: "school",
  Other: "category",
};

const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

export default function SportsTab({ college }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("Sports");
  const [name, setName] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`);
      const d = await res.json();
      setActivities(d.activities ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Activity name is required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/sports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), typeOfActivity: type }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess("Activity added!"); setTimeout(() => setSuccess(null), 3000);
      setName(""); setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this activity?")) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/sports?activityId=${id}`, { method: "DELETE" });
      setActivities(prev => prev.filter(a => a.id !== id));
      setSuccess("Activity deleted!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  // Group by type
  const grouped = TYPES.reduce((acc, t) => {
    acc[t] = activities.filter(a => a.typeOfActivity === t);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Sports & Activities</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name} · {activities.length} activit{activities.length !== 1 ? "ies" : "y"}</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setError(null); }}
          className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          {showForm ? "Cancel" : "Add Activity"}
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-[15px] font-bold text-slate-700">Add New Activity</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type of Activity</label>
                <div className="relative">
                  <select value={type} onChange={e => setType(e.target.value)} className={`${inputCls} appearance-none`}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Activity Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cricket, Debate Club" className={inputCls} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Add Activity"}
            </button>
          </form>
        )}

        {/* Activities grouped by type */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">sports_soccer</span>
            <p className="text-slate-500 font-semibold">No activities added yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">+ Add your first activity</button>
          </div>
        ) : (
          <div className="space-y-6">
            {TYPES.filter(t => grouped[t]?.length > 0).map(t => (
              <div key={t}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]" style={{ color: "#FF3C3C", fontVariationSettings: "'FILL' 1" }}>{TYPE_ICONS[t]}</span>
                  <h3 className="text-[13px] font-black text-slate-600 uppercase tracking-wider">{t} ({grouped[t].length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grouped[t].map(a => (
                    <div key={a.id} className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-semibold ${TYPE_COLORS[t] ?? TYPE_COLORS.Other}`}>
                      <span>{a.name}</span>
                      <button onClick={() => handleDelete(a.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 ml-1">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
