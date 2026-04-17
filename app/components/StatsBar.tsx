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
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/85" />
      
      <div className="relative z-10 mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl bg-white/5 border border-white/10 p-5 py-6 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-500/50 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/50 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`mb-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {stat.icon}
                  </span>
                </div>
                
                {/* Counter */}
                <div className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-1">
                  <AnimatedCounter 
                    target={stat.target} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix} 
                  />
                </div>
                
                {/* Label */}
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}