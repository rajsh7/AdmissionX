"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
  activeCountryId?: string;
  activeFeesMax?: string;
  activeSort?: string;
  totalResults?: number;
  onFilterChange?: (filters: ActiveFilters) => void;
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
  fees_ranges?: string;
  rating_ranges?: string;
  ownerships?: string;
}

const RANKING_OPTIONS = [
  { id: "1-50", name: "Top 50" },
  { id: "51-100", name: "Top 100" },
  { id: "101-200", name: "Top 200" },
  { id: "201+", name: "Above 200" },
];

const FEES_OPTIONS = [
  { label: "Up to ₹1 Lakh", value: "100000" },
  { label: "Up to ₹3 Lakhs", value: "300000" },
  { label: "Up to ₹5 Lakhs", value: "500000" },
  { label: "Up to ₹10 Lakhs", value: "1000000" },
  { label: "Up to ₹20 Lakhs", value: "2000000" },
];

const TOTAL_FEES_OPTIONS = [
  { label: "< 1 Lakh", value: "0-100000" },
  { label: "1 - 2 Lakh", value: "100000-200000" },
  { label: "2 - 3 Lakh", value: "200000-300000" },
  { label: "3 - 5 Lakh", value: "300000-500000" },
  { label: "> 5 Lakh", value: "500000-999999999" },
];

const RATING_OPTIONS = [
  { label: "> 4 - 5 Star", value: "4-5" },
  { label: "> 3 - 4 Star", value: "3-4" },
  { label: "> 2 - 3 Star", value: "2-3" },
];

const OWNERSHIP_OPTIONS = [
  { label: "Private College", value: "Private College" },
  { label: "Government College", value: "Government College" },
  { label: "Government University", value: "Government University" },
  { label: "Private University", value: "Private University" },
];

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
  activeCountryId = "",
  activeFeesMax = "",
  activeSort = "rating",
  totalResults,
  onFilterChange,
  entityNamePlural = "Colleges",
  activeFeesRanges = "",
  activeRatingRanges = "",
  activeOwnerships = "",
}: SearchFiltersProps & { activeFeesRanges?: string; activeRatingRanges?: string; activeOwnerships?: string; }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [stream, setStream] = useState(activeStream);
  const [degree, setDegree] = useState(activeDegree);
  const [cityId, setCityId] = useState(activeCityId);
  const [stateId, setStateId] = useState(activeStateId);
  const [countryId, setCountryId] = useState(activeCountryId);
  const [feesMax, setFeesMax] = useState(activeFeesMax);
  const [sort] = useState(activeSort || "rating");
  const [ranking, setRanking] = useState("");
  const [feesRanges, setFeesRanges] = useState<string[]>(activeFeesRanges ? activeFeesRanges.split(',') : []);
  const [ratingRanges, setRatingRanges] = useState<string[]>(activeRatingRanges ? activeRatingRanges.split(',') : []);
  const [ownerships, setOwnerships] = useState<string[]>(activeOwnerships ? activeOwnerships.split(',') : []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropOpen, setCityDropOpen] = useState(false);

  const activeCount = [stream, degree, cityId, stateId, countryId, feesMax].filter(Boolean).length + feesRanges.length + ratingRanges.length + ownerships.length;

  const applyFilters = useCallback(
    (overrides: Partial<ActiveFilters> = {}) => {
      const next: ActiveFilters = {
        stream: overrides.stream !== undefined ? overrides.stream : stream,
        degree: overrides.degree !== undefined ? overrides.degree : degree,
        city_id: overrides.city_id !== undefined ? overrides.city_id : cityId,
        state_id: overrides.state_id !== undefined ? overrides.state_id : stateId,
        country_id: overrides.country_id !== undefined ? overrides.country_id : countryId,
        fees_max: overrides.fees_max !== undefined ? overrides.fees_max : feesMax,
        sort: overrides.sort !== undefined ? overrides.sort : sort,
        q: overrides.q !== undefined ? overrides.q : undefined,
        ranking: overrides.ranking !== undefined ? overrides.ranking : ranking,
        fees_ranges: overrides.fees_ranges !== undefined ? overrides.fees_ranges : feesRanges.join(","),
        rating_ranges: overrides.rating_ranges !== undefined ? overrides.rating_ranges : ratingRanges.join(","),
        ownerships: overrides.ownerships !== undefined ? overrides.ownerships : ownerships.join(","),
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
    [stream, degree, cityId, stateId, countryId, feesMax, sort, ranking, feesRanges, ratingRanges, ownerships, searchParams, router, pathname, onFilterChange, activeSort]
  );

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string, filterKey: keyof ActiveFilters) => {
    setter(prev => {
      const nextArr = prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item];
      applyFilters({ [filterKey]: nextArr.join(",") });
      return nextArr;
    });
  };

  const resetAll = () => {
    router.push(pathname);
    setStream("");
    setDegree("");
    setCityId("");
    setStateId("");
    setCountryId("");
    setFeesMax("");
    setRanking("");
    setFeesRanges([]);
    setRatingRanges([]);
    setOwnerships([]);
    setCitySearch("");
    setCityDropOpen(false);
    if (onFilterChange) onFilterChange({} as ActiveFilters);
  };

  const handleStream = (val: string) => { setStream(val); applyFilters({ stream: val }); };
  const handleDegree = (val: string) => { setDegree(val); applyFilters({ degree: val }); };
  const handleFees = (val: string) => { setFeesMax(val); applyFilters({ fees_max: val }); };

  const handleCityClick = (cId: string, sId: string, coId: string) => {
    setCityId(cId); setStateId(sId); setCountryId(coId);
    applyFilters({ city_id: cId, state_id: sId, country_id: coId });
  };

  const countryStates = states.filter((state) => String(state.slug) === countryId);
  const selectedCountryName = countries.find((country) => String(country.id) === countryId)?.name;
  const isCountryOnlySelection = !!countryId && !stateId && !cityId && countryStates.length === 0;

  const panel = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] -mx-4 -mt-4 mb-2 rounded-t-[5px] border-b border-white/5">
        <h2 className="text-[25px] font-black text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#FF3C3C]">filter_alt</span>
          Filters
        </h2>
        <button type="button" onClick={resetAll} className="text-xs text-[#FF3C3C] font-bold hover:text-white transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* University Name */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block">University Name</label>
          <input
            type="text"
            placeholder="Search your university..."
            className="w-full pl-3 pr-3 text-base font-semibold border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-[#6C6C6C]"
            style={{ height: "45px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters({ q: (e.target as HTMLInputElement).value });
            }}
          />
        </div>

        {/* Location — Nested Country → State → City */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block mb-1">Location</label>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-2">
            {["Country", "State", "City"].map((step, i) => {
              const done = i === 0 ? !!countryId : i === 1 ? !!stateId : !!cityId;
              const active = i === 0 ? !countryId : i === 1 ? !!countryId && !stateId : !!stateId && !cityId;
              return (
                <span key={step} className="inline-flex items-center gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? "bg-[#FF3C3C] text-white" : active ? "bg-neutral-200 text-neutral-700" : "bg-neutral-100 text-neutral-400"
                    }`}>{step}</span>
                  {i < 2 && <span className="material-symbols-outlined text-[12px] text-neutral-300">chevron_right</span>}
                </span>
              );
            })}
            {(countryId || stateId || cityId) && (
              <button type="button" onClick={() => { setCityId(""); setStateId(""); setCountryId(""); setCitySearch(""); applyFilters({ city_id: "", state_id: "", country_id: "" }); }} className="ml-auto">
                <span className="material-symbols-outlined text-[15px] text-neutral-400 hover:text-[#FF3C3C]">close</span>
              </button>
            )}
          </div>

          {/* Country */}
          {!countryId && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-neutral-400 pointer-events-none">public</span>
              <input type="text" placeholder="Search country..."
                value={citySearch}
                onChange={(e) => { setCitySearch(e.target.value); setCityDropOpen(true); }}
                onFocus={() => setCityDropOpen(true)}
                onBlur={() => setTimeout(() => setCityDropOpen(false), 150)}
                className="w-full pl-9 pr-3 text-base font-semibold border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-[#6C6C6C]"
                style={{ height: "45px" }}
              />
              {cityDropOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-[5px] shadow-xl max-h-48 overflow-y-auto">
                  {countries.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).map((country) => (
                    <button key={country.id} type="button"
                      onMouseDown={() => {
                        const nextCountryId = String(country.id);
                        const hasStates = states.some((state) => String(state.slug) === nextCountryId);
                        setCountryId(nextCountryId);
                        setStateId("");
                        setCityId("");
                        setCitySearch("");
                        setCityDropOpen(false);
                        if (!hasStates) {
                          applyFilters({ city_id: "", state_id: "", country_id: nextCountryId });
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#FF3C3C]/5 text-neutral-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-neutral-400">public</span>
                      {country.name}
                    </button>
                  ))}
                  {countries.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                    <p className="px-3 py-2 text-xs text-neutral-400">No countries found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* State */}
          {countryId && !stateId && countryStates.length > 0 && (() => {
            return (
              <div className="relative">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[11px] font-bold text-[#FF3C3C]">{selectedCountryName}</span>
                  <button type="button" onClick={() => { setCountryId(""); setCitySearch(""); }} className="text-neutral-400 hover:text-[#FF3C3C]">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
                <span className="material-symbols-outlined absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 text-[16px] text-neutral-400 pointer-events-none">map</span>
                <input type="text" placeholder="Search state..."
                  value={citySearch}
                  onChange={(e) => { setCitySearch(e.target.value); setCityDropOpen(true); }}
                  onFocus={() => setCityDropOpen(true)}
                  onBlur={() => setTimeout(() => setCityDropOpen(false), 150)}
                  className="w-full pl-9 pr-3 text-base font-semibold border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-[#6C6C6C]"
                  style={{ height: "45px" }}
                />
                {cityDropOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-[5px] shadow-xl max-h-48 overflow-y-auto">
                    {countryStates.filter(s => !citySearch || s.name.toLowerCase().includes(citySearch.toLowerCase())).map((state) => (
                      <button key={state.id} type="button"
                        onMouseDown={() => { setStateId(String(state.id)); setCitySearch(""); setCityDropOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#FF3C3C]/5 text-neutral-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-neutral-400">map</span>
                        {state.name}
                      </button>
                    ))}
                    {countryStates.filter(s => !citySearch || s.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-xs text-neutral-400">No states found</p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {isCountryOnlySelection && (
            <div className="flex items-center gap-2 bg-[#FF3C3C]/5 border border-[#FF3C3C]/20 rounded-[5px] px-3 py-2">
              <span className="material-symbols-outlined text-[15px] text-[#FF3C3C]">public</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#FF3C3C] truncate">{selectedCountryName}</p>
                <p className="text-[10px] text-neutral-400">Country filter applied</p>
              </div>
              <button type="button" onClick={() => { setCityId(""); setStateId(""); setCountryId(""); setCitySearch(""); applyFilters({ city_id: "", state_id: "", country_id: "" }); }}>
                <span className="material-symbols-outlined text-[16px] text-neutral-400 hover:text-[#FF3C3C]">close</span>
              </button>
            </div>
          )}

          {/* City */}
          {stateId && !cityId && (() => {
            const stateCities = cities.filter(c => String(c.slug) === stateId);
            return (
              <div className="relative">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[11px] font-bold text-[#FF3C3C]">{selectedCountryName}</span>
                  <span className="material-symbols-outlined text-[11px] text-neutral-400">chevron_right</span>
                  <span className="text-[11px] font-bold text-[#FF3C3C]">{states.find(s => String(s.id) === stateId)?.name}</span>
                  <button type="button" onClick={() => { setStateId(""); setCitySearch(""); }} className="text-neutral-400 hover:text-[#FF3C3C]">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
                <span className="material-symbols-outlined absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 text-[16px] text-neutral-400 pointer-events-none">location_city</span>
                <input type="text" placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => { setCitySearch(e.target.value); setCityDropOpen(true); }}
                  onFocus={() => setCityDropOpen(true)}
                  onBlur={() => setTimeout(() => setCityDropOpen(false), 150)}
                  className="w-full pl-9 pr-3 text-base font-semibold border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white transition-all placeholder:text-[#6C6C6C]"
                  style={{ height: "45px" }}
                />
                {cityDropOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-[5px] shadow-xl max-h-48 overflow-y-auto">
                    {stateCities.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).map((city) => (
                      <button key={city.id} type="button"
                        onMouseDown={() => { setCitySearch(""); setCityDropOpen(false); handleCityClick(String(city.id), stateId, countryId); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#FF3C3C]/5 text-neutral-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-neutral-400">location_on</span>
                        {city.name}
                      </button>
                    ))}
                    {stateCities.filter(c => !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-xs text-neutral-400">No cities found</p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Selected city display */}
          {cityId && (
            <div className="flex items-center gap-2 bg-[#FF3C3C]/5 border border-[#FF3C3C]/20 rounded-[5px] px-3 py-2">
              <span className="material-symbols-outlined text-[15px] text-[#FF3C3C]">location_on</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#FF3C3C] truncate">{cities.find(c => String(c.id) === cityId)?.name}</p>
                <p className="text-[10px] text-neutral-400">{states.find(s => String(s.id) === stateId)?.name} · {selectedCountryName}</p>
              </div>
              <button type="button" onClick={() => { setCityId(""); setStateId(""); setCountryId(""); setCitySearch(""); applyFilters({ city_id: "", state_id: "", country_id: "" }); }}>
                <span className="material-symbols-outlined text-[16px] text-neutral-400 hover:text-[#FF3C3C]">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Course Name */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block">Course name</label>
          <div className="relative">
            <select value={degree} onChange={(e) => handleDegree(e.target.value)}
              className="w-full pl-3 pr-8 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
              style={{ height: "45px" }}>
              <option value="">Search according to the course...</option>
              {degrees.map((d) => <option key={d.id} value={d.slug || String(d.id)}>{d.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Stream */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block">Stream</label>
          <div className="relative">
            <select value={stream} onChange={(e) => handleStream(e.target.value)}
              className="w-full pl-3 pr-8 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
              style={{ height: "45px" }}>
              <option value="">Select Stream...</option>
              {streams.map((s) => <option key={s.id} value={s.slug || String(s.id)}>{s.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Tuition Fee */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block">Tuition fee</label>
          <div className="relative">
            <select value={feesMax} onChange={(e) => handleFees(e.target.value)}
              className="w-full pl-3 pr-8 text-sm border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer"
              style={{ height: "45px" }}>
              <option value="">Select Fees Range...</option>
              {FEES_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Ranking */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block">Ranking</label>
          <div className="space-y-1 px-1">
            {RANKING_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={ranking === opt.id}
                    onChange={() => { const v = ranking === opt.id ? "" : opt.id; setRanking(v); applyFilters({ ranking: v }); }}
                    className="w-5 h-5 border-2 border-neutral-200 rounded bg-white checked:bg-[#FF3C3C] checked:border-[#FF3C3C] appearance-none transition-all cursor-pointer"
                  />
                  {ranking === opt.id && (
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[16px] flex items-center justify-center pointer-events-none">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${ranking === opt.id ? "text-[#FF3C3C]" : "text-neutral-500 group-hover:text-neutral-800"}`}>
                  {opt.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Total Fees */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block mb-2">Total Fees</label>
          <div className="space-y-1 px-1">
            {TOTAL_FEES_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={feesRanges.includes(opt.value)}
                    onChange={() => toggleArrayItem(setFeesRanges, opt.value, "fees_ranges")}
                    className="w-5 h-5 border-2 border-neutral-200 rounded bg-white checked:bg-[#FF3C3C] checked:border-[#FF3C3C] appearance-none transition-all cursor-pointer"
                  />
                  {feesRanges.includes(opt.value) && (
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[16px] flex items-center justify-center pointer-events-none">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${feesRanges.includes(opt.value) ? "text-[#FF3C3C]" : "text-neutral-500 group-hover:text-neutral-800"}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block mb-2">Rating</label>
          <div className="space-y-1 px-1">
            {RATING_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={ratingRanges.includes(opt.value)}
                    onChange={() => toggleArrayItem(setRatingRanges, opt.value, "rating_ranges")}
                    className="w-5 h-5 border-2 border-neutral-200 rounded bg-white checked:bg-[#FF3C3C] checked:border-[#FF3C3C] appearance-none transition-all cursor-pointer"
                  />
                  {ratingRanges.includes(opt.value) && (
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[16px] flex items-center justify-center pointer-events-none">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${ratingRanges.includes(opt.value) ? "text-[#FF3C3C]" : "text-neutral-500 group-hover:text-neutral-800"}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ownership */}
        <div>
          <label className="text-[16px] font-semibold text-[#6C6C6C] block mb-2">Ownership</label>
          <div className="space-y-1 px-1">
            {OWNERSHIP_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={ownerships.includes(opt.value)}
                    onChange={() => toggleArrayItem(setOwnerships, opt.value, "ownerships")}
                    className="w-5 h-5 border-2 border-neutral-200 rounded bg-white checked:bg-[#FF3C3C] checked:border-[#FF3C3C] appearance-none transition-all cursor-pointer"
                  />
                  {ownerships.includes(opt.value) && (
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[16px] flex items-center justify-center pointer-events-none">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${ownerships.includes(opt.value) ? "text-[#FF3C3C]" : "text-neutral-500 group-hover:text-neutral-800"}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-0 grid grid-cols-2 items-stretch gap-3">
          <button type="button" onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center whitespace-nowrap bg-[#FF3C3C] border border-transparent hover:bg-[#E63636] text-white text-[14px] font-bold rounded-[5px] shadow-lg shadow-[#FF3C3C]/20 transition-all active:scale-[0.98]"
            style={{ height: "45px" }}>
            Apply filter
          </button>
          <button type="button" onClick={resetAll}
            className="w-full flex items-center justify-center whitespace-nowrap bg-white border border-neutral-200 text-[#6C6C6C] hover:text-neutral-600 hover:border-neutral-400 text-[14px] font-bold rounded-[5px] transition-all"
            style={{ height: "45px" }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-full flex-shrink-0 mr-6 ml-6">
        <div className="sticky top-6 bg-white rounded-[5px] border border-neutral-200 shadow-md p-4 flex flex-col">
          {panel}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button type="button" onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-6 py-3.5 rounded-[5px] shadow-2xl shadow-black/20 hover:bg-[#FF3C3C] transition-all duration-300">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FF3C3C] text-white text-[10px] font-black flex items-center justify-center">{activeCount}</span>
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
              <button type="button" onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-[5px] bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-neutral-600">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="px-5 py-4 border-t border-neutral-100">
              <button type="button" onClick={() => setMobileOpen(false)}
                className="w-full bg-[#FF3C3C] text-white font-bold py-3.5 rounded-[5px] hover:bg-[#E63636] transition-colors text-sm">
                Show {totalResults?.toLocaleString() ?? ""} {entityNamePlural}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
