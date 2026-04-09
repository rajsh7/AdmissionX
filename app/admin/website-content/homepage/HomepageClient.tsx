"use client";

import { useState } from "react";
import { saveHomepageSettings, toggleCollegeOnHome, toggleUniversityOnHome } from "./actions";

interface College {
  slug: string;
  name: string;
  location: string;
  isShowOnHome: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  rating: number;
}

interface Props {
  settings: Record<string, any>;
  colleges: College[];
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

const TABS = [
  { id: "colleges", label: "Featured Colleges", icon: "apartment" },
  { id: "universities", label: "Top Universities", icon: "school" },
  { id: "hero", label: "Hero Section", icon: "web" },
  { id: "stats", label: "Stats Bar", icon: "bar_chart" },
  { id: "sections", label: "Section Visibility", icon: "visibility" },
];

export default function HomepageClient({ settings, colleges }: Props) {
  const [tab, setTab] = useState("colleges");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  const hero = settings.hero ?? {};
  const stats = settings.stats ?? {};
  const sections = settings.sections ?? {};

  const featuredColleges = colleges.filter(c => c.isShowOnHome === 1);
  const topUniversities = colleges.filter(c => c.isTopUniversity === 1);

  const filtered = colleges.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await saveHomepageSettings(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>home</span>
            Homepage Content Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Control what appears on the public homepage — all changes save to the database instantly.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
            <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>check_circle</span>
            Saved successfully!
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Featured Colleges", value: featuredColleges.length, icon: "apartment", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Top Universities", value: topUniversities.length, icon: "school", color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total Colleges", value: colleges.length, icon: "domain", color: "text-slate-600", bg: "bg-slate-50" },
          { label: "Sections Active", value: Object.values(sections).filter(Boolean).length || 7, icon: "layers", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-tight">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-rounded text-[16px]" style={tab === t.id ? ICO_FILL : ICO}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* -- Tab: Featured Colleges -- */}
      {tab === "colleges" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-800">Featured Colleges on Homepage</h2>
              <p className="text-xs text-slate-500 mt-0.5">Toggle which colleges appear in the homepage "Top Universities" carousel.</p>
            </div>
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[16px] text-slate-400" style={ICO}>search</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search colleges..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Show on Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.slug} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.location || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>star</span>
                        {c.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleCollegeOnHome}>
                        <input type="hidden" name="slug" value={c.slug} />
                        <input type="hidden" name="current" value={String(c.isShowOnHome)} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            c.isShowOnHome === 1
                              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>
                            {c.isShowOnHome === 1 ? "visibility" : "visibility_off"}
                          </span>
                          {c.isShowOnHome === 1 ? "Showing" : "Hidden"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -- Tab: Top Universities -- */}
      {tab === "universities" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Top Universities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Mark colleges as "Top University" — they appear in the Top Universities section with a special badge.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top University</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {colleges.map(c => (
                  <tr key={c.slug} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-black text-sm flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.topUniversityRank ? `#${c.topUniversityRank}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleUniversityOnHome}>
                        <input type="hidden" name="slug" value={c.slug} />
                        <input type="hidden" name="current" value={String(c.isTopUniversity)} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            c.isTopUniversity === 1
                              ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>
                            {c.isTopUniversity === 1 ? "star" : "star_border"}
                          </span>
                          {c.isTopUniversity === 1 ? "Top University" : "Not Featured"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -- Tab: Hero / Stats / Sections (form) -- */}
      {(tab === "hero" || tab === "stats" || tab === "sections") && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero */}
          {tab === "hero" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600 text-[20px]" style={ICO_FILL}>web</span>
                Hero Section Text
              </h2>
              {[
                { name: "hero_heading", label: "Main Heading", placeholder: "Find Your Dream College", defaultValue: hero.heading },
                { name: "hero_subheading", label: "Sub Heading", placeholder: "Discover top universities...", defaultValue: hero.subheading },
                { name: "hero_cta_text", label: "CTA Button Text", placeholder: "Explore Colleges", defaultValue: hero.cta_text },
                { name: "hero_cta_link", label: "CTA Button Link", placeholder: "/colleges", defaultValue: hero.cta_link },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    name={f.name}
                    defaultValue={f.defaultValue}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {tab === "stats" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600 text-[20px]" style={ICO_FILL}>bar_chart</span>
                Stats Bar Labels
              </h2>
              <p className="text-xs text-slate-500">Customize the label text shown under each stat counter on the homepage.</p>
              {[
                { name: "stat_colleges_label", label: "Colleges Stat Label", defaultValue: stats.colleges_label ?? "Partner Colleges" },
                { name: "stat_students_label", label: "Students Stat Label", defaultValue: stats.students_label ?? "Students Registered" },
                { name: "stat_countries_label", label: "Countries Stat Label", defaultValue: stats.countries_label ?? "Countries" },
                { name: "stat_courses_label", label: "Courses Stat Label", defaultValue: stats.courses_label ?? "Courses Available" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    name={f.name}
                    defaultValue={f.defaultValue}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Section Visibility */}
          {tab === "sections" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600 text-[20px]" style={ICO_FILL}>layers</span>
                Homepage Section Visibility
              </h2>
              <p className="text-xs text-slate-500">Toggle which sections are visible on the public homepage.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "show_top_universities", label: "Top Universities", icon: "school", defaultChecked: sections.show_top_universities !== false },
                  { name: "show_top_courses", label: "Top Courses", icon: "book", defaultChecked: sections.show_top_courses !== false },
                  { name: "show_career_guidance", label: "Career Guidance", icon: "work", defaultChecked: sections.show_career_guidance !== false },
                  { name: "show_fields_of_study", label: "Fields of Study", icon: "grid_view", defaultChecked: sections.show_fields_of_study !== false },
                  { name: "show_entrance_exams", label: "Entrance Exams", icon: "quiz", defaultChecked: sections.show_entrance_exams !== false },
                  { name: "show_news", label: "News & Blogs", icon: "newspaper", defaultChecked: sections.show_news !== false },
                  { name: "show_testimonials", label: "Testimonials", icon: "reviews", defaultChecked: sections.show_testimonials !== false },
                  { name: "show_contact", label: "Contact Section", icon: "contact_mail", defaultChecked: sections.show_contact !== false },
                ].map(s => (
                  <label key={s.name} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" name={s.name} defaultChecked={s.defaultChecked} className="w-4 h-4 accent-blue-600 rounded" />
                    <span className="material-symbols-rounded text-slate-400 text-[18px]" style={ICO_FILL}>{s.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>{saving ? "hourglass_empty" : "save"}</span>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
