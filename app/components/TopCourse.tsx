"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FadeIn from "./FadeIn";

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
  const [active, setActive] = useState(0); // Start with Medical as per Figma
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const current = courses[active] || courses[0];

  return (
    <section className="w-full py-24 lg:py-32 bg-[#fdfdfd] relative overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 relative z-10">
        <FadeIn>
          <div className="mb-16">
            <div className="flex items-center justify-between gap-12 mb-6">
              <h2 className="text-[40px] lg:text-[68px] font-semibold text-slate-900 tracking-tight leading-[1.1]">
                Discover the Top <span style={{ color: '#FF3C3C' }}>Course</span>
              </h2>
              <Link href="/careers-courses" className="px-8 py-3.5 rounded-[10px] bg-white border border-slate-100 shadow-sm text-slate-600 font-normal text-sm hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap">
                View All Course
              </Link>
            </div>
            <p className="text-slate-500 font-medium text-[25px] max-w-4xl leading-relaxed">
              Filter through thousands of institutions worldwide based on your specific academic preferences and <span className="text-blue-500">career</span> goals.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column: Featured Course ──────────────────────────── */}
          <FadeIn className="lg:col-span-8 flex flex-col gap-10" direction="left">
            <div className="relative aspect-[16/10] rounded-none overflow-hidden group shadow-2xl shadow-black/5">
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
               <h3 className="text-[40px] lg:text-[56px] font-bold text-slate-900 tracking-tight leading-none">
                  {current.name}
               </h3>
               <p className="text-xl text-slate-500 font-normal leading-relaxed max-w-2xl">
                  {current.description}
               </p>
               <div className="flex flex-wrap gap-12 mt-4 items-center">
                 <div className="flex flex-col">
                    <span className="text-[28px] font-bold text-slate-900">{current.stats.colleges}</span>
                    <span className="text-sm font-medium text-slate-400">Colleges</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[28px] font-bold text-slate-900">{current.stats.salary}</span>
                    <span className="text-sm font-medium text-slate-400">Avg. Salary</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[28px] font-bold text-slate-900">{current.stats.growth}</span>
                    <span className="text-sm font-medium text-slate-400">Job Growth</span>
                 </div>
                 <Link 
                   href={`/careers-courses?stream=${current.slug}`} 
                   className="flex items-center gap-2 hover:translate-x-1 transition-transform ml-4" 
                   style={{ color: '#FF3C3C', fontSize: '25px', fontWeight: 700 }}
                 >
                    View more <span className="material-symbols-outlined" style={{ fontSize: '25px', fontWeight: 700 }}>arrow_forward</span>
                 </Link>
              </div>
            </div>
          </FadeIn>

          {/* ── Right Column: Selector List ───────────────────────────── */}
          <FadeIn className="lg:col-span-4 bg-white rounded-[10px] border border-slate-100 p-0 shadow-xl shadow-black/5 flex flex-col h-full overflow-hidden" direction="right" delay={0.1}>
             <div className="p-6 pb-4 border-b border-slate-50">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Search your course"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-6 bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none rounded-[10px] text-[14px] font-medium transition-all"
                  />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 max-h-[400px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
               {filteredCourses.map((course, idx) => {
                 const originalIdx = courses.findIndex(c => c.id === course.id);
                 return (
                  <button
                    key={course.id}
                    onMouseEnter={() => setActive(originalIdx)}
                    className={`flex items-center gap-4 p-3 rounded-[10px] transition-all duration-300 text-left ${
                      active === originalIdx 
                        ? 'text-white translate-x-2' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                    style={{ 
                      backgroundColor: active === originalIdx ? '#DD8D8F' : 'transparent',
                      boxShadow: active === originalIdx ? '0 10px 25px -5px rgba(221, 141, 143, 0.4)' : 'none'
                    }}
                  >
                    <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                      active === originalIdx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">{course.icon}</span>
                    </div>
                    <div className="flex-1">
                       <div className={`text-[16px] font-bold leading-none ${active === originalIdx ? 'text-white' : 'text-slate-800'}`}>
                         {course.name}
                       </div>
                       <div className={`text-[11px] mt-1 font-medium uppercase tracking-[0.1em] ${active === originalIdx ? 'text-white/80' : 'text-slate-400'}`}>
                         {course.count}
                       </div>
                    </div>
                    {active === originalIdx && (
                       <span className="material-symbols-outlined text-white text-[20px]">arrow_forward</span>
                    )}
                  </button>
                 );
               })}
             </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
