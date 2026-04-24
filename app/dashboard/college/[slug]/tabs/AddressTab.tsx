"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

function LegendInput({
  label, value, onChange, placeholder, type = "text", isTextarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; isTextarea?: boolean;
}) {
  const cls = "w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all placeholder:text-slate-300";
  return (
    <div className="relative mt-4">
      <label className="absolute -top-2 left-6 px-1.5 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

export default function AddressTab({ college }: Props) {
  const [registeredShort, setRegisteredShort] = useState("");
  const [registeredFull,  setRegisteredFull]  = useState("");
  const [campusShort,     setCampusShort]     = useState("");
  const [campusFull,      setCampusFull]      = useState("");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`);
      const d = await res.json();
      const p = d.profile ?? {};
      setRegisteredShort(p.registeredSortAddress || "");
      setRegisteredFull(p.registeredFullAddress  || "");
      setCampusShort(p.campusSortAddress         || "");
      setCampusFull(p.campusFullAddress          || "");
    } catch {}
    finally { setLoading(false); }
  }, [college.slug]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registeredSortAddress: registeredShort,
          registeredFullAddress: registeredFull,
          campusSortAddress:     campusShort,
          campusFullAddress:     campusFull,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess("Address saved successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="animate-pulse space-y-6 p-8">
      {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-100 rounded" />)}
    </div>
  );

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-[22px] font-bold text-[#333]">Location & Address</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your registered and campus address details.</p>
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-10">
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Registered Address */}
        <div className="space-y-6">
          <h3 className="text-[15px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">
            Registered Address
          </h3>
          <LegendInput
            label="Registered Short Address"
            value={registeredShort}
            onChange={setRegisteredShort}
            placeholder="e.g. Powai, Mumbai"
          />
          <LegendInput
            label="Registered Full Address"
            value={registeredFull}
            onChange={setRegisteredFull}
            placeholder="Full registered address…"
            isTextarea
          />
        </div>

        {/* Campus Address */}
        <div className="space-y-6">
          <h3 className="text-[15px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">
            Campus Address
          </h3>
          <LegendInput
            label="Campus Short Address"
            value={campusShort}
            onChange={setCampusShort}
            placeholder="e.g. Andheri East, Mumbai"
          />
          <LegendInput
            label="Campus Full Address"
            value={campusFull}
            onChange={setCampusFull}
            placeholder="Full campus address…"
            isTextarea
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#FF3D3D] text-white px-10 py-3 rounded-[8px] font-black text-[16px] hover:bg-[#ff2d2d] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          {saving ? "Saving..." : "Save Address"}
        </button>
      </form>
    </div>
  );
}
