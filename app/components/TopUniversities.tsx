"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AskQueryModal from "@/app/college/[slug]/components/AskQueryModal";
import ApplyAuthModal from "@/app/components/ApplyAuthModal";
import { useApplyGuard } from "@/app/hooks/useApplyGuard";
import type { FilterCollegeResult } from "@/lib/college-filter";
import type { AdItem } from "./AdsSection";
import AdCard from "./AdCard";
import FadeIn from "./FadeIn";

export interface University {
  name: string;
  location: string;
  image: string;
  rating: number;
  totalRatingUser: number;
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
];

export default function TopUniversities({
  universities: initialUniversities,
  initialStreamColleges = [],
  ads = [],
}: TopUniversitiesProps) {
  const { handleApply, modalSlug, closeModal } = useApplyGuard();
  const [activeTab, setActiveTab] = useState("Engineering");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUniversities, setCurrentUniversities] = useState<University[]>(
    initialStreamColleges.length > 0 ? initialStreamColleges : initialUniversities,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "rating" | null>(null);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // On mount, if no SSR data was provided, fetch Engineering colleges
  useEffect(() => {
    if (currentUniversities.length === 0) {
      fetchColleges("Engineering");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="home-page-shell">
        <FadeIn>
          <div className="mb-16 grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h2 className="text-[28px] sm:text-[40px] lg:text-[56px] xl:text-[68px] font-semibold leading-[1.1] tracking-tight text-slate-900">
                Discover the Top <span className="text-primary">Universities</span>
              </h2>
              <p className="mt-4 max-w-3xl text-[15px] sm:text-[18px] lg:text-[22px] font-medium leading-relaxed text-slate-500">
                Filter through thousands of institutions worldwide based on your
                specific academic preferences and career goals.
              </p>
            </div>
            <div className="lg:col-span-4">
              <AdCard ads={ads} className="mx-auto max-w-[440px] lg:ml-auto lg:mr-0" />
            </div>
          </div>
        </FadeIn>

        <div className="mb-8 flex items-center gap-3 flex-col sm:flex-row">
          <div className="group relative flex h-[48px] w-full sm:flex-1 sm:max-w-[800px] overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges, universities..."
              suppressHydrationWarning
              className="h-full flex-1 bg-white pl-12 text-[14px] sm:text-[16px] font-normal text-[#6C6C6C] placeholder:text-[#6C6C6CA1] focus:outline-none"
            />
            <button className="flex h-full min-w-[80px] sm:min-w-[120px] items-center justify-center bg-[#FF3C3C] px-4 sm:px-8 text-sm font-semibold text-white hover:bg-[#E63636]">
              Search
            </button>
          </div>
          <button
            onClick={() => setSortBy(sortBy === "rank" ? null : "rank")}
            className={`h-[48px] w-full sm:w-auto rounded-[5px] border px-4 sm:px-6 text-sm font-medium shadow-sm transition-all ${
              sortBy === "rank" ? "border-[#FF3C3C] bg-[#FF3C3C] text-white" : "border-slate-200 bg-white text-slate-600"
            } flex items-center justify-center gap-2`}
          >
            <span className="material-symbols-rounded text-[20px]">swap_vert</span>
            Sort By: rank
          </button>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabClick(cat)}
              className={`whitespace-nowrap rounded-[5px] px-6 py-2.5 text-sm font-normal transition-all active:scale-95 ${
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
          <h3 className="whitespace-nowrap text-[20px] font-bold uppercase tracking-wider text-slate-900">
            Top rank universities !
          </h3>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div
          className={`grid grid-cols-1 gap-6 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8 ${isLoading ? "pointer-events-none opacity-50" : "opacity-100"}`}
        >
          {filteredUniversities.length > 0 ? (
            filteredUniversities.slice(0, 8).map((uni, i) => (
              <div key={`${uni.href}-${i}`}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-100 bg-white shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={uni.image}
                        alt={uni.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                       <div className="absolute top-3 right-0 bg-white px-2.5 py-1 flex items-center gap-1.5 shadow-md rounded-l-[5px] border border-r-0 border-neutral-100 z-10">
                         <span className="material-symbols-rounded text-[#FF3C3C] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                           star
                         </span>
                         <span className="font-semibold" style={{ fontSize: "13px", color: "#3E3E3E" }}>
                           {uni.rating.toFixed(1)}
                           <span className="ml-1 font-medium">
                             ( {uni.totalRatingUser >= 1000 ? `${(uni.totalRatingUser / 1000).toFixed(1)}k` : uni.totalRatingUser} Reviews )
                           </span>
                         </span>
                       </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="rounded-[5px] bg-primary px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-white shadow-lg">
                          {sortBy === "rank" ? `#${i + 1} Ranked` : "Featured"}
                        </span>
                      </div>
                    </div>

                     <div className="flex flex-1 flex-col p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="line-clamp-2 leading-snug transition-colors group-hover:text-primary" style={{ fontWeight: 700, fontSize: '16px', color: 'rgba(108, 108, 108, 1)' }}>
                          {uni.name}
                        </h3>
                      </div>

                      <div className="mb-4 flex items-center gap-1.5 text-[#6C6C6C]">
                        <span className="material-symbols-rounded text-[20px]">
                          location_on
                        </span>
                        <span className="truncate text-[16px] font-semibold">
                          {uni.location}
                        </span>
                      </div>

                      <div className="mb-5 flex flex-wrap gap-3">
                        {(uni.offeredCourses?.length ? uni.offeredCourses : [activeTab])
                          .slice(0, 4)
                          .map((course) => (
                            <span
                              key={`${uni.name}-${course}`}
                              className="inline-flex items-center rounded-[5px] border border-slate-400 bg-[#F8FAFC] px-4 py-2 text-[16px] font-semibold leading-none text-[#6C6C6C]"
                            >
                              {course}
                            </span>
                          ))}
                        {(uni.offeredCourses?.length ?? 0) > 4 && (
                          <span className="inline-flex items-center rounded-[5px] border border-slate-400 bg-[#F8FAFC] px-4 py-2 text-[16px] font-semibold leading-none text-[#6C6C6C]">
                            +{(uni.offeredCourses?.length ?? 0) - 4} More
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex flex-row items-center gap-2 border-t border-slate-200 pt-4 relative z-20">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(uni.href.replace('/college/', '')); }}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-[11px] lg:text-[12px] font-bold px-1.5 py-2.5 rounded-[5px] transition-all whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_document</span>
                          Apply Now
                        </button>
                        <AskQueryModal slug={uni.href.replace('/college/', '')} collegeName={uni.name}
                          renderTrigger={(onClick) => (
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }}
                              className="flex-1 flex items-center justify-center gap-1 bg-white border border-[#FF3C3C] hover:bg-red-50 text-[#FF3C3C] text-[11px] lg:text-[12px] font-bold px-1.5 py-2.5 rounded-[5px] transition-all whitespace-nowrap">
                              <span className="material-symbols-outlined text-[14px]">help</span>
                              Ask Query
                            </button>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
          </div>

        <div className="mt-12 text-center">
          <Link
            href="/top-university"
            className="group inline-flex h-[51.8px] items-center gap-2 rounded-[5px] border border-primary px-6 text-sm font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
          >
            Explore All Universities
            <span className="material-symbols-rounded text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
      <div className="home-page-shell">
        <hr className="mt-12 border-t border-slate-200" />
      </div>
      {modalSlug && <ApplyAuthModal redirectTo={`/apply/${modalSlug}`} onClose={closeModal} />}
    </section>
  );
}
