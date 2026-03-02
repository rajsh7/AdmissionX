"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ChapterHeading from "./ChapterHeading";

interface Exam {
  abbr: string;
  name: string;
  fullName: string;
  date: string;
  mode: string;
  gradient: string;
  icon: string;
  href: string;
}

const exams: Exam[] = [
  {
    abbr: "SAT",
    name: "SAT 2026",
    fullName: "Scholastic Assessment Test",
    date: "Oct 07, 2026",
    mode: "Online / Offline",
    gradient: "from-indigo-500 to-blue-600",
    icon: "edit_note",
    href: "/exams/sat",
  },
  {
    abbr: "GRE",
    name: "GRE General",
    fullName: "Graduate Record Examinations",
    date: "Year Round",
    mode: "Computer Based",
    gradient: "from-rose-500 to-pink-600",
    icon: "psychology",
    href: "/exams/gre",
  },
  {
    abbr: "JEE",
    name: "JEE Main 2026",
    fullName: "Joint Entrance Examination",
    date: "Jan 24, 2026",
    mode: "Computer Based",
    gradient: "from-orange-500 to-amber-600",
    icon: "calculate",
    href: "/exams/jee",
  },
  {
    abbr: "GMAT",
    name: "GMAT Focus",
    fullName: "Graduate Management Admission Test",
    date: "Year Round",
    mode: "Computer Based",
    gradient: "from-purple-500 to-violet-600",
    icon: "analytics",
    href: "/exams/gmat",
  },
  {
    abbr: "NEET",
    name: "NEET UG 2026",
    fullName: "National Eligibility cum Entrance Test",
    date: "May 04, 2026",
    mode: "Pen & Paper",
    gradient: "from-teal-500 to-emerald-600",
    icon: "biotech",
    href: "/exams/neet",
  },
];

const timelineVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function EntranceExams() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-white dark:bg-background-dark overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <ChapterHeading
          number="05"
          label="Prepare"
          title="Your Gateway Awaits"
          subtitle="Every champion prepares. Get ready for the entrance exams that unlock doors to your dream institutions."
        />

        {/* Timeline Layout */}
        <motion.div
          variants={timelineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-3xl"
        >
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent-violet to-accent-cyan hidden md:block" />

          {exams.map((exam, i) => (
            <motion.div
              key={exam.abbr}
              variants={itemVariants}
              className="relative mb-6 last:mb-0"
            >
              {/* Timeline Dot */}
              <div className={`absolute left-[14px] top-8 w-[22px] h-[22px] rounded-full bg-gradient-to-br ${exam.gradient} border-[3px] border-white dark:border-background-dark z-10 hidden md:block`} />

              {/* Card */}
              <Link
                href={exam.href}
                className="group block md:ml-16 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className={`h-14 w-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${exam.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="material-symbols-outlined text-2xl text-white">
                      {exam.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {exam.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {exam.abbr}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.fullName}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
                      <span className="font-semibold">{exam.date}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{exam.mode}</span>
                  </div>

                  {/* Arrow */}
                  <span className="hidden sm:flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 md:ml-16"
        >
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            View All Exams
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
