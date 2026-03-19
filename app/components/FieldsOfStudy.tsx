"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { label: "MBA", icon: "business_center", color: "bg-violet-100", textColor: "text-violet-600", border: "border-violet-200/50", href: "/colleges?course=mba" },
  { label: "Engineering", icon: "engineering", color: "bg-amber-100", textColor: "text-amber-600", border: "border-amber-200/50", href: "/colleges?course=engineering" },
  { label: "MBBS", icon: "medical_services", color: "bg-rose-100", textColor: "text-rose-600", border: "border-rose-200/50", href: "/colleges?course=mbbs" },
  { label: "B.Com", icon: "payments", color: "bg-blue-100", textColor: "text-blue-600", border: "border-blue-200/50", href: "/colleges?course=bcom" },
  { label: "Education", icon: "school", color: "bg-green-100", textColor: "text-green-600", border: "border-green-200/50", href: "/colleges?course=education" },
  { label: "Fashion", icon: "styler", color: "bg-pink-100", textColor: "text-pink-600", border: "border-pink-200/50", href: "/colleges?course=fashion" },
  { label: "Pharmacy", icon: "medication", color: "bg-slate-100", textColor: "text-slate-600", border: "border-slate-200/50", href: "/colleges?course=pharmacy" },
  { label: "Humanities", icon: "account_balance", color: "bg-[#e6f2f2]", textColor: "text-[#008080]", border: "border-[#008080]/20", href: "/colleges?course=humanities" },
];

export default function FieldsOfStudy() {
  return (
    <section className="w-full py-16 lg:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Categories</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
           {categories.map((cat, i) => (
             <motion.div
               key={cat.label}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: i * 0.05 }}
             >
                <Link 
                  href={cat.href}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border ${cat.border} ${cat.color} transition-all hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 active:scale-95`}
                >
                   <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${cat.textColor} shadow-sm transition-transform group-hover:scale-110`}>
                      <span className="material-symbols-rounded text-[24px]">
                        {cat.icon}
                      </span>
                   </div>
                   <span className={`text-sm font-bold ${cat.textColor} tracking-tight`}>{cat.label}</span>
                </Link>
             </motion.div>
           ))}
        </div>

        {/* Ad Banner (Scholarship) - EXPLICIT STYLES */}
        <div 
          className="mt-16 w-full relative min-h-[140px] sm:min-h-[120px] rounded-[32px] overflow-hidden flex items-center px-10"
          style={{ backgroundColor: '#008080' }}
        >
           <div 
             className="absolute top-0 right-0 w-1/2 h-full bg-yellow-400 skew-x-[-20deg] translate-x-10 pointer-events-none opacity-20" 
           />
           
           <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-slate-200 hidden sm:block">
                   <img src="https://i.pravatar.cc/100?u=scholarship" alt="Student" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="text-xl lg:text-2xl font-black text-white leading-none">AdmissionX Scholarship Test 2026</h3>
                    <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-2">Win up to 100% Scholarship on your dream course</p>
                 </div>
              </div>
              <button 
                className="px-8 py-3 bg-white text-[#008080] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-xl shadow-black/10"
                style={{ color: '#008080' }}
              >
                 Apply Now
              </button>
           </div>
        </div>
      </div>
    </section>
  );
}
