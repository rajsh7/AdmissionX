"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "adx_signup_nudge_seen";
const DELAY_MS    = 12000;

const SLIDES = [
  { img: "/uploads/college/accurate-group-of-institutions-63/banner_1775556967175.jpeg",                  name: "Accurate Group of Institutions" },
  { img: "/uploads/college/jaipur-institute-of-engineering-and-technology-20/banner_1776772953083.jpg",   name: "Jaipur Institute of Engineering & Technology" },
  { img: "/uploads/college/gb-pant-social-science-institute-30/banner_1776772405157.jpg",                 name: "GB Pant Social Science Institute" },
  { img: "/uploads/college/apex-international-institute-of-technology-38/banner_1776773098584.jpg",       name: "Apex International Institute of Technology" },
  { img: "/uploads/college/regional-college-21/banner_1776773174928.avif",                                name: "Regional College" },
];

export default function SignupNudge() {
  const [visible,    setVisible]    = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const skip = ["/admin", "/dashboard", "/login", "/signup", "/reset-password", "/forgot-password"];
    if (skip.some(p => pathname.startsWith(p))) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 3000);
    return () => clearInterval(iv);
  }, [visible]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in zoom-in-95 fade-in duration-400 rounded-3xl overflow-hidden shadow-2xl">

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">close</span>
        </button>

        {/* ── Image slider ── */}
        <div className="relative h-52 overflow-hidden">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === slideIndex ? 1 : 0 }}
            >
              <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          ))}

          {/* Logo */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1">
            <img src="/admissionx-logo.png" alt="AdmissionX" className="h-5 w-auto object-contain" />
          </div>

          {/* College name */}
          <p className="absolute bottom-8 left-4 right-4 z-10 text-white text-xs font-semibold drop-shadow truncate">
            {SLIDES[slideIndex].name}
          </p>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIndex ? "bg-white w-5" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="bg-white px-6 py-5">
          <p className="text-[10px] font-bold text-[#FF3C3C] uppercase tracking-widest mb-1">Free Registration</p>
          <h2 className="text-[20px] font-black text-slate-800 leading-tight mb-1">Find Your Dream College</h2>
          <p className="text-xs text-slate-400 font-medium mb-4">Join 10,000+ students already on AdmissionX</p>

          {/* Benefits */}
          <ul className="space-y-2 mb-5">
            {[
              { icon: "account_balance",      text: "Explore 500+ top colleges" },
              { icon: "notifications_active",  text: "Real-time admission alerts" },
              { icon: "compare_arrows",        text: "Compare colleges side by side" },
              { icon: "bookmark_added",        text: "Save & track applications" },
            ].map(b => (
              <li key={b.icon} className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                <span className="w-6 h-6 bg-[#FF3C3C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-[14px] text-[#FF3C3C]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                </span>
                {b.text}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <Link href="/signup/student" onClick={dismiss}
            className="block w-full bg-[#FF3C3C] hover:bg-[#e63535] text-white text-sm font-bold py-3 rounded-xl text-center transition-colors shadow-lg shadow-red-100 mb-2">
            Create Free Account
          </Link>
          <Link href="/login/student" onClick={dismiss}
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-3 rounded-xl text-center transition-colors">
            Already have an account? Log In
          </Link>
          <p className="text-center text-[10px] text-slate-300 font-medium mt-2">No spam · Free forever</p>
        </div>
      </div>
    </div>
  );
}
