"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export interface TickerAdItem {
  id: number;
  title: string | null;
  description: string | null;
  img: string | null;
  redirectto: string | null;
}

interface HomeTickerProps {
  ads: TickerAdItem[];
}

function buildImgUrl(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.toUpperCase().includes("NULL")) return null;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return `/uploads/${value}`;
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value && !value.toUpperCase().includes("NULL"));
}

export default function HomeTicker({ ads }: HomeTickerProps) {
  const source = ads.map((ad, index) => ({
    id: ad.id ?? -(index + 1),
    title: ad.title ?? null,
    description: ad.description ?? null,
    img: ad.img ?? null,
    redirectto: ad.redirectto ?? null,
  }));
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (source.length <= 1) return;
    const interval = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % source.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [source.length]);

  if (source.length === 0) return null;

  const visibleAds = Array.from({ length: 5 }, (_, offset) => {
    const index = (startIndex + offset) % source.length;
    return source[index];
  });

  const slotClasses = [
    "block",
    "block",
    "hidden md:block",
    "hidden xl:block",
    "hidden xl:block",
  ];

  return (
    <div className="w-full py-6">
      <div className="home-page-shell">
        <div className="relative h-[136px] w-full overflow-hidden rounded-[5px] border border-slate-100 shadow-md">
          <div className="grid h-full grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {visibleAds.map((ad, i) => {
            const imgSrc = buildImgUrl(ad.img);
            const inner = (
              <div className="group relative h-full overflow-hidden">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={ad.title || "Ad"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                      Ad
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {(hasText(ad.title) || hasText(ad.description)) && (
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                    {hasText(ad.title) && (
                      <p className="truncate text-[13px] font-bold leading-tight text-white drop-shadow">
                        {ad.title}
                      </p>
                    )}
                    {hasText(ad.description) && (
                      <p className="mt-0.5 truncate text-[11px] font-medium text-white/75">
                        {ad.description}
                      </p>
                    )}
                  </div>
                )}

                <span className="absolute right-2 top-2 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm">
                  Ad
                </span>

                <div className="absolute bottom-0 right-0 top-0 w-px bg-white/10" />
              </div>
            );

            return (
              <div key={`slot-${i}`} className={`${slotClasses[i]} relative h-full overflow-hidden`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${i}-${ad.id}-${startIndex}`}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {ad.redirectto ? (
                      <Link
                        href={ad.redirectto}
                        target={ad.id > 0 ? "_blank" : "_self"}
                        rel={ad.id > 0 ? "noopener noreferrer sponsored" : undefined}
                        className="block h-full"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="h-full">{inner}</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
