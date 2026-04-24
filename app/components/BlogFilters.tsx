"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogFiltersProps {
  currentQuery: string;
  currentSort: "latest" | "oldest";
}

export default function BlogFilters({ currentQuery, currentSort }: BlogFiltersProps) {
  const router = useRouter();

  const toggleCategory = (category: string) => {
    const keywords = currentQuery.split(/\s+/).filter(Boolean);
    const index = keywords.findIndex(k => k.toLowerCase() === category.toLowerCase());
    
    let newQuery: string;
    if (index !== -1) {
      // Remove it
      keywords.splice(index, 1);
      newQuery = keywords.join(" ");
    } else {
      // Add it
      newQuery = currentQuery ? `${currentQuery} ${category}` : category;
    }

    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery.trim());
    if (currentSort !== "latest") params.set("sort", currentSort);
    
    router.push(`/blogs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="mb-8 w-full flex flex-col gap-5">
      {/* Search Bar Row */}
      <div className="flex flex-row items-center gap-2 w-full" style={{ height: "51.8px" }}>
        <form
          method="GET"
          action="/blogs"
          className="flex flex-row flex-1 max-w-[800px] shadow-sm rounded-[5px] overflow-hidden border border-neutral-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50 transition-all"
          style={{ height: "51.8px" }}
        >
          <div className="flex-1 relative h-full bg-white">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-400">
              search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Search for topics, exams, career tips, or any blog..."
              className="w-full h-full pl-12 pr-4 text-[15px] font-medium bg-transparent text-neutral-800 placeholder:text-neutral-400 focus:outline-none box-border"
            />
            <input type="hidden" name="sort" value={currentSort} />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: "#FF3B30" }}
            className="shrink-0 px-8 h-full text-[15px] font-bold text-white hover:bg-[#E63636] transition-colors whitespace-nowrap"
          >
            Search Now
          </button>
        </form>
      </div>

      {/* Category Toggles Row */}
      <div className="flex flex-row flex-wrap items-center gap-3">
        {["Admissions", "Exams", "Career", "Scholarships", "Campus"].map((label) => {
          const isActive = currentQuery.toLowerCase().includes(label.toLowerCase());
          return (
            <button
              key={label}
              onClick={() => toggleCategory(label)}
              className={`text-[13px] font-semibold px-5 flex items-center justify-center rounded-[5px] border transition-all whitespace-nowrap shadow-sm hover:shadow-md ${
                isActive
                  ? "border-red-300 bg-red-50 text-red-700 ring-2 ring-red-100"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-red-200 hover:bg-neutral-50 hover:text-red-700"
              }`}
              style={{ height: "42px" }}
            >
              {label}
            </button>
          );
        })}
        {currentQuery && (
          <Link 
            href="/blogs"
            className="text-[13px] font-bold text-neutral-400 hover:text-red-500 transition-colors ml-2 px-2"
          >
            Clear All
          </Link>
        )}
      </div>
    </div>
  );
}
