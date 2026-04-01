"use client";

import React, { useState, useMemo } from "react";

const countries = [
  { name: "United States", tuition: 35000, living: 18000, scholarship: 10000, salary: 85000 },
  { name: "United Kingdom", tuition: 28000, living: 15000, scholarship: 8000, salary: 65000 },
  { name: "Canada", tuition: 22000, living: 12000, scholarship: 6000, salary: 60000 },
  { name: "Australia", tuition: 30000, living: 16000, scholarship: 9000, salary: 75000 },
];

export default function CostCalculator() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0].name);
  const [degree, setDegree] = useState("Bachelors");
  const [duration, setDuration] = useState(2);

  const stats = useMemo(() => {
    const country = countries.find((c) => c.name === selectedCountry) || countries[0];
    const multiplier = degree === "Bachelors" ? 1.2 : 1;
    return {
      tuition: Math.round(country.tuition * multiplier * duration),
      living: Math.round(country.living * duration),
      scholarship: Math.round(country.scholarship * duration),
      total: Math.round((country.tuition * multiplier + country.living - country.scholarship) * duration),
      salary: country.salary,
    };
  }, [selectedCountry, degree, duration]);

  return (
    <section className="py-32 bg-white border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="bg-white rounded-[40px] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.12)] flex flex-col xl:flex-row border border-slate-50">
          {/* Left Side - Controls */}
          <div className="flex-1 bg-[#10b981] p-16 xl:p-24 text-white overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 rounded-full text-sm font-black mb-10 tracking-widest uppercase">
                <span className="material-symbols-outlined text-[20px]">calculate</span>
                Smart Calculator
              </div>
              
              <h2 className="text-[52px] font-black mb-8 leading-tight tracking-tight">Estimate Your Investment</h2>
              <p className="text-emerald-50 text-[19px] max-w-lg mb-16 leading-relaxed opacity-90">
                Explore the most popular countries for international student based on quality of education, post study work right, and living standards.
              </p>

              <div className="space-y-12">
                {/* Destination Dropdown */}
                <div>
                  <label className="block text-sm font-black mb-4 uppercase tracking-[0.2em] opacity-70">Select Destination</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-white/10 border-2 border-white/20 rounded-[18px] px-6 py-5 text-xl text-white font-bold outline-none focus:border-white transition-all appearance-none cursor-pointer"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      {countries.map(c => <option key={c.name} className="text-slate-900">{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-y-[-40%] text-2xl">expand_more</span>
                  </div>
                </div>

                {/* Degree Level Tabs */}
                <div>
                  <label className="block text-sm font-black mb-4 uppercase tracking-[0.2em] opacity-70">Degree Level</label>
                  <div className="bg-white/10 p-2 rounded-[22px] flex gap-2">
                    {["Bachelors", "Masters"].map((type) => (
                      <button 
                        key={type}
                        onClick={() => setDegree(type)}
                        className={`flex-1 py-4.5 rounded-[16px] font-black text-[16px] transition-all ${degree === type ? "bg-white text-emerald-600 shadow-xl shadow-emerald-900/10" : "text-white hover:bg-white/10"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <label className="text-sm font-black uppercase tracking-[0.2em] opacity-70">Duration (Years)</label>
                    <span className="text-3xl font-black bg-white/20 px-6 py-2 rounded-[18px]">{duration}Y</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between mt-6 text-sm font-black opacity-60 px-1">
                    <span>1 YEAR</span>
                    <span>2 YEARS</span>
                    <span>3 YEARS</span>
                    <span>4 YEARS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="flex-[1.3] p-16 xl:p-24 flex flex-col justify-center">
            <div className="space-y-8 flex-1">
              {/* Result Cards */}
              <div className="group bg-blue-50/40 rounded-[24px] p-8 border border-blue-100/30 hover:bg-blue-50 transition-all duration-500">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-blue-500 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    <span className="material-symbols-outlined text-[32px]">payments</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xl font-black text-slate-800">Tuition Fees</h4>
                       <span className="text-2xl font-black text-slate-900 tracking-tight">${stats.tuition.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 font-bold">Total for {duration} years</p>
                  </div>
                </div>
              </div>

              <div className="group bg-yellow-50/40 rounded-[24px] p-8 border border-yellow-100/30 hover:bg-yellow-50 transition-all duration-500">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-yellow-500 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-yellow-500/20">
                    <span className="material-symbols-outlined text-[32px]">home</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xl font-black text-slate-800">Living Expenses</h4>
                       <span className="text-2xl font-black text-slate-900 tracking-tight">${stats.living.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 font-bold">Estimated local spending</p>
                  </div>
                </div>
              </div>

              <div className="group bg-emerald-50/40 rounded-[24px] p-8 border border-emerald-100/30 hover:bg-emerald-50 transition-all duration-500">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-500 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-[32px]">redeem</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xl font-black text-slate-800">Expected Scholarship</h4>
                       <span className="text-2xl font-black text-emerald-600 tracking-tight">-${stats.scholarship.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 font-bold">Based on merit records</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-16 border-t border-slate-100">
               <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
                  <div>
                    <span className="text-slate-400 text-sm font-black uppercase tracking-[0.3em] mb-4 block">Net Estimated Cost</span>
                    <div className="text-[64px] font-black text-slate-900 leading-none tracking-tighter">${stats.total.toLocaleString()}</div>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-slate-400 text-sm font-black uppercase tracking-[0.3em] mb-4 block">Avg. Starting Salary</span>
                    <div className="text-[42px] font-black text-emerald-600 leading-none tracking-tighter">${stats.salary.toLocaleString()}/yr</div>
                  </div>
               </div>

               <button className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[24px] font-black text-xl transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-4 active:scale-[0.98]">
                  Get Your Personalized Roadmap
                  <span className="material-symbols-outlined font-black">arrow_forward</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
