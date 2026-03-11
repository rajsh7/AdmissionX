"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

const exams: Exam[] = [
  {
    abbr: "SAT",
    name: "SAT 2026",
    fullName: "Scholastic Assessment Test",
    date: "Oct 07",
    dateLabel: "2026",
    mode: "Online / Offline",
    modeIcon: "devices",
    level: "Undergraduate",
    color: "text-blue-600",
    colorBg: "bg-blue-600",
    colorLight: "bg-blue-50",
    colorBorder: "border-l-blue-500",
    icon: "edit_note",
    href: "/exams/sat",
  },
  {
    abbr: "GRE",
    name: "GRE General",
    fullName: "Graduate Record Examinations",
    date: "Year Round",
    dateLabel: "Flexible",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Postgraduate",
    color: "text-rose-600",
    colorBg: "bg-rose-600",
    colorLight: "bg-rose-50",
    colorBorder: "border-l-rose-500",
    icon: "psychology",
    href: "/exams/gre",
  },
  {
    abbr: "JEE",
    name: "JEE Main 2026",
    fullName: "Joint Entrance Examination",
    date: "Jan 24",
    dateLabel: "2026",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Undergraduate",
    color: "text-orange-600",
    colorBg: "bg-orange-600",
    colorLight: "bg-orange-50",
    colorBorder: "border-l-orange-500",
    icon: "calculate",
    href: "/exams/jee",
  },
  {
    abbr: "GMAT",
    name: "GMAT Focus",
    fullName: "Graduate Management Admission Test",
    date: "Year Round",
    dateLabel: "Flexible",
    mode: "Computer Based",
    modeIcon: "computer",
    level: "Postgraduate",
    color: "text-purple-600",
    colorBg: "bg-purple-600",
    colorLight: "bg-purple-50",
    colorBorder: "border-l-purple-500",
    icon: "analytics",
    href: "/exams/gmat",
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
    color: "text-teal-600",
    colorBg: "bg-teal-600",
    colorLight: "bg-teal-50",
    colorBorder: "border-l-teal-500",
    icon: "biotech",
    href: "/exams/neet",
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
    color: "text-amber-600",
    colorBg: "bg-amber-600",
    colorLight: "bg-amber-50",
    colorBorder: "border-l-amber-500",
    icon: "trending_up",
    href: "/exams/cat",
  },
];

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

export default function EntranceExams() {
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
            Every champion prepares. Master the exams that unlock doors to
            your dream institutions.
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
          {exams.map((exam) => (
            <motion.div key={exam.abbr} variants={cardVariants}>
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
                      <div className={`h-11 w-11 rounded-xl ${exam.colorLight} ${exam.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined text-xl">
                          {exam.icon}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${exam.color}`}>
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
                      <div className={`h-10 w-10 rounded-lg ${exam.colorLight} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined text-lg ${exam.color}`}>
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

                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${exam.color} group-hover:gap-2.5 transition-all`}>
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
            href="/exams"
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
