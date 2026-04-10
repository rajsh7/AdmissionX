"use client";

import { useState } from "react";
import Image from "next/image";
import ExamListClient, { ExamItem } from "./ExamListClient";

interface Props {
  exams: ExamItem[];
}

export default function ExamPageClient({ exams }: Props) {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Hero section */}
      <div className="pt-24 pb-8 w-full px-4 lg:px-8 xl:px-12 max-w-[1400px] mx-auto min-h-[500px]">
        {/* Banner */}
        <div className="relative bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "360px" }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0" style={{ background: "repeating-linear-gradient(-45deg, #f8fafc, #f8fafc 60px, #ffffff 60px, #ffffff 120px)" }}></div>

          {/* Left Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-neutral-700 leading-[1.15] mb-4">
              Finds Your Next <br /> Competitive exam
            </h1>
            <p className="text-neutral-500 font-semibold text-sm md:text-base max-w-[400px] mb-8 leading-relaxed">
              Discover all exams which can refine your future, unlock gate for dream University.
            </p>

            <div className="flex w-full max-w-[420px] bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm">
              <div className="flex items-center pl-4 pr-2 text-neutral-400">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Location, universities, courses..."
                className="flex-1 py-3 px-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent font-medium"
              />
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 transition-colors text-sm tracking-wide">
                Search
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full md:w-[40%] lg:w-[40%] min-h-[250px] md:min-h-full flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200"
              alt="Competitive Exam"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent hidden md:block"></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full px-4 lg:px-8 xl:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className="flex-1 w-full max-w-[800px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] sm:text-[19px] font-black text-[#444]">Upcoming & Urgent</h2>
            </div>
            <ExamListClient exams={exams} search={search} />
          </div>

          {/* Right Sidebar */}
          <div className="w-full max-w-[280px] flex-shrink-0 space-y-6 pt-10">
            {/* Calendar Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
                <div className="font-black text-2xl text-neutral-900">March 2026</div>
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
              </div>
              <div className="flex justify-around text-center text-xs font-semibold text-neutral-400 mb-3">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                {(() => {
                  const year = 2026, month = 2;
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
                  return Array.from({ length: total }, (_, i) => {
                    const dayNum = i - firstDay + 1;
                    if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="h-7 w-7" />;
                    let cls = "h-7 w-7 flex items-center justify-center rounded-2xl transition-colors hover:bg-neutral-100 mx-auto";
                    if (dayNum === 19) cls += " bg-red-100 text-red-600 font-bold";
                    else if (dayNum === 23) cls += " bg-red-600 text-white font-bold";
                    return <div key={i} className={cls}>{dayNum}</div>;
                  });
                })()}
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-100 space-y-4 text-sm">
                <div className="flex gap-3">
                  <span className="text-red-500 mt-px">•</span>
                  <div>
                    <div className="font-semibold text-red-500">NOV 28, 2026</div>
                    <div className="text-neutral-600">CAT 2026 EXAM DAY</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-500 mt-px">•</span>
                  <div>
                    <div className="font-semibold text-red-500">NOV 28, 2026</div>
                    <div className="text-neutral-600">CAT 2026 EXAM DAY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Searched Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-xl mb-5 text-neutral-900">Most Searched</h3>
              <div className="space-y-6">
                {[
                  { name: "JEE Mains", sub: "Central Universities" },
                  { name: "CUET UG", sub: "State Universities" },
                  { name: "NEET", sub: "Medical Colleges" },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div className="font-semibold text-neutral-900">{item.name}</div>
                      <div className="text-xs text-neutral-500">{item.sub}</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
