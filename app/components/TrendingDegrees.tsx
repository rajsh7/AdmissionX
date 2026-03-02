"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ChapterHeading from "./ChapterHeading";
import AnimatedCounter from "./AnimatedCounter";

interface Degree {
  title: string;
  duration: string;
  icon: string;
  gradient: string;
  badge: string;
  salary: number;
  salaryDisplay: string;
  placement: number;
  recruiters: string[];
  href: string;
}

const degrees: Degree[] = [
  {
    title: "B.Tech Computer Science",
    duration: "4 Years  •  Full Time",
    icon: "code",
    gradient: "from-blue-500 to-indigo-600",
    badge: "High Demand",
    salary: 85000,
    salaryDisplay: "$85,000",
    placement: 85,
    recruiters: ["Google", "Amazon", "Microsoft", "Meta"],
    href: "/courses/btech-cs",
  },
  {
    title: "MBA Finance",
    duration: "2 Years  •  Post Grad",
    icon: "bar_chart",
    gradient: "from-orange-500 to-red-600",
    badge: "Popular",
    salary: 92000,
    salaryDisplay: "$92,000",
    placement: 90,
    recruiters: ["Goldman Sachs", "McKinsey", "JP Morgan", "Deloitte"],
    href: "/courses/mba-finance",
  },
  {
    title: "MBBS Medicine",
    duration: "5.5 Years  •  Full Time",
    icon: "medical_services",
    gradient: "from-teal-500 to-emerald-600",
    badge: "Evergreen",
    salary: 110000,
    salaryDisplay: "$110,000",
    placement: 95,
    recruiters: ["Apollo", "AIIMS", "Mayo Clinic", "Johns Hopkins"],
    href: "/courses/mbbs",
  },
];

function ProgressBar({ width, color }: { width: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${width}%` } : { width: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.3 }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function TrendingDegrees() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-background-dark overflow-hidden">
      {/* Background accents */}
      <div className="orb orb-violet w-[400px] h-[400px] top-20 -right-40 opacity-30" />
      <div className="orb orb-cyan w-[300px] h-[300px] -bottom-20 left-0 opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <ChapterHeading
          number="04"
          label="Choose Your Path"
          title="Invest In Your Future"
          subtitle="Data-driven insights to help you make the most important decision of your career. Explore degrees with stellar placement records."
          light
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {degrees.map((deg) => (
            <motion.div key={deg.title} variants={cardVariants}>
              <Link
                href={deg.href}
                className="group block glass rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${deg.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="material-symbols-outlined text-2xl text-white">
                      {deg.icon}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 text-white">
                    {deg.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {deg.title}
                </h3>
                <p className="text-sm text-slate-400 mb-6">{deg.duration}</p>

                {/* Salary & Placement */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Avg. Salary</span>
                      <span className="font-bold text-white">
                        <AnimatedCounter target={deg.salary} prefix="$" suffix="/yr" duration={2} className="tabular-nums" />
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Placement Rate</span>
                      <span className="font-bold text-white">{deg.placement}%</span>
                    </div>
                    <ProgressBar width={deg.placement} color={deg.gradient} />
                  </div>
                </div>

                {/* Recruiters */}
                <div className="pt-5 border-t border-white/10">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-3">
                    Top Recruiters
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {deg.recruiters.map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-slate-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
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
          className="mt-10 text-center"
        >
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-white transition-colors"
          >
            View All Degrees
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
