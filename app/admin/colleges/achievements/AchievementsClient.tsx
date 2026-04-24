"use client";

import { useState, useEffect, useCallback } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  category: string;
  college_slug: string;
}

const CATEGORIES = ["Award", "Ranking", "Accreditation", "Recognition", "Other"];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const CATEGORY_COLORS: Record<string, string> = {
  Award: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Ranking: "bg-blue-50 text-blue-700 border-blue-200",
  Accreditation: "bg-green-50 text-green-700 border-green-200",
  Recognition: "bg-purple-50 text-purple-700 border-purple-200",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300";

interface Props {
  slug: string;
  collegeName: string;
}

export default function AchievementsClient({ slug, collegeName }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState({ title: "", description: "", year: "", category: "Other" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/achievements`);
      const d = await res.json();
      setAchievements(d.achievements ?? []);
    } catch {}
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ title: "", description: "", year: "", category: "Other" });
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
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/achievements`, {
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
      await fetch(`/api/college/dashboard/${slug}/achievements?id=${id}`, { method: "DELETE" });
      setAchievements(prev => prev.filter(a => a.id !== id));
      setSuccess("Deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-800">Achievements</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{collegeName}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#313131] text-white text-xs font-semibold hover:bg-black transition-all">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Achievement
        </button>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-700">{editing ? "Edit Achievement" : "New Achievement"}</h3>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">error</span>{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. NAAC A+ Accreditation" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={`${inputCls} appearance-none`}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
                <select value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} className={`${inputCls} appearance-none`}>
                  <option value="">Select Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Add"}
              </button>
              <button type="button" onClick={closeForm} className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">emoji_events</span>
            <p className="text-slate-500 font-semibold text-sm">No achievements yet</p>
            <button onClick={openAdd} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              + Add first achievement
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {achievements.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">{a.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[a.category] ?? CATEGORY_COLORS.Other}`}>
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-500">{a.year || "—"}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-xs text-slate-400 truncate">{a.description || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
