"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import type { HomeStat } from "../api/home/stats/route";

const STATIC_STATS: HomeStat[] = [
  { value: 500, suffix: "+", label: "Partner Colleges" },
  { value: 10000, suffix: "+", label: "Students Registered" },
  { value: 50, suffix: "+", label: "Countries" },
  { value: 200, suffix: "+", label: "Courses Available" },
];

interface CallToActionProps {
  stats?: HomeStat[];
}

export default function CallToAction({ stats }: CallToActionProps) {
  const liveStats = stats && stats.length > 0 ? stats : STATIC_STATS;
  const router = useRouter();

  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 cta-gradient" />

      {/* Floating Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl translate-x-1/3 translate-y-1/3 animate-float-reverse" />

      {/* Noise */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Join the Movement
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Your Story
            <br />
            <span className="text-white/40">Starts Now</span>
          </h2>

          <p className="text-lg text-white/60 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of students who found their dream college through
            Admissionx. Your extraordinary journey is just one click away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/signup/student")}
              className="h-14 px-10 rounded-2xl bg-white text-red-600 font-bold text-base hover:bg-red-50 transition-colors shadow-2xl shadow-black/20"
            >
              Create Free Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/colleges")}
              className="h-14 px-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors"
            >
              Explore Colleges
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10"
        >
          {liveStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                />
              </div>
              <div className="mt-1 text-sm text-white/50 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}




