"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface TickerAdItem {
  id: number;
  title: string | null;
  description: string | null;
  img: string | null;
  redirectto: string | null;
}

// Fallback placeholder banners shown when no ads are configured
const FALLBACK_ITEMS: TickerAdItem[] = [
  { id: -1, title: "Top MBA Colleges 2025", description: "Admissions Open — Apply Now", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800&h=120", redirectto: "/search?stream=management" },
  { id: -2, title: "Engineering Colleges", description: "Explore 200+ Institutes", img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800&h=120", redirectto: "/search?stream=engineering" },
  { id: -3, title: "MBBS Admissions 2025", description: "Limited Seats Available", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800&h=120", redirectto: "/search?stream=medicine" },
  { id: -4, title: "Design & Fashion", description: "Top Creative Colleges", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800&h=120", redirectto: "/search?stream=design" },
];

interface HomeTickerProps {
  ads: TickerAdItem[];
}

function buildImgUrl(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t || t.toUpperCase().includes("NULL")) return null;
  if (t.startsWith("http") || t.startsWith("/")) return t;
  return `/uploads/${t}`;
}

import { motion, AnimatePresence } from "framer-motion";

export default function HomeTicker({ ads, className = "" }: HomeTickerProps & { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const source = ads && ads.length > 0 ? ads : FALLBACK_ITEMS;

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (source.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % source.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [source.length]);

  if (!mounted) return null;

  const currentAd = source[currentIndex];

  return (
    <div className={`w-full flex justify-center py-6 ${className.includes('w-') ? '' : ''}`}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm bg-white/50 ${className || "w-[90%] max-w-[1400px]"}`}
        style={{ height: 120 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {(() => {
              const imgSrc = buildImgUrl(currentAd.img);
              const inner = (
                <div className="relative w-full h-full overflow-hidden group">
                  {imgSrc ? (
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={imgSrc}
                        alt={currentAd.title || "Ad"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Featured</span>
                    </div>
                  )}

                  {/* Glassy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Text with internal sequence animation */}
                  {(currentAd.title || currentAd.description) && (
                    <div className="absolute inset-0 flex flex-col justify-end px-8 pb-5">
                      {currentAd.title && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="text-white text-[18px] lg:text-[22px] font-bold leading-tight truncate drop-shadow-xl"
                        >
                          {currentAd.title}
                        </motion.p>
                      )}
                      {currentAd.description && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45, duration: 0.5 }}
                          className="text-white/90 text-[13px] lg:text-[14px] font-medium truncate mt-1.5"
                        >
                          {currentAd.description}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* Premium Badge */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-4 right-6 flex items-center gap-2"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-white/90 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      Partner
                    </span>
                  </motion.div>
                </div>
              );

              return currentAd.redirectto ? (
                <Link
                  href={currentAd.redirectto}
                  target={currentAd.id > 0 ? "_blank" : "_self"}
                  rel={currentAd.id > 0 ? "noopener noreferrer sponsored" : undefined}
                  className="block w-full h-full"
                >
                  {inner}
                </Link>
              ) : (
                <div className="w-full h-full">
                  {inner}
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Progress Indicator (Visual timer) */}
        <motion.div 
          key={`timer-${currentIndex}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.5, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-primary/40 z-30"
        />

        {/* Navigation Dots (Subtle) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
          {source.map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary h-6' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
