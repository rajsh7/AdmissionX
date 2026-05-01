"use client";
// v2 - redesign cache bust

import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";
import CollegeCard from "@/app/components/CollegeCard";
import CollegeListItem from "@/app/components/CollegeListItem";
import SearchFilters from "@/app/components/SearchFilters";
import PaginationFixed from "@/app/components/PaginationFixed";
import SearchBar from "@/app/components/SearchBar";
import type { CollegeResult } from "@/app/api/search/colleges/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface SearchClientProps {
  initialColleges: CollegeResult[];
  initialTotal: number;
  initialTotalPages: number;
  streams: FilterOption[];
  degrees: FilterOption[];
  cities: FilterOption[];
  states?: FilterOption[];
  countries?: FilterOption[];
  // Initial URL params (from server)
  initQ: string;
  initStream: string;
  initDegree: string;
  initCityId: string;
  initStateId: string;
  initCountryId?: string;
  initFeesMax: string;
  initSort: string;
  initPage: number;
  initType: string;
  pageTitle: string;
  pageSubtitle: string;
  entityName?: string;
  entityNamePlural?: string;
  // Optional styling props
  gridCols?: number;
  heroImage?: string;
  heroRightImage?: string;
  heroHeight?: string;
  heroObjectPosition?: string;
  heroFit?: string;
  filterWidth?: string;
}

type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "ranking", label: "Best Ranked" },
  { value: "fees", label: "Lowest Fees" },
  { value: "newest", label: "Newest" },
];

function getCollegeRenderKey(college: CollegeResult, index: number): string {
  return [
    college.id ?? "no-id",
    college.slug || "no-slug",
    index,
  ].join("-");
}

// ─── Search bar with typeahead ────────────────────────────────────────────────



// ─── Results skeleton ─────────────────────────────────────────────────────────

function CollegeCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-100 rounded-[10px] w-3/4" />
        <div className="h-3 bg-neutral-100 rounded-[10px] w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-neutral-100 rounded w-16" />
          <div className="h-5 bg-neutral-100 rounded w-16" />
        </div>
        <div className="h-8 bg-neutral-100 rounded-[10px] mt-4" />
      </div>
    </div>
  );
}

function CollegeListSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border border-neutral-100 p-5 flex gap-4 animate-pulse">
      <div className="w-32 h-24 bg-neutral-100 rounded-[10px] flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-neutral-100 rounded-[10px] w-2/3" />
        <div className="h-3 bg-neutral-100 rounded-[10px] w-1/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-neutral-100 rounded w-20" />
          <div className="h-5 bg-neutral-100 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default function SearchClient({
  initialColleges,
  initialTotal,
  initialTotalPages,
  streams,
  degrees,
  cities,
  states = [],
  countries = [],
  initQ,
  initStream,
  initDegree,
  initCityId,
  initStateId,
  initCountryId = "",
  initFeesMax,
  initSort,
  initPage,
  entityName = "College",
  entityNamePlural = "Colleges",
  gridCols = 3,
  heroImage = "/images/hero-student.png",
  heroRightImage = "",
  heroHeight = "560px",
  heroObjectPosition = "center",
  heroFit = "cover",
  filterWidth = "300px",
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [colleges, setColleges] = useState<CollegeResult[]>(initialColleges);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initPage);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasMounted, setHasMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Current filter values (derived from URL)
  const q = searchParams.get("q") ?? initQ;
  const stream = searchParams.get("stream") ?? initStream;
  const degree = searchParams.get("degree") ?? initDegree;
  const cityId = searchParams.get("city_id") ?? initCityId;
  const stateId = searchParams.get("state_id") ?? initStateId;
  const countryId = searchParams.get("country_id") ?? initCountryId;
  const feesMax = searchParams.get("fees_max") ?? initFeesMax;
  const sort = searchParams.get("sort") ?? initSort;
  const page = parseInt(searchParams.get("page") ?? String(initPage));
  const feesRanges = searchParams.get("fees_ranges") ? searchParams.get("fees_ranges")!.split(",") : [];
  const ratingRanges = searchParams.get("rating_ranges") ? searchParams.get("rating_ranges")!.split(",") : [];
  const ownerships = searchParams.get("ownerships") ? searchParams.get("ownerships")!.split(",") : [];

  // ── Sync state when the server delivers fresh initialColleges after a
  //    router.push() navigation (new SSR render completes) ───────────────────
  useEffect(() => {
    setColleges(initialColleges);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
    setCurrentPage(initPage);
    setVisibleCount(12);
    setLoading(false);
  }, [initialColleges, initialTotal, initialTotalPages, initPage]);

  const handleLoadMore = useCallback(async () => {
    const nextCount = visibleCount + 12;
    // Already have enough fetched, just show more
    if (nextCount <= colleges.length) {
      setVisibleCount(nextCount);
      return;
    }
    // Need to fetch more from API
    setLoadingMore(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", "48");
      params.delete("page");
      // Ensure city_id is always sent (URL may only have ?city=text resolved server-side)
      if (cityId && !params.get("city_id")) params.set("city_id", cityId);
      // Remove the text-based city param so API doesn't get confused
      params.delete("city");
      const res = await fetch(`/api/search/colleges?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.colleges.length > 0) {
        setColleges(data.colleges);
        setVisibleCount(nextCount);
      } else {
        setVisibleCount(nextCount);
      }
    } catch {
      setVisibleCount(nextCount);
    } finally {
      setLoadingMore(false);
    }
  }, [visibleCount, colleges.length, searchParams, cityId]);

  // Loading state cleanly aligns with Next.js router transitions
  useEffect(() => {
    if (!isPending) {
      setLoading(false);
    }
  }, [isPending]);

  // ── Handle search bar submit ───────────────────────────────────────────────
  const handleSearch = useCallback(
    (newQ: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQ) {
        params.set("q", newQ);
      } else {
        params.delete("q");
      }
      params.delete("page");
      setLoading(true);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname],
  );

  const isFiltered = !!(q || stream || degree || cityId || stateId || countryId || feesMax || feesRanges.length > 0 || ratingRanges.length > 0 || ownerships.length > 0);

  const showingText = loading
    ? "Loading..."
    : total === 0
    ? "No results found"
    : `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, total)} of ${total.toLocaleString()} ${entityNamePlural.toLowerCase()}`;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-neutral-50 flex flex-col relative">
      <Header />
      <div className="relative w-full z-20" style={{ height: heroHeight }}>
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <Image
            src={heroImage}
            alt="Campus Background"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: heroFit as "cover" | "contain" | "fill" | "none" | "scale-down", objectPosition: heroObjectPosition }}
            className=""
          />
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-start relative">
            <div className="mx-auto max-w-[1920px] w-full px-6 md:px-12 lg:px-24 h-full relative">
              <div className="flex flex-col justify-center h-full relative z-20">
                <div className={`transition-opacity duration-300 mt-6 flex flex-col justify-center ${heroRightImage ? "lg:max-w-[55%] text-left" : "max-w-4xl text-left"} ${hasMounted ? "opacity-100" : "opacity-0"}`}>
                  <h1 className="font-poppins text-white leading-[1.05] tracking-[0.02em] mb-4 drop-shadow-2xl">
                    <span className="text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold block mb-0">Finds your</span>
                    <span className="text-[40px] sm:text-[54px] lg:text-[72px] font-black text-[#FF3C3C]">Dream college</span>
                  </h1>
                  <p className="text-white text-lg sm:text-2xl font-bold mb-8 max-w-2xl leading-relaxed opacity-90">
                    Search thousands of courses and universities worldwide
                  </p>
                  <div className="max-w-2xl">
                    <SearchBar defaultValue={q} onSearch={handleSearch} />
                  </div>
                </div>
              </div>

              {heroRightImage && (
                <div className="hidden lg:block absolute bottom-0 right-0 w-[45%] h-[90%] z-10">
                  <div className="relative w-full h-full">
                    <Image
                      src={heroRightImage}
                      alt="Hero illustration"
                      fill
                      className="object-contain object-bottom drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {/* -- Main content -- */}
        <div className="mx-auto max-w-[1920px] w-full px-0 pt-8 pb-8">
          <div className="flex gap-5 items-start">
            {/* ── Filters sidebar ── */}
            <div className="hidden lg:block flex-shrink-0 sticky top-[72px] self-start" style={{ flexBasis: filterWidth, minWidth: filterWidth, maxWidth: filterWidth }}>
              <SearchFilters
                key={`${stream}|${degree}|${cityId}|${stateId}|${countryId}|${feesMax}|${sort}|${searchParams.get("fees_ranges")}|${searchParams.get("rating_ranges")}|${searchParams.get("ownerships")}`}
                streams={streams}
                degrees={degrees}
                cities={cities}
                states={states}
                countries={countries}
                activeStream={stream}
                activeDegree={degree}
                activeCityId={cityId}
                activeStateId={stateId}
                activeCountryId={countryId}
                activeFeesMax={feesMax}
                activeFeesRanges={searchParams.get("fees_ranges") ?? ""}
                activeRatingRanges={searchParams.get("rating_ranges") ?? ""}
                activeOwnerships={searchParams.get("ownerships") ?? ""}
                activeSort={sort}
                totalResults={total}
                entityNamePlural={entityNamePlural}
              />

            </div>

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0 pl-10 pr-6">
              {/* ── Results Toolbar (Figma Redesign) ── */}
              <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-4 border-b border-neutral-100">
                  {/* Active Filters Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap">
                      Active Filters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stream && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm transition-all hover:border-[#008080]">
                          {streams.find(s => String(s.slug || s.id) === stream)?.name || stream}
                          <button onClick={() => {
                            const p = new URLSearchParams(searchParams.toString());
                            p.delete("stream"); p.delete("page");
                            router.push(`${pathname}?${p.toString()}`);
                          }} className="hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      )}
                      {degree && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm transition-all hover:border-[#008080]">
                          {degrees.find(d => String(d.slug || d.id) === degree)?.name || degree}
                          <button onClick={() => {
                            const p = new URLSearchParams(searchParams.toString());
                            p.delete("degree"); p.delete("page");
                            router.push(`${pathname}?${p.toString()}`);
                          }} className="hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      )}
                      {cityId && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          {cities.find(c => String(c.id) === cityId)?.name || cityId}
                          <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("city_id"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      )}
                      {stateId && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          {states.find(s => String(s.id) === stateId)?.name || stateId}
                          <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("state_id"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      )}
                      {countryId && !stateId && !cityId && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          {countries.find(c => String(c.id) === countryId)?.name || countryId}
                          <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("country_id"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      )}
                      {feesMax && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          Up to ₹{(Number(feesMax) / 100000).toFixed(0)}L fees
                          <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("fees_max"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      )}
                      {feesRanges.map(fr => (
                        <div key={`fr-${fr}`} className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          Fees: {fr}
                          <button onClick={() => { 
                            const p = new URLSearchParams(searchParams.toString()); 
                            const newArr = feesRanges.filter(x => x !== fr);
                            if (newArr.length > 0) p.set("fees_ranges", newArr.join(",")); else p.delete("fees_ranges");
                            p.delete("page"); router.push(`${pathname}?${p.toString()}`); 
                          }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ))}
                      {ratingRanges.map(rr => (
                        <div key={`rr-${rr}`} className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          Rating: {rr}
                          <button onClick={() => { 
                            const p = new URLSearchParams(searchParams.toString()); 
                            const newArr = ratingRanges.filter(x => x !== rr);
                            if (newArr.length > 0) p.set("rating_ranges", newArr.join(",")); else p.delete("rating_ranges");
                            p.delete("page"); router.push(`${pathname}?${p.toString()}`); 
                          }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ))}
                      {ownerships.map(ow => (
                        <div key={`ow-${ow}`} className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#6C6C6C] shadow-sm hover:border-[#FF3C3C] transition-all">
                          {ow}
                          <button onClick={() => { 
                            const p = new URLSearchParams(searchParams.toString()); 
                            const newArr = ownerships.filter(x => x !== ow);
                            if (newArr.length > 0) p.set("ownerships", newArr.join(",")); else p.delete("ownerships");
                            p.delete("page"); router.push(`${pathname}?${p.toString()}`); 
                          }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ))}
                      {!stream && !degree && !cityId && !stateId && !countryId && !feesMax && feesRanges.length === 0 && ratingRanges.length === 0 && ownerships.length === 0 && (
                        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-[10px] border border-neutral-100 border-dashed">No filters applied</span>
                      )}
                    </div>
                  </div>

                  {/* Sort Row */}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap">
                        Short by:
                      </span>
                      <div className="relative">
                        <select
                          value={sort || "rating"}
                          onChange={(e) => {
                            const val = e.target.value;
                            const p = new URLSearchParams(searchParams.toString());
                            if (val === "rating") p.delete("sort");
                            else p.set("sort", val);
                            p.delete("page");
                            router.push(`${pathname}?${p.toString()}`);
                          }}
                          className="appearance-none bg-white border border-neutral-200 rounded-[5px] px-4 pr-10 text-[13px] font-medium text-[#6C6C6C] shadow-sm focus:outline-none focus:border-[#008080] transition-all cursor-pointer min-w-[180px]"
                          style={{ height: "45px" }}
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-white border border-neutral-200 rounded-[5px] p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-[5px] transition-all ${viewMode === 'list' ? 'bg-[#FF3C3C] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">view_headline</span>
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-[5px] transition-all ${viewMode === 'grid' ? 'bg-[#FF3C3C] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Count Summary */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-bold">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin" />
                        Refreshing {entityNamePlural.toLowerCase()}...
                      </span>
                    ) : (
                      showingText
                    )}
                  </p>
                </div>
              </div>

              {/* ── College grid / list ── */}
              {loading ? (
                viewMode === "grid" ? (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-y-5 gap-x-[10px]`}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <CollegeCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <CollegeListSkeleton key={i} />
                    ))}
                  </div>
                )
              ) : colleges.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-[10px] bg-neutral-100 flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-[40px] text-neutral-300">
                      search_off
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">
                    No {entityNamePlural.toLowerCase()} found
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-xs mb-6">
                    {isFiltered
                      ? "Try removing some filters or searching with different keywords."
                      : `No ${entityNamePlural.toLowerCase()} match your search. Try different keywords.`}
                  </p>
                  {isFiltered && (
                    <a
                      href={pathname}
                      className="inline-flex items-center gap-2 bg-[#008080] text-white text-sm font-bold px-5 py-3 rounded-[10px] hover:bg-[#006666] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        filter_list_off
                      </span>
                      Clear All Filters
                    </a>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-y-5 gap-x-[10px]`}>
                  {colleges.slice(0, visibleCount).map((college, i) => (
                    <CollegeCard
                      key={getCollegeRenderKey(college, i)}
                      college={college}
                      index={i}
                      entityName={entityName}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {colleges.slice(0, visibleCount).map((college, i) => (
                    <CollegeListItem
                      key={getCollegeRenderKey(college, i)}
                      college={college}
                      index={i}
                      entityName={entityName}
                    />
                  ))}
                </div>
              )}

              {/* ── Load More arrow ── */}
              {hasMounted && !loading && colleges.length > 0 && visibleCount < 36 && visibleCount < total && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors disabled:opacity-50"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {loadingMore ? "Loading..." : "Show More"}
                    </span>
                    <span className={`material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] ${loadingMore ? "animate-spin" : "animate-bounce"}`}>
                      {loadingMore ? "progress_activity" : "keyboard_arrow_down"}
                    </span>
                  </button>
                </div>
              )}

              {/* ── Pagination (shows after 36 visible or no more to load) ── */}
              {hasMounted && !loading && totalPages > 1 && visibleCount >= 36 && (
                <div className="mt-10">
                  <PaginationFixed
                    currentPage={currentPage}
                    totalPages={totalPages}
                    useUrl
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explore Cards */}
      <div className="w-full pb-0">
        <ExploreCards />
      </div>

      <Footer />
    </div>
  );
}
// Force cache invalidation 4
