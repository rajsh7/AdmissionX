"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Any Country");

  return (
    <section className="relative bg-white pt-48 pb-28 overflow-hidden">
      {/* Background Image - User provided abstract pattern */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-[1.2] text-left">
            <h1 className="text-[80px] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8">
              Study Abroad <br />
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-[20px] text-slate-500 mb-12 leading-relaxed max-w-2xl">
              Discover all exams which can refine your future, unlock <br />
              gate for dream university.
            </p>

            {/* Stats with icons */}
            <div className="flex flex-wrap items-center gap-10 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-primary font-bold">check</span>
                </div>
                <span className="text-slate-800 font-bold text-lg">10,000+ courses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-primary font-bold">check</span>
                </div>
                <span className="text-slate-800 font-bold text-lg">500+ universities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-primary font-bold">check</span>
                </div>
                <span className="text-slate-800 font-bold text-lg">1500+ scholarships</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-[24px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.12)] p-3 flex flex-col md:flex-row items-center gap-4 max-w-4xl border border-slate-50">
              <div className="flex-1 flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-slate-100 w-full">
                <span className="material-symbols-outlined text-slate-300 text-2xl">search</span>
                <input
                  type="text"
                  placeholder="Course, university, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 w-full text-lg placeholder:text-slate-400 font-medium"
                />
              </div>
              
              <div className="flex items-center gap-3 px-6 py-4 min-w-[220px] w-full md:w-auto cursor-pointer group">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <select 
                  className="bg-transparent border-none outline-none text-slate-700 cursor-pointer w-full font-bold text-lg"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                   <option>Any Country</option>
                   <option>United States</option>
                   <option>United Kingdom</option>
                   <option>Canada</option>
                   <option>Australia</option>
                </select>
              </div>

              <button className="bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-[18px] font-black text-lg transition-all shadow-xl shadow-primary/30 w-full md:w-auto">
                Search
              </button>
            </div>

            {/* Quick links */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Quick Area:</span>
              <div className="flex gap-6">
                {["MBA", "Undergraduate", "Postgraduate", "Others"].map((item) => (
                  <button key={item} className="text-[17px] font-bold text-slate-400 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="flex-1 relative w-full h-[500px] lg:h-[650px]">
             {/* Map Illustration - User provided */}
             <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] transform lg:scale-110 lg:translate-x-10">
                <Image
                  src="/images/72297360ccd8d493c15ef805130a31280431261f.png"
                  alt="Study Abroad Destination"
                  fill
                  className="object-cover"
                  priority
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
