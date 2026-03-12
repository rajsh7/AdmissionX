"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DbExam } from "../api/home/exams/route";

// ── Display shape ─────────────────────────────────────────────────────────────

interface Exam {
  abbr: string;
  name: string;
  fullName: string;
  date: string;
  dateLabel: string;
  mode: string;
  modeIcon: string;
  level: string;
  color: string;
  colorBg: string;
  colorLight: string;
  colorBorder: string;
  icon: string;
  href: string;
}

interface EntranceExamsProps {
  dbExams?: DbExam[];
}

// ── Colour + icon palettes (cycle by index) ───────────────────────────────────

const PALETTES = [
  {
    color: "text-blue-600",
    colorBg: "bg-blue-600",
    colorLight: "bg-blue-50",
    colorBorder: "border-l-blue-500",
  },
  {
    color: "text-rose-600",
    colorBg: "bg-rose-600",
    colorLight: "bg-rose-50",
    colorBorder: "border-l-rose-500",
  },
  {
    color: "text-orange-600",
    colorBg: "bg-orange-600",
    colorLight: "bg-orange-50",
    colorBorder: "border-l-orange-500",
  },
  {
    color: "text-purple-600",
    colorBg: "bg-purple-600",
    colorLight: "bg-purple-50",
    colorBorder: "border-l-purple-500",
  },
  {
    color: "text-teal-600",
    colorBg: "bg-teal-600",
    colorLight: "bg-teal-50",
    colorBorder: "border-l-teal-500",
  },
  {
    color: "text-amber-600",
    colorBg: "bg-amber-600",
    colorLight: "bg-amber-50",
    colorBorder: "border-l-amber-500",
  },
] as const;

// Match common exam abbreviations to Material Symbols icons
const ABBR_ICONS: Record<string, string> = {
  JEE: "calculate",
  NEET: "biotech",
  CAT: "trending_up",
  MAT: "trending_up",
  XAT: "trending_up",
  GMAT: "analytics",
  GRE: "psychology",
  SAT: "edit_note",
  GATE: "memory",
  CLAT: "gavel",
  LSAT: "gavel",
  CUET: "school",
};

function extractAbbr(title: string): string {
  // Grab the first ALL-CAPS token (2-6 letters), e.g. "JEE" from "JEE Main 2026"
  const m = title.match(/\b([A-Z]{2,6})\b/);
  return m ? m[1] : title.slice(0, 3).toUpperCase();
}

function formatExamDate(raw: string | null): {
  date: string;
  dateLabel: string;
} {
  if (!raw) return { date: "TBA", dateLabel: "Date TBD" };
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { date: raw.slice(0, 10), dateLabel: "" };
    const month = d.toLocaleString("en-IN", { month: "short" });
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear().toString();
    return { date: `${month} ${day}`, dateLabel: year };
  } catch {
    return { date: "TBA", dateLabel: "" };
  }
}

function mapDbExamToExam(raw: DbExam, index: number): Exam {
  const abbr = extractAbbr(raw.title ?? "");
  const pal = PALETTES[index % PALETTES.length];
  const { date, dateLabel } = formatExamDate(raw.exminationDate);

  return {
    abbr,
    name: raw.title ?? "Entrance Exam",
    fullName: raw.title ?? "",
    date,
    dateLabel,
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Undergraduate",
    ...pal,
    icon: ABBR_ICONS[abbr] ?? "quiz",
    href: `/examination/details/${raw.slug ?? raw.id}`,
  };
}

// ── Static fallback exams (shown when DB is empty) ────────────────────────────

const STATIC_EXAMS: Exam[] = [
  {
    abbr: "JEE",
    name: "JEE Main 2026",
    fullName: "Joint Entrance Examination",
    date: "Jan 24",
    dateLabel: "2026",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Undergraduate",
    color: "text-blue-600",
    colorBg: "bg-blue-600",
    colorLight: "bg-blue-50",
    colorBorder: "border-l-blue-500",
    icon: "calculate",
    href: "/examination/engineering/jee-main",
  },
  {
    abbr: "NEET",
    name: "NEET UG 2026",
    fullName: "National Eligibility cum Entrance Test",
    date: "May 04",
    dateLabel: "2026",
    mode: "Pen & Paper",
    modeIcon: "draw",
    level: "Undergraduate",
    color: "text-rose-600",
    colorBg: "bg-rose-600",
    colorLight: "bg-rose-50",
    colorBorder: "border-l-rose-500",
    icon: "biotech",
    href: "/examination/medical/neet-ug",
  },
  {
    abbr: "CAT",
    name: "CAT 2026",
    fullName: "Common Admission Test",
    date: "Nov 24",
    dateLabel: "2026",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Postgraduate",
    color: "text-orange-600",
    colorBg: "bg-orange-600",
    colorLight: "bg-orange-50",
    colorBorder: "border-l-orange-500",
    icon: "trending_up",
    href: "/examination/management/cat",
  },
  {
    abbr: "GATE",
    name: "GATE 2026",
    fullName: "Graduate Aptitude Test in Engineering",
    date: "Feb 01",
    dateLabel: "2026",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Postgraduate",
    color: "text-purple-600",
    colorBg: "bg-purple-600",
    colorLight: "bg-purple-50",
    colorBorder: "border-l-purple-500",
    icon: "memory",
    href: "/examination/engineering/gate",
  },
  {
    abbr: "CUET",
    name: "CUET UG 2026",
    fullName: "Common University Entrance Test",
    date: "May 15",
    dateLabel: "2026",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Undergraduate",
    color: "text-teal-600",
    colorBg: "bg-teal-600",
    colorLight: "bg-teal-50",
    colorBorder: "border-l-teal-500",
    icon: "school",
    href: "/examination/arts/cuet",
  },
  {
    abbr: "CLAT",
    name: "CLAT 2026",
    fullName: "Common Law Admission Test",
    date: "Dec 01",
    dateLabel: "2026",
    mode: "Pen & Paper",
    modeIcon: "draw",
    level: "Undergraduate",
    color: "text-amber-600",
    colorBg: "bg-amber-600",
    colorLight: "bg-amber-50",
    colorBorder: "border-l-amber-500",
    icon: "gavel",
    href: "/examination/law/clat",
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function EntranceExams({ dbExams }: EntranceExamsProps) {
  const exams: Exam[] =
    dbExams && dbExams.length > 0
      ? dbExams.map((e, i) => mapDbExamToExam(e, i))
      : STATIC_EXAMS;

  return (
    <section className="relative w-full py-20 lg:py-28 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── Chapter Heading ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14 lg:mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
              05
            </span>
            <div className="h-px w-8 bg-red-500/30" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              Prepare
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
            Your Gateway Awaits
          </h2>
          <p className="mt-4 text-lg text-neutral-500 font-light max-w-xl leading-relaxed">
            Every champion prepares. Master the exams that unlock doors to your
            dream institutions.
          </p>
        </motion.div>

        {/* ─── Exam Cards Grid ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {exams.map((exam, index) => (
            <motion.div key={`${exam.abbr}-${index}`} variants={cardVariants}>
              <Link
                href={exam.href}
                className={`group relative flex flex-col bg-white rounded-2xl border border-neutral-100 ${exam.colorBorder} border-l-4 hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-500 overflow-hidden h-[260px]`}
              >
                {/* Watermark Abbreviation */}
                <span
                  className="absolute -right-3 -top-2 text-[120px] font-black leading-none text-neutral-900/[0.03] select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {exam.abbr}
                </span>

                {/* ── Card Content ── */}
                <div className="relative z-10 flex flex-col h-full p-6">
                  {/* Row 1: Icon + Level + Mode */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-xl ${exam.colorLight} ${exam.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {exam.icon}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${exam.color}`}
                        >
                          {exam.abbr}
                        </span>
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {exam.level}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-neutral-50 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">
                        {exam.modeIcon}
                      </span>
                      {exam.mode}
                    </span>
                  </div>

                  {/* Row 2: Name + Full Name */}
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-red-600 transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {exam.fullName}
                  </p>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Row 3: Date + Apply CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-lg ${exam.colorLight} flex items-center justify-center flex-shrink-0`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${exam.color}`}
                        >
                          calendar_month
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-900">
                          {exam.date}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {exam.dateLabel}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-bold ${exam.color} group-hover:gap-2.5 transition-all`}
                    >
                      Apply Now
                      <span className="material-symbols-outlined text-base">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── View All ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/examination"
            className="group inline-flex items-center gap-3 bg-neutral-900 text-white font-bold text-sm px-7 py-4 rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
          >
            View All Exams
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
