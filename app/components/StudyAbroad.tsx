"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const countries = [
  {
    name: "MIT",
    fullName: "Massachusetts Institute of Technology",
    rank: "#1 QS Ranking",
    flag: "🇺🇸",
    country: "United States",
    tags: ["Engineering", "Computer Science", "Research"],
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=2574&auto=format&fit=crop",
    href: "/university/mit",
    stats: { acceptance: "4%", students: "11,500+" },
  },
  {
    name: "Cambridge",
    fullName: "University of Cambridge",
    rank: "#2 QS Ranking",
    flag: "🇬🇧",
    country: "United Kingdom",
    tags: ["Law", "Science", "Humanities"],
    image: "https://images.unsplash.com/photo-1580491934990-4e4172142bc4?q=80&w=2574&auto=format&fit=crop",
    href: "/university/cambridge",
    stats: { acceptance: "21%", students: "24,000+" },
  },
  {
    name: "NUS",
    fullName: "National University of Singapore",
    rank: "#8 QS Ranking",
    flag: "🇸🇬",
    country: "Singapore",
    tags: ["Business", "Technology", "Innovation"],
    image: "https://images.unsplash.com/photo-1496939376851-89342e90adcd?q=80&w=2670&auto=format&fit=crop",
    href: "/university/nus",
    stats: { acceptance: "12%", students: "42,000+" },
  },
  {
    name: "Oxford",
    fullName: "University of Oxford",
    rank: "#3 QS Ranking",
    flag: "🇬🇧",
    country: "United Kingdom",
    tags: ["Medicine", "Law", "Philosophy"],
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop",
    href: "/university/oxford",
    stats: { acceptance: "17%", students: "26,000+" },
  },
  {
    name: "Stanford",
    fullName: "Stanford University",
    rank: "#5 QS Ranking",
    flag: "🇺🇸",
    country: "United States",
    tags: ["AI", "Entrepreneurship", "Engineering"],
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2670&auto=format&fit=crop",
    href: "/university/stanford",
    stats: { acceptance: "4%", students: "17,000+" },
  },
  {
    name: "ETH Zurich",
    fullName: "Swiss Federal Institute of Technology",
    rank: "#7 QS Ranking",
    flag: "🇨🇭",
    country: "Switzerland",
    tags: ["Science", "Engineering", "Architecture"],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop",
    href: "/university/eth-zurich",
    stats: { acceptance: "27%", students: "23,000+" },
  },
];

function ParallaxCard({ uni }: { uni: (typeof countries)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className="min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] snap-center flex-shrink-0">
      <Link
        href={uni.href}
        className="group relative block overflow-hidden rounded-3xl bg-neutral-900 h-[460px]"
      >
        {/* Parallax Image */}
        <motion.div className="absolute inset-[-10%] z-0" style={{ y: imageY }}>
          <Image
            src={uni.image}
            alt={uni.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 450px"
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10 p-7 lg:p-8 h-full flex flex-col justify-between">
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <span className="bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white">
              {uni.rank}
            </span>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <span className="text-xl">{uni.flag}</span>
            </div>
          </div>

          {/* Bottom Content */}
          <div>
            <p className="text-sm text-white/50 font-medium mb-1">{uni.country}</p>
            <h3 className="text-3xl font-black text-white mb-2 group-hover:text-red-400 transition-colors">
              {uni.name}
            </h3>
            <p className="text-white/60 text-sm mb-5">{uni.fullName}</p>

            <div className="flex gap-6 mb-5">
              <div>
                <div className="text-lg font-bold text-white">{uni.stats.acceptance}</div>
                <div className="text-xs text-white/40">Acceptance</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{uni.stats.students}</div>
                <div className="text-xs text-white/40">Students</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {uni.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function StudyAbroad() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth ?? 400;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + 24) : cardWidth + 24,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  return (
    <section className="relative w-full py-20 lg:py-28 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        {/* ─── Header Row ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 lg:mb-16">
          {/* Chapter Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
                03
              </span>
              <div className="h-px w-8 bg-red-500/30" />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
                Go Global
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
              The World Is Your Classroom
            </h2>
            <p className="mt-4 text-lg text-neutral-500 font-light max-w-xl leading-relaxed">
              Break boundaries. Study at the most prestigious institutions
              across the globe and build an international career.
            </p>
          </motion.div>

          {/* Arrow Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                canScrollLeft
                  ? "border-neutral-300 text-neutral-700 hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10 cursor-pointer"
                  : "border-neutral-200 text-neutral-300 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                canScrollRight
                  ? "border-neutral-300 text-neutral-700 hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10 cursor-pointer"
                  : "border-neutral-200 text-neutral-300 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </motion.div>
        </div>

        {/* ─── Horizontal Scroll Cards ─── */}
        <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto hide-scrollbar snap-x pb-4"
          >
            {countries.map((uni) => (
              <ParallaxCard key={uni.name} uni={uni} />
            ))}
          </div>

          {/* Left fade edge */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          )}
          {/* Right fade edge */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          )}
        </div>
      </div>
    </section>
  );
}
