"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Suggestion {
  name: string;
}

export default function ContactSearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/colleges/contact/suggestions?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  function submitSearch(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextQuery.trim();

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.set("page", "1");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="flex justify-center">
      <div className="w-full max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(query);
          }}
          className="relative"
        >
          <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            placeholder="Search college by name..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-28 text-[15px] text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#1f6feb] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1558b0]"
          >
            Search
          </button>
        </form>

        {open && (suggestions.length > 0 || loading) && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <div className="px-4 py-3 text-sm text-slate-500">Loading suggestions...</div>
            ) : (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.name}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion.name);
                    submitSearch(suggestion.name);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span className="truncate font-medium">{suggestion.name}</span>
                  <span className="material-symbols-rounded text-[18px] text-slate-300">north_west</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
