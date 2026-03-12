"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface SearchFiltersProps {
  streams?: FilterOption[];
  degrees?: FilterOption[];
  cities?: FilterOption[];
  /** Current active filter values (controlled from parent / URL) */
  activeStream?: string;
  activeDegree?: string;
  activeCityId?: string;
  activeStateId?: string;
  activeFeesMax?: string;
  activeSort?: string;
  /** Total result count for display */
  totalResults?: number;
  /** Called whenever any filter changes — parent can use URL push instead */
  onFilterChange?: (filters: ActiveFilters) => void;
}

export interface ActiveFilters {
  stream: string;
  degree: string;
  city_id: string;
  state_id: string;
  fees_max: string;
  sort: string;
}

// ─── Indian states (static since no state table in DB) ────────────────────────

const INDIAN_STATES: FilterOption[] = [
  { id: "9",  name: "Uttar Pradesh" },
  { id: "7",  name: "Maharashtra" },
  { id: "4",  name: "Karnataka" },
  { id: "2",  name: "Delhi" },
  { id: "10", name: "Tamil Nadu" },
  { id: "3",  name: "Gujarat" },
  { id: "11", name: "Telangana" },
  { id: "1",  name: "Andhra Pradesh" },
  { id: "13", name: "West Bengal" },
  { id: "6",  name: "Madhya Pradesh" },
  { id: "9",  name: "Rajasthan" },
  { id: "5",  name: "Kerala" },
  { id: "8",  name: "Punjab" },
];

const SORT_OPTIONS = [
  { value: "rating",  label: "Top Rated",    icon: "star" },
  { value: "ranking", label: "Best Ranked",  icon: "emoji_events" },
  { value: "fees",    label: "Lowest Fees",  icon: "currency_rupee" },
  { value: "newest",  label: "Newest First", icon: "schedule" },
];

const FEES_OPTIONS = [
  { label: "Up to ₹1 Lakh",   value: "100000" },
  { label: "Up to ₹3 Lakhs",  value: "300000" },
  { label: "Up to ₹5 Lakhs",  value: "500000" },
  { label: "Up to ₹10 Lakhs", value: "1000000" },
  { label: "Up to ₹20 Lakhs", value: "2000000" },
];

// ─── Helper: Collapsible section ─────────────────────────────────────────────

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-left group"
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-red-500">
            {icon}
          </span>
          <span className="text-sm font-bold text-neutral-800">{title}</span>
        </div>
        <span
          className={`material-symbols-outlined text-[18px] text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          expand_more
        </span>
      </button>

      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

// ─── Radio pill list ───────────────────────────────────────────────────────────

function PillList({
  options,
  value,
  onChange,
  maxVisible = 6,
  searchable = false,
}: {
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  maxVisible?: number;
  searchable?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = searchable && search
    ? options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const visible = showAll ? filtered : filtered.slice(0, maxVisible);

  return (
    <div className="space-y-1.5">
      {searchable && options.length > maxVisible && (
        <div className="relative mb-3">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20 bg-neutral-50"
          />
        </div>
      )}

      {/* Clear option */}
      <button
        type="button"
        onClick={() => onChange("")}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
          value === ""
            ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
            : "text-neutral-500 hover:bg-neutral-100"
        }`}
      >
        <span className="material-symbols-outlined text-[13px]">
          {value === "" ? "radio_button_checked" : "radio_button_unchecked"}
        </span>
        All
      </button>

      {visible.map((opt) => {
        const optVal = String(opt.slug ?? opt.id);
        const active = value === optVal;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(active ? "" : optVal)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
              active
                ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                {active ? "radio_button_checked" : "radio_button_unchecked"}
              </span>
              <span className="truncate">{opt.name}</span>
            </div>
            {opt.count !== undefined && (
              <span
                className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}

      {filtered.length > maxVisible && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full text-center text-xs text-red-500 font-semibold py-1.5 hover:text-red-700 transition-colors"
        >
          {showAll
            ? "Show less"
            : `+ ${filtered.length - maxVisible} more`}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-2">
          No results found
        </p>
      )}
    </div>
  );
}

// ─── Main SearchFilters component ─────────────────────────────────────────────

export default function SearchFilters({
  streams = [],
  degrees = [],
  cities = [],
  activeStream = "",
  activeDegree = "",
  activeCityId = "",
  activeStateId = "",
  activeFeesMax = "",
  activeSort = "rating",
  totalResults,
  onFilterChange,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state (mirrors URL params)
  const [stream, setStream]   = useState(activeStream);
  const [degree, setDegree]   = useState(activeDegree);
  const [cityId, setCityId]   = useState(activeCityId);
  const [stateId, setStateId] = useState(activeStateId);
  const [feesMax, setFeesMax] = useState(activeFeesMax);
  const [sort, setSort]       = useState(activeSort || "rating");

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active filter count (for mobile badge)
  const activeCount = [stream, degree, cityId, stateId, feesMax].filter(
    Boolean
  ).length;

  // ── Push to URL ────────────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (overrides: Partial<ActiveFilters> = {}) => {
      const next: ActiveFilters = {
        stream:   overrides.stream   !== undefined ? overrides.stream   : stream,
        degree:   overrides.degree   !== undefined ? overrides.degree   : degree,
        city_id:  overrides.city_id  !== undefined ? overrides.city_id  : cityId,
        state_id: overrides.state_id !== undefined ? overrides.state_id : stateId,
        fees_max: overrides.fees_max !== undefined ? overrides.fees_max : feesMax,
        sort:     overrides.sort     !== undefined ? overrides.sort     : sort,
      };

      const params = new URLSearchParams(searchParams.toString());

      // Preserve q from existing URL
      const q = params.get("q") ?? "";
      params.delete("q");
      if (q) params.set("q", q);

      params.delete("page"); // reset to page 1 on filter change

      (Object.entries(next) as [keyof ActiveFilters, string][]).forEach(
        ([key, val]) => {
          if (val) {
            params.set(key, val);
          } else {
            params.delete(key);
          }
        }
      );

      // Remove default sort from URL to keep it clean
      if (params.get("sort") === "rating") params.delete("sort");

      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.(next);
    },
    [stream, degree, cityId, stateId, feesMax, sort, router, pathname, searchParams, onFilterChange]
  );

  // ── Sync local state → URL on each change ─────────────────────────────────
  const handleStream = (v: string) => {
    setStream(v);
    applyFilters({ stream: v });
  };
  const handleDegree = (v: string) => {
    setDegree(v);
    applyFilters({ degree: v });
  };
  const handleCity = (v: string) => {
    setCityId(v);
    applyFilters({ city_id: v });
  };
  const handleState = (v: string) => {
    setStateId(v);
    applyFilters({ state_id: v });
  };
  const handleFees = (v: string) => {
    setFeesMax(v);
    applyFilters({ fees_max: v });
  };
  const handleSort = (v: string) => {
    setSort(v);
    applyFilters({ sort: v });
  };

  // ── Reset all filters ──────────────────────────────────────────────────────
  const resetAll = () => {
    setStream("");
    setDegree("");
    setCityId("");
    setStateId("");
    setFeesMax("");
    setSort("rating");

    const params = new URLSearchParams();
    const q = searchParams.get("q") ?? "";
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`);
  };

  // ── Sync props → local state when URL changes externally ──────────────────
  useEffect(() => { setStream(activeStream); }, [activeStream]);
  useEffect(() => { setDegree(activeDegree); }, [activeDegree]);
  useEffect(() => { setCityId(activeCityId); }, [activeCityId]);
  useEffect(() => { setStateId(activeStateId); }, [activeStateId]);
  useEffect(() => { setFeesMax(activeFeesMax); }, [activeFeesMax]);
  useEffect(() => { setSort(activeSort || "rating"); }, [activeSort]);

  // ─── Filter panel content (shared by desktop sidebar + mobile drawer) ──────
  const panel = (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-black text-neutral-900">Filters</h2>
          {totalResults !== undefined && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {totalResults.toLocaleString()} colleges found
            </p>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              filter_list_off
            </span>
            Clear all
          </button>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {stream && (
            <FilterChip
              label={
                streams.find(
                  (s) => String(s.slug ?? s.id) === stream
                )?.name ?? stream
              }
              onRemove={() => handleStream("")}
            />
          )}
          {degree && (
            <FilterChip
              label={
                degrees.find(
                  (d) => String(d.slug ?? d.id) === degree
                )?.name ?? degree
              }
              onRemove={() => handleDegree("")}
            />
          )}
          {cityId && (
            <FilterChip
              label={
                cities.find((c) => String(c.id) === cityId)?.name ?? "City"
              }
              onRemove={() => handleCity("")}
            />
          )}
          {stateId && (
            <FilterChip
              label={
                INDIAN_STATES.find((s) => String(s.id) === stateId)?.name ??
                "State"
              }
              onRemove={() => handleState("")}
            />
          )}
          {feesMax && (
            <FilterChip
              label={
                FEES_OPTIONS.find((f) => f.value === feesMax)?.label ??
                `Max ₹${parseInt(feesMax).toLocaleString()}`
              }
              onRemove={() => handleFees("")}
            />
          )}
        </div>
      )}

      {/* ── Scrollable filter list ── */}
      <div className="flex-1 overflow-y-auto space-y-0 pr-1 -mr-1">
        {/* Sort */}
        <FilterSection title="Sort By" icon="sort" defaultOpen>
          <div className="grid grid-cols-2 gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSort(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  sort === opt.value
                    ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Stream */}
        {streams.length > 0 && (
          <FilterSection title="Stream" icon="school" defaultOpen>
            <PillList
              options={streams}
              value={stream}
              onChange={handleStream}
              maxVisible={7}
            />
          </FilterSection>
        )}

        {/* Degree */}
        {degrees.length > 0 && (
          <FilterSection title="Degree" icon="workspace_premium" defaultOpen={false}>
            <PillList
              options={degrees}
              value={degree}
              onChange={handleDegree}
              maxVisible={6}
              searchable
            />
          </FilterSection>
        )}

        {/* City */}
        {cities.length > 0 && (
          <FilterSection title="City" icon="location_city" defaultOpen={false}>
            <PillList
              options={cities}
              value={cityId}
              onChange={handleCity}
              maxVisible={6}
              searchable
            />
          </FilterSection>
        )}

        {/* State */}
        <FilterSection title="State" icon="map" defaultOpen={false}>
          <PillList
            options={INDIAN_STATES}
            value={stateId}
            onChange={handleState}
            maxVisible={6}
          />
        </FilterSection>

        {/* Fees */}
        <FilterSection title="Max Fees" icon="currency_rupee" defaultOpen={false}>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleFees("")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                feesMax === ""
                  ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {feesMax === ""
                  ? "radio_button_checked"
                  : "radio_button_unchecked"}
              </span>
              Any Budget
            </button>
            {FEES_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFees(opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  feesMax === opt.value
                    ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {feesMax === opt.value
                    ? "radio_button_checked"
                    : "radio_button_unchecked"}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
          {panel}
        </div>
      </aside>

      {/* ── Mobile: floating filter button ── */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/20 hover:bg-red-600 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">
            filter_list
          </span>
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-[85vw] max-w-sm h-full bg-white shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <span className="text-base font-black text-neutral-900">
                Filter Colleges
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-neutral-600">
                  close
                </span>
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl hover:bg-red-700 transition-colors text-sm"
              >
                Show {totalResults?.toLocaleString() ?? ""} Colleges
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-full">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-red-900 transition-colors"
      >
        <span className="material-symbols-outlined text-[11px]">close</span>
      </button>
    </span>
  );
}
