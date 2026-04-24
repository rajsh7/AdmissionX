"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
  onNavigate?: (tabId: any) => void;
}

function LegendInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-6 px-1.5 bg-white text-[13px] font-black text-slate-500 z-10 tracking-tight">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-[5px] px-6 py-4 text-[14px] font-bold text-slate-800 focus:ring-1 focus:ring-red-900 focus:border-red-900 transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="space-y-8 mt-12">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-12 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SocialLinksTab({ college }: Props) {
  const [facebookurl, setFacebookurl] = useState("");
  const [twitterurl, setTwitterurl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/profile`);
      if (!res.ok) throw new Error("Failed to load social links.");
      const data = await res.json();
      const p = data.profile;
      setFacebookurl(p.facebookurl ?? "");
      setTwitterurl(p.twitterurl ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebookurl: facebookurl.trim() || null,
          twitterurl: twitterurl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save social links.");
      setSuccess("Social links updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonForm />;

  return (
    <div className="pb-24 font-poppins">
      <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-[#FF3D3D] rounded-full" />
          <h2 className="text-[22px] font-black text-slate-800 uppercase tracking-tight">Social Media Links</h2>
        </div>

        <p className="text-[14px] text-slate-500 mb-10 font-medium leading-relaxed">
          Manage your college&apos;s social media presence. These links will appear on your public profile page and help students connect with you.
        </p>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-[5px] text-red-600 text-sm font-bold flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[5px] text-emerald-600 text-sm font-bold flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10">
          <LegendInput
            label="Facebook URL"
            value={facebookurl}
            onChange={setFacebookurl}
            placeholder="https://facebook.com/your-college"
          />

          <LegendInput
            label="Twitter / X URL"
            value={twitterurl}
            onChange={setTwitterurl}
            placeholder="https://twitter.com/your-college"
          />
        </div>

        <div className="mt-16 flex justify-start">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FF3D3D] text-white px-12 py-3.5 rounded-[8px] font-black text-[16px] hover:bg-[#ff2d2d] transition-all flex items-center justify-center min-w-[200px] shadow-lg shadow-red-500/10 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Social Links"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
