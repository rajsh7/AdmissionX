"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  // Update dropdown position when suggestions change
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
    if (newColleges.some((c) => c?.slug === slug)) return;
    setLoading(true);
    fetch(`/api/compare?slugs=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.colleges[0]) {
          newColleges[slot] = data.colleges[0];
          setColleges(newColleges);
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

  function handleAddButton() {
    if (!searchQ.trim()) return;
    const slot = addingSlot !== null ? addingSlot : colleges.findIndex((c) => !c);
    if (slot === -1) return;
    if (suggestions.length > 0) {
      addCollege(suggestions[0].slug, slot);
    } else {
      fetch(`/api/search?q=${encodeURIComponent(searchQ.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          const first = (d.suggestions ?? []).find((s: Suggestion) => s.type === "college");
          if (first) addCollege(first.slug, slot);
        });
    }
  }

  const filledCount = colleges.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-display">
      <Header theme="dark" />

      <main className="pt-20 pb-20">
        {/* Hero Section */}
        <section
          className="w-full py-20 lg:py-28 pb-32 relative mb-0 overflow-visible z-30"
          style={{
            backgroundImage: "url('/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle overlay for better text readability if image is too bright */}
          <div className="absolute inset-0 bg-white/10" />
          
          <div className="relative z-30 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-[48px] font-semibold text-slate-800 leading-tight">Compare College</h1>
              <p className="text-slate-500 mt-2 text-[20px] font-medium max-w-4xl">
          <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-[48px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
                Compare College
              </h1>
              <p className="text-[20px] font-medium leading-relaxed mb-10 text-slate-600 max-w-2xl">
                Evaluate multiple institution side by side to find your perfect match based on fees, placement, and academic quality.
              </p>

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
            </div>
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
          </div>
              {/* Search Layout */}
              <div ref={searchRef} className="flex flex-col sm:flex-row gap-4 max-w-2xl relative">
                <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-[5px] px-4 py-3.5 shadow-sm focus-within:border-[#FF3C3C] focus-within:ring-2 focus-within:ring-[#FF3C3C]/10 transition-all">
                  <span className="text-[#FF3C3C] font-bold text-xl">+</span>
                  <input
                    ref={inputRef}
                    value={searchQ}
                    onChange={(e) => {
                      setSearchQ(e.target.value);
                      if (addingSlot === null) {
                        const slot = colleges.findIndex((c) => !c);
                        setAddingSlot(slot !== -1 ? slot : null);
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddButton(); }}
                    placeholder="Search universities, colleges..."
                    className="flex-1 text-[16px] text-slate-700 placeholder:text-slate-400 bg-transparent outline-none font-medium"
                  />
                </div>
                <button
                  onClick={handleAddButton}
                  className="bg-[#FF3C3C] text-white text-[16px] font-bold px-8 py-3.5 rounded-[5px] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200 whitespace-nowrap"
                >
                  Add College
                </button>

                {/* Suggestions dropdown via portal */}
                {suggestions.length > 0 && dropdownStyle && createPortal(
                  <div
                    style={{ position: "absolute", top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width, zIndex: 9999 }}
                    className="bg-white rounded-[5px] shadow-2xl border border-slate-100 overflow-hidden"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => {
                          const slot = addingSlot !== null ? addingSlot : colleges.findIndex((c) => !c);
                          if (slot !== -1) addCollege(s.slug, slot);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">account_balance</span>
                        <div>
                          <p className="text-[15px] font-bold text-slate-800">{s.name}</p>
                          <p className="text-[13px] text-slate-400 font-medium">{s.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-24 relative z-40 -mt-10">
          <div className="bg-white rounded-[5px] border border-slate-100 overflow-hidden" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-[300px] bg-[#F5F5F5] px-10 py-10 text-left border-b border-r border-slate-200 align-middle">
                      <h2 className="text-[32px] font-bold text-slate-900 leading-[1.1]">Comparing<br/>Metrics</h2>
                    </th>

                    {colleges.map((college, i) => (
                      <th key={i} className="relative px-8 py-8 border-b border-r border-slate-100 last:border-r-0 min-w-[320px] align-top bg-white group">
                        {college ? (
                          <div className="flex flex-col h-full">
                            <button
                              onClick={() => removeCollege(i)}
                              className="absolute top-0 right-0 w-10 h-8 bg-[#FFA8A8] text-white flex items-center justify-center hover:bg-red-500 transition-colors z-20"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            <div className="flex items-center gap-4 mb-8 pt-2">
                              <div className="w-14 h-14 rounded-[5px] overflow-hidden bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                                {college.image ? (
                                  <img src={college.image} alt={college.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-xl rounded-[5px]">
                                    {college.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-[18px] font-bold text-slate-900 leading-tight truncate mb-1">{college.name}</p>
                                <p className="text-[14px] text-slate-500 font-semibold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                                  {college.location}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/college/${college.slug}`}
                              className="w-full bg-[#424242] text-white text-[16px] font-bold py-3.5 rounded-[5px] hover:bg-black transition-all active:scale-95 text-center mt-auto shadow-lg shadow-black/10"
                            >
                              Apply
                            </Link>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center min-h-[160px] pt-2">
                            <button
                              onClick={() => {
                                setAddingSlot(i);
                                setSearchQ("");
                                setTimeout(() => inputRef.current?.focus(), 50);
                              }}
                              className="w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-100 rounded-[5px] hover:border-[#FF3C3C] hover:bg-[#FF3C3C]/5 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF3C3C] text-[24px]">add</span>
                              </div>
                              <span className="text-[15px] font-bold text-slate-400 group-hover:text-[#FF3C3C] transition-colors">Add College</span>
                            </button>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {METRICS.map((metric) => (
                    <tr key={metric.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8 border-r border-b border-slate-100">
                        <span className="text-[17px] font-bold text-slate-800">{metric.label}</span>
                      </td>
                      {colleges.map((college, ci) => (
                        <td key={ci} className="px-8 py-8 border-r border-b border-slate-100 last:border-r-0">
                          {college ? (
                            loading ? (
                              <div className="space-y-2">
                                <div className="h-5 bg-slate-100 rounded-[5px] animate-pulse w-24" />
                                <div className="h-3 bg-slate-100/50 rounded-[5px] animate-pulse w-16" />
                              </div>
                            ) : (
                              metric.render(college)
                            )
                          ) : (
                            <div className="flex flex-col gap-1.5 opacity-20">
                              <div className="h-1 bg-slate-200 w-12 rounded-full" />
                              <div className="h-1 bg-slate-100 w-8 rounded-full" />
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
              <div className="py-24 text-center bg-white/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[40px] text-slate-200">compare</span>
                </div>
                <h3 className="text-[20px] font-bold text-slate-900 mb-2">No colleges selected</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto px-6">Search and add colleges above to see a detailed side-by-side comparison.</p>
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
