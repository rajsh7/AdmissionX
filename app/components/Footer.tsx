"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const footerLinks = {
  "Discover": [
    { label: "Universities", href: "/search" },
    { label: "Courses", href: "/search" },
    { label: "Scholarship", href: "/search" }, // Fallback to search if specific page missing
    { label: "Study Abroad", href: "/study-abroad" },
  ],
  "Exams": [
    { label: "GRE Prep", href: "/examination/study-abroad/gre" },
    { label: "GMAT Prep", href: "/examination/study-abroad/gmat" },
    { label: "IELTS/TOEFL", href: "/examination/study-abroad/ielts-toefl" },
    { label: "Mock Tests", href: "/examination" },
  ],
  "Resources": [
    { label: "Blogs", href: "/blogs" },
    { label: "News", href: "/news" },
    { label: "Career Guide", href: "/careers" },
    { label: "Community", href: "/" },
  ],
  "Legal": [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Use", href: "/terms-and-conditions" },
    { label: "Cookies Policy", href: "/privacy-policy" },
    { label: "Support", href: "/contact-us" },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#F8F9FA] rounded-t-[40px] pt-20 pb-16">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 overflow-hidden">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-8">
               <img
                src="/admissionx-v2-logo.png"
                className="h-10 w-auto object-contain"
                alt="AdmissionX Logo"
              />
            </Link>
            <p className="text-slate-600 font-medium leading-relaxed max-w-sm mb-10 text-[15px]">
               Your one-stop platform for college admissions, entrance exams, scholarships, and study abroad guidance.
            </p>
            <div className="flex items-center gap-4">
               {[
                 { id: 'google', icon: 'google' },
                 { id: 'twitter', icon: 'x-twitter' },
                 { id: 'instagram', icon: 'instagram' },
                 { id: 'facebook', icon: 'facebook-f' }
               ].map(social => (
                 <button 
                  key={social.id} 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 transition-all hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:-translate-y-1 shadow-sm"
                 >
                    <i className={`fab fa-${social.icon} text-[18px]`}></i>
                 </button>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-1">
              <h4 className="text-[17px] font-black text-slate-900 mb-8">{title}</h4>
              <ul className="space-y-4">
                {links.map(link => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-[15px] font-semibold text-slate-500 hover:text-teal-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar (Optional based on image, keeping minimal) */}
        <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-400">
            © 2026 AdmissionX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
