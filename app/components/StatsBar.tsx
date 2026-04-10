"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { label: "Universities", target: 500, suffix: "+", prefix: "" },
  { label: "Students", target: 1000, suffix: "+", prefix: "" },
  { label: "Cities", target: 50, suffix: "+", prefix: "" },
  { label: "Admission Rate", target: 95, suffix: "+", prefix: "" },
];

export default function StatsBar() {
  return (
    <section className="w-full py-20 lg:py-28 bg-white border-b border-slate-50">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
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
              <div className="text-[20px] font-semibold text-slate-400 uppercase tracking-[0.2em] antialiased">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
