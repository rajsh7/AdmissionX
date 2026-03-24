"use client";
// v2.1 - force rebuild for hydration

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CourseCardV2 from "@/app/components/CourseCardV2";
import CourseFilters from "@/app/components/CourseFilters";
import Pagination from "@/app/components/Pagination";
import type { CourseResult } from "@/app/api/search/courses/route";

interface CourseSearchClientProps {
  initialCourses: CourseResult[];
  initialTotal: number;
  initialTotalPages: number;
  levels: any[];
  streams: any[];
  initQ: string;
  initLevel: string;
  initStream: string;
  initPage: number;
}

export default function CourseSearchClient({
  initialCourses,
  initialTotal,
  initialTotalPages,
  levels,
  streams,
  initQ,
  initLevel,
  initStream,
  initPage,
}: CourseSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<CourseResult[]>(initialCourses);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  const q = searchParams.get("q") ?? initQ;
  const level = searchParams.get("level") ?? initLevel;
  const stream = searchParams.get("stream") ?? initStream;
  const page = parseInt(searchParams.get("page") ?? String(initPage));

  useEffect(() => {
    setCourses(initialCourses);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialCourses, initialTotal, initialTotalPages]);

  useEffect(() => {
    if (!isPending) setLoading(false);
  }, [isPending]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback(
    (newQ: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQ) params.set("q", newQ);
      else params.delete("q");
      params.delete("page");
      setLoading(true);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname]
  );

  const showingText = loading
    ? "Loading..."
    : `Showing ${courses.length > 0 ? (page - 1) * 12 + 1 : 0}–${Math.min(page * 12, total)} of ${total.toLocaleString()} courses`;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      {/* ── Hero section ── */}
      <div className="relative w-full overflow-hidden">
        {/* ── Hero Background ── */}
        <div className="absolute top-0 left-0 w-full h-[580px] z-0 overflow-hidden">
            {/* Background Image - Full width and height of container */}
            <Image
              src="https://images.unsplash.com/photo-1541339907198-e087593c02ca?auto=format&fit=crop&q=80&w=2000"
              alt="Campus Background"
              fill
              priority
              className="object-cover"
            />
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-neutral-900/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 w-full">
            <Header />
            
            {/* ── Hero / Search Banner ── */}
            <div className="pt-28 pb-20 relative">
                <div className="mx-auto w-full px-4 lg:px-12 xl:px-20">
                    {mounted && (
                      <div className="max-w-4xl pt-10 text-left">
                          <h1 className="text-6xl sm:text-7xl lg:text-[100px] font-black text-white leading-[1.1] mb-6 drop-shadow-xl">
                            Finds your <br />
                            <span className="text-[#008080]">perfect course!</span>
                          </h1>
                          <p className="text-white text-lg sm:text-2xl font-bold mb-10 max-w-2xl leading-relaxed">
                            Search thousands of courses and universities worldwide
                          </p>

                          {/* Search bar */}
                          <div className="max-w-2xl">
                              <form
                                onSubmit={(e) => { e.preventDefault(); handleSearch((e.target as any).q.value); }}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full"
                              >
                                <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 shadow-xl focus-within:border-[#008080] focus-within:ring-4 focus-within:ring-[#008080]/5 transition-all duration-300 px-6 py-1">
                                  <span className="material-symbols-outlined text-[20px] text-neutral-400 flex-shrink-0">search</span>
                                  <input
                                    name="q"
                                    type="text"
                                    defaultValue={q}
                                    placeholder="Location, universities, courses..."
                                    className="flex-1 py-4 text-sm sm:text-base text-neutral-800 placeholder:text-neutral-400 bg-transparent outline-none min-w-0"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="flex-shrink-0 bg-[#008080] hover:bg-[#006666] text-white text-sm font-black px-12 py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#008080]/20 min-w-max"
                                >
                                  Search Now
                                </button>
                              </form>
                          </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-12">
        {/* ── Main content ── */}
        <div className="mx-auto w-full px-4 lg:px-8 xl:px-12 py-8">
          <div className="flex gap-8">
            {/* ── Filters sidebar ── */}
            <CourseFilters
              levels={levels}
              streams={streams}
              activeLevel={level}
              activeStream={stream}
              totalResults={total}
              onFilterChange={() => setLoading(true)}
            />

            {/* ── Results column ── */}
            <div className="flex-1 min-w-0">
              {/* ── Results Toolbar ── */}
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-4 border-b border-neutral-100">
                  {/* Active Filters Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-neutral-400 whitespace-nowrap uppercase tracking-wider">
                      Active Filters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {level && (
                            <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
                                {levels.find(l => l.slug === level)?.name || level}
                                <button onClick={() => handleSearch("")} className="hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        )}
                        {stream && (
                            <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 shadow-sm transition-all hover:border-[#008080]">
                                {streams.find(s => s.slug === stream)?.name || stream}
                                <button onClick={() => handleSearch("")} className="hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        )}
                        {!level && !stream && (
                             <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 border-dashed">No filters applied</span>
                        )}
                    </div>
                  </div>

                  {/* Sort placeholder */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm font-black text-neutral-400 whitespace-nowrap uppercase tracking-wider">
                      Short by:
                    </span>
                    <select className="bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-xs font-black text-neutral-700 shadow-sm focus:outline-none focus:border-[#008080]">
                      <option>Most Popular</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-bold">
                  {showingText}
                </p>
              </div>

              {/* ── Course grid ── */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-neutral-100 aspect-[3/4] animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <span className="material-symbols-outlined text-6xl text-neutral-200 mb-4">search_off</span>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">No courses found</h3>
                    <p className="text-neutral-400 max-w-md">Try adjusting your filters or search keywords to find what you're looking for.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, i) => (
                    <CourseCardV2 key={course.id} course={course} index={i} />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!loading && totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    useUrl
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
