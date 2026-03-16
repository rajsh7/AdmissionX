"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const fields = [
  {
    label: "Engineering",
    tagline: "Build the Future",
    description:
      "From robotics to renewable energy, engineering shapes tomorrow. Dive into cutting-edge programs that turn ideas into reality.",
    count: 850,
    growth: "+12%",
    avgSalary: "$85K",
    icon: "engineering",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop",
    accent: "bg-blue-500",
    accentText: "text-blue-500",
    href: "/colleges?course=engineering",
  },
  {
    label: "Management",
    tagline: "Lead With Vision",
    description:
      "Master strategy, finance, and leadership. Business schools that forge the CEOs, founders, and game-changers of tomorrow.",
    count: 620,
    growth: "+9%",
    avgSalary: "$92K",
    icon: "analytics",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop",
    accent: "bg-orange-500",
    accentText: "text-orange-500",
    href: "/colleges?course=management",
  },
  {
    label: "Medical",
    tagline: "Heal the World",
    description:
      "The noblest calling. Join world-class medical programs and learn from the best to save lives and advance healthcare.",
    count: 340,
    growth: "+7%",
    avgSalary: "$110K",
    icon: "stethoscope",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop",
    accent: "bg-teal-500",
    accentText: "text-teal-500",
    href: "/colleges?course=medicine",
  },
  {
    label: "Law",
    tagline: "Defend What Matters",
    description:
      "Justice needs champions. Study at prestigious law schools that shape the minds behind landmark decisions.",
    count: 210,
    growth: "+5%",
    avgSalary: "$95K",
    icon: "gavel",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop",
    accent: "bg-purple-500",
    accentText: "text-purple-500",
    href: "/colleges?course=law",
  },
  {
    label: "Design",
    tagline: "Create the Beautiful",
    description:
      "Where art meets innovation. Explore design programs that teach you to shape experiences, products, and brands.",
    count: 180,
    growth: "+15%",
    avgSalary: "$78K",
    icon: "palette",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop",
    accent: "bg-rose-500",
    accentText: "text-rose-500",
    href: "/colleges?course=design",
  },
  {
    label: "Science",
    tagline: "Discover the Unknown",
    description:
      "Push the boundaries of knowledge. Research-driven programs that unlock the mysteries of the universe.",
    count: 450,
    growth: "+8%",
    avgSalary: "$82K",
    icon: "biotech",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop",
    accent: "bg-indigo-500",
    accentText: "text-indigo-500",
    href: "/colleges?course=science",
  },
  {
    label: "Commerce",
    tagline: "Master the Markets",
    description:
      "Numbers tell stories. Dive into finance, accounting, and economics at institutions that power the global economy.",
    count: 380,
    growth: "+6%",
    avgSalary: "$88K",
    icon: "account_balance",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop",
    accent: "bg-amber-500",
    accentText: "text-amber-500",
    href: "/colleges?course=commerce",
  },
  {
    label: "Arts",
    tagline: "Express Your Soul",
    description:
      "Art transforms society. Study at creative institutions that nurture talent and turn passion into a powerful voice.",
    count: 290,
    growth: "+10%",
    avgSalary: "$65K",
    icon: "brush",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop",
    accent: "bg-pink-500",
    accentText: "text-pink-500",
    href: "/colleges?course=arts",
  },
];

interface FieldsOfStudyProps {
  streamCounts?: Record<string, number>;
}

export default function FieldsOfStudy({
  streamCounts = {},
}: FieldsOfStudyProps) {
  const [active, setActive] = useState(0);
  const current = fields[active];

  // Resolve live college count: DB value takes priority, static fallback otherwise
  const getCount = (label: string, staticCount: number) =>
    streamCounts[label.toLowerCase()] ?? staticCount;

  return (
    <section
      id="explore"
      className="relative w-full py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── Chapter Heading ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
              01
            </span>
            <div className="h-px w-8 bg-red-500/30" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              Explore
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
            What Ignites Your Passion?
          </h2>
          <p className="mt-4 text-lg text-neutral-500 font-light max-w-xl leading-relaxed">
            Every dreamer needs a direction. Tap a field below and watch your
            future unfold.
          </p>
        </motion.div>

        {/* ─── Mobile: Horizontal pill selector ─── */}
        <div className="lg:hidden mb-8 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {fields.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  i === active
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {f.icon}
                </span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Desktop: Split-screen Explorer ─── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
          {/* ── Left: Showcase Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative w-full lg:w-[58%] rounded-3xl overflow-hidden min-h-[420px] lg:min-h-[520px]"
          >
            {/* Background Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.label}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image
                  src={current.image}
                  alt={current.label}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-[1]" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.label}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {/* Tagline pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 ${current.accent} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {current.icon}
                    </span>
                    {current.tagline}
                  </span>

                  {/* Field Name */}
                  <h3 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                    {current.label}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-white/70 font-light leading-relaxed max-w-lg mb-8">
                    {current.description}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 mb-8">
                    <div>
                      <div className="text-2xl font-black text-white">
                        {getCount(current.label, current.count)}+
                      </div>
                      <div className="text-xs text-white/50 font-medium">
                        Colleges
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/15" />
                    <div>
                      <div className="text-2xl font-black text-white">
                        {current.avgSalary}
                      </div>
                      <div className="text-xs text-white/50 font-medium">
                        Avg. Salary
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/15" />
                    <div>
                      <div className="text-2xl font-black text-green-400">
                        {current.growth}
                      </div>
                      <div className="text-xs text-white/50 font-medium">
                        Job Growth
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={current.href}
                    className="group inline-flex items-center gap-2 bg-white text-neutral-900 font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xl shadow-black/20"
                  >
                    Explore {current.label}
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Right: Field Selector List (Desktop) ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1] as const,
              delay: 0.15,
            }}
            className="hidden lg:flex w-full lg:w-[42%] flex-col"
          >
            {fields.map((field, i) => (
              <button
                key={field.label}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`group relative flex items-center gap-5 px-7 py-5 text-left transition-all duration-300 border-l-[3px] ${
                  i === active
                    ? "border-red-500 bg-red-50"
                    : "border-transparent hover:bg-neutral-50 hover:border-neutral-200"
                } ${i === 0 ? "rounded-tr-2xl" : ""} ${
                  i === fields.length - 1 ? "rounded-br-2xl" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                    i === active
                      ? `${field.accent} text-white shadow-lg`
                      : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {field.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-base font-bold transition-colors duration-300 ${
                        i === active ? "text-neutral-900" : "text-neutral-700"
                      }`}
                    >
                      {field.label}
                    </h4>
                    <span
                      className={`text-xs font-semibold transition-colors duration-300 ${
                        i === active ? "text-red-500" : "text-neutral-400"
                      }`}
                    >
                      {getCount(field.label, field.count)}+
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-0.5 truncate transition-colors duration-300 ${
                      i === active ? "text-neutral-600" : "text-neutral-400"
                    }`}
                  >
                    {field.tagline}
                  </p>
                </div>

                {/* Active indicator arrow */}
                <span
                  className={`material-symbols-outlined text-lg flex-shrink-0 transition-all duration-300 ${
                    i === active
                      ? "text-red-500 translate-x-0 opacity-100"
                      : "text-transparent -translate-x-2 opacity-0"
                  }`}
                >
                  arrow_forward
                </span>
              </button>
            ))}

            {/* View all link */}
            <div className="mt-auto pt-6 px-7">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
              >
                View all 25+ categories
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ─── Mobile: Showcase Panel (reuses active state) ─── */}
        <div className="lg:hidden">
          <div className="relative rounded-3xl overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-${current.label}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={current.image}
                  alt={current.label}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-[1]" />

            <div className="relative z-10 flex flex-col justify-end h-full p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-content-${current.label}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <span
                    className={`inline-flex items-center gap-1.5 ${current.accent} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {current.icon}
                    </span>
                    {current.tagline}
                  </span>

                  <h3 className="text-3xl font-black text-white mb-2">
                    {current.label}
                  </h3>
                  <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
                    {current.description}
                  </p>

                  <div className="flex items-center gap-5 mb-6">
                    <div>
                      <div className="text-xl font-black text-white">
                        {getCount(current.label, current.count)}+
                      </div>
                      <div className="text-[11px] text-white/50">Colleges</div>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div>
                      <div className="text-xl font-black text-white">
                        {current.avgSalary}
                      </div>
                      <div className="text-[11px] text-white/50">
                        Avg. Salary
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div>
                      <div className="text-xl font-black text-green-400">
                        {current.growth}
                      </div>
                      <div className="text-[11px] text-white/50">Growth</div>
                    </div>
                  </div>

                  <Link
                    href={current.href}
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold text-sm px-5 py-3 rounded-xl shadow-xl shadow-black/20"
                  >
                    Explore {current.label}
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-500"
            >
              View all categories
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
