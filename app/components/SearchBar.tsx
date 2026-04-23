"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Suggestion {
  type: "college" | "course" | "stream" | "city";
  name: string;
  location: string;
  slug?: string;
  id?: number | string;
}

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search colleges, courses, cities...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data.suggestions || []);
            setShowDropdown(true);
          })
          .catch((err) => console.error("Search fetch error:", err))
          .finally(() => setIsLoading(false));
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navigateToItem = (item: Suggestion) => {
    setSearchQuery(item.name);
    setShowDropdown(false);
    if (item.type === "college") {
      router.push(`/college/${item.slug}`);
    } else if (item.type === "course") {
      router.push(`/careers-courses?q=${encodeURIComponent(item.name)}`);
    } else if (item.type === "stream") {
      const params = new URLSearchParams();
      if (item.slug) params.set("stream", item.slug);
      if ((item as any).cityId) params.set("city_id", String((item as any).cityId));
      router.push(`/top-colleges?${params.toString()}`);
    } else if (item.type === "city") {
      router.push(`/top-colleges?city_id=${item.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(item.name)}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Parse "X in Y" for direct search navigation
      const inMatch = searchQuery.match(/^(.+?)\s+in\s+(.+)$/i);
      if (inMatch) {
        const params = new URLSearchParams({ q: inMatch[1].trim(), city: inMatch[2].trim() });
        router.push(`/search?${params.toString()}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
    setShowDropdown(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSearch}
        className="flex w-full items-stretch rounded-[5px] shadow-2xl transition-all duration-300 focus-within:ring-4 focus-within:ring-[#FF3C3C]/10"
      >
        <div className="flex h-[46px] sm:h-[50px] min-w-0 flex-1 items-center gap-2 sm:gap-3 px-3 sm:px-6 bg-white/40 backdrop-blur-md border border-white/30 border-r-0 rounded-l-[5px] focus-within:border-[#FF3C3C]">
          <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-white flex-shrink-0">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            placeholder={placeholder}
            suppressHydrationWarning
            className="min-w-0 flex-1 bg-transparent text-[14px] sm:text-[18px] lg:text-[20px] font-normal text-white placeholder:text-white/80 outline-none"
          />
        </div>
        <button
          type="submit"
          suppressHydrationWarning
          className="h-[46px] sm:h-[50px] flex-shrink-0 bg-[#FF3C3C] px-4 sm:px-8 lg:px-10 text-[13px] sm:text-[16px] lg:text-[20px] font-normal text-white transition-colors hover:bg-[#E63636] rounded-r-[5px] whitespace-nowrap"
        >
          {isLoading ? "..." : <><span className="hidden sm:inline">Search Now</span><span className="sm:hidden">Search</span></>}
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[5px] shadow-2xl overflow-hidden border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigateToItem(item)}
                  className="w-full text-left px-4 py-3 hover:bg-rose-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      {item.type === "college" ? "school" : 
                       item.type === "course" ? "menu_book" :
                       item.type === "stream" ? "category" :
                       item.type === "city" ? "location_on" : "search"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-slate-800 truncate">{item.name}</div>
                    <div className="text-[12px] font-normal text-slate-500 flex items-center gap-1 flex-wrap">
                      <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-400">
                        {item.type}
                      </span>
                      {(item as any).tag && (
                        <span className="px-1.5 py-0.5 bg-red-50 rounded text-[10px] font-bold text-red-400">
                          {(item as any).tag}
                        </span>
                      )}
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm font-normal">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
