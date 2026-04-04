"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Any Country");

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" };

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
            <div className="relative aspect-[16/9] lg:aspect-[1.6/1] rounded-2xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] border border-slate-100">
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
        <div className="bg-white rounded-[24px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.2)] p-8 md:p-10 border border-slate-100/50">
          
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
                className="w-full pl-12 pr-4 h-14 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-medium text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* Country Dropdown */}
            <div className="w-full lg:w-[280px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <span className="material-symbols-rounded text-[#FF3C3C] text-[22px]" style={ICO_FILL}>location_on</span>
              </div>
              <select 
                className="w-full pl-12 pr-10 h-14 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-600 appearance-none cursor-pointer"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                 <option>Any Country</option>
                 <option>United States</option>
                 <option>United Kingdom</option>
                 <option>Canada</option>
                 <option>Australia</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-rounded text-slate-400">expand_more</span>
              </div>
            </div>

            {/* Main Search Button */}
            <button className="w-full lg:w-auto px-12 h-14 bg-[#FF3C3C] hover:bg-[#E23434] text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/20 flex items-center justify-center">
              Search
            </button>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-bold text-slate-300 uppercase tracking-widest mr-2">Quick Filters:</span>
            {["Undergraduate", "Postgraduate", "Fall 2026"].map((filter) => (
              <button 
                key={filter}
                className="px-5 py-1.5 rounded-lg border border-slate-100 text-[13px] font-bold text-slate-400 hover:border-[#FF3C3C] hover:text-[#FF3C3C] transition-all bg-slate-50/30 hover:bg-white"
              >
                {filter}
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
