"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { 
    title: "Engineering", 
    icon: "engineering", 
    color: "text-blue-600", 
    bg: "bg-blue-50",
    href: "/search?stream=engineering"
  },
  { 
    title: "Management", 
    icon: "business_center", 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    href: "/search?stream=management"
  },
  { 
    title: "Medical", 
    icon: "medical_services", 
    color: "text-rose-600", 
    bg: "bg-rose-50",
    href: "/search?stream=medicine"
  },
  { 
    title: "Design", 
    icon: "palette", 
    color: "text-purple-600", 
    bg: "bg-purple-50",
    href: "/search?stream=design"
  },
  { 
    title: "Science", 
    icon: "biotech", 
    color: "text-cyan-600", 
    bg: "bg-cyan-50",
    href: "/search?stream=science"
  },
  { 
    title: "Arts", 
    icon: "history_edu", 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    href: "/search?stream=arts"
  },
  { 
    title: "Commerce", 
    icon: "payments", 
    color: "text-orange-600", 
    bg: "bg-orange-50",
    href: "/search?stream=commerce"
  },
  { 
    title: "Pharmacy", 
    icon: "medications", 
    color: "text-teal-600", 
    bg: "bg-teal-50",
    href: "/search?stream=pharmacy"
  },
];

export default function FieldsOfStudy() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="text-center mb-16">
           <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Top Categories</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link 
                href={cat.href}
                className={`group flex flex-col items-center justify-center p-6 rounded-[32px] border border-slate-100 bg-white transition-all hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 active:scale-95 h-full`}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-rounded text-[28px] ${cat.color}`}>
                    {cat.icon}
                  </span>
                </div>
                <h3 className={`text-[13px] font-black text-slate-800 text-center leading-tight transition-colors group-hover:text-[#008080]`}>
                  {cat.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Ads Banner - Grey Minimalist Box */}
        <div className="mt-20 w-full h-40 bg-slate-200 rounded-[32px] flex items-center justify-center relative group overflow-hidden">
           <div className="absolute inset-0 bg-slate-300 transform -translate-x-full transition-transform duration-1000 group-hover:translate-x-0 opacity-20" />
           <span className="text-[72px] lg:text-[96px] font-black text-white uppercase tracking-tighter antialiased transition-all group-hover:scale-105 group-hover:tracking-[0.2em]">
             ads
           </span>
        </div>
      </div>
    </section>
  );
}
