"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface BlogFiltersProps {
  currentQuery: string;
  currentSort: "latest" | "oldest";
}

export default function BlogFilters({ currentQuery, currentSort }: BlogFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortLabel = currentSort === "oldest" ? "Oldest" : "Latest";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between items-center gap-3 mb-6 relative">
        <form method="GET" action="/blogs" className="flex flex-row gap-3 min-w-0 w-1/2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-400">
              search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Location, universities, courses..."
              className="w-full pl-11 pr-4 py-3 text-sm border border-neutral-200 rounded-[5px] bg-white text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-shadow"
            />
            <input type="hidden" name="sort" value={currentSort} />
          </div>
          <button
            type="submit"
            className="shrink-0 px-6 py-3 rounded-[5px] text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: "#FF3B30" }}
          >
            Search Now
          </button>
        </form>
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="relative min-w-[180px] appearance-none rounded-[10px] border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-left text-[13px] font-black text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 focus:outline-none"
          >
            Filters ({sortLabel})
            <span
              className={`material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 transition-transform duration-200 ${
                showFilters ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {showFilters && (
            <div
              id="blog-filters"
              className="absolute right-0 z-30 mt-2 w-[180px] overflow-hidden rounded-[10px] border border-neutral-200 bg-white p-1 shadow-2xl"
            >
              <div className="flex flex-col">
                <Link
                  href={`/blogs?${new URLSearchParams({
                    ...(currentQuery ? { q: currentQuery } : {}),
                    sort: "latest",
                  }).toString()}`}
                  className={`w-full rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    currentSort === "latest"
                      ? "bg-blue-50 text-blue-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Latest Blogs
                </Link>
                <Link
                  href={`/blogs?${new URLSearchParams({
                    ...(currentQuery ? { q: currentQuery } : {}),
                    sort: "oldest",
                  }).toString()}`}
                  className={`w-full rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    currentSort === "oldest"
                      ? "bg-blue-50 text-blue-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Oldest Blogs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["Admissions", "Exams", "Career", "Scholarships", "Campus"].map((label) => {
          const isActive = currentQuery.toLowerCase() === label.toLowerCase();
          return (
            <Link
              key={label}
              href={`/blogs?${new URLSearchParams({
                q: label,
                sort: currentSort,
              }).toString()}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-[5px] border transition-colors ${
                isActive
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-neutral-200 text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
