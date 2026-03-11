"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type Option = { id: number; name: string };

type College = {
  id: number;
  name: string;
  city: string;
  country: string;
  location: string;
  rating: number | null;
  students: string;
  image: string;
  slug: string;
  description: string;
  website: string;
  estyear: string;
  universityType: string;
};

type CollegesResponse = {
  success: boolean;
  data: College[];
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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

function StarRating({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-gray-400 text-xs">No rating</span>;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${i < full ? "text-amber-400" : half && i === full ? "text-amber-300" : "text-gray-200"}`} fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.164c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.951 2.878c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.164a1 1 0 00.95-.69l1.285-3.957z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-600 font-medium">{value.toFixed(1)}</span>
    </span>
  );
}

export default function TopColleges() {
  const [searchInput, setSearchInput] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [minRatingInput, setMinRatingInput] = useState("");
  const [universityTypeInput, setUniversityTypeInput] = useState("");
  const [sortByInput, setSortByInput] = useState("id");

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [universityType, setUniversityType] = useState("");
  const [sortBy, setSortBy] = useState("id");

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [countries, setCountries] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  const [colleges, setColleges] = useState<College[]>([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const res = await fetch("/api/filters", { cache: "no-store" });
        const json = await res.json();
        setCountries(Array.isArray(json?.data?.countries) ? json.data.countries : []);
        setCities(Array.isArray(json?.data?.cities) ? json.data.cities : []);
      } catch {
        setCountries([]);
        setCities([]);
      }
    };
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadColleges = async () => {
      setIsFetching(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (search) params.set("q", search);
        if (country) params.set("country", country);
        if (city) params.set("city", city);
        if (minRating) params.set("minRating", minRating);
        if (universityType) params.set("universityType", universityType);
        params.set("sortBy", sortBy);

        const res = await fetch(`/api/colleges?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as CollegesResponse;

        if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch colleges");

        const normalized = Array.isArray(json.data)
          ? json.data.map((item) => {
            const rating =
              typeof item.rating === "number"
                ? item.rating
                : item.rating !== null && item.rating !== undefined
                  ? Number(item.rating)
                  : null;
            return {
              id: Number(item.id) || 0,
              name: item.name ? String(item.name) : "College",
              city: item.city ? String(item.city) : "",
              country: item.country ? String(item.country) : "",
              location: item.location ? String(item.location) : "",
              rating: Number.isFinite(rating) ? rating : null,
              students: item.students !== null && item.students !== undefined ? String(item.students) : "N/A",
              image: item.image ? String(item.image) : FALLBACK_IMAGE,
              slug: item.slug ? String(item.slug) : "",
              description: item.description ? String(item.description) : "",
              website: item.website ? String(item.website) : "",
              estyear: item.estyear ? String(item.estyear) : "",
              universityType: item.universityType ? String(item.universityType) : "",
            };
          })
          : [];

        setColleges(normalized);
        setTotalCount(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 1);
        setHasNext(Boolean(json.pagination?.hasNext));
        setHasPrev(Boolean(json.pagination?.hasPrev));
      } catch (err) {
        setColleges([]);
        setTotalPages(1);
        setHasNext(false);
        setHasPrev(false);
        setError(err instanceof Error ? err.message : "Unable to load colleges");
      } finally {
        setIsFetching(false);
      }
    };
    loadColleges();
  }, [search, country, city, minRating, universityType, sortBy, page]);

  const chips = useMemo(() => {
    const result: Array<{ key: string; label: string; clear: () => void }> = [];
    if (search) result.push({ key: "search", label: `Search: ${search}`, clear: () => { setSearch(""); setSearchInput(""); setPage(1); } });
    if (country) result.push({ key: "country", label: `Country: ${country}`, clear: () => { setCountry(""); setCountryInput(""); setPage(1); } });
    if (city) result.push({ key: "city", label: `City: ${city}`, clear: () => { setCity(""); setCityInput(""); setPage(1); } });
    if (minRating) result.push({ key: "minRating", label: `Min Rating: ${minRating}★`, clear: () => { setMinRating(""); setMinRatingInput(""); setPage(1); } });
    if (universityType) result.push({ key: "universityType", label: `Type: ${universityType}`, clear: () => { setUniversityType(""); setUniversityTypeInput(""); setPage(1); } });
    return result;
  }, [search, country, city, minRating, universityType]);

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setCountry(countryInput);
    setCity(cityInput);
    setMinRating(minRatingInput);
    setUniversityType(universityTypeInput);
    setSortBy(sortByInput);
    setShowMobileFilters(false);
  };

  const clearAll = () => {
    setSearchInput(""); setCountryInput(""); setCityInput("");
    setMinRatingInput(""); setUniversityTypeInput(""); setSortByInput("id");
    setSearch(""); setCountry(""); setCity("");
    setMinRating(""); setUniversityType(""); setSortBy("id"); setPage(1);
  };

  const FilterSidebar = () => (
    <form onSubmit={applyFilters} className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">College Name</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Country</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <select
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white"
          >
            <option value="">All Countries</option>
            {countries.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white"
          >
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* University Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">University Type</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select
            value={universityTypeInput}
            onChange={(e) => setUniversityTypeInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white"
          >
            <option value="">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
            <option value="Deemed">Deemed</option>
            <option value="Autonomous">Autonomous</option>
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Minimum Rating
          {minRatingInput && <span className="ml-2 text-amber-500 font-bold">{minRatingInput}★ & above</span>}
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {["", "1", "2", "3", "4", "4.5"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setMinRatingInput(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${minRatingInput === val
                ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600"
                }`}
            >
              {val === "" ? "Any" : `${val}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort By</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <select
            value={sortByInput}
            onChange={(e) => setSortByInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white"
          >
            <option value="id">Default</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name (A–Z)</option>
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
      >
        Apply Filters
      </button>
    </form>
  );

  return (
    <>
      <Header onLoginClick={() => { }} onRegisterClick={() => { }} />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/Background-images/universityImage.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-red-950/40 to-black/80" />

        <motion.div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-500/20 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, -26, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative text-center py-20 max-w-5xl px-6"
        >
          {/* Tag */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-semibold px-5 py-1.5 rounded-full mb-6 tracking-widest uppercase backdrop-blur-sm"
          >
            🎓 India's Largest College Discovery Platform
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight tracking-tight"
          >
            Find Your Dream{" "}
            <span className="bg-gradient-to-r from-red-400 via-rose-300 to-orange-300 bg-clip-text text-transparent">
              College
            </span>
          </motion.h1>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-red-400 to-rose-400 origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Compare Government, Private & Deemed universities across India. Explore rankings, courses, fees,
            facilities & admission deadlines — everything you need to make the right choice.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => document.querySelector("section.bg-gray-50")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95"
            >
              Explore Colleges
            </button>
            <a href="/courses" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl backdrop-blur-sm transition-all hover:scale-105">
              Browse Courses →
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {[
              { value: "16,000+", label: "Colleges Listed" },
              { value: "28+", label: "States Covered" },
              { value: "2M+", label: "Students Helped" },
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
            <button
              onClick={() => setShowMobileFilters((v) => !v)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl shadow-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters {chips.length > 0 && <span className="bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{chips.length}</span>}
            </button>
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-sm text-red-500 hover:underline">Clear all</button>
            )}
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
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex flex-wrap gap-2 items-center"
              >
                <span className="text-xs text-gray-500 mr-1">Active filters:</span>
                {chips.map((chip) => (
                  <motion.button
                    key={chip.key}
                    layout
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                  >
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
                    {chips.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{chips.length}</span>
                    )}
                  </div>
                  {chips.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-red-500 hover:underline font-medium">Reset</button>
                  )}
                </div>
                <FilterSidebar />
              </div>

              {/* Results summary card */}
              <div className="mt-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-100 mb-0.5">Results</p>
                    <p className="text-2xl font-bold">{isFetching ? "…" : totalCount.toLocaleString()}</p>
                    <p className="text-xs text-red-100">colleges found</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-100">Page</p>
                    <p className="text-lg font-bold">{page}<span className="text-xs font-normal text-red-200">/{totalPages}</span></p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── COLLEGE LIST ── */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Result count bar */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  {isFetching ? (
                    <span className="animate-pulse bg-gray-200 rounded h-4 w-32 inline-block" />
                  ) : (
                    <>Showing <span className="font-semibold text-gray-800">{colleges.length}</span> of <span className="font-semibold text-gray-800">{totalCount.toLocaleString()}</span> colleges</>
                  )}
                </p>
                <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
              </div>

              {isFetching && colleges.length === 0 ? (
                /* Loading skeletons in grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4 animate-pulse">
                      <div className="w-full h-48 rounded-2xl bg-gray-200" />
                      <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
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
              ) : colleges.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 font-medium">No colleges found.</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                  <button onClick={clearAll} className="mt-4 text-sm text-red-500 hover:underline">Clear all filters</button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={`${page}-${search}-${country}-${city}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {colleges.map((college, index) => (
                      <motion.div
                        key={college.id || college.slug || `${college.name}-${index}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
                      >
                        <article className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                          {/* Main card link overlay */}
                          <Link
                            href={`/colleges/${college.id || college.slug}`}
                            className="absolute inset-0 z-10 rounded-2xl"
                            aria-label={`View details for ${college.name}`}
                          />

                          {/* Image with overlaid info */}
                          <div className="relative overflow-hidden aspect-[4/3]">
                            <img
                              src={college.image || FALLBACK_IMAGE}
                              alt={college.name}
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* University type badge */}
                            {college.universityType && (
                              <span className={`absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md border ${college.universityType === "Government" ? "bg-blue-50 text-blue-700 border-blue-200"
                                : college.universityType === "Private" ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : college.universityType === "Deemed" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}>
                                {college.universityType}
                              </span>
                            )}

                            {/* Rating top-right */}
                            {college.rating !== null && Number.isFinite(college.rating) && (
                              <span className="absolute top-2.5 right-2.5 bg-amber-400/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-md">
                                ⭐ {college.rating.toFixed(1)}
                              </span>
                            )}

                            {/* Name + location overlaid on image */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md group-hover:text-red-200 transition-colors">
                                {college.name}
                              </h3>
                              {(college.location || college.city) && (
                                <p className="flex items-center gap-1 text-white/70 text-[11px] mt-0.5">
                                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{college.location || [college.city, college.country].filter(Boolean).join(", ")}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Content below image */}
                          <div className="px-3 py-2.5 flex-1 flex flex-col gap-1.5">
                            {/* Meta chips */}
                            <div className="flex flex-wrap items-center gap-2">
                              <StarRating value={college.rating} />
                              {college.estyear && (
                                <span className="text-[10px] text-gray-400 font-medium">Est. {college.estyear}</span>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                View Details →
                              </span>
                              {college.students !== "N/A" && (
                                <span className="text-[10px] text-gray-400">{college.students} students</span>
                              )}
                            </div>
                          </div>
                        </article>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ── PAGINATION ── */}
              {!error && totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 mx-10">
                  <button
                    type="button"
                    onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasPrev || isFetching}
                    className="px-3 py-2 rounded-xl border bg-white text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasPrev || isFetching}
                    className="px-4 py-2 rounded-xl border bg-white text-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>

                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl shadow-sm">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasNext || isFetching}
                    className="px-4 py-2 rounded-xl border bg-white text-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next →
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!hasNext || isFetching}
                    className="px-3 py-2 rounded-xl border bg-white text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                  >
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
