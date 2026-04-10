"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import Image from "next/image";

interface CollegeData {
  slug: string;
  name: string;
  image: string | null;
  location: string;
  ranking: number | null;
  rating: number;
  totalRatingUser: number;
  universityType: string | null;
  estyear: string | null;
  totalStudent: number | null;
  website: string | null;
  min_fees: number | null;
  max_fees: number | null;
  total_courses: number;
  total_streams: number;
  placement_companies: string | null;
  placement_last_year: string | null;
  ctc_highest: string | null;
  ctc_lowest: string | null;
  ctc_average: string | null;
}

interface Suggestion {
  type: string;
  name: string;
  slug: string;
  location: string;
}

function formatFees(val: number | null): string {
  if (!val || val === 0) return "—";
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L/yr`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K/yr`;
  return `₹${val}/yr`;
}

function Cell({ value, sub }: { value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[16px] font-semibold text-[#3e3e3e]">{value || "—"}</p>
      {sub && <p className="text-[13px] font-semibold text-[#3e3e3e]/60 mt-0.5">{sub}</p>}
    </div>
  );
}

const METRICS = [
  { label: "Global Ranking", key: "ranking", render: (c: CollegeData) => <Cell value={c.ranking ? `#${c.ranking}` : "—"} sub="QS World 2026" /> },
  { label: "Tuition Fees/yr", key: "fees", render: (c: CollegeData) => <Cell value={c.min_fees ? `${formatFees(c.min_fees)} – ${formatFees(c.max_fees)}` : "—"} sub={c.universityType ?? undefined} /> },
  { label: "Rating", key: "rating", render: (c: CollegeData) => <Cell value={c.rating ? `${c.rating.toFixed(1)} ★` : "—"} sub={`${c.totalRatingUser} reviews`} /> },
  { label: "Placement Rate", key: "placement", render: (c: CollegeData) => <Cell value={c.placement_last_year || "—"} sub={c.placement_companies ? `${c.placement_companies} companies` : undefined} /> },
  { label: "Highest CTC", key: "ctc_highest", render: (c: CollegeData) => <Cell value={c.ctc_highest || "—"} /> },
  { label: "Average CTC", key: "ctc_average", render: (c: CollegeData) => <Cell value={c.ctc_average || "—"} /> },
  { label: "Total Courses", key: "courses", render: (c: CollegeData) => <Cell value={c.total_courses ? String(c.total_courses) : "—"} sub={c.total_streams ? `${c.total_streams} streams` : undefined} /> },
  { label: "Established", key: "estyear", render: (c: CollegeData) => <Cell value={c.estyear || "—"} /> },
  { label: "University Type", key: "type", render: (c: CollegeData) => <Cell value={c.universityType || "—"} /> },
];

function ComparePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [colleges, setColleges] = useState<(CollegeData | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load from URL params
  useEffect(() => {
    const slugs = searchParams.get("colleges")?.split(",").filter(Boolean) ?? [];
    if (!slugs.length) return;
    setLoading(true);
    fetch(`/api/compare?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const filled: (CollegeData | null)[] = [null, null, null];
        data.colleges.forEach((c: CollegeData, i: number) => { filled[i] = c; });
        setColleges(filled);
      })
      .finally(() => setLoading(false));
  }, []);

  // Search suggestions
  useEffect(() => {
    if (searchQ.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
        .then((r) => r.json())
        .then((d) => setSuggestions((d.suggestions ?? []).filter((s: Suggestion) => s.type === "college").slice(0, 6)));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  // Close suggestions on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setAddingSlot(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function addCollege(slug: string, slot: number) {
    const newColleges = [...colleges];
    // Don't add duplicate
    if (newColleges.some((c) => c?.slug === slug)) return;
    setLoading(true);
    fetch(`/api/compare?slugs=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.colleges[0]) {
          newColleges[slot] = data.colleges[0];
          setColleges(newColleges);
          // Update URL
          const slugs = newColleges.filter(Boolean).map((c) => c!.slug);
          router.replace(`/compare?colleges=${slugs.join(",")}`, { scroll: false });
        }
      })
      .finally(() => { setLoading(false); setSearchQ(""); setSuggestions([]); setAddingSlot(null); });
  }

  function removeCollege(slot: number) {
    const newColleges = [...colleges];
    newColleges[slot] = null;
    setColleges(newColleges);
    const slugs = newColleges.filter(Boolean).map((c) => c!.slug);
    router.replace(slugs.length ? `/compare?colleges=${slugs.join(",")}` : "/compare", { scroll: false });
  }

  const filledCount = colleges.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      <Header theme="dark" />

      <main className="pt-[104px] pb-16">
        {/* Hero Section with Search */}
        <div 
          className="relative w-full mb-12 py-32 px-4 sm:px-8 lg:px-12 bg-cover bg-center bg-no-repeat min-h-[480px] flex items-center"
          style={{ backgroundImage: "url('/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png')" }}
        >
          {/* Subtle overlay for better text readability if image is too bright */}
          <div className="absolute inset-0 bg-white/10" />
          
          <div className="relative z-30 max-w-7xl">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-[48px] font-semibold text-slate-800 leading-tight">Compare College</h1>
              <p className="text-slate-500 mt-2 text-[20px] font-medium max-w-4xl">
                Evaluate multiple institution side by side to find your perfect match based on fees, placement, and academic quality.
              </p>
            </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Compare College</h1>
            <p className="text-slate-500 mt-2">Evaluate multiple institutions side by side to find your perfect match based on fees, placement, and academic quality.</p>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="relative mb-8 max-w-xl">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="text-primary font-bold text-lg">+</span>
              <input
                value={searchQ}
                onChange={(e) => { setSearchQ(e.target.value); setAddingSlot(colleges.findIndex((c) => !c)); }}
                placeholder="Location, universities, courses..."
                className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none"
              />
              <button
                onClick={() => {
                  if (searchQ.trim()) {
                    const slot = colleges.findIndex((c) => !c);
                    if (slot !== -1) addCollege(searchQ.trim(), slot);
                  }
                }}
                className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Add College
              </button>
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full md:w-[calc(100%-140px)] mt-2 bg-white rounded-[5px] shadow-xl border border-slate-100 z-50 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => {
                        const slot = addingSlot !== null ? addingSlot : colleges.findIndex((c) => !c);
                        if (slot !== -1) addCollege(s.slug, slot);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.location}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      const slot = addingSlot !== null ? addingSlot : colleges.findIndex((c) => !c);
                      if (slot !== -1) addCollege(s.slug, slot);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {/* Metrics label column */}
                    <th className="w-[280px] bg-[#FAFAFA] px-8 py-8 text-left border-b border-r border-slate-100 align-middle">
                      <h2 className="text-[32px] font-semibold text-[#3e3e3e] leading-tight">Comparing Metrics</h2>
                    </th>

                    {/* College columns */}
                    {colleges.map((college, i) => (
                      <th key={i} className="relative px-6 py-6 border-b border-r border-slate-100 last:border-r-0 min-w-[280px] align-top bg-white">
                        {college ? (
                          <div className="flex flex-col h-full justify-between">
                            {/* Remove button (X) top-right */}
                            <button
                              onClick={() => removeCollege(i)}
                              className="absolute top-0 right-0 w-10 h-7 bg-[#FFA8A8] text-white flex items-center justify-center hover:bg-red-400 transition-colors z-10"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            {/* College card */}
                            <div className="flex flex-col items-start text-left mt-3 mb-5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[5px] overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center p-1">
                                  {college.image ? (
                                    <img src={college.image} alt={college.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-xl rounded-[5px]">
                                      {college.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[16px] font-semibold text-[#3e3e3e] leading-tight line-clamp-2">{college.name}</p>
                                  <p className="text-[15px] text-[#3e3e3e]/60 font-medium flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    {college.location}
                                  </p>
                                </div>
                              </div>
                            </div>
                              
                            <Link
                              href={`/college/${college.slug}`}
                              className="w-full bg-[#424242] text-white text-[15px] font-bold py-2.5 rounded-[5px] hover:bg-[#2A2A2A] transition-colors text-center block mt-auto"
                            >
                              Apply
                            </Link>
                          </div>
                        ) : (
                          /* Empty slot */
                          <div className="h-full flex items-center justify-center min-h-[120px]">
                            <button
                              onClick={() => { setAddingSlot(i); setSearchQ(""); }}
                              className="w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-[5px] hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[24px]">add</span>
                              <span className="text-[13px] font-semibold text-slate-400 group-hover:text-primary transition-colors">Add College</span>
                            </button>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {METRICS.map((metric, mi) => (
                    <tr key={metric.key} className={mi % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                      <td className="px-8 py-7 border-r border-slate-100">
                        <span className="text-[16px] font-semibold text-[#3e3e3e]">{metric.label}</span>
                      </td>
                      {colleges.map((college, ci) => (
                        <td key={ci} className="px-4 py-4 border-r border-slate-100 last:border-r-0">
                          {college ? (
                            loading ? (
                              <div className="h-4 bg-slate-100 rounded animate-pulse w-20" />
                            ) : (
                              metric.render(college)
                            )
                          ) : (
                            <span className="text-slate-200 text-sm">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filledCount === 0 && (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-200">compare</span>
                <p className="text-slate-400 font-medium mt-3">Search and add colleges above to start comparing</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  );
}
