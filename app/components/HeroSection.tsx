"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data.suggestions || []);
            setShowDropdown(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setIsLoading(false);
          });
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[850px] flex items-center overflow-hidden">
      {/* Raw Group 1.png Background */}
      <div className="absolute inset-0 z-0">
         <img 
           src="/Background-images/Group 1.png" 
           alt="Hero Background" 
           className="w-full h-full object-cover object-left lg:object-center"
         />
      </div>

      <div className="relative z-10 mx-auto max-w-[1920px] w-full">
        {/* Frame 2: Sub-nav Bar */}
        <div className="w-full h-[50px] bg-[#181C35]/58 backdrop-blur-md flex items-center justify-center gap-10 px-6 sm:px-12 lg:px-24 overflow-hidden">
          {["Top Universities", "Top Universities", "Top Universities", "Top Universities", "Top Universities", "Top Colleges"].map((item, i) => (
            <Link 
              key={i} 
              href={item === "Top Colleges" ? "/top-colleges" : "/top-university"}
              className="text-white text-sm font-normal whitespace-nowrap hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="px-6 sm:px-12 lg:px-24 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center">
            
            {/* Moved slightly left (col-start-6) to match the user's request for "little left" */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-start-6 lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left pt-20"
            >
              <div className="mb-4">
                <img 
                  src="/images/Architect Your  Academic Future.png" 
                  alt="Architect Your Academic Future" 
                  className="h-auto w-full max-w-[320px] sm:max-w-[450px] lg:max-w-[650px] object-contain"
                />
              </div>

              <p className="mt-8 text-[22px] text-white/90 w-full max-w-xl lg:w-[763px] lg:h-[132px] leading-relaxed font-normal drop-shadow-sm">
                The world's most comprehensive academic discovery platform. Search 50,000+ universities, get exam guidance, and read unfiltered student reviews.
              </p>

              <div className="mt-12 w-full max-w-2xl">
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                    <div ref={dropdownRef} className="relative flex-1 w-full bg-white/10 backdrop-blur-md rounded-[10px] border border-white/20 p-1 shadow-2xl">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                      </span>
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowDropdown(true);
                        }}
                        placeholder="Location, universities, courses..."
                        className="w-full h-12 pl-12 pr-6 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-[15px] font-normal rounded-[10px]"
                      />

                      {/* Autocomplete Dropdown */}
                      <AnimatePresence>
                        {showDropdown && (searchQuery.trim().length >= 2) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[10px] border border-slate-100 shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                          >
                            {isLoading ? (
                              <div className="p-4 text-center text-slate-500 text-sm font-normal">Searching...</div>
                            ) : suggestions.length > 0 ? (
                              <div className="py-2">
                                {suggestions.map((item, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(item.name);
                                      setShowDropdown(false);
                                      if (item.slug) {
                                         router.push(`/college/${item.slug}`);
                                      } else {
                                         router.push(`/search?q=${encodeURIComponent(item.name)}`);
                                      }
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-rose-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                        {item.slug ? "school" : "search"}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[15px] font-normal text-slate-800 truncate">{item.name}</div>
                                      <div className="text-[12px] font-normal text-slate-500 truncate">{item.location}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-slate-500 text-sm font-normal">No results found for "{searchQuery}"</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-10 h-14 rounded-[10px] bg-[#FF3C3C] text-white font-medium text-[13px] uppercase tracking-widest hover:brightness-105 transition-all active:scale-95 shadow-xl shadow-[#FF3C3C]/30 shrink-0"
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
                  <div className="w-14 h-14 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white text-[15px] font-normal shadow-lg ring-1 ring-slate-100/50">
                    23k
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[22px] font-normal leading-tight tracking-tight">12,450+ Students</span>
                  <span className="text-white/70 text-[17px] font-normal antialiased">found their dream college last month</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}




