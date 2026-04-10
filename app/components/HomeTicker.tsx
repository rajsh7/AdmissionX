"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

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

export default function HomeTicker({ ads }: HomeTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  const source = ads && ads.length > 0 ? ads : FALLBACK_ITEMS;
  // Triple for seamless infinite scroll
  const items = [...source, ...source, ...source];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let x = 0;
    const speed = 0.8;

    function step() {
      x -= speed;
      const singleWidth = track!.scrollWidth / 3;
      if (Math.abs(x) >= singleWidth) x = 0;
      track!.style.transform = `translateX(${x}px)`;
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [source.length]);

  return (
    <div className="w-full flex justify-center py-6">
      <div
        className="relative overflow-hidden rounded-2xl shadow-md border border-slate-100"
        style={{ width: "70%", height: 110 }}
      >
        {/* Scrolling image track */}
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((ad, i) => {
            const imgSrc = buildImgUrl(ad.img);
            const inner = (
              <div
                className="relative flex-shrink-0 overflow-hidden group"
                style={{ width: 320, height: 110 }}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={ad.title || "Ad"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    sizes="320px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Ad</span>
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Text */}
                {(ad.title || ad.description) && (
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                    {ad.title && (
                      <p className="text-white text-[13px] font-bold leading-tight truncate drop-shadow">
                        {ad.title}
                      </p>
                    )}
                    {ad.description && (
                      <p className="text-white/75 text-[11px] font-medium truncate mt-0.5">
                        {ad.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Ad badge */}
                <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest bg-black/40 text-white/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  Ad
                </span>

                {/* Divider */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10" />
              </div>
            );

            return ad.redirectto ? (
              <Link
                key={`${ad.id}-${i}`}
                href={ad.redirectto}
                target={ad.id > 0 ? "_blank" : "_self"}
                rel={ad.id > 0 ? "noopener noreferrer sponsored" : undefined}
                className="flex-shrink-0"
              >
                {inner}
              </Link>
            ) : (
              <div key={`${ad.id}-${i}`} className="flex-shrink-0">
                {inner}
              </div>
            );
          })}
        </div>

        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/20 to-transparent pointer-events-none z-10" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}
