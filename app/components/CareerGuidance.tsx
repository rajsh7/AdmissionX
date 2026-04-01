"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CareerGuidance() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="relative rounded-[10px] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
             <img 
               src="/images/98dbd696a8ef9396310ca4d2788bf46b8b3d5435.jpg" 
               alt="Section Background" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
          </div>

          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FF3C3C]/5 rounded-full blur-3xl opacity-40 z-0" />

          {/* ── Left Content (60% width) ─────────────────────────────────── */}
          <div className="flex-[1.2] text-center lg:text-left z-10">
            <h2 className="text-[36px] lg:text-[48px] font-bold text-[#1F2937] leading-[1.2] mb-6 tracking-tight">
              Confused about your <span className="text-[#FF3C3C]">career path?</span>
            </h2>
            <p className="text-[17px] text-[#6B7280] font-normal leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Filter through thousands of institutions worldwide based on your specific academic preferences and career goals.
            </p>
            
            {/* Features List (Mockup bullets) */}
            <ul className="mb-10 flex flex-col gap-3 text-[16px] font-medium text-[#374151]">
               <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2937]/30" />
                  Helps up to finds the talent
               </li>
               <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2937]/30" />
                  Save your time
               </li>
               <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2937]/30" />
                  self assessment
               </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/counselling" 
                className="w-full sm:w-auto px-8 py-4 rounded-[10px] bg-[#FF3C3C] text-white font-bold text-[14px] shadow-lg shadow-[#FF3C3C]/20 hover:brightness-105 transition-all text-center"
              >
                Start Free Assessment
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-[10px] bg-neutral-800 text-white font-bold text-[14px] shadow-lg shadow-black/10 hover:bg-neutral-900 transition-all text-center">
                Watch how its work
              </button>
            </div>
          </div>

          {/* ── Right Content: Illustration (40% width) ────────────────────── */}
          <div className="flex-1 relative z-10 w-full flex items-center justify-center lg:justify-end">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, x: 20 }}
               whileInView={{ opacity: 1, scale: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.7 }}
               className="relative w-full max-w-[480px]"
             >
                <img 
                   src="/images/3718e82201e432bd5219be08e1391c20ad9829af.png" 
                   alt="Confused Career Path Boy Illustration" 
                   className="w-full h-auto object-contain drop-shadow-xl"
                />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
