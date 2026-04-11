"use client";

import React, { useState, useMemo } from "react";

const countries = [
  { name: "United States", tuition: 2800000, living: 1500000, scholarship: 800000, salary: 7000000 },
  { name: "United Kingdom", tuition: 2500000, living: 1400000, scholarship: 700000, salary: 6000000 },
  { name: "Canada", tuition: 1800000, living: 1200000, scholarship: 500000, salary: 5500000 },
  { name: "Australia", tuition: 2200000, living: 1300000, scholarship: 600000, salary: 6500000 },
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
    <section className="py-24 bg-white">
      <div className="max-w-[1920px] mx-auto px-8 lg:px-12">
        
        <div className="bg-white rounded-[5px] overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] flex flex-col xl:flex-row border border-slate-100/60">
          
          {/* Left Side - Control Panel */}
          <div className="flex-1 bg-gradient-to-br from-[#12A082] to-[#0A6D58] p-12 xl:p-14 text-white relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-[5px] text-[13px] font-bold mb-8 backdrop-blur-md border border-white/10">
                <span className="material-symbols-rounded text-[18px]">calculate</span>
                Smart Calculator
              </div>
              
              <h2 className="text-[36px] font-bold mb-4 leading-tight tracking-tight">Estimate Your Investment</h2>
              <p className="text-white/80 text-[15px] max-w-sm mb-12 leading-relaxed">
                Explore the most popular countries for international student based on quality of education, post study work right, and living standards.
              </p>

              <div className="space-y-10">
                {/* Destination Dropdown */}
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-white/70 uppercase tracking-widest">Select Destination</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white/10 border border-white/20 rounded-[5px] px-5 py-4 text-[16px] text-white font-bold outline-none focus:border-white/50 transition-all appearance-none cursor-pointer"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      {countries.map(c => <option key={c.name} className="text-slate-900">{c.name}</option>)}
                    </select>
                    <span className="material-symbols-rounded absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">expand_more</span>
                  </div>
                </div>

                {/* Degree Level */}
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-white/70 uppercase tracking-widest">Degree Level</label>
                  <div className="bg-white/10 p-1 rounded-[5px] flex gap-1">
                    {["Bachelors", "Masters"].map((type) => (
                      <button 
                        key={type}
                        onClick={() => setDegree(type)}
                        className={`flex-1 py-3 rounded-[5px] font-bold text-[15px] transition-all ${degree === type ? "bg-white text-[#0A6D58] shadow-lg" : "text-white/70 hover:bg-white/5"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-6">
                   <label className="block text-[13px] font-bold text-white/70 uppercase tracking-widest">Duration (Years)</label>
                   <div className="relative px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="4" 
                      step="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between mt-4 text-[11px] font-black text-white/50 uppercase tracking-tighter">
                      <span>1 Yr</span>
                      <span>2 Yr</span>
                      <span>3 Yr</span>
                      <span>4 Yr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Analysis Results */}
          <div className="flex-[1.2] p-12 xl:p-14 flex flex-col">
            <h3 className="text-[20px] font-bold text-slate-800 mb-8">Estimate Total Cost</h3>
            
            <div className="space-y-4 flex-1">
              {/* Cost Rows */}
              <div className="bg-[#F0F7FF] rounded-[5px] p-5 border border-blue-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#D1E9FF] rounded-full flex items-center justify-center text-blue-600">
                    <span className="material-symbols-rounded text-[24px]">school</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[15px] font-bold text-slate-700">Tuition Fees</span>
                       <span className="text-[18px] font-bold text-slate-900">₹{stats.tuition.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium">For {duration} years</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F2FBF2] rounded-[5px] p-5 border border-green-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#DDF5DD] rounded-full flex items-center justify-center text-green-600">
                    <span className="material-symbols-rounded text-[24px]">home</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[15px] font-bold text-slate-700">Living Expenses</span>
                       <span className="text-[18px] font-bold text-slate-900">₹{stats.living.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium">Accommodation, Food, etc</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF9F0] rounded-[5px] p-5 border border-orange-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#FFEED6] rounded-full flex items-center justify-center text-orange-600">
                    <span className="material-symbols-rounded text-[24px]">stars</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[15px] font-bold text-slate-700">Expected scholarship</span>
                       <span className="text-[18px] font-bold text-slate-900">-₹{stats.scholarship.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium">Based on average profile</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100/60">
               <div className="flex items-end justify-between gap-8 mb-10">
                  <div className="space-y-2">
                    <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Net Estimated Cost</span>
                    <div className="text-[40px] font-bold text-slate-800 leading-none tracking-tight">₹{stats.total.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Avg. Starting Salary</span>
                    <div className="text-[28px] font-bold text-[#22C55E] leading-none tracking-tight">₹{stats.salary.toLocaleString('en-IN')}/yr</div>
                  </div>
               </div>

               <button className="w-full bg-[#333333] hover:bg-black text-white py-5 rounded-[5px] font-bold text-[16px] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                  Get Detailed financial Plan
               </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
