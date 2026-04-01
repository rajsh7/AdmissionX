"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const courses = [
  {
    id: 1,
    name: "Medical",
    count: "10 universities +",
    icon: "medical_services",
    slug: "medicine",
    description: "Prepare for a rewarding career in healthcare. From anatomy to clinical practice, learn from the best in the field.",
    stats: { colleges: "850+", salary: "$85K+", growth: "12%+" },
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Engineering",
    count: "10 universities +",
    icon: "engineering",
    slug: "engineering",
    description: "From robotics to renewable energy, engineering shapes tomorrow. Dive into cutting-edge programs that turn ideas into reality.",
    stats: { colleges: "850+", salary: "$85K+", growth: "12%+" },
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Management",
    count: "10 universities +",
    icon: "business_center",
    slug: "management",
    description: "Lead organizations and drive innovation. Our management courses provide the skills you need to excel in the global business landscape.",
    stats: { colleges: "720+", salary: "$95K+", growth: "15%+" },
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Business",
    count: "10 universities +",
    icon: "payments",
    slug: "commerce",
    description: "Master the fundamentals of trade and finance. Our business programs prepare you for the dynamic world of commerce.",
    stats: { colleges: "450+", salary: "$75K+", growth: "10%+" },
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Law and order",
    count: "10 universities +",
    icon: "gavel",
    slug: "law",
    description: "Uphold justice and the rule of law. Our legal studies programs offer deep insights into various legal systems and practices.",
    stats: { colleges: "280+", salary: "$110K+", growth: "8%+" },
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Architect",
    count: "10 universities +",
    icon: "architecture",
    slug: "design",
    description: "Design the spaces of the future. Our architecture programs blend creativity with technical expertise.",
    stats: { colleges: "310+", salary: "$80K+", growth: "14%+" },
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop"
  }
];

export default function TopCourse() {
  const [active, setActive] = useState(1);
  const current = courses[active];

  return (
    <section className="w-full py-24 lg:py-32 bg-[#fdfdfd] relative overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="mb-16">
          <div className="flex items-center justify-between gap-12 mb-6">
            <h2 className="text-[40px] lg:text-[68px] font-normal text-slate-900 tracking-tight leading-[1.1]">
              Discover the Top <span className="text-primary">Course</span>
            </h2>
            <Link href="/courses" className="px-8 py-3.5 rounded-[10px] bg-white border border-slate-100 shadow-sm text-slate-600 font-normal text-sm hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap">
              View All Course
            </Link>
          </div>
          <p className="text-slate-500 font-normal text-[25px] max-w-4xl leading-relaxed">
            Explore specialized programs and certifications designed to accelerate your professional growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column: Featured Course ──────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            <div className="relative aspect-[16/10] rounded-[10px] overflow-hidden group shadow-2xl shadow-black/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={current.image}
                    alt={current.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-6">
               <h3 className="text-[40px] lg:text-[56px] font-normal text-slate-900 tracking-tight leading-none uppercase">
                  {current.name}
               </h3>
               <p className="text-xl text-slate-500 font-normal leading-relaxed max-w-2xl">
                  {current.description}
               </p>
               <div className="flex flex-wrap gap-4 mt-2">
                 <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="material-symbols-outlined text-primary text-[24px]">school</span>
                    <span className="text-base font-normal text-slate-700">{current.stats.colleges} Colleges</span>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                    <span className="text-base font-normal text-slate-700">{current.stats.salary} Avg. Salary</span>
                 </div>
              </div>
              <Link href={`/courses/${current.slug}`} className="mt-4 px-12 py-5 w-fit rounded-[10px] bg-primary text-white font-normal hover:brightness-105 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                 Explore Programs
                 <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* ── Right Column: Selector List ───────────────────────────── */}
          <div className="lg:col-span-5 bg-white rounded-[10px] border border-slate-100 p-10 shadow-xl shadow-black/5">
             <div className="mb-10">
                <h3 className="text-2xl font-normal text-slate-900 mb-2 uppercase tracking-tight">Select Stream</h3>
                <div className="w-12 h-1.5 bg-primary rounded-[10px]" />
             </div>
             <div className="flex flex-col gap-4">
               {courses.map((course, idx) => (
                 <button
                   key={course.id}
                   onClick={() => setActive(idx)}
                   className={`flex items-center gap-6 p-6 rounded-[24px] transition-all duration-300 text-left border-[2px] ${
                     active === idx 
                       ? 'bg-slate-950 border-slate-950 text-white shadow-2xl scale-[1.02]' 
                       : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                   }`}
                 >
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                     active === idx ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                   }`}>
                     <span className="material-symbols-outlined text-[32px]">{course.icon}</span>
                   </div>
                   <div className="flex-1">
                      <div className={`text-[18px] font-normal mb-0.5 leading-none ${active === idx ? 'text-white' : 'text-slate-800'}`}>
                        {course.name}
                      </div>
                      <div className={`text-xs font-normal uppercase tracking-[0.15em] ${active === idx ? 'text-white/60' : 'text-slate-400'}`}>
                        {course.count}
                      </div>
                   </div>
                   {active === idx && (
                      <span className="material-symbols-outlined text-primary text-[28px]">chevron_right</span>
                   )}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}




