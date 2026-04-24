"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { AdItem } from "./AdsSection";

interface MovingAdsCardProps {
  ads: AdItem[];
  className?: string;
}

export default function MovingAdsCard({ ads, className = "" }: MovingAdsCardProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [ads?.length]);

  if (!ads || ads.length === 0) return null;

  const ad = ads[current];
  if (!ad) return null;

  const imgSrc = ad.img
    ? ad.img.startsWith("/") || ad.img.startsWith("http") ? ad.img : `/uploads/${ad.img}`
    : null;

  return (
    <div className={`${className} relative bg-slate-100`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center"
        >
          {ad.redirectto ? (
            <Link href={ad.redirectto} target="_blank" rel="noopener noreferrer sponsored" className="block w-full h-full relative group">
              <AdContent ad={ad} imgSrc={imgSrc} />
            </Link>
          ) : (
            <div className="w-full h-full relative group">
              <AdContent ad={ad} imgSrc={imgSrc} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(i);
              }}
              className={`block rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-white shadow-sm" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdContent({ ad, imgSrc }: { ad: AdItem; imgSrc: string | null }) {
  return (
    <div className="w-full h-full overflow-hidden rounded-[5px]">
      {imgSrc ? (
        <>
          <img
            src={imgSrc}
            alt={ad.title || "Ad"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-1">{ad.title}</p>
            {ad.description && (
              <p className="text-white/90 text-sm mt-1 line-clamp-1 font-medium">{ad.description}</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center h-full w-full px-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <p className="font-bold text-lg line-clamp-2" style={{ color: '#334155' }}>{ad.title || "Featured Partner"}</p>
          {ad.description && <p className="text-sm mt-2 line-clamp-2" style={{ color: '#334155' }}>{ad.description}</p>}
        </div>
      )}
      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-black/50 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-md z-10">
        Ad
      </span>
    </div>
  );
}
