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
      router.push(`/colleges?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/colleges`);
    }
  };

  return (
    <section className="relative w-full min-h-[600px] lg:h-[800px] flex items-center pt-32 pb-16 overflow-hidden bg-[#fdfdfd]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-[#008080]/5 blur-[120px]" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-50/30 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#008080]/10 border border-[#008080]/20 mb-6">
               <span className="w-2 h-2 rounded-full bg-[#008080] animate-pulse" />
               <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest">Global Education Platform</span>
            </div>

            <h1 className="text-[42px] sm:text-[56px] lg:text-[72px] font-black leading-[1.1] text-slate-900 tracking-tight">
              Architect Your <br />
              <span className="text-[#008080] underline decoration-[#008080]/20 decoration-8 underline-offset-8">Academic Future</span>
            </h1>

            <p className="mt-8 text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
              Join 50,000+ students on their journey to top-tier universities.
              Find your perfect course, explore campuses, and start your story today.
            </p>

            <div className="mt-10 max-w-xl">
               <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white rounded-2xl shadow-xl border border-slate-100">
                  <div className="relative flex-1 w-full group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </span>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for universities, courses..."
                      className="w-full h-12 pl-12 pr-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm font-semibold"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-10 h-12 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:brightness-90 transition-all active:scale-95 shadow-lg shadow-[#008080]/20"
                    style={{ backgroundColor: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Search
                  </button>
               </form>
            </div>
          </motion.div>

          {/* Right Column: Image with plain IMG tag */}
          <div className="relative hidden lg:block">
            <div 
              className="relative z-10 w-full h-[650px] rounded-[40px] overflow-hidden shadow-2xl bg-slate-100 border-4 border-white"
            >
               <img 
                 src="/images/hero-student.png"
                 alt="Student Architecting Future"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 z-20 bg-white p-5 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: '#008080' }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Ranking</div>
                  <div className="text-base font-black text-slate-800 mt-1">Top 1% Institutions</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
