"use client";
import { useState, useMemo } from "react";
import ExploreCards from "@/app/components/ExploreCards";

interface CourseRow {
  course_name: string;
  degree_name: string | null;
  stream_name?: string | null;
  fees: string | null;
  seats?: string | null;
  courseduration: string | null;
  twelvemarks?: string | null;
  description?: string | null;
  admission_start?: string | null;
  admission_end?: string | null;
  last_date?: string | null;
}

interface CoursesTabProps {
  courses: CourseRow[];
  slug: string;
}

function formatFees(fees: string | null): string {
  if (!fees) return "—";
  const n = parseInt(fees);
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L / yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K / yr`;
  return `₹${n} / yr`;
}

function formatDate(d: string | null | undefined): string | null {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

// Use actual degree name as tab key — most reliable approach
function getTabKey(degreeName: string | null): string {
  if (!degreeName) return "Other";
  const d = degreeName.toLowerCase().trim();
  // Group common UG patterns
  if (d.includes("bachelor") || d.startsWith("b.") || d === "be" || d === "bba" || d === "bca" || d === "bsc" || d === "bcom" || d === "ba")
    return "Undergraduate";
  // Group common PG patterns
  if (d.includes("master") || d.startsWith("m.") || d === "me" || d === "mba" || d === "mca" || d === "msc" || d === "mcom" || d === "ma" || d.includes("pg") || d.includes("post"))
    return "Postgraduate";
  if (d.includes("phd") || d.includes("ph.d") || d.includes("doctor"))
    return "PhD";
  if (d.includes("diploma"))
    return "Diploma";
  if (d.includes("certificate"))
    return "Certificate";
  // For anything else, use the actual degree name as its own tab
  return degreeName;
}

const STREAM_COLORS = [
  { border: "border-red-100",     badge: "bg-red-100 text-red-700",       dot: "bg-red-500",     header: "bg-red-50"     },
  { border: "border-blue-100",    badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500",    header: "bg-blue-50"    },
  { border: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", header: "bg-emerald-50" },
  { border: "border-amber-100",   badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500",   header: "bg-amber-50"   },
  { border: "border-purple-100",  badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500",  header: "bg-purple-50"  },
  { border: "border-pink-100",    badge: "bg-pink-100 text-pink-700",     dot: "bg-pink-500",    header: "bg-pink-50"    },
];

export default function CoursesTab({ courses, slug }: CoursesTabProps) {
  const [activeTab, setActiveTab] = useState("All");

  // Build dynamic tabs from actual degree data
  const filterTabs = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach(c => cats.add(getTabKey(c.degree_name)));
    const ORDER = ["Undergraduate", "Postgraduate", "PhD", "Diploma", "Certificate"];
    const sorted = [...cats].sort((a, b) => {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
    return ["All", ...sorted];
  }, [courses]);

  const filtered = useMemo(() =>
    activeTab === "All" ? courses : courses.filter(c => getTabKey(c.degree_name) === activeTab),
    [courses, activeTab]
  );

  // Group by stream
  const byStream = useMemo(() => {
    const map = new Map<string, CourseRow[]>();
    filtered.forEach(c => {
      const k = c.stream_name || "General";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return map;
  }, [filtered]);

  return (
    <div className="w-full bg-white pb-24">
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-12">

        {/* Header + Filter tabs */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h2 className="text-[22px] sm:text-[28px] font-black text-slate-900">Courses Offered</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {courses.length} course{courses.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Filter tabs — scrollable on mobile */}
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex items-center bg-white border border-neutral-200 rounded-[5px] shadow-sm min-w-max">
              {filterTabs.map((tab) => {
                const count = tab === "All" ? courses.length : courses.filter(c => getTabKey(c.degree_name) === tab).length;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-widest border-r border-neutral-100 last:border-r-0 flex items-center gap-1 sm:gap-1.5 ${
                      isActive
                        ? "text-[#FF3C3C] bg-[#FF3C3C]/10"
                        : "bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                    <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-[#FF3C3C]/20 text-[#FF3C3C]" : "bg-slate-100 text-slate-400"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* No courses */}
        {filtered.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-[5px] py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">school</span>
            <p className="text-slate-500 font-bold">No courses found for this category.</p>
            <button onClick={() => setActiveTab("All")} className="mt-3 text-[#FF3C3C] font-bold text-sm hover:underline">
              Show all courses
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {[...byStream.entries()].map(([streamName, streamCourses], si) => {
              const color = STREAM_COLORS[si % STREAM_COLORS.length];
              return (
                <div key={streamName}>
                  {/* Stream heading */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${color.dot}`} />
                    <h3 className="text-[13px] font-black text-slate-600 uppercase tracking-widest">{streamName}</h3>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${color.badge}`}>
                      {streamCourses.length} course{streamCourses.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Course cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {streamCourses.map((course, idx) => (
                      <div
                        key={idx}
                        className={`bg-white rounded-[5px] border ${color.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col`}
                      >
                        {/* Card header */}
                        <div className={`px-5 py-4 ${color.header} border-b ${color.border}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-slate-900 text-[15px] leading-snug">
                                {course.course_name}
                              </h4>
                              {course.degree_name && (
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  {course.degree_name}
                                </span>
                              )}
                            </div>
                            {course.courseduration && (
                              <span className="shrink-0 text-[11px] font-black text-white bg-slate-700 px-2 py-1 rounded-[3px] whitespace-nowrap">
                                {course.courseduration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="px-5 py-4 space-y-3 flex-1">
                          {/* Fees + Seats */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Fees</p>
                              <p className="text-[20px] font-black text-[#FF3C3C] leading-tight">
                                {formatFees(course.fees)}
                              </p>
                            </div>
                            {course.seats && (
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seats</p>
                                <p className="text-[20px] font-black text-slate-800 leading-tight">{course.seats}</p>
                              </div>
                            )}
                          </div>

                          {/* Eligibility */}
                          {course.twelvemarks && parseInt(course.twelvemarks) > 0 && (
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-semibold">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">school</span>
                              Min. {course.twelvemarks}% in 12th
                            </div>
                          )}

                          {/* Dates */}
                          {(course.admission_start || course.admission_end || course.last_date) && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              {course.admission_start && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400 font-semibold">Opens</span>
                                  <span className="font-bold text-emerald-600">{formatDate(course.admission_start)}</span>
                                </div>
                              )}
                              {course.admission_end && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400 font-semibold">Closes</span>
                                  <span className="font-bold text-slate-700">{formatDate(course.admission_end)}</span>
                                </div>
                              )}
                              {course.last_date && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400 font-semibold">Last Date</span>
                                  <span className={`font-bold ${new Date(course.last_date) < new Date() ? "text-red-500" : "text-amber-600"}`}>
                                    {formatDate(course.last_date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {course.description && (
                            <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 pt-1 border-t border-slate-100">
                              {course.description}
                            </p>
                          )}
                        </div>

                        {/* Apply button */}
                        <div className="px-5 pb-4">
                          <a
                            href={`/apply/${slug}`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3C3C] hover:bg-red-700 text-white font-black text-[12px] uppercase tracking-widest rounded-[5px] transition-colors"
                          >
                            Apply Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div className="mt-10 flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-[5px]">
          <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
          <p className="text-[12px] text-slate-500 font-medium">
            Fees and seats are indicative. Please contact the college for the latest information.
          </p>
        </div>
      </div>

      {/* Explore Cards */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 pb-10">
        <ExploreCards />
      </div>
    </div>
  );
}
