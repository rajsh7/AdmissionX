"use client";

import Link from "next/link";

interface BlogFiltersProps {
  currentQuery: string;
  currentSort: "latest" | "oldest";
}

export default function BlogFilters({ currentQuery, currentSort }: BlogFiltersProps) {
  return (
    <div className="mb-6 w-full flex flex-col gap-3">
      {/* Row 1: search + filters dropdown */}
      <div className="flex flex-row items-center gap-2 w-full" style={{ height: "45px" }}>
        {/* Search form */}
        <form
          method="GET"
          action="/blogs"
          className="flex flex-row shrink-0"
          style={{ height: "45px", width: "600px" }}
        >
          <div className="flex-1 relative h-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-400">
              search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Location, universities, courses..."
              className="w-full h-full pl-11 pr-4 text-sm border border-neutral-200 border-r-0 rounded-l-[5px] rounded-r-none bg-white text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-shadow box-border"
            />
            <input type="hidden" name="sort" value={currentSort} />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: "#FF3B30", height: "45px" }}
            className="shrink-0 px-6 rounded-r-[5px] rounded-l-none text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
          >
            Search Now
          </button>
        </form>
      </div>

      {/* Row 2: category pills */}
      <div className="flex flex-row flex-wrap items-center gap-2">
        {["Admissions", "Exams", "Career", "Scholarships", "Campus"].map((label) => {
          const isActive = currentQuery.toLowerCase() === label.toLowerCase();
          return (
            <Link
              key={label}
              href={`/blogs?${new URLSearchParams({
                q: label,
                sort: currentSort,
              }).toString()}`}
              className={`text-[13px] font-semibold px-4 flex items-center justify-center rounded-[5px] border transition-colors whitespace-nowrap ${
                isActive
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              }`}
              style={{ height: "40px" }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
