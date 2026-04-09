"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import MovingAdsCard from "./MovingAdsCard";
import type { AdItem } from "./AdsSection";

const stats = [
  { label: "Universities", target: 500, suffix: "+", prefix: "" },
  { label: "Students", target: 1000, suffix: "+", prefix: "" },
  { label: "Cities", target: 50, suffix: "+", prefix: "" },
  { label: "Admission Rate", target: 95, suffix: "+", prefix: "" },
];

interface StatsBarProps {
  ads?: AdItem[];
}

export default function StatsBar({ ads = [] }: StatsBarProps) {
  return (
    <section className="w-full bg-white border-y border-slate-200">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="py-10 lg:py-12 flex flex-col lg:flex-row items-center gap-8">

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="text-[40px] lg:text-[48px] font-bold text-primary mb-1 tracking-tight group-hover:scale-105 transition-transform">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </div>
                <div className="text-[16px] font-semibold uppercase tracking-[0.1em] antialiased" style={{ color: "rgba(108, 108, 108, 1)" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
}
