"use client";

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
      className="relative w-full"
      autoComplete="off"
    >
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 shadow-sm focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-400/10 transition-all duration-200 px-4">
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
          placeholder="Search colleges, universities..."
          className="flex-1 py-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent outline-none min-w-0"
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
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
        <button
          type="submit"
          className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors ml-1"
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && value.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-100 shadow-xl overflow-hidden z-40">
          {loadingSuggestions ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-400">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-red-500 rounded-full animate-spin" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-neutral-300 group-hover:text-red-400 transition-colors flex-shrink-0">
                      account_balance
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-800 group-hover:text-red-700 truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {s.location}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-neutral-300 group-hover:text-red-400 flex-shrink-0 transition-colors">
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

  // ── Snapshot of the init params the server rendered with ──────────────────
  // Used to detect whether the current URL already matches what SSR gave us,
  // so we never fire a redundant fetch for data we already have.
  const initParamsKey = useMemo(
    () =>
      [
        initQ,
        initStream,
        initDegree,
        initCityId,
        initStateId,
        initFeesMax,
        initSort,
        String(initPage),
        initType,
      ].join("|"),
    [
      initQ,
      initStream,
      initDegree,
      initCityId,
      initStateId,
      initFeesMax,
      initSort,
      initPage,
      initType,
    ],
  );

  // ── Fetch colleges only when URL params change AFTER the initial mount ─────
  useEffect(() => {
    // Skip the very first effect run — SSR already provided the correct data.
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Also skip if the current URL params exactly match what the server
    // rendered (e.g. after a router.push() that triggered a new SSR pass —
    // the initialColleges sync effect above already updated the state).
    const currentKey = [
      q,
      stream,
      degree,
      cityId,
      stateId,
      feesMax,
      sort,
      String(page),
      type,
    ].join("|");
    if (currentKey === initParamsKey) return;

    let cancelled = false;

    async function fetchColleges() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (stream) params.set("stream", stream);
        if (degree) params.set("degree", degree);
        if (cityId) params.set("city_id", cityId);
        if (stateId) params.set("state_id", stateId);
        if (feesMax) params.set("fees_max", feesMax);
        if (sort) params.set("sort", sort);
        if (type) params.set("type", type);
        if (page > 1) params.set("page", String(page));

        const res = await fetch(`/api/search/colleges?${params.toString()}`);
        const data = await res.json();

        if (!cancelled && data.success) {
          setColleges(data.colleges);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setCurrentPage(data.page);
        }
      } catch (err) {
        console.error("[SearchClient] fetch error", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchColleges();
    return () => {
      cancelled = true;
    };
  }, [
    q,
    stream,
    degree,
    cityId,
    stateId,
    feesMax,
    sort,
    type,
    page,
    initParamsKey,
  ]);

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
    <div className="min-h-screen relative">
      {/* ── Full Page Background ── */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ── Hero / Search Banner ── */}
        <div className="pt-24 pb-10">
          <div className="mx-auto w-full px-4 lg:px-8 xl:px-12">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-400 mb-5">
              <a href="/" className="hover:text-white transition-colors">
                Home
              </a>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-neutral-300">{pageTitle}</span>
            </nav>

            {/* Title */}
            <div className="mb-7 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                {pageTitle}
              </h1>
              <p className="text-neutral-300 text-sm sm:text-base">
                {pageSubtitle}
              </p>
            </div>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar defaultValue={q} onSearch={handleSearch} />
            </div>

            {/* Active search indicator */}
            {q && (
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-sm text-neutral-400">Results for:</span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">
                    search
                  </span>
                  {q}
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="ml-0.5 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      close
                    </span>
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto w-full px-4 lg:px-8 xl:px-12 py-8">
          <div className="flex gap-6">
            {/* ── Filters sidebar ── */}
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
              />

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0">
              {/* ── Toolbar row ── */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <p className="text-sm text-neutral-300 font-medium">
                  {loading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-neutral-300 border-t-red-500 rounded-full animate-spin inline-block" />
                      Loading {entityNamePlural.toLowerCase()}...
                    </span>
                  ) : (
                    showingText
                  )}
                </p>

                {/* Sort (mobile/tablet) + View toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Sort dropdown (desktop inline) */}
                  <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          if (opt.value === "rating") {
                            params.delete("sort");
                          } else {
                            params.set("sort", opt.value);
                          }
                          params.delete("page");
                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${(sort || "rating") === opt.value
                            ? "bg-white/20 text-white shadow-sm"
                            : "text-neutral-300 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      title="Grid view"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${viewMode === "grid"
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-neutral-300 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        grid_view
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      title="List view"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${viewMode === "list"
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-neutral-300 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        view_agenda
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── College grid / list ── */}
              {loading ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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
                      className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        filter_list_off
                      </span>
                      Clear All Filters
                    </a>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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
