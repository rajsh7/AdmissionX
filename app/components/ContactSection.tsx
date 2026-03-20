"use client";

import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-[#fdfdfd] overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ── Left: Contact Info ────────────────────────────────────── */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Get in Touch
            </h2>
            <p className="mt-4 text-slate-500 font-medium leading-relaxed max-w-md">
              Have questions about colleges, courses, or admissions? 
              Our experts are here to help you navigate your academic journey.
            </p>

            <div className="mt-10 space-y-8">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#008080]/10 flex items-center justify-center text-[#008080] shrink-0">
                    <span className="material-symbols-rounded text-[24px]">mail</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Email Us</h4>
                    <a href="mailto:support@admissionx.in" className="mt-2 text-slate-500 font-semibold hover:text-[#008080] transition-colors block">support@admissionx.in</a>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-600 shrink-0">
                    <span className="material-symbols-rounded text-[24px]">call</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Call Us (Toll Free)</h4>
                    <p className="mt-2 text-slate-500 font-semibold">1800-XXX-XXXX</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-rounded text-[24px]">location_on</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Visit Us</h4>
                    <p className="mt-2 text-slate-500 font-semibold">Registered Office, New Delhi, India</p>
                  </div>
               </div>
            </div>
          </div>

          {/* ── Right: Contact Form ───────────────────────────────────── */}
          <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
             <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/10 focus:border-[#008080] transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/10 focus:border-[#008080] transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                   <input 
                     type="tel" 
                     placeholder="+91 XXXXX XXXXX"
                     className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/10 focus:border-[#008080] transition-all"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                   <textarea 
                     rows={4}
                     placeholder="Tell us about your requirements..."
                     className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/10 focus:border-[#008080] transition-all resize-none"
                   ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#008080] text-white font-black text-sm uppercase tracking-widest hover:bg-[#006666] transition-all active:scale-[0.98] shadow-lg shadow-[#008080]/10"
                >
                  Send Message
                </button>
             </form>
          </div>

        </div>
      </div>
    </section>
  );
}
