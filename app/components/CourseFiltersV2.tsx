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

export default function CourseFiltersV2({
  levels = [],
  streams = [],
  activeLevel = "",
  activeStream = "",
  onFilterChange,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [level, setLevel] = useState(activeLevel);
  const [stream, setStream] = useState(activeStream);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setLevel(activeLevel); setStream(activeStream); }, [activeLevel, activeStream]);

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
    router.push(`${pathname}`);
    setLevel("");
    setStream("");
    if (onFilterChange) onFilterChange({});
  };

  if (!mounted) return null;

  return (
    <aside className="hidden lg:flex flex-col w-full flex-shrink-0">
      <div className="sticky top-6 w-full bg-white rounded-[10px] border border-neutral-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#1A1A1A]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">filter_alt</span>
            Filters
          </h2>
          <button type="button" onClick={resetAll} className="text-xs text-[#FF3C3C] font-semibold hover:text-white transition-colors">
            Clear all
          </button>
        </div>

        {/* Filters body */}
        <div className="p-4 flex flex-col gap-4">
          {/* Course Name */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Course Name</label>
            <input
              type="text"
              placeholder="Search course name"
              className="w-full px-3 py-2.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-[#FF3C3C] bg-white placeholder:text-neutral-400 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
          </div>

          {/* Degree */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Degree</label>
            <div className="relative">
              <select
                disabled
                className="w-full px-3 pr-8 py-2.5 text-xs border border-neutral-200 rounded-[6px] bg-white text-neutral-500 appearance-none cursor-not-allowed"
              >
                <option>Accounting and finance</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Education Level</label>
            <div className="relative">
              <select
                value={level}
                onChange={(e) => { const val = e.target.value; setLevel(val); applyFilters({ level: val }); }}
                className="w-full px-3 pr-8 py-2.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer transition-all text-neutral-600"
              >
                <option value="">Accounting and finance</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.slug || String(l.id)}>{l.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Stream */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Stream</label>
            <div className="relative">
              <select
                value={stream}
                onChange={(e) => { const val = e.target.value; setStream(val); applyFilters({ stream: val }); }}
                className="w-full px-3 pr-8 py-2.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer transition-all text-neutral-600"
              >
                <option value="">Computer science</option>
                {streams.map((s) => (
                  <option key={s.id} value={s.slug || String(s.id)}>{s.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => applyFilters()}
              className="w-full bg-[#FF3C3C] hover:bg-[#E63636] text-white text-xs font-bold py-2.5 rounded-[6px] transition-all"
            >
              Apply filter
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="w-full bg-white border border-neutral-300 text-neutral-500 hover:text-neutral-700 text-xs font-bold py-2.5 rounded-[6px] transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}




