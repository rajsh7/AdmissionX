"use client";

import { motion } from "framer-motion";

const searchOptions = [
  { title: "Engineering", icon: "engineering", count: "1200+ Colleges" },
  { title: "Management", icon: "business_center", count: "800+ Colleges" },
  { title: "Medical", icon: "medical_services", count: "500+ Colleges" },
  { title: "Law", icon: "gavel", count: "300+ Colleges" },
  { title: "Design", icon: "palette", count: "400+ Colleges" },
  { title: "Science", icon: "science", count: "600+ Colleges" },
];

export default function FieldsOfStudy() {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#0f0f0f] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="home-page-shell relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-white text-[36px] lg:text-[52px] font-bold leading-tight tracking-tight">
            Explore Fields Of Study
          </h2>
          <p className="text-white/50 text-[18px] font-normal mt-4 max-w-2xl mx-auto leading-relaxed">
            Choose your career path from our wide range of disciplines and partner institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {searchOptions.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div 
                className="group flex flex-col p-8 lg:p-10 rounded-[5px] bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] transition-all hover:shadow-2xl hover:-translate-y-2 h-full border border-slate-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-primary text-[32px] group-hover:text-white transition-colors duration-300">
                    {opt.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                  {opt.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {opt.count}
                </p>
                <div className="mt-6 flex items-center gap-2 text-primary font-bold text-[13px] uppercase tracking-wider group-hover:gap-3 transition-all">
                  Explore Now
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
