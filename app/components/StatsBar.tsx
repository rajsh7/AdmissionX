"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { 
    label: "Universities", 
    target: 500, 
    suffix: "+", 
    prefix: "", 
    icon: "school",
    color: "text-blue-400"
  },
  { 
    label: "Students", 
    target: 1000, 
    suffix: "+", 
    prefix: "", 
    icon: "groups",
    color: "text-green-400"
  },
  { 
    label: "Cities", 
    target: 50, 
    suffix: "+", 
    prefix: "", 
    icon: "location_city",
    color: "text-amber-400"
  },
  { 
    label: "Admission Rate", 
    target: 95, 
    suffix: "%", 
    prefix: "", 
    icon: "verified",
    color: "text-red-400"
  },
];

export default function StatsBar() {
  return (
    <section
      className="w-full border-b border-white/10 bg-cover bg-center bg-no-repeat py-10 lg:py-14 relative overflow-hidden"
      style={{
        backgroundImage:
          "url('/Background-images/a869d11c-8380-4a53-ae65-09c5a674b54f.png')",
        zIndex: 0,
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/85" />
      
      <div className="home-page-shell relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-[5px] bg-white/5 border border-white/10 p-5 py-6 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center">
               <div className="flex flex-col items-center text-center">
                 <div className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight">
                   <AnimatedCounter 
                     target={stat.target} 
                     suffix={stat.suffix} 
                     prefix={stat.prefix} 
                   />
                 </div>
                 <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mt-2 sm:mt-3">
                   {stat.label}
                 </div>
               </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
