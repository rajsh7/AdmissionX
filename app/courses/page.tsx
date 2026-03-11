"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type Degree = { id: number; name: string };
type Course = {
  id: number;
  name: string;
  pageslug?: string;
  logoimage?: string;
  bannerimage?: string;
  degree_name?: string;
  functional_area_name?: string;
};

type CoursesResponse = {
  success: boolean;
  data: Course[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type DegreeColorKey = "default" | "engineering" | "business" | "medical" | "arts" | "law";

const DEGREE_COLORS: Record<DegreeColorKey, { bg: string; text: string; border: string; accent: string }> = {
  default: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", accent: "bg-red-500" },
  engineering: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", accent: "bg-sky-500" },
  business: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-500" },
  medical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "bg-rose-500" },
  arts: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-500" },
  law: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", accent: "bg-slate-600" },
};

function getDegreeColorKey(name: string): DegreeColorKey {
  const lower = (name || "").toLowerCase();
  if (lower.match(/engineer|tech|computer|software|it\b/)) return "engineering";
  if (lower.match(/business|management|mba|bba|commerce|finance/)) return "business";
  if (lower.match(/medical|medicine|health|nursing|pharma|dental/)) return "medical";
  if (lower.match(/arts|design|humanit|literature|media/)) return "arts";
  if (lower.match(/law|legal|policy|political/)) return "law";
  return "default";
}

function getDegreeColor(name: string) {
  return DEGREE_COLORS[getDegreeColorKey(name)];
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800";

export default function TopCourses() {
  const [queryInput, setQueryInput] = useState("");
  const [degreeInput, setDegreeInput] = useState("");
  const [sortInput, setSortInput] = useState("name");

  const [query, setQuery] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [sort, setSort] = useState("name");
  const [eduLevelId, setEduLevelId] = useState("");
  const [streamId, setStreamId] = useState("");

  const [eduLevelInput, setEduLevelInput] = useState("");
  const [streamInput, setStreamInput] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [educationLevels, setEducationLevels] = useState<Degree[]>([]);
  const [streams, setStreams] = useState<Degree[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await fetch("/api/filters", { cache: "no-store" });
        const json = await res.json();
        if (json?.success) {
          if (json.data.degrees) setDegrees(json.data.degrees);
          if (json.data.educationLevels) setEducationLevels(json.data.educationLevels);
          if (json.data.streams) setStreams(json.data.streams);
        }
      } catch { /* ignore */ }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (query) params.set("q", query);
        if (degreeId) params.set("degreeId", degreeId);
        if (eduLevelId) params.set("educationLevelId", eduLevelId);
        if (streamId) params.set("streamId", streamId);
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/courses?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as CoursesResponse;

        if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch courses");

        setCourses(Array.isArray(json.data) ? json.data : []);
        setTotalCount(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages && json.pagination.totalPages > 0 ? json.pagination.totalPages : 1);
        setHasNext(Boolean(json.pagination?.hasNext));
        setHasPrev(Boolean(json.pagination?.hasPrev));
      } catch (err) {
        setCourses([]);
        setTotalPages(1);
        setHasNext(false);
        setHasPrev(false);
        setError(err instanceof Error ? err.message : "Unable to load courses");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [query, degreeId, eduLevelId, streamId, sort, page]);

  const degreeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    degrees.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [degrees]);
  const selectedDegreeName = degreeId ? degreeLabelById.get(degreeId) || "" : "";
  const degreeColor = getDegreeColor(selectedDegreeName);

  const eduLabelById = useMemo(() => {
    const map = new Map<string, string>();
    educationLevels.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [educationLevels]);
  const streamLabelById = useMemo(() => {
    const map = new Map<string, string>();
    streams.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [streams]);

  const chips = useMemo(() => {
    const result: Array<{ key: string; label: string; clear: () => void }> = [];
    if (query) result.push({ key: "q", label: `Search: ${query}`, clear: () => { setQuery(""); setQueryInput(""); setPage(1); } });
    if (degreeId) result.push({ key: "degree", label: `Degree: ${selectedDegreeName || degreeId}`, clear: () => { setDegreeId(""); setDegreeInput(""); setPage(1); } });
    if (eduLevelId) result.push({ key: "edu", label: `Level: ${eduLabelById.get(eduLevelId) || eduLevelId}`, clear: () => { setEduLevelId(""); setEduLevelInput(""); setPage(1); } });
    if (streamId) result.push({ key: "stream", label: `Stream: ${streamLabelById.get(streamId) || streamId}`, clear: () => { setStreamId(""); setStreamInput(""); setPage(1); } });
    return result;
  }, [query, degreeId, eduLevelId, streamId, selectedDegreeName, eduLabelById, streamLabelById]);

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
    setDegreeId(degreeInput);
    setEduLevelId(eduLevelInput);
    setStreamId(streamInput);
    setSort(sortInput);
    setShowMobileFilters(false);
  };

  const clearAll = () => {
    setQueryInput(""); setDegreeInput(""); setEduLevelInput(""); setStreamInput(""); setSortInput("name");
    setQuery(""); setDegreeId(""); setEduLevelId(""); setStreamId(""); setSort("name"); setPage(1);
  };

  const FilterSidebar = () => (
    <form onSubmit={applyFilters} className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Course Name</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search courses..." value={queryInput} onChange={(e) => setQueryInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition" />
        </div>
      </div>

      {/* Degree */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Degree</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <select value={degreeInput} onChange={(e) => { setDegreeInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 transition bg-white">
            <option value="">All Degrees</option>
            {degrees.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Education Level</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select value={eduLevelInput} onChange={(e) => { setEduLevelInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 transition bg-white">
            <option value="">All Levels</option>
            {educationLevels.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Stream */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stream</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select value={streamInput} onChange={(e) => { setStreamInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 transition bg-white">
            <option value="">All Streams</option>
            {streams.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort By</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <select value={sortInput} onChange={(e) => setSortInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 transition bg-white">
            <option value="name">Name (A–Z)</option>
            <option value="id">Recently Added</option>
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200">
        Apply Filters
      </button>
    </form>
  );

  const resolveImageUrl = (course: Course) => {
    const raw = (course.bannerimage || course.logoimage || "").trim();
    if (!raw) return FALLBACK_IMAGE;
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
    return `https://admin.admissionx.in/uploads/${raw}`;
  };

  return (
    <>
      <Header onLoginClick={() => { }} onRegisterClick={() => { }} />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/Background-images/17.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-indigo-950/40 to-black/80" />

        <motion.div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, -26, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative text-center py-20 max-w-5xl px-6"
        >
          {/* Tag */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block mt-8 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-5 py-1.5 rounded-full mb-6 tracking-widest uppercase backdrop-blur-sm shadow-sm"
          >
            📚 {totalCount > 0 ? `${totalCount.toLocaleString()}+ Courses` : "Thousands of Courses"} Available
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight tracking-tight"
          >
            Discover Your{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
              Perfect Course
            </span>
          </motion.h1>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Browse thousands of undergraduate, postgraduate & professional programs from India's leading universities.
            Compare syllabi, fees, eligibility & career outcomes — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => document.querySelector("section.bg-gray-50")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95"
            >
              Browse All Courses
            </button>
            <a href="/colleges" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl backdrop-blur-sm transition-all hover:scale-105">
              Explore Colleges →
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {[
              { value: totalCount > 0 ? `${totalCount.toLocaleString()}+` : "10,000+", label: "Courses Listed" },
              { value: "500+", label: "Top Universities" },
              { value: "95%", label: "Placement Rate" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{stat.value}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="bg-gray-50 py-20 sm:py-14 px-15">
        <div>

          {/* Mobile filter toggle */}
          <div className="md:hidden mb-4 flex gap-3 items-center">
            <button onClick={() => setShowMobileFilters((v) => !v)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl shadow-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters {chips.length > 0 && <span className="bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{chips.length}</span>}
            </button>
            {chips.length > 0 && <button onClick={clearAll} className="text-sm text-red-500 hover:underline">Clear all</button>}
          </div>

          {/* Mobile filter sliding panel */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] md:hidden flex flex-col shadow-2xl"
                >
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-black text-xl text-gray-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 bg-white rounded-full shadow-sm border border-gray-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <FilterSidebar />
                  </div>
                  <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
                    <button onClick={clearAll} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Clear All</button>
                    <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md shadow-red-200 transition">Show Results</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          <AnimatePresence>
            {chips.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500 mr-1">Active filters:</span>
                {chips.map((chip) => (
                  <motion.button key={chip.key} layout onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition">
                    {chip.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                ))}
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition ml-1">Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-5 items-start">

            {/* ── FILTER SIDEBAR (desktop) ── */}
            <aside className="hidden md:block w-72 lg:w-80 xl:w-90 shrink-0 sticky top-6 self-start">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Filters</h3>
                    {chips.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{chips.length}</span>}
                  </div>
                  {chips.length > 0 && <button onClick={clearAll} className="text-xs text-red-500 hover:underline font-medium">Reset</button>}
                </div>
                <FilterSidebar />
              </div>

              {/* Degree badge card */}
              {selectedDegreeName && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 rounded-2xl p-5 border shadow-sm ${degreeColor.bg} ${degreeColor.border}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${degreeColor.text} opacity-70`}>Filtering by Degree</p>
                  <p className={`text-lg font-bold ${degreeColor.text}`}>{selectedDegreeName}</p>
                  <button onClick={() => { setDegreeId(""); setDegreeInput(""); setPage(1); }}
                    className={`mt-3 text-xs underline ${degreeColor.text} opacity-70 hover:opacity-100`}>
                    Clear degree filter
                  </button>
                </motion.div>
              )}
            </aside>

            {/* ── COURSE GRID ── */}
            <div className="flex-1 min-w-0">
              {/* Result count bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {loading ? (
                    <span className="animate-pulse bg-gray-200 rounded h-4 w-32 inline-block" />
                  ) : (
                    <>Showing <span className="font-semibold text-gray-800">{courses.length}</span> of <span className="font-semibold text-gray-800">{totalCount.toLocaleString()}</span> courses</>
                  )}
                </p>
                <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
              </div>

              {loading ? (
                <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse flex gap-4">
                      <div className="w-1 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center">
                  <svg className="w-10 h-10 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-medium">{error}</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-500 font-medium">No courses found.</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                  <button onClick={clearAll} className="mt-4 text-sm text-red-500 hover:underline">Clear all filters</button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={`${page}-${query}-${degreeId}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {courses.map((course, index) => {
                      const colorKey = getDegreeColorKey(course.name);
                      const color = DEGREE_COLORS[colorKey];
                      const imageUrl = resolveImageUrl(course);

                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                        >
                          <Link href={`/courses/${course.pageslug || course.id}`} className="block group">
                            <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                              {/* Image */}
                              <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                  src={imageUrl}
                                  alt={course.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                />
                                {/* Gradient overlay always present at bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                {/* Type badge top-left */}
                                <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${color.bg} ${color.text} ${color.border}`}>
                                  {colorKey}
                                </span>

                                {/* Course name overlaid on image bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
                                    {course.name}
                                  </h3>
                                </div>
                              </div>

                              {/* Content below image */}
                              <div className="px-3 py-2.5 flex-1 flex flex-col gap-2">
                                {/* Stream */}
                                <p className="text-[11px] text-gray-400 italic truncate">
                                  {course.functional_area_name || "Regular Program"}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    Admissions Open
                                  </span>
                                  <span className="text-red-400 group-hover:translate-x-1 transition-transform duration-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </article>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ── PAGINATION ── */}
              {!error && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button type="button"
                    onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasPrev || loading}
                    className="px-3 py-2 rounded-xl border bg-white text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    «
                  </button>
                  <button type="button"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasPrev || loading}
                    className="px-4 py-2 rounded-xl border bg-white text-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    ← Previous
                  </button>

                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl shadow-sm">
                    {page} / {totalPages}
                  </span>

                  <button type="button"
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasNext || loading}
                    className="px-4 py-2 rounded-xl border bg-white text-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    Next →
                  </button>
                  <button type="button"
                    onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasNext || loading}
                    className="px-3 py-2 rounded-xl border bg-white text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
