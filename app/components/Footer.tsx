"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#000000" />
    <path d="M14.613 7.502h2.52l-5.508 6.29 6.471 8.549h-5.067l-3.968-5.187-4.531 5.187H2.01L8.01 15.25 1.745 7.5t5.195 0l3.585 4.755 4.088-4.753zm-.883 13.332h1.396L7.332 8.924H5.83l7.9 11.91z" fill="#ffffff" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="igBg" x1="0%" x2="100%" y1="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="5" fill="url(#igBg)" />
    <path d="M12 7.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.4c-1.6 0-2.9-1.3-2.9-2.9s1.3-2.9 2.9-2.9 2.9 1.3 2.9 2.9-1.3 2.9-2.9 2.9z" fill="#fff" />
    <circle cx="16.5" cy="7.5" r="1.1" fill="#fff" />
    <path d="M16.9 5.5H7.1c-1.1 0-2 .9-2 2v9.8c0 1.1.9 2 2 2h9.8c1.1 0 2-.9 2-2V7.5c0-1.1-.9-2-2-2zm1.6 11.8c0 .88-.72 1.6-1.6 1.6H7.1c-.88 0-1.6-.72-1.6-1.6V7.5c0-.88.72-1.6 1.6-1.6h9.8c.88 0 1.6.72 1.6 1.6v9.8z" fill="#fff" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
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
    { label: "About Us", href: "/about-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "FAQ", href: "/faq" },
    { label: "Site Map", href: "/site-map" },
  ]
};

export default function Footer() {
  return (
    <footer className="w-full bg-black pt-24 pb-16">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-12 lg:gap-8 overflow-hidden">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-10 bg-white px-5 py-2.5 rounded-[10px]">
              <img
                src="/admissionx-logo.png"
                className="h-8 w-auto object-contain"
                alt="AdmissionX Logo"
              />
            </Link>
            <p className="text-slate-400 font-normal leading-relaxed max-w-sm mb-12 text-[15px]">
              Your one-stop platform for college admissions, entrance exams, scholarships, and study abroad guidance.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Google" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <GoogleIcon />
              </a>
              <a href="#" aria-label="X (Twitter)" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <XIcon />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-1">
              <h4 className="text-[17px] font-normal text-white mb-10">{title}</h4>
              <ul className="space-y-5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-normal text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="mt-24 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-normal text-slate-500">
            © 2026 AdmissionX. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy-policy" className="text-sm font-normal text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="text-sm font-normal text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}




