"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { FilterCollegeResult } from "@/lib/college-filter";

export interface University {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
}

interface TopUniversitiesProps {
  universities: University[];
  /** Pre-fetched colleges for the default "Engineering" tab (SSR warm-up). */
  initialStreamColleges?: FilterCollegeResult[];
}

const categories = [
  "MBA",
  "Engineering",
  "MBBS",
  "B.Com",
  "Design",
  "Fashion",
  "Pharmacy",
  "Humanities",
];

export default function TopUniversities({
  universities: initialUniversities,
  initialStreamColleges = [],
}: TopUniversitiesProps) {
  const [activeTab, setActiveTab] = useState("Engineering");
  const [searchQuery, setSearchQuery] = useState("");
  // If the server pre-fetched Engineering colleges, show them immediately.
  // Otherwise fall back to the generic featured colleges from the home query.
  const [currentUniversities, setCurrentUniversities] = useState<University[]>(
    initialStreamColleges.length > 0
      ? initialStreamColleges
      : initialUniversities,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "rating" | null>(null);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchColleges = async (category: string) => {
    setIsLoading(true);
    try {
      const resp = await fetch(
        `/api/colleges/filter?stream=${encodeURIComponent(category)}`,
      );
      const json = await resp.json();
      if (json.success && Array.isArray(json.data)) {
        setCurrentUniversities(json.data);
        setSelectedCity("All Cities");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (category: string) => {
    // If clicking the already-active tab, don't re-fetch
    if (category === activeTab) return;
    setActiveTab(category);
    fetchColleges(category);
  };

  const uniqueCities = [
    "All Cities",
    ...Array.from(
      new Set(
        currentUniversities.map((u) => {
          const parts = u.location.split(",");
          return parts[0].trim();
        }),
      ),
    ),
  ].filter(Boolean);

  let filteredUniversities = currentUniversities.filter((uni) => {
    const matchesSearch =
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity =
      selectedCity === "All Cities" ||
      uni.location.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCity;
  });

  if (sortBy === "rank" || sortBy === "rating") {
    filteredUniversities = [...filteredUniversities].sort(
      (a, b) => b.rating - a.rating,
    );
  }

  const categoryToSlug = (cat: string) => {
    const map: Record<string, string> = {
      MBA: "management",
      Engineering: "engineering",
      MBBS: "medicine", // Using medicine as slug
      "B.Com": "commerce",
      Design: "design",
      Fashion: "design", // Fashion often maps to design in functionalarea
      Pharmacy: "pharmacy",
      Humanities: "arts",
    };
    return map[cat] || cat.toLowerCase();
  };

  const activeTabSlug = categoryToSlug(activeTab);

  return (
    <section className="w-full py-24 lg:py-32 bg-[#f8fafc]/30">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="mb-12">
          <h2 className="text-[40px] lg:text-[68px] font-normal text-slate-900 tracking-tight leading-[1.1]">
            Discover the Top <span className="text-primary">Universities</span>
          </h2>
          <p className="mt-6 text-[25px] text-slate-500 font-normal max-w-4xl leading-relaxed antialiased">
            Filter through thousands of institutions worldwide based on your
            specific academic preferences and career goals.
          </p>
        </div>

        {/* Section Search & Filters */}
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white border border-slate-100 rounded-[10px] p-3 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] mb-12">
          <div className="relative flex-1 w-full group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your college, universities, courses..."
              className="w-full h-14 pl-14 pr-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-base font-normal"
            />
          </div>

          <div className="w-px h-10 bg-slate-100 hidden lg:block mx-2" />

          <div className="flex items-center gap-3 w-full lg:w-auto relative">
            {/* Filters Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] font-normal text-sm transition-all active:scale-95 ${
                  selectedCity !== "All Cities"
                    ? "bg-primary text-white"
                    : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-rounded text-[20px]">
                  tune
                </span>
                {selectedCity === "All Cities" ? "Filters" : selectedCity}
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-[10px] shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 max-h-60 overflow-y-auto hide-scrollbar">
                        <div className="px-3 py-2 text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                          Filter by City
                        </div>
                        {uniqueCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-[10px] text-sm font-normal transition-colors ${
                              selectedCity === city
                                ? "bg-primary/10 text-primary"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Button */}
            <button
              onClick={() => setSortBy(sortBy === "rank" ? null : "rank")}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] font-normal text-sm transition-all active:scale-95 ${
                sortBy === "rank"
                  ? "bg-primary text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-rounded text-[20px]">
                swap_vert
              </span>
              Short By: rank
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabClick(cat)}
              className={`px-6 py-2.5 rounded-[10px] text-sm font-normal whitespace-nowrap transition-all active:scale-95 ${
                activeTab === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Universities Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          <AnimatePresence mode="popLayout">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.slice(0, 8).map((uni, i) => (
                <motion.div
                  key={uni.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className="group bg-white rounded-[10px] border border-slate-100 overflow-hidden shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 flex flex-col h-full">
                    {/* Card Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={uni.image}
                        alt={uni.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-[10px] px-2.5 py-1 flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-rounded text-yellow-500 text-[18px]">
                          star
                        </span>
                        <span className="text-sm font-normal text-slate-800">
                          {uni.rating}
                        </span>
                      </div>

                      {/* Tag Overlay (Dynamic Rank) */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 rounded-[10px] bg-primary text-white text-[10px] font-normal uppercase tracking-wider shadow-lg">
                          {sortBy === "rank" ? `#${i + 1} Ranked` : "Featured"}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[22px] font-normal text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {uni.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                        <span className="material-symbols-rounded text-[18px]">
                          location_on
                        </span>
                        <span className="text-xs font-normal truncate">
                          {uni.location}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <div>
                          <div className="text-[10px] font-normal text-slate-400 uppercase tracking-widest leading-none">
                            Best Course
                          </div>
                          <div className="text-sm font-normal text-slate-800 mt-1">
                            {activeTab}
                          </div>
                        </div>
                        <Link
                          href={uni.href}
                          className="px-4 py-2 rounded-[10px] bg-slate-900 text-white text-xs font-normal hover:bg-primary transition-all active:scale-95"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <span className="material-symbols-rounded text-[32px]">
                    search_off
                  </span>
                </div>
                <h3 className="text-xl font-normal text-slate-800">
                  No Universities Found
                </h3>
                <p className="text-slate-500 mt-2">
                  Try searching for a different name or location.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* View All */}
        <div className="mt-12 text-center">
          <Link
            href={`/search?stream=${activeTabSlug}`}
            className="group inline-flex items-center gap-2 text-sm font-normal text-slate-400 hover:text-primary transition-colors"
          >
            Explore 120+ More {activeTab} Colleges
            <span className="material-symbols-rounded text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}




