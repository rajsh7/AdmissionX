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
  states?: FilterOption[];
  countries?: FilterOption[];
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
  country_id: string;
  fees_max: string;
  sort: string;
  q?: string;
  ranking?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
  states = [],
  countries = [],
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
  const [cityId, setCityId]     = useState(activeCityId);
  const [stateId, setStateId]   = useState(activeStateId);
  const [countryId, setCountryId] = useState("");
  const [feesMax, setFeesMax] = useState(activeFeesMax);
  const [sort, setSort]       = useState(activeSort || "rating");
  const [ranking, setRanking] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropOpen, setCityDropOpen] = useState(false);

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
        stream:     overrides.stream      !== undefined ? overrides.stream      : stream,
        degree:     overrides.degree      !== undefined ? overrides.degree      : degree,
        city_id:    overrides.city_id     !== undefined ? overrides.city_id     : cityId,
        state_id:   overrides.state_id    !== undefined ? overrides.state_id    : stateId,
        country_id: overrides.country_id  !== undefined ? overrides.country_id  : countryId,
        fees_max:   overrides.fees_max    !== undefined ? overrides.fees_max    : feesMax,
        sort:       overrides.sort        !== undefined ? overrides.sort        : sort,
        q:          overrides.q           !== undefined ? overrides.q           : undefined,
        ranking:    overrides.ranking     !== undefined ? overrides.ranking     : ranking,
      };

      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, val]) => {
        const isDefaultSort = key === "sort" && (val === "rating" || val === activeSort);
        if (val && !isDefaultSort) params.set(key, val);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
      if (onFilterChange) onFilterChange(next);
    },
    [stream, degree, cityId, stateId, feesMax, sort, ranking, searchParams, router, pathname, onFilterChange]
  );

  const resetAll = () => {
    router.push(pathname);
    setStream("");
    setDegree("");
    setCityId("");
    setStateId("");
    setCountryId("");
    setFeesMax("");
    setRanking("");
    setCitySearch("");
    setCityDropOpen(false);
    if (onFilterChange) onFilterChange({} as any);
  };

  const handleStream = (val: string) => { setStream(val); applyFilters({ stream: val }); };
  const handleDegree = (val: string) => { setDegree(val); applyFilters({ degree: val }); };
  const handleFees   = (val: string) => { setFeesMax(val); applyFilters({ fees_max: val }); };

  const handleCityClick = (cId: string, sId: string, coId: string) => {
    setCityId(cId);
    setStateId(sId);
    setCountryId(coId);
    applyFilters({ city_id: cId, state_id: sId, country_id: coId });
  };

  const filteredCities = citySearch.length >= 1
    ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 50)
    : cities.slice(0, 50);

  const selectedCity = cities.find(c => String(c.id) === cityId);

  if (!mounted) return null;

  const panel = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] -mx-4 -mt-4 mb-2 rounded-t-[10px] shadow-lg border-b border-white/5">
        <h2 className="text-[25px] font-black text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#FF3C3C]">filter_alt</span>
          Filters
        </h2>
        <button type="button" onClick={resetAll} className="text-xs text-[#FF3C3C] font-bold hover:text-white transition-colors">
          Clear all
        </button>
      </div>

      {/* Filter list */}
      <div className="space-y-4">
        {/* University Name */}
        <div>
          <label className="text-xs font-bold text-neutral-600 block">University Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search your university..."
              className="w-full pl-3 pr-3 py-3 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-neutral-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
          </div>
        </div>

        {/* Location — searchable city dropdown */}
        <div className="relative h-[62px]">
          <label className="text-xs font-bold text-neutral-600 block">Location</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">location_on</span>
            <input
              type="text"
              placeholder={selectedCity ? selectedCity.name : "Search city..."}
              value={citySearch}
              onChange={(e) => { setCitySearch(e.target.value); setCityDropOpen(true); }}
              onFocus={() => setCityDropOpen(true)}
              onBlur={() => setTimeout(() => setCityDropOpen(false), 150)}
              className="w-full pl-9 pr-8 py-3 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-neutral-500"
            />
            {cityId && (
              <button type="button" onMouseDown={() => { setCityId(""); setStateId(""); setCountryId(""); setCitySearch(""); applyFilters({ city_id: "", state_id: "", country_id: "" }); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-[16px] text-neutral-400 hover:text-[#FF3C3C]">close</span>
              </button>
            )}
          </div>
          {cityDropOpen && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-[5px] shadow-xl max-h-48 overflow-y-auto">
              {filteredCities.map((city) => {
                const state = states.find(s => String(s.id) === String(city.slug));
                return (
                  <button
                    key={city.id}
                    type="button"
                    onMouseDown={() => {
                      const sId = city.slug ?? "";
                      const coId = state ? String(state.slug ?? "") : "";
                      setCitySearch("");
                      setCityDropOpen(false);
                      handleCityClick(String(city.id), sId, coId);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#FF3C3C]/5 ${
                      cityId === String(city.id) ? "text-[#FF3C3C] font-bold bg-[#FF3C3C]/5" : "text-neutral-700"
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    {state && <span className="text-xs text-neutral-400 ml-1">{state.name}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Name */}
        <div>
          <label className="text-xs font-bold text-neutral-600 block">Course name</label>
          <div className="relative">
            <select
              value={degree}
              onChange={(e) => handleDegree(e.target.value)}
              className="w-full pl-3 pr-8 py-3 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
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
          <label className="text-xs font-bold text-neutral-600 block">Stream</label>
          <div className="relative">
            <select
              value={stream}
              onChange={(e) => handleStream(e.target.value)}
              className="w-full pl-3 pr-8 py-3 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
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
          <label className="text-xs font-bold text-neutral-600 block">Tuition fee</label>
          <div className="relative">
            <select
              value={feesMax}
              onChange={(e) => handleFees(e.target.value)}
              className="w-full pl-3 pr-8 py-3 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
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
          <label className="text-xs font-bold text-neutral-600 block">Ranking</label>
          <div className="space-y-1 px-1">
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
        <div className="pt-0 grid grid-cols-2 items-stretch gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-full whitespace-nowrap bg-[#FF3C3C] hover:bg-[#E63636] text-white text-xs font-black py-2 rounded-[5px] shadow-lg shadow-[#FF3C3C]/20 transition-all active:scale-[0.98]"
          >
            Apply filter
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="w-full whitespace-nowrap bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 text-xs font-black py-2 rounded-[5px] transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-full flex-shrink-0 mr-6 ml-6">
        <div className="sticky top-6 bg-white rounded-[5px] border border-neutral-100 shadow-xl p-4 flex flex-col">
          {panel}
        </div>
      </aside>

      {/* Mobile: floating filter button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-6 py-3.5 rounded-[5px] shadow-2xl shadow-black/20 hover:bg-[#FF3C3C] transition-all duration-300"
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
                className="w-8 h-8 rounded-[5px] bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-neutral-600">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="px-5 py-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full bg-[#FF3C3C] text-white font-bold py-3.5 rounded-[5px] hover:bg-[#E63636] transition-colors text-sm"
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




