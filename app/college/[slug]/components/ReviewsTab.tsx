"use client";
import { useState } from "react";
import Image from "next/image";
import ExploreCards from "@/app/components/ExploreCards";

interface Review {
  id: string | number;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  role: string;
  category?: string;
}

interface ReviewsTabProps {
  reviews?: Review[];
}

const fallbackReviews: Review[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  name: i % 2 === 0 ? "Lara Smith" : "John Doe",
  role: i % 2 === 0 ? "Harvard Medical" : "Stanford University",
  text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
  rating: 4,
  avatar: i % 2 === 0
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=150&h=150"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=60&w=150&h=150",
  category: ["All Reviews", "Student", "Alumni", "Campus Life", "Placements"][i % 5],
}));

export default function ReviewsTab({ reviews: propReviews }: ReviewsTabProps = {}) {
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const reviews = propReviews && propReviews.length > 0 ? propReviews : fallbackReviews;

  const filteredReviews = activeFilter === "All Reviews" 
    ? reviews 
    : reviews.filter(r => r.category === activeFilter);

  const ratingStats = [
    { star: 5, pct: 71 },
    { star: 4, pct: 20 },
    { star: 3, pct: 7 },
    { star: 2, pct: 1 },
    { star: 1, pct: 1 }
  ];

  return (
    <div className="w-full bg-[#f8fafc] pb-24">
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* ─── PHASE 1: LEFT SIDEBAR (RATING SUMMARY) ─── */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Overall Rating Card */}
          <div className="bg-white rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] pl-4 md:pl-6 pr-8 py-8 border border-neutral-100">
            <span className="text-[#FF3C3C] text-[24px] font-bold tracking-[0.3em] uppercase block mb-4">OVERALL RATING</span>

            <div className="flex items-center gap-6 mb-8">
              <div className="text-[40px] font-bold leading-none tracking-tighter" style={{ color: 'rgba(62, 62, 62, 1)' }}>4.8</div>
              <div className="flex flex-col gap-1">
                <div className="flex text-yellow-400 gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className="material-symbols-rounded text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Based on 5,249 reviews</span>
              </div>
            </div>

            {/* Rating Bars Breakout */}
            <div className="space-y-4">
              {ratingStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-500 w-12">{stat.star} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-[5px] overflow-hidden">
                    <div
                      className="h-full bg-[#FF3C3C] rounded-[5px]"
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900 w-10 text-right">{stat.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Stats Card */}
          <div className="bg-white rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] pl-4 md:pl-6 pr-8 py-8 border border-neutral-100 relative overflow-hidden">
            <span className="text-[#FF3C3C] text-[24px] font-bold tracking-[0.3em] uppercase block mb-3">STUDENT</span>
            <h4 className="text-2xl font-bold text-slate-900 mb-8">Student Satisfaction</h4>

            <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-[5px] p-6 border text-center transition-all hover:bg-slate-50 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 duration-300" style={{ borderColor: 'rgba(184, 181, 181, 0.5)' }}>
                   <span className="material-symbols-rounded text-[#FF3C3C] text-4xl mb-3">thumb_up</span>
                   <h5 className="font-semibold text-[24px] leading-none mb-1" style={{ color: 'rgba(62, 62, 62, 1)' }}>94%</h5>
                   <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-widest leading-tight mt-2">Recommend to <br /> a friend</p>
                </div>
                <div className="flex-1 bg-white rounded-[5px] p-6 border text-center transition-all hover:bg-slate-50 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 duration-300" style={{ borderColor: 'rgba(184, 181, 181, 0.5)' }}>
                   <span className="material-symbols-rounded text-green-600 text-4xl mb-3">work</span>
                   <h5 className="font-semibold text-[24px] leading-none mb-1" style={{ color: 'rgba(62, 62, 62, 1)' }}>92%</h5>
                   <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-widest leading-tight mt-2">Employed <br /> in 6 months</p>
                </div>
            </div>
          </div>
        </aside>

        {/* ─── PHASE 2: REVIEWS CONTENT AREA ─── */}
        <main className="lg:col-span-8">

          {/* Main Filter Tabs - Unified Block */}
          <div className="mb-10 inline-flex items-center bg-white border border-neutral-200 rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {["All Reviews", "Student", "Alumni", "Campus Life", "Placements"].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFilter(tag)}
                className={`px-6 md:px-8 py-3.5 text-xs font-black whitespace-nowrap transition-all duration-300 uppercase tracking-widest border-r border-neutral-100 last:border-r-0 ${
                  activeFilter === tag
                    ? 'text-[#FF3C3C]'
                    : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
                style={activeFilter === tag ? { backgroundColor: 'rgba(255, 60, 60, 0.2)' } : {}}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Modern Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-[5px] pl-4 md:pl-6 pr-8 pt-8 pb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-50 relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-red-500/10"
              >
                {/* Visual Quote Accent */}
                <div className="absolute top-8 right-8 text-[#FF3C3C]">
                  <span className="material-symbols-rounded text-3xl">format_quote</span>
                </div>

                <div className="relative z-10">
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF3C3C] p-0.5 shrink-0 bg-white shadow-sm">
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[16px] font-bold text-slate-900 leading-none mb-1">{rev.name}</h5>
                      <span className="text-[11px] font-medium text-slate-400">{rev.role}</span>
                    </div>
                  </div>

                  {/* Review Text with Accent Bar */}
                  <div className="border-l-2 border-[#FF3C3C] pl-4 mb-8">
                    <p className="text-sm leading-relaxed text-slate-600 font-medium italic">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  {/* Rating Stars - Yellow with Darker Grey Divider */}
                  <div className="flex text-yellow-400 border-t border-neutral-200 pt-3 gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <span 
                         key={i} 
                         className={`material-symbols-rounded text-xl ${i < rev.rating ? 'opacity-100' : 'text-neutral-200'}`}
                         style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                       >
                         star
                       </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* High-Fidelity Red Pagination */}
          <nav className="mt-16 flex justify-center items-center gap-3">
             <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#FF3C3C] transition-colors">
               <span className="material-symbols-rounded">chevron_left</span>
             </button>
             <button className="w-12 h-12 flex items-center justify-center rounded-[5px] bg-[#FF3C3C] text-white font-black text-sm shadow-xl shadow-red-500/20">1</button>
             <button className="w-12 h-12 flex items-center justify-center rounded-[5px] bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">2</button>
             <button className="w-12 h-12 flex items-center justify-center rounded-[5px] bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">3</button>
             <span className="text-slate-300 font-black px-2">...</span>
             <button className="w-12 h-12 flex items-center justify-center rounded-[5px] bg-white text-slate-600 font-black text-sm border border-neutral-100 shadow-sm transition-all hover:border-[#FF3C3C] hover:text-[#FF3C3C]">9</button>
             <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#FF3C3C] transition-colors">
               <span className="material-symbols-rounded">chevron_right</span>
             </button>
          </nav>
        </main>
      </div>

      {/* Explore Cards */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 pb-10">
        <ExploreCards />
      </div>
    </div>
  );
}
