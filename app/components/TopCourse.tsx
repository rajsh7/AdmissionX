"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const courses = [
  { id: 1, name: "MBA", count: "850+ Colleges", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop", color: "text-violet-600", bg: "bg-violet-50" },
  { id: 2, name: "Engineering", count: "620+ Colleges", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop", color: "text-amber-600", bg: "bg-amber-50" },
  { id: 3, name: "MBBS", count: "340+ Colleges", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop", color: "text-rose-600", bg: "bg-rose-50" },
  { id: 4, name: "B.Com", count: "380+ Colleges", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 5, name: "Design", count: "180+ Colleges", image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop", color: "text-pink-600", bg: "bg-pink-50" },
  { id: 6, name: "Fashion", count: "120+ Colleges", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2670&auto=format&fit=crop", color: "text-rose-400", bg: "bg-rose-50" },
];

export default function TopCourse() {
  const [active, setActive] = useState(0);
  const current = courses[active];

  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ── Left: Featured Image (EXPLICIT ASPECT) ────────────────── */}
          <div className="relative order-2 lg:order-1">
             <div 
               className="relative rounded-[40px] overflow-hidden group bg-slate-100"
               style={{ paddingBottom: '100%' }} // Square aspect
             >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <Image 
                      src={current.image}
                      alt={current.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Overlay with Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-10 left-10 p-2">
                   <motion.div
                     key={`text-${current.id}`}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col gap-2"
                   >
                     <span 
                       className="px-3 py-1 rounded-lg backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20 w-fit"
                       style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                     >
                        Top Ranking
                     </span>
                     <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight">{current.name}</h3>
                   </motion.div>
                </div>
             </div>
          </div>

          {/* ── Right: List of Courses ────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <div className="mb-10 lg:mb-12">
               <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                 Discover the Top Course
               </h2>
               <p className="mt-4 text-slate-500 font-medium leading-relaxed">
                 Explore trending programs that align with your career goals. 
                 Master your field with the most sought-after degrees.
               </p>
            </div>

            <div className="space-y-3">
               {courses.map((course, i) => (
                 <button
                   key={course.id}
                   onMouseEnter={() => setActive(i)}
                   onClick={() => setActive(i)}
                   className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                     active === i 
                       ? "bg-slate-50 border-[#008080]" 
                       : "bg-white border-slate-100"
                   }`}
                   style={active === i ? { borderColor: '#008080' } : {}}
                 >
                    <div className="flex items-center gap-4">
                       <div 
                         className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all font-black text-xs ${active === i ? 'text-white':'text-slate-400'}`}
                         style={active === i ? { backgroundColor: '#008080' } : { backgroundColor: '#f1f5f9' }}
                       >
                          0{i + 1}
                       </div>
                       <div className="text-left">
                          <h4 className={`text-base font-black transition-colors ${active === i ? "text-slate-900" : "text-slate-600"}`}>
                             {course.name}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{course.count}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <span 
                         className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all`}
                         style={active === i ? { backgroundColor: 'rgba(0,128,128,0.1)', color: '#008080' } : { opacity: 0 }}
                       >
                          Top Ranking
                       </span>
                       <span 
                         className={`material-symbols-rounded text-[20px] transition-all`}
                         style={active === i ? { color: '#008080' } : { color: '#cbd5e1' }}
                       >
                          arrow_forward
                       </span>
                    </div>
                 </button>
               ))}
            </div>

            <div className="mt-10">
               <Link 
                 href="/courses"
                 className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
               >
                 View All Courses
               </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
