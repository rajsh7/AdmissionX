"use client";

import Link from "next/link";
import { StaggerContainer, StaggerItem } from "./FadeIn";
import FadeIn from "./FadeIn";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#000" />
    <path d="M14.613 7.502h2.52l-5.508 6.29 6.471 8.549h-5.067l-3.968-5.187-4.531 5.187H2.01L8.01 15.25 1.745 7.5t5.195 0l3.585 4.755 4.088-4.753zm-.883 13.332h1.396L7.332 8.924H5.83l7.9 11.91z" fill="#fff" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="igBg2" x1="0%" x2="100%" y1="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="5" fill="url(#igBg2)" />
    <path d="M12 7.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.4c-1.6 0-2.9-1.3-2.9-2.9s1.3-2.9 2.9-2.9 2.9 1.3 2.9 2.9-1.3 2.9-2.9 2.9z" fill="#fff" />
    <circle cx="16.5" cy="7.5" r="1.1" fill="#fff" />
    <path d="M16.9 5.5H7.1c-1.1 0-2 .9-2 2v9.8c0 1.1.9 2 2 2h9.8c1.1 0 2-.9 2-2V7.5c0-1.1-.9-2-2-2zm1.6 11.8c0 .88-.72 1.6-1.6 1.6H7.1c-.88 0-1.6-.72-1.6-1.6V7.5c0-.88.72-1.6 1.6-1.6h9.8c.88 0 1.6.72 1.6 1.6v9.8z" fill="#fff" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1877F2" />
    <path d="M15.36 12.07l.53-3.47h-3.33V6.35c0-.95.46-1.87 1.95-1.87h1.53V1.52c0 0-1.39-.24-2.71-.24-2.77 0-4.56 1.68-4.56 4.7v2.62H5.97v3.47h2.8v8.39a12.18 12.18 0 003.78 0v-8.39h2.8z" fill="#fff" />
  </svg>
);

const footerLinks = {
  "Top Colleges": [
    { label: "Engineering Colleges", href: "/top-colleges?stream=engineering" },
    { label: "Management Colleges", href: "/top-colleges?stream=management" },
    { label: "Medical Colleges", href: "/top-colleges?stream=medicine" },
    { label: "Law Colleges", href: "/top-colleges?stream=law" },
    { label: "Commerce Colleges", href: "/top-colleges?stream=commerce" },
    { label: "Science Colleges", href: "/top-colleges?stream=science" },
    { label: "Arts Colleges", href: "/top-colleges?stream=arts" },
    { label: "Pharmacy Colleges", href: "/top-colleges?stream=pharmacy" },
    { label: "Design Colleges", href: "/top-colleges?stream=design" },
    { label: "Architecture Colleges", href: "/top-colleges?stream=architecture" },
  ],
  "Top Universities": [
    { label: "Engineering Universities", href: "/top-university?stream=engineering" },
    { label: "Management Universities", href: "/top-university?stream=management" },
    { label: "Medical Universities", href: "/top-university?stream=medicine" },
    { label: "Law Universities", href: "/top-university?stream=law" },
    { label: "Commerce Universities", href: "/top-university?stream=commerce" },
    { label: "Science Universities", href: "/top-university?stream=science" },
    { label: "Arts Universities", href: "/top-university?stream=arts" },
    { label: "Pharmacy Universities", href: "/top-university?stream=pharmacy" },
    { label: "Design Universities", href: "/top-university?stream=design" },
    { label: "Architecture Universities", href: "/top-university?stream=architecture" },
  ],
  "Top Courses": [
    { label: "MBA/PGDM", href: "/search?degree=mba" },
    { label: "B.Tech/B.E.", href: "/search?degree=b-tech" },
    { label: "MBBS", href: "/search?degree=mbbs" },
    { label: "BBA/BMS", href: "/search?degree=bba" },
    { label: "LLB", href: "/search?degree=llb" },
    { label: "B.Sc", href: "/search?degree=bsc" },
    { label: "B.Com", href: "/search?degree=bcom" },
    { label: "B.A", href: "/search?degree=ba" },
    { label: "B.Arch", href: "/search?degree=barch" },
    { label: "B.Des", href: "/search?degree=bdes" },
  ],
  "Examination": [
    { label: "JEE Main", href: "/examination/engineering/jee-main" },
    { label: "NEET", href: "/examination/medicine/neet" },
    { label: "CAT", href: "/examination/management/cat" },
    { label: "GATE", href: "/examination/engineering/gate" },
    { label: "CLAT", href: "/examination/law/clat" },
    { label: "CUET", href: "/examination/common/cuet" },
    { label: "MAT", href: "/examination/management/mat" },
    { label: "XAT", href: "/examination/management/xat" },
    { label: "CMAT", href: "/examination/management/cmat" },
    { label: "GMAT", href: "/examination/study-abroad/gmat" },
  ],
  "Other": [
    { label: "Study Abroad", href: "/study-abroad" },
    { label: "Education Blogs", href: "/education-blogs" },
    { label: "News & Articles", href: "/news" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "FAQ", href: "/faq" },
    { label: "Site Map", href: "/site-map" },
  ],
};

const STATS = [
  { value: "16,000+", label: "Partner Colleges", icon: "account_balance" },
  { value: "10,000+", label: "Students Registered", icon: "group" },
  { value: "500+", label: "Entrance Exams", icon: "quiz" },
  { value: "1,500+", label: "Courses Listed", icon: "menu_book" },
];

export default function Footer() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          FOOTER SECTION 1 — Links
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#0a0a0a] pt-16 pb-10 border-t border-white/5">
        <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">

          {/* Section label */}
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.25em]">Quick Links</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </FadeIn>

          <StaggerContainer
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-6"
            stagger={0.06}
          >
            {Object.entries(footerLinks).map(([title, links]) => (
              <StaggerItem key={title}>
                <h4 className="text-[13px] font-bold text-white mb-5 pb-2 border-b border-white/10">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-slate-500 hover:text-white transition-colors leading-tight block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Divider */}
          <div className="mt-12 border-t border-white/5" />
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER SECTION 2 — About AdmissionX
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#111111] pt-14 pb-10">
        <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">

          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.25em]">About AdmissionX</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left — Brand + description */}
            <FadeIn className="lg:col-span-5">
              <Link href="/" className="inline-block mb-6 bg-white px-5 py-2.5 rounded-xl">
                <img src="/logo.jpg" className="h-8 w-auto object-contain" alt="AdmissionX" />
              </Link>

              <p className="text-slate-400 text-[14px] leading-relaxed mb-4 max-w-md">
                AdmissionX is India&apos;s most trusted college admissions platform. We connect students with 16,000+ institutions, entrance exams, scholarships, and career guidance — all in one place.
              </p>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-6 max-w-md">
                Founded with a mission to democratise access to quality education information, we help every student — regardless of background or location — make confident, well-informed decisions about their future.
              </p>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-red-400 transition-colors mb-8"
              >
                Read our full story
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>

              {/* Social */}
              <div className="flex items-center gap-3">
                {[
                  { icon: <GoogleIcon />, label: "Google" },
                  { icon: <XIcon />, label: "X" },
                  { icon: <InstagramIcon />, label: "Instagram" },
                  { icon: <FacebookIcon />, label: "Facebook" },
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:border-white/20 transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>
            </FadeIn>

            {/* Right — Stats + Mission/Vision */}
            <div className="lg:col-span-7 space-y-8">

              {/* Stats grid */}
              <FadeIn>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STATS.map((stat) => (
                    <div key={stat.label}
                      className="rounded-xl p-4 text-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="material-symbols-outlined text-primary text-[22px] block mb-2"
                        style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                      <p className="text-white font-black text-[18px] leading-tight">{stat.value}</p>
                      <p className="text-slate-500 text-[11px] font-semibold mt-1 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Mission + Vision */}
              <FadeIn>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl p-5" style={{ background: "rgba(255,60,60,0.04)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
                      <h5 className="text-[13px] font-bold text-white">Our Mission</h5>
                    </div>
                    <p className="text-slate-500 text-[12px] leading-relaxed">
                      To democratise access to quality education information for every student in India — making the admission process transparent, simple, and student-first.
                    </p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                      <h5 className="text-[13px] font-bold text-white">Our Vision</h5>
                    </div>
                    <p className="text-slate-500 text-[12px] leading-relaxed">
                      To become the definitive starting point for every student&apos;s higher education journey — from discovering the right stream to enrolling in their dream college.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Bottom bar */}
          <FadeIn>
            <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-slate-600">
                © {new Date().getFullYear()} AdmissionX. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy-policy" className="text-[12px] text-slate-600 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms-and-conditions" className="text-[12px] text-slate-600 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/contact-us" className="text-[12px] text-slate-600 hover:text-white transition-colors">Contact Us</Link>
              </div>
            </div>
          </FadeIn>

        </div>
      </footer>
    </>
  );
}
