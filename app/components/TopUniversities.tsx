"use client";

import { useRef } from "react";
import Link from "next/link";

export interface University {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
}

interface TopUniversitiesProps {
  universities: University[];
}

export default function TopUniversities({ universities }: TopUniversitiesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-slate-100 dark:bg-slate-900/50 py-16">
      <div className="w-full px-4">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Featured
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Top Universities
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Cards Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x"
        >
          {universities.map((uni) => (
            <div
              key={uni.name}
              className="min-w-[320px] max-w-[320px] snap-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              <div
                className="h-40 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url('${uni.image}')` }}
              >
                <div className="absolute top-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                    star
                  </span>
                  {uni.rating}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex gap-3 mb-3">
                  <div
                    className={`h-10 w-10 flex-shrink-0 rounded ${uni.abbrBg} flex items-center justify-center text-white text-xs font-serif font-bold`}
                  >
                    {uni.abbr}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {uni.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      {uni.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {uni.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="block text-slate-900 dark:text-white font-bold text-sm">
                      {uni.tuition}
                    </span>
                    Avg. Tuition
                  </div>
                  <Link
                    href={uni.href}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
