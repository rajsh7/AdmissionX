"use client";

import { useState, useCallback, useEffect } from "react";
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
  activeStream?: string;
  activeDegree?: string;
  activeCityId?: string;
  activeStateId?: string;
  activeFeesMax?: string;
  activeSort?: string;
  totalResults?: number;
  onFilterChange?: (filters: ActiveFilters) => void;
  entityName?: string;
  entityNamePlural?: string;
}

export interface ActiveFilters {
  stream: string;
  degree: string;
  city_id: string;
  state_id: string;
  fees_max: string;
  sort: string;
  q?: string;
  ranking?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
  { id: "12", name: "Rajasthan" },
  { id: "5",  name: "Kerala" },
  { id: "8",  name: "Punjab" },
];

const SORT_OPTIONS = [
  { value: "rating",  label: "Top Rated",    icon: "star" },
  { value: "ranking", label: "Best Ranked",  icon: "emoji_events" },
  { value: "fees",    label: "Lowest Fees",  icon: "currency_rupee" },
  { value: "newest",  label: "Newest First", icon: "schedule" },
];

const RANKING_OPTIONS = [
  { id: "1-50",   name: "Top 50" },
  { id: "51-100",  name: "Top 100" },
  { id: "101-200", name: "Top 200" },
  { id: "201+",    name: "Above 200" },
];

const FEES_OPTIONS = [
  { label: "Up to ₹1 Lakh",   value: "100000" },
  { label: "Up to ₹3 Lakhs",  value: "300000" },
  { label: "Up to ₹5 Lakhs",  value: "500000" },
  { label: "Up to ₹10 Lakhs", value: "1000000" },
  { label: "Up to ₹20 Lakhs", value: "2000000" },
];

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
  entityName = "College",
  entityNamePlural = "Colleges",
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state
  const [stream, setStream]   = useState(activeStream);
  const [degree, setDegree]   = useState(activeDegree);
  const [cityId, setCityId]   = useState(activeCityId);
  const [stateId, setStateId] = useState(activeStateId);
  const [feesMax, setFeesMax] = useState(activeFeesMax);
  const [sort, setSort]       = useState(activeSort || "rating");
  const [ranking, setRanking] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with URL
  useEffect(() => {
    setStream(activeStream);
    setDegree(activeDegree);
    setCityId(activeCityId);
    setStateId(activeStateId);
    setFeesMax(activeFeesMax);
    setSort(activeSort);
  }, [activeStream, activeDegree, activeCityId, activeStateId, activeFeesMax, activeSort]);

  const activeCount = [stream, degree, cityId, stateId, feesMax, ranking].filter(Boolean).length;

  const applyFilters = useCallback(
    (overrides: Partial<ActiveFilters> = {}) => {
      const next: ActiveFilters = {
        stream:   overrides.stream   !== undefined ? overrides.stream   : stream,
        degree:   overrides.degree   !== undefined ? overrides.degree   : degree,
        city_id:  overrides.city_id  !== undefined ? overrides.city_id  : cityId,
        state_id: overrides.state_id !== undefined ? overrides.state_id : stateId,
        fees_max: overrides.fees_max !== undefined ? overrides.fees_max : feesMax,
        sort:     overrides.sort     !== undefined ? overrides.sort     : sort,
        q:        overrides.q        !== undefined ? overrides.q        : undefined,
        ranking:  overrides.ranking  !== undefined ? overrides.ranking  : ranking,
      };

      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
      if (onFilterChange) onFilterChange(next);
    },
    [stream, degree, cityId, stateId, feesMax, sort, ranking, searchParams, router, pathname, onFilterChange]
  );

  const resetAll = () => {
    const params = new URLSearchParams();
    params.set("sort", "rating");
    router.push(`${pathname}?${params.toString()}`);
    setStream("");
    setDegree("");
    setCityId("");
    setStateId("");
    setFeesMax("");
    setRanking("");
    if (onFilterChange) onFilterChange({} as any);
  };

  const handleStream = (val: string) => { setStream(val); applyFilters({ stream: val }); };
  const handleDegree = (val: string) => { setDegree(val); applyFilters({ degree: val }); };
  const handleCity   = (val: string) => { setCityId(val); applyFilters({ city_id: val }); };
  const handleState  = (val: string) => { setStateId(val); applyFilters({ state_id: val }); };
  const handleFees   = (val: string) => { setFeesMax(val); applyFilters({ fees_max: val }); };

  if (!mounted) return null;

  const panel = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1A1A1A] -mx-5 -mt-5 mb-8 rounded-t-[10px] shadow-lg border-b border-white/5">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#FF3C3C]">filter_alt</span>
          Filters
        </h2>
        <button type="button" onClick={resetAll} className="text-xs text-[#FF3C3C] font-bold hover:text-white transition-colors">
          Clear all
        </button>
      </div>

      {/* Filter list */}
      <div className="flex-1 space-y-8 pb-10">
        {/* University Name */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">University Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search your university..."
              className="w-full pl-4 pr-3 py-3 text-sm border border-neutral-200 rounded-[10px] focus:outline-none focus:border-[#FF3C3C] focus:ring-4 focus:ring-[#FF3C3C]/5 bg-white transition-all placeholder:text-neutral-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Location</label>
          <div className="relative">
            <select
              value={cityId || stateId || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith("state:")) {
                  handleState(val.replace("state:", ""));
                  handleCity("");
                } else {
                  handleCity(val);
                  handleState("");
                }
              }}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-[10px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="">Search with location...</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.id} value={`state:${s.id}`}>{s.name} (State)</option>
              ))}
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Course Name */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Course name</label>
          <div className="relative">
            <select
              value={degree}
              onChange={(e) => handleDegree(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-[10px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
            >
              <option value="">Search according to the course...</option>
              {degrees.map((d) => (
                <option key={d.id} value={d.slug || String(d.id)}>{d.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Stream */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Stream</label>
          <div className="relative">
            <select
              value={stream}
              onChange={(e) => handleStream(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-[10px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
            >
              <option value="">Select Stream...</option>
              {streams.map((s) => (
                <option key={s.id} value={s.slug || String(s.id)}>{s.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Tuition Fee */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Tuition fee</label>
          <div className="relative">
            <select
              value={feesMax}
              onChange={(e) => handleFees(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-[10px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
            >
              <option value="">Select Fees Range...</option>
              {FEES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Ranking Checkboxes */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-3 block">Ranking</label>
          <div className="space-y-3 px-1">
            {RANKING_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={ranking === opt.id}
                    onChange={() => {
                        const newVal = ranking === opt.id ? "" : opt.id;
                        setRanking(newVal); 
                        applyFilters({ ranking: newVal });
                    }}
                    className="w-5 h-5 border-2 border-neutral-200 rounded bg-white checked:bg-[#FF3C3C] checked:border-[#FF3C3C] appearance-none transition-all cursor-pointer"
                  />
                  {ranking === opt.id && (
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[16px] flex items-center justify-center pointer-events-none">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${ranking === opt.id ? 'text-[#FF3C3C]' : 'text-neutral-500 group-hover:text-neutral-800'}`}>
                  {opt.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="pt-8 grid grid-cols-2 items-stretch gap-2.5 pb-4">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-full whitespace-nowrap bg-[#FF3C3C] hover:bg-[#E63636] text-white text-sm font-black py-3.5 rounded-[10px] shadow-lg shadow-[#FF3C3C]/20 transition-all active:scale-[0.98]"
          >
            Apply filter
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="w-full whitespace-nowrap bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 text-sm font-black py-3.5 rounded-[10px] transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-full flex-shrink-0">
        <div className="sticky top-6 bg-white rounded-[10px] border border-neutral-100 shadow-xl p-5 flex flex-col">
          {panel}
        </div>
      </aside>

      {/* Mobile: floating filter button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-6 py-3.5 rounded-[10px] shadow-2xl shadow-black/20 hover:bg-[#FF3C3C] transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FF3C3C] text-white text-[10px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-[85%] max-w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-black text-neutral-800">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-[10px] bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-neutral-600">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="px-5 py-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full bg-[#FF3C3C] text-white font-bold py-3.5 rounded-[10px] hover:bg-[#E63636] transition-colors text-sm"
              >
                Show {totalResults?.toLocaleString() ?? ""} {entityNamePlural}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




