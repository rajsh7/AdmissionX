"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

export default function DescriptionTab({ college }: Props) {
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [aboutHeading, setAboutHeading] = useState("");
  const [statsBannerTagline, setStatsBannerTagline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`);
      const d = await res.json();
      setDescription(d.profile?.description ?? "");
      setMission(d.profile?.mission ?? "");
      setVision(d.profile?.vision ?? "");
      setAboutHeading(d.profile?.aboutHeading ?? "");
      setStatsBannerTagline(d.profile?.statsBannerTagline ?? "");
    } catch { }
    finally { setLoading(false); }
  }, [college.slug]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${college.slug}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, mission, vision, aboutHeading, statsBannerTagline }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Save failed.");
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  }

  const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

  return (
    <div className="pb-24 bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-[20px] font-bold text-[#333]">About / Description</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Edit the About Us section — heading, description, mission and vision shown on your public page.
        </p>
      </div>

      <div className="p-6 md:p-10">
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

        {loading ? (
          <div className="animate-pulse space-y-4 max-w-3xl">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <form onSubmit={handleSave} className="max-w-3xl space-y-6">

            {/* Stats Banner Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Stats Banner Tagline
              </label>
              <input
                value={statsBannerTagline}
                onChange={e => setStatsBannerTagline(e.target.value)}
                placeholder="e.g. India's biggest university,"
                className={inputCls}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The line above the college name in the stats banner. Default: "India's biggest university,"
              </p>
            </div>

            {/* About Heading */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                About Section Heading
              </label>
              <input
                value={aboutHeading}
                onChange={e => setAboutHeading(e.target.value)}
                placeholder="e.g. India's Premier University for Excellence"
                className={inputCls}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Replaces the default "Benefit From Our Online Learning..." heading.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                College Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={10}
                placeholder="Write about your college — its history, achievements, campus life, facilities, and what makes it unique..."
                className={`${inputCls} resize-y`}
              />
              <p className="text-[11px] text-slate-400 mt-1">{description.length} characters</p>
            </div>

            {/* Mission + Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Our Mission
                </label>
                <textarea
                  value={mission}
                  onChange={e => setMission(e.target.value)}
                  rows={5}
                  placeholder="e.g. To provide quality education that empowers students with knowledge, skills, and values..."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Our Vision
                </label>
                <textarea
                  value={vision}
                  onChange={e => setVision(e.target.value)}
                  rows={5}
                  placeholder="e.g. To become a world-class institution recognized for academic excellence..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FF3C3C] hover:bg-[#e63535] text-white px-12 py-3 rounded-[6px] font-bold text-[16px] transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
