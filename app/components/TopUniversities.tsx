"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { FilterCollegeResult } from "@/lib/college-filter";
import type { AdItem } from "./AdsSection";
import AdCard from "./AdCard";
import FadeIn from "./FadeIn";

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
  avgPackage?: string;
  offeredCourses?: string[];
}

interface TopUniversitiesProps {
  universities: University[];
  initialStreamColleges?: FilterCollegeResult[];
  ads?: AdItem[];
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
  ads = [],
}: TopUniversitiesProps) {
  const [activeTab, setActiveTab] = useState("Engineering");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUniversities, setCurrentUniversities] = useState<University[]>(
    initialStreamColleges.length > 0 ? initialStreamColleges : initialUniversities,
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
      MBBS: "medicine",
      "B.Com": "commerce",
      Design: "design",
      Fashion: "design",
      Pharmacy: "pharmacy",
      Humanities: "arts",
    };
    return map[cat] || cat.toLowerCase();
  };

  const activeTabSlug = categoryToSlug(activeTab);

  return (
    <section className="w-full bg-[#f8fafc]/30 py-24 lg:py-32">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <FadeIn>
          <div className="mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h2 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-slate-900 lg:text-[68px]">
                Discover the Top <span className="text-primary">Universities</span>
              </h2>
              <p className="mt-6 max-w-3xl text-[22px] font-medium leading-relaxed text-slate-500 antialiased">
                Filter through thousands of institutions worldwide based on your
                specific academic preferences and career goals.
              </p>
            </div>

            <div className="lg:col-span-4">
              <AdCard ads={ads} className="mx-auto max-w-[440px] lg:ml-auto lg:mr-0" />
            </div>
          </div>
        </FadeIn>

        <div className="mb-12 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="group relative flex-1 rounded-[10px] border border-slate-100 bg-white shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all hover:shadow-lg">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              className="h-14 w-full rounded-[10px] bg-transparent pl-14 pr-4 text-base font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="relative h-full">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-14 rounded-[10px] border px-8 text-sm font-medium shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all active:scale-95 hover:shadow-lg ${
                selectedCity !== "All Cities"
                  ? "border-primary bg-primary text-white"
                  : "border-slate-100 bg-white text-slate-600"
              } flex items-center justify-center gap-2`}
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
                    className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-[10px] border border-slate-100 bg-white shadow-2xl"
                  >
                    <div className="hide-scrollbar max-h-60 overflow-y-auto p-2">
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Filter by City
                      </div>
                      {uniqueCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full rounded-[10px] px-4 py-2.5 text-left text-sm font-normal transition-colors ${
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

          <button
            onClick={() => setSortBy(sortBy === "rank" ? null : "rank")}
            className={`h-14 rounded-[10px] border px-8 text-sm font-medium shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all active:scale-95 hover:shadow-lg ${
              sortBy === "rank"
                ? "border-primary bg-primary text-white"
                : "border-slate-100 bg-white text-slate-600"
            } flex items-center justify-center gap-2`}
          >
            <span className="material-symbols-rounded text-[20px]">
              swap_vert
            </span>
            Short By: rank
          </button>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabClick(cat)}
              className={`whitespace-nowrap rounded-[10px] px-6 py-2.5 text-sm font-normal transition-all active:scale-95 ${
                activeTab === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-8 flex items-center gap-4">
          <h3 className="whitespace-nowrap text-[25px] font-bold uppercase tracking-wider text-slate-900">
            Top rank universities !
          </h3>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div
          className={`grid grid-cols-1 gap-6 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8 ${isLoading ? "pointer-events-none opacity-50" : "opacity-100"}`}
        >
          <AnimatePresence mode="popLayout">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.slice(0, 8).map((uni, i) => (
                <motion.div
                  key={`${uni.href}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-slate-100 bg-white shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={uni.image}
                        alt={uni.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-[10px] bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur">
                        <span className="material-symbols-rounded text-[18px] text-yellow-500">
                          star
                        </span>
                        <span className="text-sm font-normal text-slate-800">
                          {uni.rating}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="rounded-[10px] bg-primary px-3 py-1 text-[10px] font-normal uppercase tracking-wider text-white shadow-lg">
                          {sortBy === "rank" ? `#${i + 1} Ranked` : "Featured"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-8">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="line-clamp-2 text-[22px] font-bold leading-snug text-[#6C6C6C] transition-colors group-hover:text-primary">
                          {uni.name}
                        </h3>
                      </div>

                      <div className="mb-4 flex items-center gap-1.5 text-[#6C6C6C]">
                        <span className="material-symbols-rounded text-[20px]">
                          location_on
                        </span>
                        <span className="truncate text-[16px] font-medium">
                          {uni.location}
                        </span>
                      </div>

                      <div className="mb-6 flex flex-wrap gap-3">
                        {(uni.offeredCourses?.length ? uni.offeredCourses : [activeTab])
                          .slice(0, 4)
                          .map((course) => (
                            <span
                              key={`${uni.name}-${course}`}
                              className="inline-flex items-center rounded-[5px] border border-slate-400 px-4 py-2 text-[14px] font-semibold leading-none text-[#6C6C6C]"
                            >
                              {course}
                            </span>
                          ))}
                        {(uni.offeredCourses?.length ?? 0) > 4 && (
                          <span className="inline-flex items-center rounded-[5px] border border-slate-400 px-4 py-2 text-[14px] font-semibold leading-none text-[#6C6C6C]">
                            +{(uni.offeredCourses?.length ?? 0) - 4} More
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-5">
                        <div className="text-[18px] font-medium text-[#6C6C6C]">
                          Avg. Package: <span className="font-bold text-primary">{uni.avgPackage}</span>
                          Avg. Package:{" "}
                          <span className="font-bold text-primary">
                            {uni.avgPackage || "Rs 4.5 LPA"}
                          </span>
                        </div>
                        <Link
                          href={uni.href}
                          className="inline-flex items-center gap-1 text-[#FF3C3C] font-bold text-[14px] group-hover:translate-x-1 transition-transform"
                        >
                          View Details
                          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <span className="material-symbols-rounded text-[32px]">
                    search_off
                  </span>
                </div>
                <h3 className="text-xl font-normal text-slate-800">
                  No Universities Found
                </h3>
                <p className="mt-2 text-slate-500">
                  Try searching for a different name or location.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/search?stream=${activeTabSlug}`}
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-primary border border-primary rounded-[5px] transition-all hover:bg-primary/5 active:scale-95"
          >
            Explore 120+ More {activeTab} Colleges
            <span className="material-symbols-rounded text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
      <hr className="border-t border-slate-200 mt-12" />
    </section>
  );
}
