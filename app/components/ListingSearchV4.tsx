"use client";
// v3.0 - final relocation for hydration stability
// timestamp-final: 2026-03-24T14:48:00

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
import ExploreCards from "@/app/components/ExploreCards";
import CourseCardV3 from "./CourseCardV3";
import SearchBar from "./SearchBar";
import CourseFiltersV2 from "./CourseFiltersV2";
import PaginationFixed from "./PaginationFixed";
import type { CourseResult } from "@/app/api/search/courses/route";

interface CourseSearchClientProps {
  initialCourses: CourseResult[];
  initialTotal: number;
  initialTotalPages: number;
  levels: any[];
  streams: any[];
  initQ: string;
  initLevel: string;
  initDegree: string;
  initStream: string;
  initPage: number;
  heroImage?: string;
  heroRightImage?: string;
  heroHeight?: string;
  heroObjectPosition?: string;
  heroFit?: "cover" | "contain";
}

export default function ListingSearchV4({
  initialCourses,
  initialTotal,
  initialTotalPages,
  levels,
  streams,
  initQ,
  initLevel,
  initDegree,
  initStream,
  initPage,
  heroImage = "/images/hero-student.png",
  heroRightImage = "/images/2999ec4e5233aa8cb9dbf010e3c51149ae41f951.png",
  heroHeight = "700px",
  heroObjectPosition,
  heroFit = "cover",
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
  const degree = searchParams.get("degree") ?? initDegree;
  const stream = searchParams.get("stream") ?? initStream;
  const page = parseInt(searchParams.get("page") ?? String(initPage));

  useEffect(() => {
    setCourses(initialCourses);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
    setLoading(false);
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

  const [showingText, setShowingText] = useState("Loading...");

  useEffect(() => {
    if (loading) {
      setShowingText("Loading...");
    } else {
      const start = courses.length > 0 ? (page - 1) * 12 + 1 : 0;
      const end = Math.min(page * 12, total);
      setShowingText(`Showing ${start}-${end} of ${total.toLocaleString()} courses`);
    }
  }, [loading, courses, page, total]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative overflow-x-hidden">
      <Header />
      {/* ── Hero section ── */}
      <div className="relative w-full overflow-hidden" style={{ height: heroHeight }}>
        {/* ── Hero Background ── */}
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
            <Image
              src={heroImage}
              alt="Campus Background"
              fill
              priority
              className={heroFit === "contain" ? "object-contain" : "object-cover"}
              style={{ objectPosition: heroObjectPosition || "center" }}
            />
            <div className="absolute inset-0 bg-neutral-900/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 w-full h-full flex flex-col">
            <div className="flex-1 relative">
              <div className="mx-auto max-w-[1920px] w-full px-6 md:px-12 lg:px-24 h-full relative">
                <div className="flex flex-col justify-center h-full relative z-20">
                  <div className={`transition-opacity duration-700 mt-6 flex flex-col justify-center ${heroRightImage ? "lg:max-w-[55%] lg:text-left" : "lg:col-span-12 lg:max-w-4xl"}`} style={{ opacity: mounted ? 1 : 0 }}>
                    <h1 className="font-poppins text-white leading-[1.05] tracking-[0.02em] mb-4 drop-shadow-2xl">
                      <span className="text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold block mb-0">Finds your</span>
                      <span className="text-[40px] sm:text-[54px] lg:text-[72px] font-black text-[#FF3C3C]">perfect course!</span>
                    </h1>
                    <p className="text-white text-lg sm:text-2xl font-bold mb-8 max-w-2xl leading-relaxed opacity-90">
                      Search thousands of courses and universities worldwide
                    </p>
                    <div className="max-w-2xl">
                      <SearchBar defaultValue={q} onSearch={handleSearch} />
                    </div>
                  </div>
                </div>

                {heroRightImage && (
                  <div className="hidden lg:block absolute bottom-0 right-0 w-[45%] h-[90%] z-10">
                    <div className="relative w-full h-full">
                      <Image
                        src={heroRightImage}
                        alt="Hero Illustration"
                        fill
                        className="object-contain object-bottom drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-0">
        <div className="mx-auto max-w-[1920px] w-full px-0 pt-8 pb-16">
          <div className="flex gap-0">
            <div className="hidden lg:block basis-[370px] min-w-[370px] max-w-[370px] flex-shrink-0 pl-6">
                <CourseFiltersV2
                  levels={levels}
                  streams={streams}
                  activeLevel={level}
                  activeDegree={degree}
                  activeStream={stream}
                  totalResults={total}
                />
            </div>
            <div className="flex-1 min-w-0 pl-10 pr-6">
              {/* Active Filters + Sort bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap uppercase tracking-wider mr-1">Active Filters:</span>
                  {q && (
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm hover:border-[#FF3C3C] transition-all">
                      {q}
                      <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("q"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                  )}
                  {degree && (
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm hover:border-[#FF3C3C] transition-all">
                      {levels.find((l) => l.slug === degree)?.name || degree}
                      <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("degree"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                  )}
                  {level && (
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm hover:border-[#FF3C3C] transition-all">
                      {levels.find((l) => l.slug === level)?.name || level}
                      <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("level"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                  )}
                  {stream && (
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-[10px] text-xs font-bold text-neutral-600 shadow-sm hover:border-[#FF3C3C] transition-all">
                      {streams.find((s) => s.slug === stream)?.name || stream}
                      <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete("stream"); p.delete("page"); router.push(`${pathname}?${p.toString()}`); }} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                  )}
                  {!q && !degree && !level && !stream && (
                    <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-[10px] border border-neutral-100 border-dashed">No filters applied</span>
                  )}
                </div>
                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-medium text-[#6C6C6C] whitespace-nowrap uppercase tracking-wider">Short by:</span>
                  <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-[6px] px-3 py-1.5 shadow-sm cursor-pointer">
                    <span className="text-[13px] font-semibold text-neutral-700">Most Popular</span>
                    <span className="material-symbols-outlined text-[16px] text-neutral-400">expand_more</span>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-[10px]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-[10px] border border-neutral-100 aspect-[4/5] animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[10px] border border-neutral-100">
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">No courses match your search</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-[10px]">
                  {courses.map((course, i) => (
                    <CourseCardV3 key={course.id} course={course} index={i} />
                  ))}
                </div>
              )}
              {!loading && totalPages > 1 && (
                <div className="mt-16 border-t border-neutral-100 pt-10">
                  <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explore Cards */}
      <div className="mx-auto max-w-[1920px] w-full px-8 lg:px-12 xl:px-20 pb-12">
        <ExploreCards />
      </div>

      <Footer />
    </div>
  );
}




