"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Degree {
  title: string;
  shortTitle: string;
  duration: string;
  type: string;
  icon: string;
  color: string;
  colorBg: string;
  colorLight: string;
  badge: string;
  salaryDisplay: string;
  placement: number;
  colleges: number;
  recruiters: string[];
  href: string;
}

const degrees: Degree[] = [
  {
    title: "B.Tech Computer Science",
    shortTitle: "B.Tech CS",
    duration: "4 Years",
    type: "Full Time",
    icon: "code",
    color: "text-blue-600",
    colorBg: "bg-blue-600",
    colorLight: "bg-blue-50",
    badge: "High Demand",
    salaryDisplay: "$85K",
    placement: 85,
    colleges: 850,
    recruiters: ["Google", "Amazon", "Microsoft", "Meta"],
    href: "/courses/btech-cs",
  },
  {
    title: "MBA Finance",
    shortTitle: "MBA Finance",
    duration: "2 Years",
    type: "Post Grad",
    icon: "bar_chart",
    color: "text-orange-600",
    colorBg: "bg-orange-600",
    colorLight: "bg-orange-50",
    badge: "Popular",
    salaryDisplay: "$92K",
    placement: 90,
    colleges: 620,
    recruiters: ["Goldman Sachs", "McKinsey", "JP Morgan", "Deloitte"],
    href: "/courses/mba-finance",
  },
  {
    title: "MBBS Medicine",
    shortTitle: "MBBS",
    duration: "5.5 Years",
    type: "Full Time",
    icon: "medical_services",
    color: "text-teal-600",
    colorBg: "bg-teal-600",
    colorLight: "bg-teal-50",
    badge: "Evergreen",
    salaryDisplay: "$110K",
    placement: 95,
    colleges: 340,
    recruiters: ["Apollo", "AIIMS", "Mayo Clinic", "Johns Hopkins"],
    href: "/courses/mbbs",
  },
  {
    title: "B.Sc Data Science",
    shortTitle: "B.Sc DS",
    duration: "3 Years",
    type: "Full Time",
    icon: "insights",
    color: "text-violet-600",
    colorBg: "bg-violet-600",
    colorLight: "bg-violet-50",
    badge: "Trending",
    salaryDisplay: "$78K",
    placement: 82,
    colleges: 280,
    recruiters: ["IBM", "Accenture", "Infosys", "TCS"],
    href: "/courses/bsc-ds",
  },
  {
    title: "LLB Law",
    shortTitle: "LLB",
    duration: "3 Years",
    type: "Under Grad",
    icon: "gavel",
    color: "text-amber-600",
    colorBg: "bg-amber-600",
    colorLight: "bg-amber-50",
    badge: "Classic",
    salaryDisplay: "$72K",
    placement: 78,
    colleges: 210,
    recruiters: ["AZB", "Cyril Amarchand", "Khaitan & Co", "Trilegal"],
    href: "/courses/llb",
  },
  {
    title: "B.Des Product Design",
    shortTitle: "B.Des",
    duration: "4 Years",
    type: "Full Time",
    icon: "palette",
    color: "text-rose-600",
    colorBg: "bg-rose-600",
    colorLight: "bg-rose-50",
    badge: "Creative",
    salaryDisplay: "$68K",
    placement: 80,
    colleges: 180,
    recruiters: ["Apple", "Samsung", "Philips", "Titan"],
    href: "/courses/bdes",
  },
];

function PlacementBar({ value, colorBg }: { value: number; colorBg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const, delay: 0.3 }}
        className={`h-full rounded-full ${colorBg}`}
      />
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function TrendingDegrees() {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-neutral-50 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        {/* --- Chapter Heading --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14 lg:mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
              04
            </span>
            <div className="h-px w-8 bg-red-500/30" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              Choose Your Path
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
            Invest In Your Future
          </h2>
          <p className="mt-4 text-lg text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
            Data-driven insights to help you make the most important decision
            of your career.
          </p>
        </motion.div>

        {/* --- Degree Cards Grid --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {degrees.map((deg) => (
            <motion.div key={deg.title} variants={cardVariants}>
              <Link
                href={deg.href}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 h-[420px] overflow-hidden"
              >
                {/* -- Top: Icon + Badge Row -- */}
                <div className="flex items-start justify-between p-6 pb-0">
                  <div className={`h-14 w-14 rounded-2xl ${deg.colorLight} ${deg.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-2xl">
                      {deg.icon}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${deg.colorLight} ${deg.color}`}>
                    {deg.badge}
                  </span>
                </div>

                {/* -- Title + Meta -- */}
                <div className="px-6 pt-4 pb-0">
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-red-600 transition-colors">
                    {deg.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                      {deg.duration}
                    </span>
                    <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                      {deg.type}
                    </span>
                  </div>
                </div>

                {/* -- Stats Row -- */}
                <div className="px-6 pt-5 flex-1">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div>
                      <div className="text-xl font-black text-neutral-900">{deg.salaryDisplay}</div>
                      <div className="text-[11px] text-neutral-400 font-medium">Avg. Salary</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-neutral-900">{deg.placement}%</div>
                      <div className="text-[11px] text-neutral-400 font-medium">Placement</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-neutral-900">{deg.colleges}+</div>
                      <div className="text-[11px] text-neutral-400 font-medium">Colleges</div>
                    </div>
                  </div>

                  {/* Placement bar */}
                  <div className="mb-1">
                    <div className="flex justify-between text-[11px] font-semibold text-neutral-400 mb-1.5">
                      <span>Placement Rate</span>
                      <span className="text-neutral-700">{deg.placement}%</span>
                    </div>
                    <PlacementBar value={deg.placement} colorBg={deg.colorBg} />
                  </div>
                </div>

                {/* -- Bottom: Recruiters + Arrow -- */}
                <div className="px-6 py-4 mt-auto border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wide flex-shrink-0 mr-1">
                        Hires:
                      </span>
                      <div className="flex gap-1.5 overflow-hidden">
                        {deg.recruiters.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 bg-neutral-50 border border-neutral-100 rounded text-[11px] font-medium text-neutral-600 truncate"
                          >
                            {r}
                          </span>
                        ))}
                        {deg.recruiters.length > 3 && (
                          <span className="px-2 py-0.5 bg-neutral-50 border border-neutral-100 rounded text-[11px] font-medium text-neutral-400">
                            +{deg.recruiters.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-lg text-neutral-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* --- View All Link --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/courses"
            className="group inline-flex items-center gap-3 bg-neutral-900 text-white font-bold text-sm px-7 py-4 rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
          >
            View All Degrees
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}




