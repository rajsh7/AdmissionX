"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { 
    title: "Engineering", 
    icon: "engineering", 
    color: "text-blue-600", 
    bg: "border-blue-500",
    description: "Explore top engineering schools and diverse specializations for a future-ready career.",
    href: "/search?stream=engineering"
  },
  { 
    title: "Management", 
    icon: "business_center", 
    color: "text-emerald-600", 
    bg: "border-emerald-500",
    description: "Transform into a global business leader with top-tier MBA and leadership programs.",
    href: "/search?stream=management"
  },
  { 
    title: "Medical", 
    icon: "medical_services", 
    color: "text-rose-600", 
    bg: "border-rose-500",
    description: "Shape the future of healthcare with premier medical university and research paths.",
    href: "/search?stream=medicine"
  },
  { 
    title: "Design", 
    icon: "palette", 
    color: "text-purple-600", 
    bg: "border-purple-500",
    description: "Unleash your creativity at world-renowned design studios and architecture schools.",
    href: "/search?stream=design"
  },
  { 
    title: "Science", 
    icon: "biotech", 
    color: "text-cyan-600", 
    bg: "border-cyan-500",
    description: "Dive into research and innovation with leading science and technology institutions.",
    href: "/search?stream=science"
  },
  { 
    title: "Commerce", 
    icon: "payments", 
    color: "text-orange-600", 
    bg: "border-orange-500",
    description: "Master the dynamics of trade, finance, and accounting at top commerce colleges.",
    href: "/search?stream=commerce"
  },
  { 
    title: "Law", 
    icon: "gavel", 
    color: "text-amber-700", 
    bg: "border-amber-600",
    description: "Uphold justice and the rule of law. Explore premier legal studies and judicial services paths.",
    href: "/search?stream=law"
  },
  { 
    title: "Arts", 
    icon: "history_edu", 
    color: "text-indigo-600", 
    bg: "border-indigo-500",
    description: "Discover the richness of human expression with top-tier humanities and social science programs.",
    href: "/search?stream=arts"
  },
];

export default function FieldsOfStudy() {
  return (
    <section className="w-full py-24 lg:py-32 bg-[#f8fafc] overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link 
                href={cat.href}
                className={`group flex flex-col p-12 rounded-[10px] bg-white border-t-4 ${cat.bg} shadow-[0_20px_50px_-10px_rgba(0,0,0,0.03)] transition-all hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2 active:scale-95 h-full`}
              >
                <div className={`w-16 h-16 rounded-[10px] bg-slate-50 flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white`}>
                  <span className={`material-symbols-rounded text-[32px] ${cat.color} group-hover:text-white transition-colors`}>
                    {cat.icon}
                  </span>
                </div>
                <h3 className="text-[28px] font-normal text-slate-900 mb-5 tracking-tight uppercase leading-tight">
                   {cat.title}
                </h3>
                <p className="text-[17px] text-slate-500 font-normal leading-relaxed mb-10 flex-1">
                   {cat.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-normal text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   <span>View More</span>
                   <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}




