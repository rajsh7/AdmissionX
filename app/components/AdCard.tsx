"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdItem } from "./AdsSection";

export interface AdCardItem {
  id: number;
  title: string | null;
  description: string | null;
  img: string | null;
  redirectto: string | null;
}

interface AdCardProps {
  ads: AdCardItem[] | AdItem[];
  className?: string;
}

function buildImgUrl(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.toUpperCase().includes("NULL")) return null;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return `/uploads/${value}`;
}

function isRenderable(value: string | null | undefined): value is string {
  return Boolean(value && !value.toUpperCase().includes("NULL"));
}

export default function AdCard({ ads, className = "" }: AdCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const source = ads.map((ad, index) => ({
    id: ad.id ?? -(index + 1),
    title: ad.title ?? null,
    description: ad.description ?? null,
    img: ad.img ?? null,
    redirectto: ad.redirectto ?? null,
  }));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const pauseAutoScroll = () => {
    setIsAutoScrolling(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 10000);
  };

  useEffect(() => {
    if (!isAutoScrolling || source.length <= 1) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const nextIndex = (currentIndex + 1) % source.length;
      container.scrollTo({
        left: nextIndex * container.clientWidth,
        behavior: "smooth",
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoScrolling, source.length]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      element.scrollBy({ left: event.deltaY, behavior: "auto" });
      pauseAutoScroll();
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  if (source.length === 0) {
    return (
      <div className={`relative flex h-[220px] w-full items-end overflow-hidden rounded-[5px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(135deg,#e2e8f0_0%,#f8fafc_55%,#ffffff_100%)] p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.2)] sm:h-[240px] ${className}`}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Live Ads
          </p>
          <h4 className="mt-2 text-xl font-bold leading-tight text-slate-800">
            No active home ads found in the database
          </h4>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Add or activate an ad with position <span className="font-bold text-slate-700">home</span> or <span className="font-bold text-slate-700">default</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative h-[220px] w-full overflow-hidden rounded-[5px] border border-slate-200 bg-slate-950 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.75)] sm:h-[240px] ${className}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={pauseAutoScroll}
        onTouchStart={pauseAutoScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {source.map((ad, idx) => {
          const imgSrc = buildImgUrl(ad.img);
          const cardContent = (
            <div className="relative h-full w-full shrink-0 snap-start overflow-hidden">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={ad.title || "Advertisement"}
                  fill
                  className="object-cover opacity-75 transition duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#1e293b_0%,#0f172a_100%)]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.45)_52%,transparent_100%)]" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white">
                  Ads
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                {isRenderable(ad.title) && (
                  <h4 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                    {ad.title}
                  </h4>
                )}
                {isRenderable(ad.description) && (
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-white/80">
                    {ad.description}
                  </p>
                )}
              </div>
            </div>
          );

          return ad.redirectto ? (
            <Link
              key={ad.id ?? idx}
              href={ad.redirectto}
              target={ad.id > 0 ? "_blank" : "_self"}
              rel={ad.id > 0 ? "noopener noreferrer sponsored" : undefined}
              draggable={false}
              className="block h-full w-full shrink-0 snap-start no-underline"
            >
              {cardContent}
            </Link>
          ) : (
            <div key={ad.id ?? idx} className="h-full w-full shrink-0 snap-start">
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 z-30 flex gap-1">
        {source.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${i === currentIndex ? "h-1 w-4 bg-primary" : "h-1 w-1.5 bg-white/35"}`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 h-[3px] bg-white/10">
        <div
          key={currentIndex}
          className={`h-full bg-primary ${isAutoScrolling ? "animate-[adcard-progress_5s_linear_forwards]" : "w-full"}`}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: "@keyframes adcard-progress { from { width: 0%; } to { width: 100%; } }" }} />
    </div>
  );
}
