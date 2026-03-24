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
  const [active, setActive] = useState(1); // Set Engineering as default active (index 1)
  const [courseSearch, setCourseSearch] = useState("");
  const current = courses[active];

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <section className="w-full py-20 lg:py-28 bg-[#fdfdfd] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f1f5f9]/30 -skew-x-12 translate-x-1/2 z-0" />
      
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="mb-16">
          <h2 className="text-[48px] lg:text-[64px] font-black text-slate-900 tracking-tight leading-none mb-6">
            Discover the Top <span className="text-[#008080]">Course</span>
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed">
              Filter through thousands of institutions worldwide based on your specific academic preferences and career goals.
            </p>
            <Link href="/courses" className="px-8 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 font-black text-sm hover:bg-slate-50 transition-all active:scale-95">
              View All Course
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column (60-70%) ──────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            {/* Main Carousel Area */}
            <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden group shadow-2xl shadow-black/5">
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
                </motion.div>
              </AnimatePresence>

              {/* Slider Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {courses.slice(0, 4).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${active === i ? 'w-10 bg-white' : 'w-2.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>

            {/* Featured Content Below Image */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[40px] lg:text-[56px] font-black text-slate-900 tracking-tight leading-none">
                  {current.name}
                </h3>
                <div className="flex gap-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-12 h-1 bg-gradient-to-r from-[#008080]/20 to-transparent rounded-full" />
                   ))}
                </div>
              </div>

              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                {current.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-8 lg:gap-12 mt-4">
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{current.stats.colleges}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Colleges</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{current.stats.salary}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Avg. Salary</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{current.stats.growth}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Job Growth</span>
                </div>
                <Link 
                  href={`/careers-courses?stream=${current.slug}`}
                  className="group flex items-center gap-3 text-[#008080] font-black text-xl hover:translate-x-1 transition-all"
                >
                  View more
                  <span className="material-symbols-rounded text-[24px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right Column (Course List) ────────────────────────────── */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden flex flex-col h-[700px]">
               {/* Search Bar */}
               <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                      <span className="material-symbols-rounded">search</span>
                    </span>
                    <input 
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search your course"
                      className="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008080]/30 transition-all font-bold"
                    />
                  </div>
               </div>

               {/* Scrollable List */}
               <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-3">
                 {filteredCourses.map((course, i) => (
                   <button
                     key={course.id}
                     onClick={() => setActive(courses.findIndex(c => c.id === course.id))}
                     className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] ${
                       active === courses.findIndex(c => c.id === course.id)
                         ? "bg-[#008080] text-white shadow-xl shadow-[#008080]/20"
                         : "bg-white text-slate-600 border border-slate-50 hover:bg-slate-50"
                     }`}
                   >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                       active === courses.findIndex(c => c.id === course.id)
                         ? "bg-white/20 border-white/20 text-white"
                         : "bg-white border-slate-100 text-slate-900 shadow-sm"
                     }`}>
                        <span className="material-symbols-rounded text-[24px]">{course.icon}</span>
                     </div>
                     <div className="flex-1 text-left">
                       <h4 className="font-black text-sm">{course.name}</h4>
                       <p className={`text-[10px] font-bold uppercase tracking-wider ${
                         active === courses.findIndex(c => c.id === course.id) ? "text-white/70" : "text-slate-400"
                       }`}>
                         {course.count}
                       </p>
                     </div>
                     <span className={`material-symbols-rounded transition-transform ${
                        active === courses.findIndex(c => c.id === course.id) ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 group-hover:opacity-100"
                     }`}>
                       arrow_forward
                     </span>
                   </button>
                 ))}
                 
                 {filteredCourses.length === 0 && (
                   <div className="py-20 text-center">
                     <p className="text-slate-400 font-bold">No courses found matching your search.</p>
                   </div>
                 )}
               </div>
            </div>
            
            {/* Decorative element (Floating sphere behind list) */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#008080]/5 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
