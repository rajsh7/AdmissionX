"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export interface CollegeOption { id: number; name: string; slug: string; }

interface Props {
  colleges: CollegeOption[];
  selectedId: string;
  total: number;
  label: string;
  icon: string;
  description: string;
  addButton?: React.ReactNode;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function CollegeFilterBar({ colleges, selectedId, total, label, icon, description, addButton }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const selected = colleges.find(c => String(c.id) === selectedId);
  const filtered = search
    ? colleges.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : colleges;

  function handleChange(id: string) {
    const p = new URLSearchParams();
    if (id) p.set("collegeId", id);
    p.set("page", "1");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>{icon}</span>
            {label}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>database</span>
            <strong className="text-slate-700">{total.toLocaleString()}</strong> records
          </span>
          {addButton}
        </div>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 flex-shrink-0">
            <span className="material-symbols-rounded text-blue-500 text-[18px]" style={ICO_FILL}>filter_alt</span>
            Filter by College
          </span>

          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[15px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search college name..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>

          {/* Dropdown */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <select
              value={selectedId}
              onChange={e => handleChange(e.target.value)}
              className="w-full h-9 pl-3 pr-8 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none cursor-pointer"
            >
              <option value="">— All Colleges —</option>
              {filtered.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-rounded text-[16px] text-slate-400 pointer-events-none" style={ICO}>expand_more</span>
          </div>

          {selectedId && (
            <button
              onClick={() => handleChange("")}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-rounded text-[14px]" style={ICO}>close</span>
              Clear
            </button>
          )}
        </div>

        {/* Active filter badge */}
        {selected && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="material-symbols-rounded text-blue-500 text-[15px]" style={ICO_FILL}>account_balance</span>
            <span className="text-sm font-semibold text-blue-700 truncate">Showing: {selected.name}</span>
            <a
              href={`/college/${selected.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
            >
              <span className="material-symbols-rounded text-[13px]" style={ICO}>open_in_new</span>
              View
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
