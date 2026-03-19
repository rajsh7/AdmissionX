"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface University {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
}

interface TopUniversitiesProps {
  universities: University[];
}

const categories = [
  "MBA", "Engineering", "MBBS", "B.Com", "Design", "Fashion", "Pharmacy", "Humanities"
];

export default function TopUniversities({ universities }: TopUniversitiesProps) {
  const [activeTab, setActiveTab] = useState("Engineering");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-full py-16 lg:py-24 bg-[#f8fafc]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Discover the Top Universities
            </h2>
            <p className="mt-3 text-slate-500 font-medium max-w-lg">
              Explore the best institutions ranked by academic excellence, placements, and student life.
            </p>
          </div>
          
          {/* Section Search */}
          <div className="relative w-full md:w-80 group">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             </span>
             <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search universities..."
               className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
             />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeTab === cat
                  ? "bg-teal text-white shadow-lg shadow-teal/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal/50 hover:text-teal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
           <AnimatePresence mode="popLayout">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((uni, i) => (
                <motion.div
                  key={uni.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                   <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 flex flex-col h-full">
                      {/* Card Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                         <Image 
                           src={uni.image}
                           alt={uni.name}
                           fill
                           className="object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                         
                         {/* Rating Badge */}
                         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-rounded text-yellow-500 text-[18px]">star</span>
                            <span className="text-sm font-black text-slate-800">{uni.rating}</span>
                         </div>

                         {/* Tag Overlay (Example) */}
                         <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 rounded-lg bg-teal text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                               #1 Ranked
                            </span>
                         </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-teal transition-colors line-clamp-2">
                               {uni.name}
                            </h3>
                         </div>
                         
                         <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                            <span className="material-symbols-rounded text-[18px]">location_on</span>
                            <span className="text-xs font-bold truncate">{uni.location}</span>
                         </div>

                         <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                            <div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Best Course</div>
                               <div className="text-sm font-black text-slate-800 mt-1">{activeTab}</div>
                            </div>
                            <Link 
                               href={uni.href}
                               className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-teal transition-all active:scale-95"
                            >
                               Apply Now
                            </Link>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <span className="material-symbols-rounded text-[32px]">search_off</span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">No Universities Found</h3>
                 <p className="text-slate-500 mt-2">Try searching for a different name or location.</p>
              </div>
            )}
           </AnimatePresence>
        </div>

        {/* View All */}
        <div className="mt-12 text-center">
           <Link 
              href="/colleges"
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal transition-colors"
           >
              Explore 120+ More {activeTab} Colleges
              <span className="material-symbols-rounded text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
           </Link>
        </div>
      </div>
    </section>
  );
}
