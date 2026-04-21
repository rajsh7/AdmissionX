"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

interface PlacementData {
  numberofrecruitingcompany: string;
  numberofplacementlastyear: string;
  ctchighest: string;
  ctclowest: string;
  ctcaverage: string;
  placementinfo: string;
}

const EMPTY: PlacementData = {
  numberofrecruitingcompany: "",
  numberofplacementlastyear: "",
  ctchighest: "",
  ctclowest: "",
  ctcaverage: "",
  placementinfo: "",
};

const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[18px] font-black text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function PlacementTab({ college }: Props) {
  const [form, setForm] = useState<PlacementData>({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/placement`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to load.");
      setForm({ ...EMPTY, ...(d.placement ?? {}) });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const upd = (k: keyof PlacementData, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/placement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Save failed.");
      setSuccess("Placement details saved successfully!");
      setTimeout(() => setSuccess(null), 4000);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleClear() {
    if (!confirm("Clear all placement details?")) return;
    setSaving(true);
    try {
      await fetch(`/api/college/dashboard/${slug}/placement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(EMPTY),
      });
      setForm({ ...EMPTY });
      setSuccess("Placement details cleared.");
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Clear failed."); }
    finally { setSaving(false); }
  }

  const hasData = Object.values(form).some(v => v !== "");

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-[20px] font-bold text-[#333]">Placement Information</h2>
        <p className="text-slate-400 text-sm mt-0.5">{college.name}</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
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

        {/* Current Data Preview */}
        {hasData && !loading && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black text-slate-500 uppercase tracking-wider">Current Placement Data</p>
              <button onClick={handleClear} disabled={saving} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Recruiting Companies" value={form.numberofrecruitingcompany} />
              <StatCard label="Placements Last Year" value={form.numberofplacementlastyear} />
              <StatCard label="Highest CTC" value={form.ctchighest} />
              <StatCard label="Lowest CTC" value={form.ctclowest} />
              <StatCard label="Average CTC" value={form.ctcaverage} />
            </div>
            {form.placementinfo && (
              <p className="text-[13px] text-slate-500 mt-3 border-t border-slate-100 pt-3">{form.placementinfo}</p>
            )}
          </div>
        )}

        {/* Form */}
        {loading ? (
          <div className="space-y-4 animate-pulse max-w-3xl">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg" />)}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Placement Description</label>
              <textarea value={form.placementinfo} onChange={e => upd("placementinfo", e.target.value)}
                placeholder="Describe your placement process, top recruiters, etc." rows={4}
                className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. of Recruiting Companies</label>
                <input value={form.numberofrecruitingcompany} onChange={e => upd("numberofrecruitingcompany", e.target.value)} placeholder="e.g. 150" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. of Placements Last Year</label>
                <input value={form.numberofplacementlastyear} onChange={e => upd("numberofplacementlastyear", e.target.value)} placeholder="e.g. 450" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CTC Highest</label>
                <input value={form.ctchighest} onChange={e => upd("ctchighest", e.target.value)} placeholder="e.g. 45 LPA" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CTC Lowest</label>
                <input value={form.ctclowest} onChange={e => upd("ctclowest", e.target.value)} placeholder="e.g. 3.5 LPA" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CTC Average</label>
                <input value={form.ctcaverage} onChange={e => upd("ctcaverage", e.target.value)} placeholder="e.g. 8 LPA" className={inputCls} />
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <button type="submit" disabled={saving}
                className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-12 py-3 rounded-[6px] font-bold text-[16px] transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save Placement Details"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
