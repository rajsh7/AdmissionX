"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import ExploreCards from "../components/ExploreCards";

const RED = "#E52E2E";
const HERO_ROBOT_SRC = "/images/7681ab140442439cf23bd300b6bf7c232d289a45.png";
const HERO_BG = encodeURI(
  "/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55 (1).png",
);
const STEPS = [
  { title: "Welcome", subtitle: "Quick intro" },
  { title: "Interest & Goals", subtitle: "What excites you" },
  { title: "Academic level", subtitle: "Where you are now" },
  { title: "Location", subtitle: "Where you'd like to study" },
  { title: "Budget", subtitle: "Fee comfort zone" },
  { title: "Review", subtitle: "Almost there" },
] as const;

const FIELD_OPTIONS = [
  {
    id: "cs",
    label: "Computer Science & IT",
    iconIdle: "bar_chart",
    iconActive: "code",
  },
  {
    id: "eng",
    label: "Engineering & Tech",
    iconIdle: "precision_manufacturing",
    iconActive: "engineering",
  },
  {
    id: "med",
    label: "Medicine & Health",
    iconIdle: "monitor_heart",
    iconActive: "medical_services",
  },
  {
    id: "bus",
    label: "Business & Management",
    iconIdle: "show_chart",
    iconActive: "business_center",
  },
  {
    id: "law",
    label: "Law & Policy",
    iconIdle: "balance",
    iconActive: "gavel",
  },
  {
    id: "art",
    label: "Design & Creative Arts",
    iconIdle: "palette",
    iconActive: "brush",
  },
] as const;

const ACADEMIC_OPTIONS = ["High school / 12th", "Undergraduate", "Working professional", "Other"] as const;
const LOCATION_OPTIONS = ["India", "USA", "UK", "Canada", "Europe", "Open to anywhere"] as const;
const BUDGET_OPTIONS = ["Under ₹2L", "₹2L – ₹5L", "₹5L – ₹15L", "₹15L+"] as const;

type Match = {
  name: string;
  location: string;
  tag: string;
  fees: string;
  package: string;
  rating: string;
  reviews: string;
  image: string;
  blurb: string;
  fields: string[];
  levels: string[];
  regions: string[];
  budget: (typeof BUDGET_OPTIONS)[number];
};

const MATCH_CATALOG: Match[] = [
  {
    name: "IIT Delhi",
    location: "New Delhi, India",
    tag: "Engineering & Tech",
    fees: "₹2.2L/yr",
    package: "₹25L",
    rating: "4.7",
    reviews: "8.4k Reviews",
    image: "https://images.unsplash.com/photo-1562774053-701939374585",
    blurb: "Top-tier engineering ecosystem with strong placements, startup support, and advanced labs.",
    fields: ["eng", "cs"],
    levels: ["High school / 12th", "Undergraduate"],
    regions: ["India"],
    budget: "₹2L – ₹5L",
  },
  {
    name: "AIIMS Delhi",
    location: "Delhi, India",
    tag: "Medicine & Health",
    fees: "₹1.7L/yr",
    package: "₹18L",
    rating: "4.8",
    reviews: "6.2k Reviews",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
    blurb: "Excellent clinical training, research opportunities, and strong healthcare outcomes.",
    fields: ["med"],
    levels: ["High school / 12th", "Undergraduate"],
    regions: ["India"],
    budget: "Under ₹2L",
  },
  {
    name: "IIM Ahmedabad",
    location: "Ahmedabad, India",
    tag: "Business & Management",
    fees: "₹9L/yr",
    package: "₹34L",
    rating: "4.8",
    reviews: "9.1k Reviews",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    blurb: "Premier management institute known for leadership training and high-impact alumni network.",
    fields: ["bus"],
    levels: ["Undergraduate", "Working professional"],
    regions: ["India"],
    budget: "₹5L – ₹15L",
  },
  {
    name: "NLSIU Bengaluru",
    location: "Bengaluru, India",
    tag: "Law & Policy",
    fees: "₹4.8L/yr",
    package: "₹16L",
    rating: "4.6",
    reviews: "3.9k Reviews",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    blurb: "Strong legal curriculum with policy exposure and excellent internship pipelines.",
    fields: ["law"],
    levels: ["High school / 12th", "Undergraduate"],
    regions: ["India"],
    budget: "₹2L – ₹5L",
  },
  {
    name: "Stanford University",
    location: "California, USA",
    tag: "Computer Science & IT",
    fees: "₹45L/yr",
    package: "$120k",
    rating: "4.8",
    reviews: "12k Reviews",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    blurb: "Strong research culture and industry ties, ideal for innovation-focused CS learners.",
    fields: ["cs", "eng"],
    levels: ["Undergraduate", "Working professional"],
    regions: ["USA", "Open to anywhere"],
    budget: "₹15L+",
  },
  {
    name: "University of Toronto",
    location: "Toronto, Canada",
    tag: "Design & Creative Arts",
    fees: "₹22L/yr",
    package: "CA$80k",
    rating: "4.6",
    reviews: "7.1k Reviews",
    image: "https://images.unsplash.com/photo-1562774053-701939374585",
    blurb: "Creative programs with practical studios and strong international student support.",
    fields: ["art", "bus"],
    levels: ["High school / 12th", "Undergraduate"],
    regions: ["Canada", "Open to anywhere"],
    budget: "₹15L+",
  },
  {
    name: "University of Oxford",
    location: "Oxford, UK",
    tag: "Law & Policy",
    fees: "₹31L/yr",
    package: "£70k",
    rating: "4.9",
    reviews: "10k Reviews",
    image: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2",
    blurb: "Rigorous academics and global legal-policy reputation with rich tutorial support.",
    fields: ["law", "art"],
    levels: ["Undergraduate", "Working professional"],
    regions: ["UK", "Europe", "Open to anywhere"],
    budget: "₹15L+",
  },
];

export default function CounsellingPageClient() {
  const [step, setStep] = useState(1);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(() => new Set());
  const [academicLevel, setAcademicLevel] = useState<(typeof ACADEMIC_OPTIONS)[number] | "">("");
  const [preferredLocations, setPreferredLocations] = useState<Set<string>>(() => new Set());
  const [budgetRange, setBudgetRange] = useState<(typeof BUDGET_OPTIONS)[number] | "">("");

  const toggleField = useCallback((id: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }, []);

  const scrollToWizard = () => {
    document.getElementById("counselling-wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStep(1);
  };

  const toggleLocation = useCallback((loc: string) => {
    setPreferredLocations((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  }, []);

  const canNext = useMemo(() => {
    if (step === 2) return selectedFields.size >= 1;
    if (step === 3) return Boolean(academicLevel);
    if (step === 4) return preferredLocations.size >= 1;
    if (step === 5) return Boolean(budgetRange);
    return true;
  }, [step, selectedFields.size, academicLevel, preferredLocations.size, budgetRange]);

  const selectedFieldLabels = useMemo(
    () =>
      FIELD_OPTIONS.filter((f) => selectedFields.has(f.id)).map((f) => f.label),
    [selectedFields],
  );

  const hasPersonalizedAnswers = Boolean(
    selectedFields.size || academicLevel || preferredLocations.size || budgetRange,
  );

  const personalizedMatches = useMemo(() => {
    if (!hasPersonalizedAnswers) {
      return MATCH_CATALOG.slice(0, 4);
    }

    const exactMatches = MATCH_CATALOG.filter((match) => {
      if (selectedFields.size > 0 && !match.fields.some((field) => selectedFields.has(field))) {
        return false;
      }

      if (academicLevel && !match.levels.includes(academicLevel)) {
        return false;
      }

      if (preferredLocations.size > 0 && ![...preferredLocations].some((location) => match.regions.includes(location))) {
        return false;
      }

      if (budgetRange && match.budget !== budgetRange) {
        return false;
      }

      return true;
    })
      .sort((a, b) => {
        const aFieldOverlap = a.fields.filter((field) => selectedFields.has(field)).length;
        const bFieldOverlap = b.fields.filter((field) => selectedFields.has(field)).length;
        if (bFieldOverlap !== aFieldOverlap) return bFieldOverlap - aFieldOverlap;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });

    return exactMatches.slice(0, 8);
  }, [selectedFields, academicLevel, preferredLocations, budgetRange, hasPersonalizedAnswers]);

  const progressFill = Math.min(step, 6);

  return (
    <>
      {/* Hero — single section: background + copy + image */}
      <section className="mt-8 sm:mt-10 lg:mt-12 mb-8 sm:mb-10 lg:mb-12 w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
        <div
          className="relative flex flex-col lg:flex-row items-center px-6 sm:px-8 lg:px-12 xl:px-14 rounded-[5px] bg-neutral-100 bg-cover bg-center bg-no-repeat shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] shadow-neutral-900/10 overflow-hidden"
          style={{ backgroundImage: `url("${HERO_BG}")`, minHeight: "400px" }}
        >
          {/* Text Content */}
          <div className="relative z-10 flex-1 w-full text-center lg:text-left py-10 lg:py-0">
            <h1
              className="font-semibold leading-[1.1] tracking-tight [text-shadow:0_1px_2px_rgba(255,255,255,0.85)] mb-4 max-w-[850px]"
              style={{ fontSize: "40px", color: "#3E3E3E" }}
            >
              Find the Right Course &amp; college in 60 Seconds
            </h1>
            <p
              className="font-medium leading-relaxed mx-auto lg:mx-0 mb-8 max-w-[850px]"
              style={{ fontSize: "20px", color: "#3E3E3EB5" }}
            >
              Our AI-powered matcher learns your interests and goals, then suggests courses <br className="hidden lg:block" /> and colleges that fit — so you spend less time searching and more <br className="hidden lg:block" /> time planning your future.
            </p>
            <div className="flex justify-center lg:justify-start pt-1">
              <button
                type="button"
                onClick={scrollToWizard}
                className="inline-flex items-center gap-2 text-white font-semibold text-sm sm:text-base px-8 py-3.5 rounded-[5px] shadow-md hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#D40C11" }}
              >
                Start your journey
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Robot Mascot */}
          <div className="absolute right-8 sm:right-16 lg:right-24 top-1/2 -translate-y-1/2 w-[300px] sm:w-[340px] lg:w-[380px] aspect-square pointer-events-none select-none">
            <Image
              src={HERO_ROBOT_SRC}
              alt="Friendly AI counselling assistant"
              width={400}
              height={400}
              className="object-contain object-center w-full h-full drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section id="counselling-wizard" className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 pb-6 scroll-mt-24">
        <div className="w-full max-w-none mx-auto bg-white rounded-[5px] border border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 sm:px-8 lg:px-12 xl:px-14 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-wrap items-start justify-between gap-2 text-xs sm:text-sm text-neutral-500 mb-3">
            <span>
              Step {step} of {STEPS.length}
            </span>
            <span className="font-medium text-neutral-600">{STEPS[step - 1]?.title}</span>
          </div>
          <div className="flex gap-0.5 h-1.5 rounded-[5px] overflow-hidden bg-neutral-200 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="flex-1 min-w-0 rounded-[2px] transition-colors duration-300"
                style={{ backgroundColor: i < progressFill ? RED : undefined }}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 max-w-4xl">
              <h2
                className="font-medium mb-2"
                style={{ fontSize: "32px", color: "#3E3E3E" }}
              >
                Let&apos;s personalize your journey
              </h2>
              <p
                className="font-medium leading-relaxed"
                style={{ fontSize: "20px", color: "#3E3E3E80" }}
              >
                Answer a few quick questions. It takes about a minute, and we&apos;ll use your answers to surface
                colleges and courses that fit you.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="font-medium mb-1"
                  style={{ fontSize: "32px", color: "#3E3E3E" }}
                >
                  What fields are you most interested in?
                </h2>
                <p
                  className="font-medium"
                  style={{ fontSize: "20px", color: "#3E3E3E80" }}
                >
                  Select up to 3 options to help us narrow down your perfect fit.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {FIELD_OPTIONS.map((f) => {
                  const on = selectedFields.has(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleField(f.id)}
                      className={[
                        "relative text-left rounded-[5px] border-2 p-4 sm:p-5 transition-all duration-200",
                        on
                          ? "bg-rose-50 border-[#E52E2E] shadow-sm"
                          : "bg-[#F3F4F6] border-transparent hover:border-neutral-300",
                      ].join(" ")}
                    >
                      {on && (
                        <span
                          className="absolute top-3 right-3 w-6 h-6 rounded-[5px] flex items-center justify-center text-white text-[14px] material-symbols-outlined"
                          style={{ backgroundColor: RED, fontVariationSettings: "'FILL' 1" }}
                          aria-hidden
                        >
                          check
                        </span>
                      )}
                      <span
                        className={[
                          "material-symbols-outlined text-[28px] mb-3 block",
                          on ? "text-[#E52E2E]" : "text-neutral-500",
                        ].join(" ")}
                        style={{ fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0" }}
                        aria-hidden
                      >
                        {on ? f.iconActive : f.iconIdle}
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 leading-snug">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-4xl">
              <h2
                className="font-medium"
                style={{ fontSize: "32px", color: "#3E3E3E" }}
              >
                What&apos;s your current academic level?
              </h2>
              <p
                className="font-medium"
                style={{ fontSize: "20px", color: "#3E3E3E80" }}
              >
                This helps us recommend realistic entry paths.
              </p>
              <ul className="space-y-2 text-sm text-neutral-700">
                {ACADEMIC_OPTIONS.map((o) => (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => setAcademicLevel(o)}
                      className={`w-full text-left flex items-center gap-2 rounded-[5px] border px-4 py-3 transition-colors ${academicLevel === o
                        ? "border-[#E52E2E] bg-rose-50 text-[#991b1b]"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {academicLevel === o ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 max-w-4xl">
              <h2
                className="font-medium"
                style={{ fontSize: "32px", color: "#3E3E3E" }}
              >
                Preferred study locations
              </h2>
              <p
                className="font-medium"
                style={{ fontSize: "24px", color: "#3E3E3E80" }}
              >
                You can refine this later — pick what feels right today.
              </p>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => toggleLocation(x)}
                    className={`text-xs font-medium px-3 py-2 rounded-[5px] border transition-colors ${preferredLocations.has(x)
                      ? "bg-rose-50 text-[#991b1b] border-[#E52E2E]"
                      : "bg-neutral-100 text-neutral-700 border-neutral-200 hover:border-neutral-300"
                      }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 max-w-4xl">
              <h2
                className="font-medium"
                style={{ fontSize: "36px", color: "#3E3E3E" }}
              >
                Annual fee comfort zone
              </h2>
              <p
                className="font-medium"
                style={{ fontSize: "24px", color: "#3E3E3E80" }}
              >
                Rough range is fine; we use it to filter suggestions.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudgetRange(b)}
                    className={`rounded-[5px] border px-4 py-3 font-medium text-center transition-colors ${budgetRange === b
                      ? "border-[#E52E2E] bg-rose-50 text-[#991b1b]"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                      }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">You&apos;re all set</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Explore your top matches below, or use &quot;Get started&quot; to create a free account and save your results.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                <div className="rounded-[5px] border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="font-semibold text-neutral-800">Interests:</span> {selectedFieldLabels.join(", ") || "None"}
                </div>
                <div className="rounded-[5px] border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="font-semibold text-neutral-800">Academic:</span> {academicLevel || "Not selected"}
                </div>
                <div className="rounded-[5px] border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="font-semibold text-neutral-800">Locations:</span> {[...preferredLocations].join(", ")}
                </div>
                <div className="rounded-[5px] border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="font-semibold text-neutral-800">Budget:</span> {budgetRange || "Not selected"}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-2 border-t border-neutral-100">
            <button
              type="button"
              disabled={step <= 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            {step < STEPS.length ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-[5px] disabled:opacity-40 disabled:pointer-events-none"
                style={{ backgroundColor: RED }}
              >
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <Link
                href="/signup/student"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-[5px]"
                style={{ backgroundColor: RED }}
              >
                Get started
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Top matches */}
      <section className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 pb-16">
        <div className="w-full max-w-none mx-auto px-6 sm:px-8 lg:px-12 xl:px-14">
          <div className="mb-6">
            <h2
              className="font-semibold"
              style={{ fontSize: "32px", color: "#3E3E3E" }}
            >
              Your Top Matches
            </h2>
            <p
              className="font-normal mt-1"
              style={{ fontSize: "20px", color: "#3E3E3E80" }}
            >
              {!hasPersonalizedAnswers
                ? "Start selecting your preferences to see personalized matches."
                : personalizedMatches.length === 0
                  ? "No exact matches found for the answers selected so far. Try adjusting a choice to see relevant recommendations."
                  : "Showing matches that fit the personalized answers you selected so far."}
            </p>
          </div>
          {personalizedMatches.length === 0 && hasPersonalizedAnswers ? (
            <div className="rounded-[5px] border border-dashed border-neutral-300 bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <span className="material-symbols-outlined text-[28px]">search_off</span>
              </div>
              <h3 className="text-base font-bold text-neutral-800">No exact match yet</h3>
              <p className="mt-2 text-sm text-neutral-500">
                The current answer combination is very specific. Try changing one of your selected fields, location, or budget range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {personalizedMatches.map((m, idx) => (
                <article
                  key={`${m.name}-${idx}`}
                  className="bg-white rounded-[5px] border border-neutral-200 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={m.image} alt={m.name} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                    <div
                      className="absolute top-3 right-0 flex items-center gap-1 rounded-l-[5px] px-2.5 py-1 bg-white shadow-md z-10"
                    >
                      <span className="material-symbols-rounded text-[16px] text-[#FF3C3C]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-semibold" style={{ fontSize: "13px", color: "#3E3E3E" }}>
                        {m.rating} <span className="font-medium ml-1"></span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-1">
                    <h3 className="text-[22px] font-semibold text-[#6C6C6C] mb-0.5 leading-tight">{m.name}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-[14px] text-neutral-400">location_on</span>
                      {m.location}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-[5px] px-2.5 py-1 whitespace-nowrap">
                        {m.tag}
                      </span>
                      <div className="flex flex-col text-right leading-tight">
                        <span className="text-[10px] text-neutral-400">Avg. Fees</span>
                        <span className="text-xs font-bold text-neutral-600">{m.fees}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      <p className="text-[11px] font-medium text-neutral-500 mb-1.5">Why it fits you</p>
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">{m.blurb}</p>
                    </div>

                    <div className="mt-auto border-t border-neutral-100 pt-3.5 flex items-center justify-between">
                      <p className="text-[15px] font-medium text-neutral-600">
                        Avg. Package: <span className="font-bold text-[#FF3C3C]">{m.package}</span>
                      </p>
                      <Link href="/top-colleges" className="text-[15px] font-semibold text-[#FF3C3C] inline-flex items-center gap-1">
                        View Details
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore Cards */}
      <ExploreCards />
    </>
  );
}
