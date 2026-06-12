"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";
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
  if (!val || val === 0) return "-";
  if (val >= 100000) return `Rs ${Number(val / 100000).toFixed(1)}L/yr`;
  if (val >= 1000) return `Rs ${Number(val / 1000).toFixed(0)}K/yr`;
  return `Rs ${val}/yr`;
}

function Cell({ value, sub }: { value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[16px] font-semibold text-slate-800">{value || "-"}</p>
      {sub && <p className="mt-0.5 text-[13px] font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}

const METRICS = [
  {
    label: "Global Ranking",
    key: "ranking",
    render: (c: CollegeData) => <Cell value={c.ranking ? `#${c.ranking}` : "-"} sub="QS World 2026" />,
  },
  {
    label: "Tuition Fees/yr",
    key: "fees",
    render: (c: CollegeData) => (
      <Cell
        value={c.min_fees ? `${formatFees(c.min_fees)} - ${formatFees(c.max_fees)}` : "-"}
        sub={c.universityType ?? undefined}
      />
    ),
  },
  {
    label: "Rating",
    key: "rating",
    render: (c: CollegeData) => (
      <Cell
        value={c.rating ? `${c.rating.toFixed(1)} / 5` : "-"}
        sub={`${c.totalRatingUser} reviews`}
      />
    ),
  },
  {
    label: "Placement Rate",
    key: "placement",
    render: (c: CollegeData) => (
      <Cell
        value={c.placement_last_year || "-"}
        sub={c.placement_companies ? `${c.placement_companies} companies` : undefined}
      />
    ),
  },
  { label: "Highest CTC", key: "ctc_highest", render: (c: CollegeData) => <Cell value={c.ctc_highest || "-"} /> },
  { label: "Average CTC", key: "ctc_average", render: (c: CollegeData) => <Cell value={c.ctc_average || "-"} /> },
  {
    label: "Total Courses",
    key: "courses",
    render: (c: CollegeData) => (
      <Cell value={c.total_courses ? String(c.total_courses) : "-"} sub={c.total_streams ? `${c.total_streams} streams` : undefined} />
    ),
  },
  { label: "Established", key: "estyear", render: (c: CollegeData) => <Cell value={c.estyear || "-"} /> },
  { label: "University Type", key: "type", render: (c: CollegeData) => <Cell value={c.universityType || "-"} /> },
];

function ComparePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [colleges, setColleges] = useState<(CollegeData | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [inlineSearchQ, setInlineSearchQ] = useState("");
  const [inlineSuggestions, setInlineSuggestions] = useState<Suggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  function updateDropdownPosition() {
    if (!searchRef.current) return;
    const rect = searchRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }

  useEffect(() => {
    if (suggestions.length > 0) updateDropdownPosition();
  }, [suggestions]);

  useEffect(() => {
    if (!suggestions.length) return;
    const syncPosition = () => updateDropdownPosition();
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);
    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [suggestions.length]);

  useEffect(() => {
    const slugs = searchParams.get("colleges")?.split(",").filter(Boolean) ?? [];
    if (!slugs.length) return;
    fetch(`/api/compare?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const filled: (CollegeData | null)[] = [null, null, null];
        data.colleges.forEach((c: CollegeData, i: number) => {
          filled[i] = c;
        });
        setColleges(filled);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (searchQ.length < 2) return;
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
        .then((r) => r.json())
        .then((d) =>
          setSuggestions((d.suggestions ?? []).filter((s: Suggestion) => s.type === "college").slice(0, 6)),
        );
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    if (inlineSearchQ.length < 2) return;
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(inlineSearchQ)}`)
        .then((r) => r.json())
        .then((d) =>
          setInlineSuggestions((d.suggestions ?? []).filter((s: Suggestion) => s.type === "college").slice(0, 6)),
        );
    }, 300);
    return () => clearTimeout(t);
  }, [inlineSearchQ]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".compare-suggestions-dropdown") &&
        !(e.target as HTMLElement).closest(".inline-suggestions-dropdown")
      ) {
        setSuggestions([]);
        setAddingSlot(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function addCollege(slug: string, slot: number) {
    const newColleges = [...colleges];
    if (newColleges.some((c) => c?.slug === slug)) {
      setSearchQ("");
      setSuggestions([]);
      setAddingSlot(null);
      return;
    }
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
      .catch((err) => console.error("Add college error:", err))
      .finally(() => {
        setLoading(false);
        setSearchQ("");
        setSuggestions([]);
        setAddingSlot(null);
      });
  }

  function removeCollege(slot: number) {
    const newColleges = [...colleges];
    newColleges[slot] = null;
    setColleges(newColleges);
    const slugs = newColleges.filter(Boolean).map((c) => c!.slug);
    router.replace(slugs.length ? `/compare?colleges=${slugs.join(",")}` : "/compare", { scroll: false });
  }

  function handleAddButton() {
    if (!searchQ.trim() || loading) return;
    const slot = addingSlot !== null ? addingSlot : colleges.findIndex((c) => !c);
    if (slot === -1) return;
    if (suggestions.length > 0) {
      addCollege(suggestions[0].slug, slot);
    } else {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQ.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          const first = (d.suggestions ?? []).find((s: Suggestion) => s.type === "college");
          if (first) addCollege(first.slug, slot);
          else setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }

  const filledCount = colleges.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f6_0%,#f8fafc_26%,#f8fafc_100%)] font-display">
      <Header theme="dark" />

      <main className="pb-20 pt-20 lg:pt-[116px]">
        <section className="relative z-30 w-full overflow-visible px-6 py-12 sm:px-12 lg:px-24 lg:py-16">
          <div className="absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(255,243,242,0.86)_48%,_rgba(248,250,252,0)_100%)]" />
          <div className="relative mx-auto max-w-[1920px]">
            <div className="overflow-hidden rounded-[28px] border border-rose-100/80 bg-white/85 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.28)] backdrop-blur">
              <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-12">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">
                    <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                    College Compare
                  </div>
                  <h1 className="mb-4 mt-5 text-[38px] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-[48px]">
                    Compare colleges side by side with clarity
                  </h1>
                  <p className="mb-8 max-w-2xl text-[16px] font-medium leading-8 text-slate-600 sm:text-[18px]">
                    Evaluate institutions across fees, rankings, ratings, placements, and
                    course depth so you can spot the best fit faster.
                  </p>

                  <div
                    ref={searchRef}
                    className="relative flex max-w-2xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(244,63,94,0.28)] sm:flex-row"
                  >
                    <div className="flex flex-1 items-center gap-3 px-5 py-4 transition-all duration-300 focus-within:bg-rose-50/30">
                      <span className="material-symbols-outlined text-[24px] text-[#FF3C3C]">school</span>
                      <input
                        ref={inputRef}
                        value={searchQ}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchQ(value);
                          if (value.length < 2) setSuggestions([]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddButton();
                        }}
                        placeholder="Search universities, colleges..."
                        className="flex-1 bg-transparent text-[16px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddButton}
                      disabled={loading}
                      className="flex min-w-[150px] items-center justify-center gap-2 whitespace-nowrap bg-[#FF3C3C] px-8 py-4 text-[16px] font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      {loading ? "Adding..." : "Add College"}
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
                          className="compare-suggestions-dropdown overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-2xl"
                        >
                          <div className="py-1">
                            {suggestions.map((s) => (
                              <button
                                key={s.slug}
                                onClick={() => {
                                  const slot =
                                    addingSlot !== null
                                      ? addingSlot
                                      : colleges.findIndex((c) => !c);
                                  if (slot !== -1) addCollege(s.slug, slot);
                                }}
                                className="group flex w-full items-center gap-4 border-b border-slate-50 px-5 py-4 text-left transition-colors last:border-0 hover:bg-rose-50"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-white">
                                  <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
                                    school
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-1 text-[15px] font-bold text-slate-800">
                                    {s.name}
                                  </p>
                                  <p className="flex items-center gap-1 text-[12px] font-medium text-slate-500">
                                    <span className="material-symbols-outlined text-[14px]">
                                      location_on
                                    </span>
                                    {s.location}
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

                <div className="grid content-start items-start gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    { value: "3", label: "Colleges at once", icon: "view_week" },
                    { value: "9+", label: "Key metrics", icon: "analytics" },
                    { value: "Fast", label: "Decision making", icon: "bolt" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="self-start rounded-[22px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#fff8f7)] px-5 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <p className="mt-3 text-[24px] font-black leading-none text-slate-900">{item.value}</p>
                      <p className="mt-1 text-[12px] leading-5 font-medium text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-40 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_-52px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 bg-[linear-gradient(90deg,#fff8f7,#ffffff)] px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500">
                    Side By Side Comparison
                  </p>
                  <h2 className="mt-1 text-[24px] font-black text-slate-900">
                    Compare metrics that matter
                  </h2>
                </div>
                <p className="max-w-xl text-[13px] leading-6 text-slate-500">
                  Add up to three colleges and review rankings, fees, ratings,
                  placements, and course breadth in one clean table.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 w-[260px] border-b border-r border-slate-200 bg-[#fff8f7] px-8 py-8 text-left align-middle">
                      <h2 className="text-[28px] font-black leading-[1.1] text-slate-900">
                        Comparing
                        <br />
                        Metrics
                      </h2>
                    </th>

                    {colleges.map((college, i) => (
                      <th
                        key={i}
                        className="group relative min-w-[320px] border-b border-r border-slate-200 bg-white px-8 py-8 align-top last:border-r-0"
                      >
                        {college ? (
                          <div className="flex h-full flex-col">
                            <button
                              onClick={() => removeCollege(i)}
                              className="absolute right-0 top-0 z-20 flex h-9 w-10 items-center justify-center rounded-bl-xl bg-rose-200 text-white transition-colors hover:bg-red-500"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            <div className="mb-8 flex items-center gap-4 pt-2">
                              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
                                {college.image ? (
                                  <img
                                    src={college.image}
                                    alt={college.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/10 text-xl font-black text-primary">
                                    {college.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <p className="mb-1 truncate text-[18px] font-bold leading-tight text-slate-900">
                                  {college.name}
                                </p>
                                <p className="flex items-center gap-1 text-[14px] font-semibold text-slate-500">
                                  <span className="material-symbols-outlined text-[15px]">
                                    location_on
                                  </span>
                                  {college.location}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/college/${college.slug}`}
                              className="mt-auto w-full rounded-2xl bg-slate-900 py-3.5 text-center text-[15px] font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-black"
                            >
                              Apply
                            </Link>
                          </div>
                        ) : addingSlot === i ? (
                          <div className="relative flex min-h-[160px] w-full flex-col justify-center p-4">
                            <div className="relative mb-2">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                                search
                              </span>
                              <input
                                autoFocus
                                value={inlineSearchQ}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setInlineSearchQ(value);
                                  if (value.length < 2) setInlineSuggestions([]);
                                }}
                                placeholder="Search college..."
                                className="w-full rounded-2xl border border-[#FF3C3C] py-3 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-red-100"
                              />
                              <button
                                onClick={() => {
                                  setAddingSlot(null);
                                  setInlineSearchQ("");
                                  setInlineSuggestions([]);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  close
                                </span>
                              </button>
                            </div>
                            {inlineSuggestions.length > 0 && (
                              <div className="inline-suggestions-dropdown absolute left-4 right-4 top-[72px] z-50 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-xl">
                                {inlineSuggestions.map((s) => (
                                  <button
                                    key={s.slug}
                                    onClick={() => {
                                      addCollege(s.slug, i);
                                      setInlineSearchQ("");
                                      setInlineSuggestions([]);
                                    }}
                                    className="w-full border-b border-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors last:border-0 hover:bg-red-50"
                                  >
                                    <p className="truncate font-semibold text-slate-800">{s.name}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{s.location}</p>
                                  </button>
                                ))}
                              </div>
                            )}
                            {inlineSearchQ.length >= 2 && inlineSuggestions.length === 0 && (
                              <p className="mt-2 text-center text-xs text-slate-400">No results found</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-full min-h-[160px] items-center justify-center pt-2">
                            <button
                              onClick={() => {
                                setAddingSlot(i);
                                setInlineSearchQ("");
                                setInlineSuggestions([]);
                              }}
                              className="group flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-slate-300 transition-all hover:border-[#FF3C3C] hover:bg-[#FF3C3C]/5"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-white group-hover:text-[#FF3C3C]">
                                <span className="material-symbols-outlined text-[24px]">add</span>
                              </div>
                              <span className="text-[15px] font-bold text-slate-400 transition-colors group-hover:text-[#FF3C3C]">
                                Add College
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
                    <tr key={metric.key} className="transition-colors hover:bg-rose-50/30">
                      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-8 py-7">
                        <span className="text-[17px] font-bold text-slate-800">{metric.label}</span>
                      </td>
                      {colleges.map((college, ci) => (
                        <td
                          key={ci}
                          className="border-b border-r border-slate-200 px-8 py-7 last:border-r-0"
                        >
                          {college ? (
                            loading ? (
                              <div className="space-y-2">
                                <div className="h-5 w-24 animate-pulse rounded-[5px] bg-slate-100" />
                                <div className="h-3 w-16 animate-pulse rounded-[5px] bg-slate-100/50" />
                              </div>
                            ) : (
                              metric.render(college)
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
              <div className="bg-[linear-gradient(180deg,#fffdfd,#fff7f6)] py-24 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                  <span className="material-symbols-outlined text-[40px] text-rose-200">
                    compare
                  </span>
                </div>
                <h3 className="mb-2 text-[22px] font-black text-slate-900">
                  No colleges selected
                </h3>
                <p className="mx-auto max-w-sm px-6 font-medium leading-7 text-slate-500">
                  Search and add colleges above to unlock a cleaner side-by-side
                  comparison experience.
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

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ComparePageInner />
    </Suspense>
  );
}
