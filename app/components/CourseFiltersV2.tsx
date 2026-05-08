"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  activeDegree?: string;
  activeStream?: string;
  totalResults?: number;
  onFilterChange?: (filters: any) => void;
}

export default function CourseFiltersV2({
  levels = [],
  streams = [],
  activeLevel = "",
  activeDegree = "",
  activeStream = "",
  onFilterChange,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [level, setLevel] = useState(activeLevel);
  const [degree, setDegree] = useState(activeDegree);
  const [stream, setStream] = useState(activeStream);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    setLevel(activeLevel);
    setDegree(activeDegree);
    setStream(activeStream);
  }, [activeLevel, activeDegree, activeStream]);

  const applyFilters = useCallback(
    (overrides: Record<string, string> = {}) => {
      const next: Record<string, string | undefined> = {
        level: overrides.level !== undefined ? overrides.level : level,
        degree: overrides.degree !== undefined ? overrides.degree : degree,
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
    [level, degree, stream, searchParams, router, pathname, onFilterChange]
  );

  const resetAll = () => {
    router.push(`${pathname}`);
    setLevel("");
    setDegree("");
    setStream("");
    if (onFilterChange) onFilterChange({});
  };

  if (!mounted) return null;

  return (
    <aside className="hidden lg:flex flex-col w-full flex-shrink-0">
      <div className="sticky top-6 w-full bg-white rounded-[5px] border border-neutral-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#1A1A1A]">
          <h2 className="text-[25px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">filter_alt</span>
            Filters
          </h2>
          <button type="button" onClick={resetAll} className="text-xs text-[#FF3C3C] font-semibold hover:text-white transition-colors">
            Clear all
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Course Name */}
          <div>
            <label className="text-[16px] font-semibold text-[#6C6C6C] mb-1.5 block">Course Name</label>
            <input
              type="text"
              placeholder="Search course name"
              className="w-full px-3 text-[15px] font-medium text-[#9AA0B4] border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white placeholder:text-[#9AA0B4] transition-all"
              style={{ height: "45px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters({ q: (e.target as HTMLInputElement).value });
              }}
            />
          </div>

          {/* Degree */}
          <div>
            <label className="text-[16px] font-semibold text-[#6C6C6C] mb-1.5 block">Degree</label>
            <div className="relative">
              <select
                value={degree}
                onChange={(e) => { const val = e.target.value; setDegree(val); applyFilters({ degree: val }); }}
                className="w-full px-3 pr-8 text-[15px] font-medium text-[#9AA0B4] border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer transition-all"
                style={{ height: "45px" }}
              >
                <option value="">Select Degree...</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.slug || String(l.id)}>{l.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="text-[16px] font-semibold text-[#6C6C6C] mb-1.5 block">Education Level</label>
            <div className="relative">
              <select
                value={level}
                onChange={(e) => { const val = e.target.value; setLevel(val); applyFilters({ level: val }); }}
                className="w-full px-3 pr-8 text-[15px] font-medium text-[#9AA0B4] border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white appearance-none cursor-pointer transition-all"
                style={{ height: "45px" }}
              >
                <option value="">Select Education Level...</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.slug || String(l.id)}>{l.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Stream */}
          <StreamDropdown
            streams={streams}
            value={stream}
            onChange={(val) => { setStream(val); applyFilters({ stream: val }); }}
          />

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1 items-stretch">
            <button
              type="button"
              onClick={() => applyFilters()}
              className="w-full flex items-center justify-center bg-[#FF3C3C] border border-transparent hover:bg-[#E63636] text-white text-[14px] font-bold rounded-[5px] shadow-lg shadow-[#FF3C3C]/20 transition-all active:scale-[0.98]"
              style={{ height: "45px" }}
            >
              Apply filter
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="w-full flex items-center justify-center bg-white border border-neutral-200 text-[#6C6C6C] hover:text-neutral-600 hover:border-neutral-400 text-[14px] font-bold rounded-[5px] transition-all"
              style={{ height: "45px" }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StreamDropdown({ streams, value, onChange }: { streams: FilterOption[]; value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = streams.find((s) => (s.slug || String(s.id)) === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      <label className="text-[16px] font-semibold text-[#6C6C6C] mb-1.5 block">Stream</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full px-3 pr-8 text-[15px] font-medium text-[#9AA0B4] border border-neutral-200 rounded-[5px] focus:outline-none focus:border-[#FF3C3C] bg-white cursor-pointer transition-all text-left"
          style={{ height: "45px" }}
        >
          {selected?.name || "Select Stream..."}
        </button>
        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400 pointer-events-none">expand_more</span>
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-[5px] shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2.5 text-[14px] text-[#9AA0B4] cursor-pointer hover:bg-neutral-50"
              onClick={() => { onChange(""); setOpen(false); }}
            >
              Select Stream...
            </div>
            {streams.map((s) => {
              const val = s.slug || String(s.id);
              return (
                <div
                  key={s.id}
                  className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-red-50 hover:text-[#FF3C3C] ${
                    value === val ? "bg-red-50 text-[#FF3C3C] font-semibold" : "text-[#6C6C6C]"
                  }`}
                  onClick={() => { onChange(val); setOpen(false); }}
                >
                  {s.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
