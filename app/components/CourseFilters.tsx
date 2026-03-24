"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface CourseFiltersProps {
  levels?: FilterOption[];
  streams?: FilterOption[];
  activeLevel?: string;
  activeStream?: string;
  totalResults?: number;
  onFilterChange?: (filters: any) => void;
}

export default function CourseFilters({
  levels = [],
  streams = [],
  activeLevel = "",
  activeStream = "",
  totalResults,
  onFilterChange,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state
  const [level, setLevel]   = useState(activeLevel);
  const [stream, setStream]   = useState(activeStream);
  const [degree, setDegree] = useState(""); // Potential future filter
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with URL
  useEffect(() => {
    setLevel(activeLevel);
    setStream(activeStream);
  }, [activeLevel, activeStream]);

  const applyFilters = useCallback(
    (overrides: Record<string, string> = {}) => {
      const next = {
        level: overrides.level !== undefined ? overrides.level : level,
        stream: overrides.stream !== undefined ? overrides.stream : stream,
        q: overrides.q !== undefined ? overrides.q : undefined,
      };

      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
      if (onFilterChange) onFilterChange(next);
    },
    [level, stream, searchParams, router, pathname, onFilterChange]
  );

  const resetAll = () => {
    const params = new URLSearchParams();
    router.push(`${pathname}?${params.toString()}`);
    setLevel("");
    setStream("");
    setDegree("");
    if (onFilterChange) onFilterChange({});
  };

  if (!mounted) return null;

  const panel = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1A1A1A] -mx-5 -mt-5 mb-8 rounded-t-2xl shadow-lg border-b border-white/5">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#008080]">filter_alt</span>
          Filters
        </h2>
        <button type="button" onClick={resetAll} className="text-xs text-[#008080] font-bold hover:text-white transition-colors">
          Clear all
        </button>
      </div>

      {/* Filter list */}
      <div className="flex-1 space-y-8 pb-10">
        {/* Course Name */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Course Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search course name..."
              className="w-full pl-4 pr-3 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#008080] focus:ring-4 focus:ring-[#008080]/5 bg-white transition-all placeholder:text-neutral-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
          </div>
        </div>

        {/* Degree (Placeholder/Future) */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Degree</label>
          <div className="relative">
            <select
              disabled
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-400 appearance-none cursor-not-allowed transition-all"
            >
              <option value="">Accounting and finance</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-300 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Education Level */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Education Level</label>
          <div className="relative">
            <select
              value={level}
              onChange={(e) => {
                  const val = e.target.value;
                  setLevel(val);
                  applyFilters({ level: val });
              }}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#008080] bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="">Select Education Level...</option>
              {levels.map((l) => (
                <option key={l.id} value={l.slug || String(l.id)}>{l.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Stream */}
        <div>
          <label className="text-sm font-bold text-neutral-600 mb-2 block">Stream</label>
          <div className="relative">
            <select
              value={stream}
              onChange={(e) => {
                  const val = e.target.value;
                  setStream(val);
                  applyFilters({ stream: val });
              }}
              className="w-full pl-4 pr-10 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#008080] bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="">Select Stream...</option>
              {streams.map((s) => (
                <option key={s.id} value={s.slug || String(s.id)}>{s.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="pt-8 flex flex-col gap-3 pb-4">
          <button
            type="button"
            className="w-full bg-[#008080] hover:bg-[#006666] text-white text-sm font-black py-3.5 rounded-xl shadow-lg shadow-[#008080]/20 transition-all active:scale-[0.98]"
          >
            Apply filter
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="w-full bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 text-sm font-black py-3.5 rounded-xl transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-28 bg-white rounded-2xl border border-neutral-100 shadow-xl p-5 flex flex-col">
        {panel}
      </div>
    </aside>
  );
}
