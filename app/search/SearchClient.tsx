"use client";
// v2 - redesign cache bust

import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useTransition,
  useMemo,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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
  // Initial URL params (from server)
  initQ: string;
  initStream: string;
  initDegree: string;
  initCityId: string;
  initStateId: string;
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
  initQ,
  initStream,
  initDegree,
  initCityId,
  initStateId,
  initFeesMax,
  initSort,
  initPage,
  initType,
  pageTitle,
  pageSubtitle,
  entityName = "College",
  entityNamePlural = "Colleges",
<<<<<<< HEAD
  gridCols = 3,
  heroImage = "/images/hero-student.png",
  heroRightImage = "",
  heroHeight = "560px",
  heroObjectPosition = "cover",
  heroFit = "cover",
  filterWidth = "300px",
=======
  heroImage = "/images/hero-student.png",
  heroRightImage,
  heroHeight = "700px",
  heroObjectPosition = "center",
  heroFit = "cover",
  filterWidth = "300px",
  gridCols = 3,
>>>>>>> f701a05bda162634057550b1b3f328ca2ab9fb7c
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [colleges, setColleges] = useState<CollegeResult[]>(initialColleges);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initPage);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Current filter values (derived from URL)
  const q = searchParams.get("q") ?? initQ;
  const stream = searchParams.get("stream") ?? initStream;
  const degree = searchParams.get("degree") ?? initDegree;
  const cityId = searchParams.get("city_id") ?? initCityId;
  const stateId = searchParams.get("state_id") ?? initStateId;
  const feesMax = searchParams.get("fees_max") ?? initFeesMax;
  const sort = searchParams.get("sort") ?? initSort;
  const page = parseInt(searchParams.get("page") ?? String(initPage));
  const type = searchParams.get("type") ?? initType;

  // ── Track whether we are on the very first mount ───────────────────────────
  // On initial mount the server has ALREADY rendered `initialColleges` for the
  // current URL params — there is nothing to fetch.  We only want the client-
  // side API call when the user actually changes a filter or page AFTER mount.
  const isMountedRef = useRef(false);

  // ── Sync state when the server delivers fresh initialColleges after a
  //    router.push() navigation (new SSR render completes) ───────────────────
  useEffect(() => {
    setColleges(initialColleges);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
    setCurrentPage(initPage);
  }, [initialColleges, initialTotal, initialTotalPages, initPage]);

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

  const isFiltered = !!(q || stream || degree || cityId || stateId || feesMax);

  const showingText = loading
    ? "Loading..."
    : `Showing ${colleges.length > 0 ? (page - 1) * 12 + 1 : 0}–${Math.min(page * 12, total)} of ${total.toLocaleString()} ${entityNamePlural.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative overflow-x-hidden">
      <div className="relative w-full overflow-hidden" style={{ height: heroHeight }}>
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <Image
            src={heroImage}
            alt="Campus Background"
            fill
            priority
            sizes="100vw"
<<<<<<< HEAD
            className={`object-${heroObjectPosition}`}
=======
            style={{ objectFit: heroFit as "cover" | "contain" | "fill" | "none" | "scale-down", objectPosition: heroObjectPosition }}
            className=""
>>>>>>> f701a05bda162634057550b1b3f328ca2ab9fb7c
          />
          <div className="absolute inset-0 bg-neutral-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-start relative">
            <div className="mx-auto max-w-[1920px] w-full px-8 lg:px-12 xl:px-20 h-full relative">
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
        {/* ── Main content ── */}
        <div className="mx-auto max-w-[1920px] w-full px-8 lg:px-12 xl:px-20 pt-8 pb-8">
          <div className="flex gap-5">
            {/* ── Filters sidebar ── */}
            <div className="hidden lg:flex flex-col gap-6 flex-shrink-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2" style={{ flexBasis: filterWidth, minWidth: filterWidth, maxWidth: filterWidth }}>
              <SearchFilters
                streams={streams}
                degrees={degrees}
                cities={cities}
                activeStream={stream}
                activeDegree={degree}
                activeCityId={cityId}
                activeStateId={stateId}
                activeFeesMax={feesMax}
                activeSort={sort}
                totalResults={total}
                entityName={entityName}
                entityNamePlural={entityNamePlural}
                onFilterChange={() => setLoading(true)}
              />

            </div>

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0">
              {/* ── Results Toolbar (Figma Redesign) ── */}
              <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-4 border-b border-neutral-100">
                  {/* Active Filters Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap uppercase tracking-wider">
                      Active Filters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stream && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
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
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
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
                      {!stream && !degree && !cityId && !stateId && (
                        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-[10px] border border-neutral-100 border-dashed">No filters applied</span>
                      )}
                    </div>
                  </div>

                  {/* Sort Row */}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap uppercase tracking-wider">
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
                          className="appearance-none bg-white border border-neutral-200 rounded-[10px] px-4 pr-10 py-2.5 text-[13px] font-black text-neutral-700 shadow-sm focus:outline-none focus:border-[#008080] transition-all cursor-pointer min-w-[180px]"
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
                    <div className="flex items-center bg-white border border-neutral-200 rounded-[10px] p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-[10px] transition-all ${viewMode === 'grid' ? 'bg-[#008080] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-[10px] transition-all ${viewMode === 'list' ? 'bg-[#008080] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">view_headline</span>
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
                  {colleges.map((college, i) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                      index={i}
                      entityName={entityName}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {colleges.map((college, i) => (
                    <CollegeListItem
                      key={college.id}
                      college={college}
                      index={i}
                      entityName={entityName}
                    />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!loading && totalPages > 1 && (
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

      <Footer />
    </div>
  );
}
// Force cache invalidation 4
