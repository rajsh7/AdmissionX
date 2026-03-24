"use client";
// v2.3 - force rebuild for hydration stability
// timestamp: 2026-03-24T12:45:00

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
import CourseCardV3 from "@/app/components/CourseCardV3";
import CourseFilters from "@/app/components/CourseFilters";
import PaginationFixed from "@/app/components/PaginationFixed";
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

  // Sync with URL params
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
    <div className="min-h-screen bg-neutral-50 flex flex-col relative overflow-x-hidden">
      {/* ── Hero section ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '560px' }}>
        {/* ── Hero Background ── */}
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <Image
            src="/images/hero-student.png"
            alt="Campus Background"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-neutral-900/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col">
          <Header />

          {/* ── Hero / Search Banner ── */}
          <div className="flex-1 flex items-center justify-start relative">
            <div className="mx-auto w-full px-4 lg:px-12 xl:px-20">
              <div className="max-w-4xl text-left transition-opacity duration-700" style={{ opacity: mounted ? 1 : 0 }}>
                <h1 className="font-poppins text-white leading-[1.05] tracking-[0.02em] mb-4 drop-shadow-2xl">
                  <span className="text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold block mb-0">Finds your</span>
                  <span className="text-[40px] sm:text-[54px] lg:text-[72px] font-black text-[#008080]">perfect course!</span>
                </h1>
                <p className="text-white text-lg sm:text-2xl font-bold mb-10 max-w-2xl leading-relaxed opacity-90">
                  Search thousands of courses and universities worldwide
                </p>

                {/* Search bar */}
                <div className="max-w-2xl">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSearch((e.target as any).q.value); }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full"
                  >
                    <div className="flex-1 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl focus-within:border-[#008080] focus-within:ring-4 focus-within:ring-[#008080]/10 transition-all duration-300 px-6 py-1">
                      <span className="material-symbols-outlined text-[20px] text-neutral-400 flex-shrink-0">search</span>
                      <input
                        name="q"
                        type="text"
                        defaultValue={q}
                        placeholder="Location, universities, courses..."
                        className="flex-1 py-4 text-sm sm:text-base text-neutral-800 placeholder:text-neutral-400 bg-transparent outline-none min-w-0 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex-shrink-0 bg-[#008080] hover:bg-[#006666] text-white text-sm font-black px-12 py-5 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-[#008080]/30 min-w-max"
                    >
                      Search Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Main content â”€â”€ */}
      <div className="relative z-10 flex-1 flex flex-col pt-0">
        <div className="mx-auto w-full px-4 lg:px-8 xl:px-12 pt-12 pb-16">
          <div className="flex gap-10">
            {/* â”€â”€ Filters sidebar â”€â”€ */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <CourseFilters
                levels={levels}
                streams={streams}
                activeLevel={level}
                activeStream={stream}
                totalResults={total}
                onFilterChange={() => setLoading(true)}
              />
            </div>

            {/* â”€â”€ Results column â”€â”€ */}
            <div className="flex-1 min-w-0">
              {/* â”€â”€ Results Toolbar â”€â”€ */}
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Academic Courses</h2>
                    <p className="text-sm text-neutral-500 font-bold">
                      {showingText}
                    </p>
                  </div>

                  {/* Sort placeholder */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-neutral-400 whitespace-nowrap uppercase tracking-widest">
                      Sort By:
                    </span>
                    <select className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black text-neutral-700 shadow-sm focus:outline-none focus:border-[#008080] cursor-pointer">
                      <option>Most Popular</option>
                      <option>Newest First</option>
                      <option>Level (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Row */}
                {(level || stream) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {level && (
                      <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-neutral-600 shadow-sm">
                        {levels.find(l => l.slug === level)?.name || level}
                        <button onClick={() => {
                          const p = new URLSearchParams(searchParams.toString());
                          p.delete("level"); p.delete("page");
                          router.push(`${pathname}?${p.toString()}`);
                        }} className="hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    )}
                    {stream && (
                      <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-neutral-600 shadow-sm">
                        {streams.find(s => s.slug === stream)?.name || stream}
                        <button onClick={() => {
                          const p = new URLSearchParams(searchParams.toString());
                          p.delete("stream"); p.delete("page");
                          router.push(`${pathname}?${p.toString()}`);
                        }} className="hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* â”€â”€ Course grid â”€â”€ */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-neutral-100 aspect-[4/5] animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] border border-neutral-100">
                  <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-neutral-300">search_off</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight">No courses match your search</h3>
                  <p className="text-neutral-400 max-w-sm mb-8 font-medium">Try adjusting your filters or using different keywords to explore more options.</p>
                  <button
                    onClick={() => router.push(pathname)}
                    className="bg-[#008080] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#006666] transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course, i) => (
                    <CourseCardV3 key={course.id} course={course} index={i} />
                  ))}
                </div>
              )}

              {/* â”€â”€ Pagination â”€â”€ */}
              {!loading && totalPages > 1 && (
                <div className="mt-16 border-t border-neutral-100 pt-10">
                  <PaginationFixed
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
