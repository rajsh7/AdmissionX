"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center pt-32 pb-16 overflow-hidden bg-[#fdfdfd]">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-orange-100/40 blur-2xl animate-pulse" />
         <div className="absolute top-[5%] right-[20%] w-80 h-80 rounded-full bg-blue-50/40 blur-[100px]" />
         <div className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-[#008080]/5 blur-[80px]" />
         
         {/* Large Blob behind the image area */}
         <div className="absolute top-[15%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/20 via-teal-100/10 to-transparent blur-[120px] z-0" />
         
         {/* Floating Spheres */}
         <motion.div 
           animate={{ y: [0, -20, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[25%] right-[25%] w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200/50 shadow-inner z-0" 
         />
         <motion.div 
           animate={{ y: [0, 20, 0] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="absolute top-[15%] left-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200/50 shadow-inner z-0" 
         />

         {/* Wavy lines decorative element (SVG) */}
         <div className="absolute bottom-[5%] left-[5%] opacity-20">
           <svg width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 50 C50 20 100 80 150 50 C200 20 250 80 300 50" stroke="#008080" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 12" />
             <path d="M0 70 C50 40 100 100 150 70 C200 40 250 100 300 70" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 12" />
           </svg>
         </div>
         
         {/* Textured rectangle on the right (Yellow) */}
         <div className="absolute top-[15%] right-[2%] w-32 h-64 bg-yellow-400/10 rounded-[30px] border-2 border-yellow-200/30 z-0 rotate-12" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[48px] sm:text-[64px] lg:text-[76px] font-black leading-[1.05] text-slate-900 tracking-tight">
              Architect Your <br />
              <span className="text-[#008080]">Academic Future</span>
            </h1>

            <p className="mt-8 text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
              The world's most comprehensive academic discovery platform. Search 50,000+ universities, get exam guidance, and read unfiltered student reviews.
            </p>

            <div className="mt-10 max-w-3xl">
               <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full group overflow-hidden bg-white rounded-full border-[1.5px] border-black shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                      <span className="material-symbols-outlined text-[24px]">location_on</span>
                    </span>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Location, universities, courses..."
                      className="w-full h-16 pl-14 pr-6 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-[16px] font-bold"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-12 h-16 rounded-full text-white font-black text-sm uppercase tracking-widest hover:brightness-105 transition-all active:scale-95 shadow-xl shadow-[#008080]/30"
                    style={{ backgroundColor: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Search Now
                  </button>
               </form>
            </div>

            {/* Social Proof / Students Count */}
            <div className="mt-14 flex items-center gap-6">
              <div className="flex -space-x-5 items-center">
                {[
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&h=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop"
                ].map((src, i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-lg ring-1 ring-slate-100/50">
                    <img src={src} alt="student" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white text-[15px] font-black shadow-lg ring-1 ring-slate-100/50">
                  23k
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 text-2xl font-black tracking-tight leading-none">12,450+ Students</span>
                <span className="text-slate-500 text-sm font-bold mt-1.5 antialiased">found their dream college last month</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 w-full h-[700px] flex items-center justify-center">
               <img 
                 src="/images/hero-student.png"
                 alt="Student"
                 className="w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
               />
            </div>

            {/* Floating Badge (Updated style) */}
            <div className="absolute top-[20%] -right-4 z-20 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#008080]/30" style={{ backgroundColor: '#008080' }}>
                 <span className="material-symbols-outlined">school</span>
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Ranking</div>
                  <div className="text-base font-black text-slate-800 mt-1">Top 1% Institutions</div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
