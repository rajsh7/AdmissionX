"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";
import Link from "next/link";

interface CourseData {
  slug: string;
  title: string;
  image: string | null;
  description: string | null;
  level_name: string | null;
  stream_name: string | null;
  bestChoiceOfCourse: string | null;
  jobsCareerOpportunityDesc: string | null;
}

interface CourseSuggestion {
  type: string;
  slug: string;
  name: string;
  location: string;
}

function Cell({ value, sub }: { value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[16px] font-semibold text-[#3e3e3e]">{value || "—"}</p>
      {sub && (
        <p className="mt-0.5 text-[13px] font-semibold text-[#3e3e3e]/60">{sub}</p>
      )}
    </div>
  );
}

const METRICS = [
  {
    label: "Course Level",
    key: "level_name",
    render: (c: CourseData) => <Cell value={c.level_name || "—"} />,
  },
  {
    label: "Stream",
    key: "stream_name",
    render: (c: CourseData) => <Cell value={c.stream_name || "—"} />,
  },
  {
    label: "Best For",
    key: "bestChoiceOfCourse",
    render: (c: CourseData) => <Cell value={c.bestChoiceOfCourse || "—"} />,
  },
  {
    label: "Career Opportunities",
    key: "jobsCareerOpportunityDesc",
    render: (c: CourseData) => <Cell value={c.jobsCareerOpportunityDesc || "—"} />,
  },
  {
    label: "Overview",
    key: "description",
    render: (c: CourseData) => <Cell value={c.description || "—"} />,
  },
];

function CompareCoursePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<(CourseData | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (suggestions.length > 0 && searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [suggestions]);

  useEffect(() => {
    const slugs = searchParams.get("courses")?.split(",").filter(Boolean) ?? [];
    if (!slugs.length) return;
    setLoading(true);
    fetch(`/api/compare-courses?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const filled: (CourseData | null)[] = [null, null, null];
        data.courses.forEach((c: CourseData, i: number) => {
          filled[i] = c;
        });
        setCourses(filled);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (searchQ.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
        .then((r) => r.json())
        .then((d) => {
          const uniqueBySlug = new Set<string>();
          const normalized = (d.suggestions ?? [])
            .filter((s: CourseSuggestion) => s.type === "course")
            .map((s: CourseSuggestion) => ({
              type: s.type,
              slug: s.slug,
              name: s.name,
              location: s.location || "Course",
            }))
            .filter((s: CourseSuggestion) => {
              if (!s.slug || uniqueBySlug.has(s.slug)) return false;
              uniqueBySlug.add(s.slug);
              return true;
            })
            .slice(0, 6);

          setSuggestions(normalized);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".compare-suggestions-dropdown")
      ) {
        setSuggestions([]);
        setAddingSlot(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function addCourse(slug: string, slot: number) {
    const newCourses = [...courses];
    if (newCourses.some((c) => c?.slug === slug)) {
      setSearchQ("");
      setSuggestions([]);
      setAddingSlot(null);
      return;
    }
    setLoading(true);
    fetch(`/api/compare-courses?slugs=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.courses[0]) {
          newCourses[slot] = data.courses[0];
          setCourses(newCourses);
          const slugs = newCourses.filter(Boolean).map((c) => c!.slug);
          router.replace(`/compare-course?courses=${slugs.join(",")}`, {
            scroll: false,
          });
        }
      })
      .catch((err) => console.error("Add course error:", err))
      .finally(() => {
        setLoading(false);
        setSearchQ("");
        setSuggestions([]);
        setAddingSlot(null);
      });
  }

  function removeCourse(slot: number) {
    const newCourses = [...courses];
    newCourses[slot] = null;
    setCourses(newCourses);
    const slugs = newCourses.filter(Boolean).map((c) => c!.slug);
    router.replace(
      slugs.length ? `/compare-course?courses=${slugs.join(",")}` : "/compare-course",
      { scroll: false },
    );
  }

  function handleAddButton() {
    if (!searchQ.trim() || loading) return;
    const slot = addingSlot !== null ? addingSlot : courses.findIndex((c) => !c);
    if (slot === -1) return;
    if (suggestions.length > 0) {
      addCourse(suggestions[0].slug, slot);
    } else {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQ.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          const first = (d.suggestions ?? []).find(
            (s: CourseSuggestion) => s.type === "course",
          );
          if (first) addCourse(first.slug, slot);
          else setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }

  const filledCount = courses.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-display">
      <Header theme="dark" />

      <main className="pb-20 pt-20">
        <section
          className="relative z-30 mb-0 w-full overflow-visible py-20 pb-32 lg:py-28"
          style={{
            backgroundImage:
              "url('/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-30 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
            <div className="max-w-4xl">
              <h1 className="mb-4 text-[48px] font-bold leading-[1.1] tracking-tight text-slate-900">
                Compare Course
              </h1>
              <p className="mb-10 max-w-2xl text-[20px] font-medium leading-relaxed text-slate-600">
                Evaluate multiple courses side by side to find your perfect match
                based on level, stream, and career outcomes.
              </p>

              <div
                ref={searchRef}
                className="relative flex max-w-2xl flex-col gap-4 sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-3 rounded-[5px] border border-slate-200 bg-white px-5 py-3.5 shadow-sm transition-all duration-300 focus-within:border-[#FF3C3C] focus-within:ring-4 focus-within:ring-[#FF3C3C]/10">
                  <span className="material-symbols-outlined text-[24px] text-[#FF3C3C]">
                    menu_book
                  </span>
                  <input
                    ref={inputRef}
                    value={searchQ}
                    onChange={(e) => {
                      setSearchQ(e.target.value);
                      if (addingSlot === null) {
                        const slot = courses.findIndex((c) => !c);
                        setAddingSlot(slot !== -1 ? slot : 0);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddButton();
                    }}
                    placeholder="Search courses..."
                    className="flex-1 bg-transparent text-[16px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button
                  onClick={handleAddButton}
                  disabled={loading}
                  className="flex min-w-[150px] items-center justify-center gap-2 whitespace-nowrap rounded-[5px] bg-[#FF3C3C] px-8 py-3.5 text-[16px] font-bold text-white shadow-lg shadow-red-200 transition-all active:scale-95 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loading ? "Adding..." : "Add Course"}
                </button>

                {suggestions.length > 0 &&
                  dropdownStyle &&
                  createPortal(
                    <div
                      style={{
                        position: "absolute",
                        top: dropdownStyle.top,
                        left: dropdownStyle.left,
                        width: dropdownStyle.width,
                        zIndex: 9999,
                      }}
                      className="compare-suggestions-dropdown animate-in slide-in-from-top-2 fade-in overflow-hidden rounded-[5px] border border-slate-100 bg-white shadow-2xl duration-200"
                    >
                      <div className="py-1">
                        {suggestions.map((s, idx) => (
                          <button
                            key={`${s.slug}-${idx}`}
                            onClick={() => {
                              const slot =
                                addingSlot !== null
                                  ? addingSlot
                                  : courses.findIndex((c) => !c);
                              if (slot !== -1) addCourse(s.slug, slot);
                            }}
                            className="group flex w-full items-center gap-4 border-b border-slate-50 px-5 py-4 text-left transition-colors last:border-0 hover:bg-rose-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-white">
                              <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
                                menu_book
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-[15px] font-bold text-slate-800">
                                {s.name}
                              </p>
                              <p className="flex items-center gap-1 text-[12px] font-medium text-slate-500">
                                <span className="material-symbols-outlined text-[14px]">
                                  school
                                </span>
                                {s.location || "Course"}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body,
                  )}
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-40 mx-auto -mt-10 max-w-[1920px] px-6 sm:px-12 lg:px-24">
          <div
            className="overflow-hidden rounded-[5px] border border-slate-100 bg-white"
            style={{ boxShadow: "0 8px 20px -16px rgba(0, 0, 0, 0.12)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-[300px] border-b border-r border-slate-200 bg-[#F5F5F5] px-10 py-10 text-left align-middle">
                      <h2 className="text-[32px] font-bold leading-[1.1] text-slate-900">
                        Comparing
                        <br />
                        Metrics
                      </h2>
                    </th>

                    {courses.map((course, i) => (
                      <th
                        key={i}
                        className="group relative min-w-[320px] border-b border-r border-slate-100 bg-white px-8 py-8 align-top last:border-r-0"
                      >
                        {course ? (
                          <div className="flex h-full flex-col">
                            <button
                              onClick={() => removeCourse(i)}
                              className="absolute right-0 top-0 z-20 flex h-8 w-10 items-center justify-center bg-[#FFA8A8] text-white transition-colors hover:bg-red-500"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                close
                              </span>
                            </button>

                            <div className="mb-8 flex items-center gap-4 pt-2">
                              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-slate-100 bg-white p-1.5 shadow-sm">
                                {course.image ? (
                                  <img
                                    src={course.image}
                                    alt={course.title}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-primary/10 text-xl font-black text-primary">
                                    {course.title.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <p className="mb-1 truncate text-[18px] font-bold leading-tight text-slate-900">
                                  {course.title}
                                </p>
                                <p className="flex items-center gap-1 text-[14px] font-semibold text-slate-500">
                                  <span className="material-symbols-outlined text-[15px]">
                                    school
                                  </span>
                                  {course.level_name || "Course"}{" "}
                                  {course.stream_name
                                    ? `• ${course.stream_name}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/careers-courses/${course.slug}`}
                              className="mt-auto w-full rounded-[5px] bg-[#424242] py-3.5 text-center text-[16px] font-bold text-white shadow-lg shadow-black/10 transition-all active:scale-95 hover:bg-black"
                            >
                              View Course
                            </Link>
                          </div>
                        ) : (
                          <div className="flex h-full min-h-[160px] items-center justify-center pt-2">
                            <button
                              onClick={() => {
                                setAddingSlot(i);
                                setSearchQ("");
                                setTimeout(() => inputRef.current?.focus(), 50);
                              }}
                              className={`group flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-[5px] border-2 border-dashed transition-all ${
                                addingSlot === i
                                  ? "border-[#FF3C3C] bg-[#FF3C3C]/5 ring-4 ring-[#FF3C3C]/10"
                                  : "border-slate-100 hover:border-[#FF3C3C] hover:bg-[#FF3C3C]/5"
                              }`}
                            >
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                                  addingSlot === i
                                    ? "bg-white text-[#FF3C3C]"
                                    : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#FF3C3C]"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[24px]">
                                  {addingSlot === i ? "edit" : "add"}
                                </span>
                              </div>
                              <span
                                className={`text-[15px] font-medium transition-colors ${
                                  addingSlot === i
                                    ? "text-[#FF3C3C]"
                                    : "text-slate-400 group-hover:text-[#FF3C3C]"
                                }`}
                              >
                                {addingSlot === i ? "Selecting..." : "Add Course"}
                              </span>
                            </button>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {METRICS.map((metric) => (
                    <tr
                      key={metric.key}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="border-b border-r border-slate-100 px-10 py-8">
                        <span className="text-[17px] font-bold text-slate-800">
                          {metric.label}
                        </span>
                      </td>
                      {courses.map((course, ci) => (
                        <td
                          key={ci}
                          className="border-b border-r border-slate-100 px-8 py-8 last:border-r-0"
                        >
                          {course ? (
                            loading ? (
                              <div className="space-y-2">
                                <div className="h-5 w-24 animate-pulse rounded-[5px] bg-slate-100" />
                                <div className="h-3 w-16 animate-pulse rounded-[5px] bg-slate-100/50" />
                              </div>
                            ) : (
                              metric.render(course)
                            )
                          ) : (
                            <div className="flex flex-col gap-1.5 opacity-20">
                              <div className="h-1 w-12 rounded-full bg-slate-200" />
                              <div className="h-1 w-8 rounded-full bg-slate-100" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filledCount === 0 && (
              <div className="bg-white/50 py-24 text-center backdrop-blur-sm">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                  <span className="material-symbols-outlined text-[40px] text-slate-200">
                    compare
                  </span>
                </div>
                <h3 className="mb-2 text-[20px] font-bold text-slate-900">
                  No courses selected
                </h3>
                <p className="mx-auto max-w-sm px-6 font-medium text-slate-500">
                  Search and add courses above to see a detailed side-by-side
                  comparison.
                </p>
              </div>
            )}
          </div>

          <div className="mt-16">
            <ExploreCards />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CompareCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CompareCoursePageInner />
    </Suspense>
  );
}

