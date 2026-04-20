"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";

const backgrounds = [
  "/Background-images/Group 1.png",
  "/Background-images/1.jpg",
  "/Background-images/18.jpg",
  "/Background-images/19.jpg"
];

export default function HeroSection() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return <div className="min-h-[850px] bg-[#181C35]" />;

  return (
    <section className="relative w-full h-screen min-h-[850px] overflow-hidden">
      {/* Animated Background Slider */}
      <div className="absolute inset-0 z-0 bg-[#181C35]">
        <AnimatePresence>
          <motion.img
            key={currentBg}
            src={backgrounds[currentBg]}
            alt="Hero Background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-left lg:object-center"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
      </div>

      <div className="relative z-10 flex h-screen min-h-[850px] w-full items-center">
        <div className="home-page-shell flex h-full items-center justify-center lg:justify-end">
           <div className="w-full py-24 lg:w-[60%] lg:py-32 xl:w-[64%] 2xl:w-[68%]">
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left pt-20 w-full lg:max-w-[920px] lg:ml-auto"
            >
              <div className="mb-4">
                <img 
                  src="/images/Architect Your  Academic Future.png" 
                  alt="Architect Your Academic Future" 
                  className="h-auto w-full max-w-[320px] sm:max-w-[450px] lg:max-w-[760px] xl:max-w-[860px] object-contain"
                />
              </div>

              <p className="mt-8 text-[22px] text-white/90 w-full max-w-3xl leading-relaxed font-normal drop-shadow-sm">
                The world's most comprehensive academic discovery platform. Search 50,000+ universities, get exam guidance, and read unfiltered student reviews.
              </p>

              <div className="mt-12 w-full max-w-4xl">
                <SearchBar />
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




