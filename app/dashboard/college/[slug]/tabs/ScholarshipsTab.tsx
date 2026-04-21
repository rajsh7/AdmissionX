"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }
interface Scholarship { id: number; title: string; description: string; }

const EMPTY = { title: "", description: "" };
const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

export default function ScholarshipsTab({ college }: Props) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/scholarships`);
      const d = await res.json();
      setScholarships(d.scholarships ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); setError(null); }
  function openEdit(s: Scholarship) { setEditing(s); setForm({ title: s.title, description: s.description }); setShowForm(true); setError(null); }
  function closeForm() { setShowForm(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/scholarships`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess(editing ? "Scholarship updated!" : "Scholarship added!");
      setTimeout(() => setSuccess(null), 3000);
      closeForm(); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this scholarship?")) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/scholarships?scholarshipId=${id}`, { method: "DELETE" });
      setScholarships(prev => prev.filter(s => s.id !== id));
      setSuccess("Scholarship deleted!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Manage Scholarships</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name} · {scholarships.length} scholarship{scholarships.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Scholarship
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
            <h3 className="text-[15px] font-bold text-slate-700">{editing ? "Edit Scholarship" : "New Scholarship"}</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Scholarship Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Merit Scholarship 2025" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Eligibility criteria, amount, how to apply..." rows={4} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add Scholarship"}
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
        ) : scholarships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">payments</span>
            <p className="text-slate-500 font-semibold">No scholarships added yet</p>
            <button onClick={openAdd} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">+ Add your first scholarship</button>
          </div>
        ) : (
          <div className="space-y-3">
            {scholarships.map(s => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-green-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-800">{s.title}</p>
                  {s.description && <p className="text-[13px] text-slate-400 mt-1 line-clamp-2">{s.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
