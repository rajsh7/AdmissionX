"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const source = ads.map((ad, index) => ({
    id: ad.id ?? -(index + 1),
    title: ad.title ?? null,
    description: ad.description ?? null,
    img: ad.img ?? null,
    redirectto: ad.redirectto ?? null,
  }));

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || source.length === 0) return;

    let x = 0;
    const speed = 0.8;

    const step = () => {
      x -= speed;
      const singleWidth = track.scrollWidth / 3;
      if (Math.abs(x) >= singleWidth) x = 0;
      track.style.transform = `translateX(${x}px)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [source.length]);

  if (source.length === 0) return null;

  const items = [...source, ...source, ...source];

  return (
    <div className="flex w-full justify-center py-6">
      <div
        className="relative h-[110px] overflow-hidden rounded-2xl border border-slate-100 shadow-md"
        style={{ width: "70%" }}
      >
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((ad, i) => {
            const imgSrc = buildImgUrl(ad.img);
            const inner = (
              <div
                className="group relative h-[110px] w-[320px] flex-shrink-0 overflow-hidden"
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

        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-white/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-white/20 to-transparent" />
      </div>
    </div>
  );
}
