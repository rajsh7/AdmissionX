"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }
interface Option { id: number; name: string; }
interface Cutoff {
  id: number; title: string; description: string | null;
  degree_id: number | null; course_id: number | null; functionalarea_id: number | null;
  degree_name: string | null; course_name: string | null; stream_name: string | null;
}

const EMPTY = { title: "", description: "", degree_id: "", course_id: "", functionalarea_id: "" };
const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

export default function CutoffsTab({ college }: Props) {
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [options, setOptions] = useState<{ degrees: Option[]; courses: Option[]; streams: Option[] }>({ degrees: [], courses: [], streams: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cutoff | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/cutoffs`);
      const d = await res.json();
      setCutoffs(d.cutoffs ?? []);
      setOptions(d.options ?? { degrees: [], courses: [], streams: [] });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); setError(null); }
  function openEdit(c: Cutoff) {
    setEditing(c);
    setForm({ title: c.title, description: c.description ?? "", degree_id: String(c.degree_id ?? ""), course_id: String(c.course_id ?? ""), functionalarea_id: String(c.functionalarea_id ?? "") });
    setShowForm(true); setError(null);
  }
  function closeForm() { setShowForm(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        description: form.description.trim() || null,
        degree_id: form.degree_id ? Number(form.degree_id) : null,
        course_id: form.course_id ? Number(form.course_id) : null,
        functionalarea_id: form.functionalarea_id ? Number(form.functionalarea_id) : null,
      };
      const res = await fetch(`/api/college/dashboard/${slug}/cutoffs`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess(editing ? "Cut-off updated!" : "Cut-off added!");
      setTimeout(() => setSuccess(null), 3000);
      closeForm(); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this cut-off entry?")) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/cutoffs?cutoffId=${id}`, { method: "DELETE" });
      setCutoffs(prev => prev.filter(c => c.id !== id));
      setSuccess("Cut-off deleted!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Manage Cut Offs</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name} · {cutoffs.length} entr{cutoffs.length !== 1 ? "ies" : "y"}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Cut Off
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-[15px] font-bold text-slate-700">{editing ? "Edit Cut Off" : "New Cut Off"}</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. B.Tech CSE Cut Off 2024" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Stream", key: "functionalarea_id", opts: options.streams },
                  { label: "Degree", key: "degree_id", opts: options.degrees },
                  { label: "Course", key: "course_id", opts: options.courses },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <div className="relative">
                      <select value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={`${inputCls} appearance-none`}>
                        <option value="">Select {label}</option>
                        {opts.map((o: Option) => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Cut-off details, category-wise marks, etc." rows={4} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add Cut Off"}
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
        ) : cutoffs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">assignment</span>
            <p className="text-slate-500 font-semibold">No cut-off entries added yet</p>
            <button onClick={openAdd} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">+ Add your first cut-off</button>
          </div>
        ) : (
          <div className="space-y-3">
            {cutoffs.map(c => (
              <div key={c.id} className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-orange-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-800">{c.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {c.stream_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{c.stream_name}</span>}
                    {c.degree_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{c.degree_name}</span>}
                    {c.course_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">{c.course_name}</span>}
                  </div>
                  {c.description && <p className="text-[13px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
