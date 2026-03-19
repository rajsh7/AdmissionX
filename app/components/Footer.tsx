"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const footerLinks = {
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Top Colleges", href: "/top-colleges" },
    { label: "Top Universities", href: "/top-university" },
    { label: "Latest News", href: "/news" },
    { label: "Education Blogs", href: "/education-blogs" },
    { label: "Contact Us", href: "/contact-us" },
  ],
  "Top Streams": [
    { label: "Engineering", href: "/search?stream=engineering" },
    { label: "Management / MBA", href: "/search?stream=management" },
    { label: "Medical & Pharmacy", href: "/search?stream=medical" },
    { label: "Science", href: "/search?stream=science" },
    { label: "Commerce", href: "/search?stream=commerce" },
    { label: "Arts & Humanities", href: "/search?stream=arts" },
  ],
  "Top Exams": [
    { label: "Engineering Exams", href: "/examination/engineering" },
    { label: "Medical Exams", href: "/examination/medical" },
    { label: "Management Exams", href: "/examination/management" },
    { label: "Law Exams", href: "/examination/law" },
    { label: "Science Exams", href: "/examination/science" },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
               <Image 
                 src="/admissionx-logo.png"
                 alt="AdmissionX Logo"
                 width={180}
                 height={40}
                 className="h-10 w-auto object-contain"
                 unoptimized
               />
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed max-w-sm mb-8">
               Empowering students to find their perfect educational path. 
               The leading platform for global admissions and counseling.
            </p>
            <div className="flex items-center gap-3">
               {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map(social => (
                 <button key={social} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 transition-all hover:bg-teal hover:text-white hover:border-teal hover:-translate-y-1">
                    <i className={`fab fa-${social} text-sm`}></i>
                 </button>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{title}</h4>
              <ul className="space-y-4">
                {links.map(link => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm font-bold text-slate-500 hover:text-teal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © 2026 AdmissionX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-teal uppercase tracking-widest">Privacy Policy</Link>
            <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-teal uppercase tracking-widest">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
