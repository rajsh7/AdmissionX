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
import Pagination from "@/app/components/Pagination";
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
}

type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "ranking", label: "Best Ranked" },
  { value: "fees", label: "Lowest Fees" },
  { value: "newest", label: "Newest" },
];

// ─── Search bar with typeahead ────────────────────────────────────────────────

interface Suggestion {
  name: string;
  location: string;
  slug: string;
}

function SearchBar({
  defaultValue,
  onSearch,
}: {
  defaultValue: string;
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
    setShowSuggestions(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(value.trim());
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setValue(s.name);
    setShowSuggestions(false);
    onSearch(s.name);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full"
      autoComplete="off"
    >
      <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 shadow-xl focus-within:border-[#008080] focus-within:ring-4 focus-within:ring-[#008080]/5 transition-all duration-300 px-6 py-1">
        <span className="material-symbols-outlined text-[20px] text-neutral-400 flex-shrink-0">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Location, universities, courses..."
          className="flex-1 py-4 text-sm sm:text-base text-neutral-800 placeholder:text-neutral-400 bg-transparent outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setSuggestions([]);
              onSearch("");
              inputRef.current?.focus();
            }}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors pt-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <button
        type="submit"
        className="flex-shrink-0 bg-[#008080] hover:bg-[#006666] text-white text-sm font-black px-12 py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#008080]/20 min-w-max"
      >
        Search Now
      </button>

      {/* Suggestions dropdown */}
      {showSuggestions && value.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-100 shadow-xl overflow-hidden z-40">
          {loadingSuggestions ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-400">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-[#008080] rounded-full animate-spin" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#008080]/5 transition-colors text-left group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-neutral-300 group-hover:text-[#008080] transition-colors flex-shrink-0">
                      account_balance
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-800 group-hover:text-[#008080] truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {s.location}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-neutral-300 group-hover:text-[#008080] flex-shrink-0 transition-colors">
                      north_west
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-400">
              No colleges found for &quot;{value}&quot;
            </div>
          )}
        </div>
      )}
    </form>
  );
}

// ─── Results skeleton ─────────────────────────────────────────────────────────

function CollegeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-100 rounded-lg w-3/4" />
        <div className="h-3 bg-neutral-100 rounded-lg w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-neutral-100 rounded w-16" />
          <div className="h-5 bg-neutral-100 rounded w-16" />
        </div>
        <div className="h-8 bg-neutral-100 rounded-xl mt-4" />
      </div>
    </div>
  );
}

function CollegeListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex gap-4 animate-pulse">
      <div className="w-32 h-24 bg-neutral-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-neutral-100 rounded-lg w-2/3" />
        <div className="h-3 bg-neutral-100 rounded-lg w-1/3" />
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
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      {/* ── Hero Background ── */}
      <div className="absolute top-0 left-0 w-full h-[580px] z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2000&auto=format&fit=crop"
          alt="Campus Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        {/* ── Hero / Search Banner ── */}
        <div className="pt-28 pb-20 relative">
          <div className="mx-auto w-full px-4 lg:px-12 xl:px-20">
            {hasMounted && (
              <div className="max-w-4xl pt-10">
                <h1 className="text-6xl sm:text-7xl lg:text-[100px] font-black text-white leading-[1.1] mb-6 drop-shadow-xl">
                  Finds your <br />
                  <span className="text-[#008080]">Dream college</span>
                </h1>
                <p className="text-white text-lg sm:text-2xl font-bold mb-10 max-w-2xl leading-relaxed">
                  Search thousands of courses and universities worldwide
                </p>

                {/* Search bar */}
                <div className="max-w-2xl">
                  <SearchBar defaultValue={q} onSearch={handleSearch} />
                </div>
              </div>
            )}

            {/* Active search indicator */}
            {q && (
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">


              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto w-full px-4 lg:px-8 xl:px-12 py-8">
          <div className="flex gap-6">
            {/* ── Filters sidebar ── */}
            <div className="flex flex-col gap-6">
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

              {/* Ad Placeholder below sidebar */}
              <div className="hidden lg:block w-72 xl:w-80 h-96 bg-neutral-200/50 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 font-bold text-sm">
                AD_SPACE
              </div>
            </div>

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0">
              {/* ── Results Toolbar (Figma Redesign) ── */}
              {/* ── Results Toolbar (Figma Redesign) ── */}
              <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-4 border-b border-neutral-100">
                  {/* Active Filters Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-neutral-400 whitespace-nowrap uppercase tracking-wider">
                      Active Filters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stream && (
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
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
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
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
                        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 border-dashed">No filters applied</span>
                      )}
                    </div>
                  </div>

                  {/* Sort Row */}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-neutral-400 whitespace-nowrap uppercase tracking-wider">
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
                          className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 pr-10 py-2.5 text-xs font-black text-neutral-700 shadow-sm focus:outline-none focus:border-[#008080] transition-all cursor-pointer min-w-[180px]"
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
                    <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#008080] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#008080] text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
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
                      className="inline-flex items-center gap-2 bg-[#008080] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#006666] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        filter_list_off
                      </span>
                      Clear All Filters
                    </a>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Bottom Ad Placeholder */}
              <div className="mt-12 w-full h-32 bg-neutral-200/50 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 font-bold text-sm">
                BANNERAD_SPACE
              </div>

              {/* ── Pagination ── */}
              {!loading && totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
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
