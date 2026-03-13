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
        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Course Name</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search courses..." value={queryInput} onChange={(e) => setQueryInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition backdrop-blur-sm" />
        </div>
      </div>

      {/* Degree */}
      <div>
        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Degree</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <select value={degreeInput} onChange={(e) => { setDegreeInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-white backdrop-blur-sm">
            <option value="" className="bg-[#1a1a1a] text-white">All Degrees</option>
            {degrees.map((d) => <option key={d.id} value={d.id} className="bg-[#1a1a1a] text-white">{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Education Level</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select value={eduLevelInput} onChange={(e) => { setEduLevelInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-white backdrop-blur-sm">
            <option value="" className="bg-[#1a1a1a] text-white">All Levels</option>
            {educationLevels.map((d) => <option key={d.id} value={d.id} className="bg-[#1a1a1a] text-white">{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Stream */}
      <div>
        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Stream</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select value={streamInput} onChange={(e) => { setStreamInput(e.target.value); }}
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-white backdrop-blur-sm">
            <option value="" className="bg-[#1a1a1a] text-white">All Streams</option>
            {streams.map((d) => <option key={d.id} value={d.id} className="bg-[#1a1a1a] text-white">{d.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">Sort By</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <select value={sortInput} onChange={(e) => setSortInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-white backdrop-blur-sm">
            <option value="name" className="bg-[#1a1a1a] text-white">Name (A–Z)</option>
            <option value="id" className="bg-[#1a1a1a] text-white">Recently Added</option>
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

      <main
        className="relative min-h-screen bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/Background-images/universityImage.png')" }}
      >
        {/* Overall Overlay - Matched to College Page */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />

        {/* ── HERO ── */}
        <section
          className="relative min-h-[50vh] flex items-center justify-center text-white overflow-hidden pt-24 pb-12"
        >
          <motion.div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-400/10 blur-3xl"
            animate={{ x: [0, 28, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"
            animate={{ x: [0, -22, 0], y: [0, -26, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative text-center py-10 max-w-4xl px-6"
          >
            {/* Tag */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-block bg-red-500/20 border border-red-400/30 text-red-200 text-[10px] font-semibold px-4 py-1 rounded-full mb-4 tracking-widest uppercase backdrop-blur-sm"
            >
              📚 {totalCount > 0 ? `${totalCount.toLocaleString()}+ Courses` : "Thousands of Courses"} Available
            </motion.span>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tight"
            >
              Discover Your{" "}
              <span className="bg-gradient-to-r from-red-400 via-rose-300 to-orange-300 bg-clip-text text-transparent">
                Perfect Course
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed"
            >
              Browse undergraduate & postgraduate programs from India's leading universities.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={() => document.getElementById("course-list")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 text-sm"
              >
                Browse Now
              </button>
              <a href="/colleges" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-2.5 rounded-xl backdrop-blur-sm transition-all hover:scale-105 text-sm">
                Explore Colleges
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section id="course-list" className="relative py-20 sm:py-14 px-6 md:px-10 lg:px-15">
          <div className="max-w-[1600px] mx-auto">

            {/* Mobile filter toggle */}
            <div className="md:hidden mb-4 flex gap-3 items-center">
              <button onClick={() => setShowMobileFilters((v) => !v)}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl shadow-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters {chips.length > 0 && <span className="bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{chips.length}</span>}
              </button>
              {chips.length > 0 && <button onClick={clearAll} className="text-sm text-red-100 hover:text-white hover:underline">Clear all</button>}
            </div>

            {/* Mobile filter sliding panel */}
            <AnimatePresence>
              {showMobileFilters && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowMobileFilters(false)}
                    className="fixed inset-0 bg-black/60 z-[100] md:hidden backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a]/95 z-[101] md:hidden flex flex-col shadow-2xl border-r border-white/10 backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
                      <h3 className="font-black text-xl text-white">Filters</h3>
                      <button onClick={() => setShowMobileFilters(false)} className="p-2 -mr-2 text-gray-400 hover:text-white bg-white/5 rounded-full shadow-sm border border-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                      <FilterSidebar />
                    </div>
                    <div className="p-5 border-t border-white/5 bg-black/20 flex gap-3">
                      <button onClick={clearAll} className="flex-1 py-3 text-sm font-bold text-gray-400 bg-white/5 rounded-xl hover:bg-white/10 transition">Clear All</button>
                      <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md shadow-red-900/40 transition">Show Results</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Active filter chips */}
            <AnimatePresence>
              {chips.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-300 mr-1">Active filters:</span>
                  {chips.map((chip) => (
                    <motion.button key={chip.key} layout onClick={chip.clear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md">
                      {chip.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  ))}
                  <button onClick={clearAll} className="text-xs text-gray-400 hover:text-white transition ml-1">Clear all</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-8 items-start">

              {/* ── FILTER SIDEBAR (desktop) ── */}
              <aside className="hidden md:block w-72 lg:w-80 xl:w-90 shrink-0 sticky top-6 self-start">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                      </svg>
                      <h3 className="font-semibold text-white">Filters</h3>
                      {chips.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{chips.length}</span>}
                    </div>
                    {chips.length > 0 && <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 hover:underline font-medium">Reset</button>}
                  </div>
                  <FilterSidebar />
                </div>

                {/* Degree badge card */}
                {selectedDegreeName && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-2xl p-5 border shadow-xl backdrop-blur-xl ${degreeColor.bg.replace('bg-', 'bg-')}/80 ${degreeColor.border}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${degreeColor.text} opacity-70`}>Filtering by Degree</p>
                    <p className={`text-xl font-black ${degreeColor.text}`}>{selectedDegreeName}</p>
                    <button onClick={() => { setDegreeId(""); setDegreeInput(""); setPage(1); }}
                      className={`mt-3 text-xs underline ${degreeColor.text} opacity-70 hover:opacity-100 font-bold`}>
                      Clear degree filter
                    </button>
                  </motion.div>
                )}
              </aside>

              {/* ── COURSE GRID ── */}
              <div className="flex-1 min-w-0">
                {/* Result count bar */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-300">
                    {loading ? (
                      <span className="animate-pulse bg-white/10 rounded h-4 w-32 inline-block" />
                    ) : (
                      <>Showing <span className="font-semibold text-white">{courses.length}</span> of <span className="font-semibold text-white">{totalCount.toLocaleString()}</span> courses</>
                    )}
                  </p>
                  <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                </div>

                {loading ? (
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 animate-pulse flex gap-4">
                        <div className="w-1 rounded-full bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-3 bg-white/10 rounded w-1/3" />
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-200 rounded-2xl p-8 text-center shadow-xl">
                    <svg className="w-10 h-10 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-bold">{error}</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center shadow-xl">
                    <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-white font-bold text-xl">No courses found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                    <button onClick={clearAll} className="mt-4 text-sm text-red-400 hover:text-white underline">Clear all filters</button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div key={`${page}-${query}-${degreeId}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                              <article className="bg-[#1a1a1a]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:shadow-red-500/20 hover:border-red-500/40 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  <img
                                    src={imageUrl}
                                    alt={course.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                  />
                                  {/* Gradient overlay always present at bottom */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/10 to-transparent opacity-90" />

                                  {/* Type badge top-left */}
                                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 bg-black/40 text-white`}>
                                    {colorKey}
                                  </span>

                                  {/* Course name overlaid on image bottom */}
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-white font-black text-sm leading-tight line-clamp-2 drop-shadow-xl group-hover:text-indigo-400 transition-colors">
                                      {course.name}
                                    </h3>
                                  </div>
                                </div>

                                {/* Content below image */}
                                <div className="px-4 py-4 flex-1 flex flex-col gap-3">
                                  {/* Stream */}
                                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic truncate">
                                    {course.functional_area_name || "Regular Program"}
                                  </p>

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                                    <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                                      Admissions Open
                                    </span>
                                    <span className="text-red-500 group-hover:translate-x-1 transition-transform duration-300">
                                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
                  <div className="mt-12 flex items-center justify-center gap-3">
                    <button type="button"
                      onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={!hasPrev || loading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 backdrop-blur-md">
                      «
                    </button>
                    <button type="button"
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={!hasPrev || loading}
                      className="px-6 h-10 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition backdrop-blur-md">
                      Previous
                    </button>

                    <span className="h-10 px-6 flex items-center bg-red-600 text-white text-sm font-black rounded-xl shadow-lg shadow-red-600/20">
                      {page} / {totalPages}
                    </span>

                    <button type="button"
                      onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={!hasNext || loading}
                      className="px-6 h-10 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition backdrop-blur-md">
                      Next
                    </button>
                    <button type="button"
                      onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={!hasNext || loading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 backdrop-blur-md">
                      »
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
