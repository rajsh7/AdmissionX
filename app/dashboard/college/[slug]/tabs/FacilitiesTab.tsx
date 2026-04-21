"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

interface Facility {
  id: number;
  name: string;
  iconname: string | null;
  enabled: boolean;
  description: string | null;
}

export default function FacilitiesTab({ college }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [description, setDescription] = useState("");

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/facilities`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setFacilities(data.facilities ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const enabledFacilities = facilities.filter(f => f.enabled);
  const availableFacilities = facilities.filter(f => !f.enabled);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) { setError("Please select a facility."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/facilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ facilities_id: Number(selectedId), enabled: true, description }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");
      setSuccess("Facility added!"); setTimeout(() => setSuccess(null), 3000);
      setSelectedId(""); setDescription(""); setShowForm(false);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(facilityId: number, name: string) {
    if (!confirm(`Remove "${name}" from your facilities?`)) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/facilities?facilityId=${facilityId}`, { method: "DELETE" });
      setFacilities(prev => prev.map(f => f.id === facilityId ? { ...f, enabled: false, description: null } : f));
      setSuccess("Facility removed!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Manage College Facilities</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name} · {enabledFacilities.length} active</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setError(null); }}
          className="bg-[#9DA6B7] hover:bg-[#8e99ac] text-white px-5 py-2.5 rounded-[5px] font-bold text-[14px] transition-all">
          {showForm ? "Cancel" : "+ Add Facility"}
        </button>
      </div>

      <div className="p-6 md:p-10 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-[15px] font-bold text-slate-700">Add Facility</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Facility Type *</label>
              <div className="relative">
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-white outline-none focus:border-red-400 appearance-none">
                  <option value="">Select Facility</option>
                  {availableFacilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe this facility..." rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-white outline-none focus:border-red-400 resize-none" />
            </div>
            <button type="submit" disabled={saving}
              className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-8 py-2.5 rounded-lg font-bold text-[14px] transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Add Facility"}
            </button>
          </form>
        )}

        {/* Enabled Facilities */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : enabledFacilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">apartment</span>
            <p className="text-slate-500 font-semibold">No facilities added yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">
              + Add your first facility
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">
              Active Facilities ({enabledFacilities.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {enabledFacilities.map(f => (
                <div key={f.id} className="group relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF3C3C] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {f.iconname || "check_circle"}
                    </span>
                    <p className="text-[13px] font-bold text-slate-700 truncate">{f.name}</p>
                  </div>
                  {f.description && <p className="text-[11px] text-slate-400 line-clamp-2">{f.description}</p>}
                  <button onClick={() => handleDelete(f.id, f.name)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
