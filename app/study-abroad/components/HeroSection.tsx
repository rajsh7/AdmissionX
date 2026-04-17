"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CountryOption {
  id: string | number;
  name: string;
}

interface HeroSectionProps {
  countries: CountryOption[];
  quickFilters: CountryOption[];
}

export default function HeroSection({ countries, quickFilters }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countrySearch.trim()
    ? countries.filter((country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : countries;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setIsCountryOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" };

  const applySearch = (overrides?: {
    query?: string;
    country?: CountryOption | null;
  }) => {
    const nextQuery = overrides?.query ?? searchQuery.trim();
    const nextCountry = overrides?.country ?? selectedCountry;
    const params = new URLSearchParams();

    if (nextQuery) {
      params.set("q", nextQuery);
    }

    if (nextCountry) {
      params.set("country_id", String(nextCountry.id));
    }

    const queryString = params.toString();
    router.push(queryString ? `/study-abroad?${queryString}` : "/study-abroad");
  };

  const handleQuickFilterClick = (country: CountryOption) => {
    const isSameCountry = selectedCountry?.id === country.id;
    const nextCountry = isSameCountry ? null : country;
    setSelectedCountry(nextCountry);
    applySearch({ country: nextCountry });
  };

  return (
    <section className="relative bg-white pt-[120px] pb-48 overflow-visible border-b border-slate-50">
      {/* Background Image - User provided abstract pattern */}
      <div className="absolute inset-x-0 bottom-0 top-[90px] z-0 opacity-40 pointer-events-none">
        <Image
          src="/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Background Geometric Patterns (Subtle Stripes) */}
      <div className="absolute inset-x-0 bottom-0 top-[90px] pointer-events-none opacity-[0.03] overflow-hidden z-0">
        <div className="absolute top-0 left-[-10%] w-[30%] h-full bg-gradient-to-r from-slate-900 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 right-[-10%] w-[30%] h-full bg-gradient-to-l from-slate-900 to-transparent transform skew-x-12" />
      </div>

      <div className="max-w-[1300px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div>
              <h1 className="text-[54px] font-black text-slate-800 leading-[1.1] tracking-tight">
                Study Abroad <br />
                <span className="text-[#FF3C3C]">Made Simple</span>
              </h1>
              <p className="text-[17px] text-slate-400 font-medium mt-6 leading-relaxed max-w-lg">
                Discover all exams which can refine your future, unlock <br className="hidden md:block" />
                gate for dream University.
              </p>
            </div>

            {/* Stats with icons */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                "10,000+ Programs", 
                "500+ Universities", 
                "500+ Universities"
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FF3C3C] flex items-center justify-center">
                    <span className="material-symbols-rounded text-white text-[14px] font-bold">check</span>
                  </div>
                  <span className="text-slate-400 font-bold text-[14px]">{stat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative group animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="relative aspect-[16/9] lg:aspect-[1.6/1] rounded-[5px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] border border-slate-100">
              <Image
                src="/images/72297360ccd8d493c15ef805130a31280431261f.png"
                alt="Study Abroad Destination"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          </div>

        </div>
      </div>

      {/* ─── Floating Search Card ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-[1300px] z-50 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="bg-white rounded-[5px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.2)] p-8 md:p-10 border border-slate-100/50">
          
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <span className="material-symbols-rounded text-slate-400 text-[24px]">search</span>
              </div>
              <input
                type="text"
                placeholder="Location, universities, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
                className="w-full pl-12 pr-4 h-14 bg-white border border-slate-200 rounded-[5px] focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-medium text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* Country Dropdown */}
            <div ref={countryRef} className="w-full lg:w-[280px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <span className="material-symbols-rounded text-[#FF3C3C] text-[22px]" style={ICO_FILL}>location_on</span>
              </div>
              <button
                type="button"
                onClick={() => { setIsCountryOpen(!isCountryOpen); setCountrySearch(""); }}
                className="w-full pl-12 pr-10 h-14 bg-white border border-slate-200 rounded-[5px] focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-600 text-left cursor-pointer"
              >
                {selectedCountry?.name ?? "Any Country"}
              </button>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-rounded text-slate-400">{isCountryOpen ? "expand_less" : "expand_more"}</span>
              </div>

              {isCountryOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-[5px] shadow-2xl z-50 overflow-hidden">
                  {/* Search inside dropdown */}
                  <div className="p-2 border-b border-slate-100">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 bg-slate-50 rounded-[5px] outline-none font-medium"
                    />
                  </div>
                  <ul className="max-h-40 overflow-y-auto">
                    <li>
                      <button
                        type="button"
                        onClick={() => { setSelectedCountry(null); setIsCountryOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${
                          !selectedCountry ? "text-[#FF3C3C]" : "text-slate-600"
                        }`}
                      >
                        Any Country
                      </button>
                    </li>
                    {filteredCountries.map((country) => (
                      <li key={country.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedCountry(country); setIsCountryOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${
                            selectedCountry?.id === country.id ? "text-[#FF3C3C]" : "text-slate-600"
                          }`}
                        >
                          {country.name}
                        </button>
                      </li>
                    ))}
                    {filteredCountries.length === 0 && (
                      <li className="px-4 py-3 text-sm text-slate-400 text-center">No countries found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Main Search Button */}
            <button
              type="button"
              onClick={() => applySearch()}
              className="w-full lg:w-auto px-12 h-14 bg-[#FF3C3C] hover:bg-[#E23434] text-white rounded-[5px] font-bold text-lg transition-all shadow-lg shadow-red-500/20 flex items-center justify-center"
            >
              Search
            </button>
          </div>

          {/* Quick Filters */}
          {quickFilters.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-bold text-slate-300 uppercase tracking-widest mr-2">
                Popular Destinations:
              </span>
              {quickFilters.map((country) => {
                const isActive = selectedCountry?.id === country.id;

                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => handleQuickFilterClick(country)}
                    className={`px-5 py-1.5 rounded-[5px] border text-[13px] font-bold transition-all ${
                      isActive
                        ? "border-[#FF3C3C] bg-red-50 text-[#FF3C3C]"
                        : "border-slate-100 text-slate-400 hover:border-[#FF3C3C] hover:text-[#FF3C3C] bg-slate-50/30 hover:bg-white"
                    }`}
                  >
                    {country.name}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
