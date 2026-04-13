"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogFiltersProps {
  currentQuery: string;
}

export default function BlogFilters({ currentQuery }: BlogFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <div className="flex flex-row justify-between items-center gap-3 mb-6">
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
          </div>
          <button
            type="submit"
            className="shrink-0 px-6 py-3 rounded-[5px] text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: "#FF3B30" }}
          >
            Search Now
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[5px] text-sm font-semibold border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          Filters
        </button>
      </div>

      {showFilters && (
        <div id="blog-filters" className="mb-8 flex flex-wrap gap-2">
          {["Admissions", "Exams", "Career", "Scholarships", "Campus"].map((label) => {
            const isActive = currentQuery.toLowerCase() === label.toLowerCase();
            return (
              <Link
                key={label}
                href={`/blogs?q=${encodeURIComponent(label)}`}
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
      )}
    </>
  );
}
