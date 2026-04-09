"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export interface TickerAdItem {
  id: number;
  title: string;
  description: string;
  img: string;
  redirectto: string;
}

interface AdCardProps {
  ads: TickerAdItem[];
  className?: string;
}

const FALLBACK_ITEMS: TickerAdItem[] = [
  {
    id: -1,
    title: "Top MBA Colleges 2025",
    description: "Admissions Open — Apply Now",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    redirectto: "/search?stream=management",
  },
  {
    id: -2,
    title: "Engineering Admissions",
    description: "Explore 200+ Institutes",
    img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
    redirectto: "/search?stream=engineering",
  },
];

function buildImgUrl(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t || t.toUpperCase().includes("NULL")) return null;
  if (t.startsWith("http") || t.startsWith("/")) return t;
  return `/uploads/${t}`;
}

export default function AdCard({ ads, className = "" }: AdCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const source = ads && ads.length > 0 ? ads : FALLBACK_ITEMS;

  // Sync index on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (!isAutoScrolling || source.length <= 1) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const nextIndex = (currentIndex + 1) % source.length;
      scrollRef.current.scrollTo({
        left: nextIndex * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoScrolling, source.length]);

  // Pause auto-scroll on interaction
  const handleInteraction = () => {
    setIsAutoScrolling(false);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setIsAutoScrolling(true), 10000);
  };

  // Mouse wheel horizontal translation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Translate vertical mouse wheel scrolling to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "auto" });
        setIsAutoScrolling(false);
      }
    };

    // Use native event listener to allow preventDefault on passive events
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: 400,
          height: 250,
          borderRadius: 5,
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 12 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div 
      className={`group ${className}`} 
      style={{ 
        width: 400, 
        height: 250, 
        flexShrink: 0, 
        position: "relative",
      }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 5,
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          background: "#0f172a",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.08)",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          #ad-scroll-container::-webkit-scrollbar { display: none; }
        `}} />
        
        {source.map((ad, idx) => {
          const imgSrc = buildImgUrl(ad.img);
          const innerContent = (
            <div
              style={{
                width: "100%",
                height: "100%",
                flexShrink: 0,
                scrollSnapAlign: "start",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background Image */}
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={ad.title || "Ad"}
                  fill
                  style={{ objectFit: "cover", opacity: 0.7 }}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  }}
                />
              )}

              {/* Dark gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                }}
              />

              {/* Top badge */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#FF3C3C",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Partner
                </span>
              </div>

              {/* Text content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  right: 24,
                }}
              >
                {ad.title && !ad.title.toUpperCase().includes("NULL") && (
                  <h4
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {ad.title}
                  </h4>
                )}
                {ad.description && !ad.description.toUpperCase().includes("NULL") && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 13,
                      fontWeight: 500,
                      marginTop: 6,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
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
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                flexShrink: 0,
                scrollSnapAlign: "start",
                textDecoration: "none",
              }}
            >
              {innerContent}
            </Link>
          ) : (
            <div key={ad.id ?? idx} style={{ width: "100%", height: "100%", flexShrink: 0, scrollSnapAlign: "start" }}>
              {innerContent}
            </div>
          );
        })}
      </div>

      {/* Overlays (Static UI elements) */}
      <div style={{ position: "absolute", bottom: 20, right: 24, display: "flex", gap: 4, zIndex: 30, pointerEvents: "none" }}>
        {source.map((_, i) => (
          <div
            key={i}
            style={{
              height: 4,
              borderRadius: 999,
              transition: "all 0.5s ease",
              width: i === currentIndex ? 16 : 6,
              background:
                i === currentIndex
                  ? "#FF3C3C"
                  : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <div
          key={currentIndex}
          style={{
            height: "100%",
            background: "#FF3C3C",
            animation: "adcard-progress 5s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes adcard-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
