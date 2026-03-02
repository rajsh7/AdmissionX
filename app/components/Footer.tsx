"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = {
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact" },
    { label: "Latest Updates", href: "/news" },
    { label: "Help Center", href: "/help" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Refunds Policy", href: "/refunds-policy" },
  ],
  "Top Courses": [
    { label: "Engineering", href: "/courses/engineering" },
    { label: "Commerce", href: "/courses/commerce" },
    { label: "Management", href: "/courses/management" },
    { label: "Science", href: "/courses/science" },
    { label: "Medical", href: "/courses/medical" },
    { label: "Law", href: "/courses/law" },
    { label: "Computer Applications", href: "/courses/computer-applications" },
    { label: "Architecture", href: "/courses/architecture" },
  ],
  "Top Exams": [
    { label: "Engineering Exam", href: "/exams/engineering" },
    { label: "Commerce Exam", href: "/exams/commerce" },
    { label: "Arts Exam", href: "/exams/arts" },
    { label: "Science Exam", href: "/exams/science" },
    { label: "Medical Exam", href: "/exams/medical" },
    { label: "Management Exam", href: "/exams/management" },
    { label: "Law Exam", href: "/exams/law" },
    { label: "All Examination", href: "/exams" },
  ],
  "Study Abroad": [
    { label: "United States", href: "/study-abroad/usa" },
    { label: "United Kingdom", href: "/study-abroad/uk" },
    { label: "Australia", href: "/study-abroad/australia" },
    { label: "Canada", href: "/study-abroad/canada" },
    { label: "Philippines", href: "/study-abroad/philippines" },
    { label: "Japan", href: "/study-abroad/japan" },
    { label: "Singapore", href: "/study-abroad/singapore" },
    { label: "Study Abroad Home", href: "/study-abroad" },
  ],
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Footer() {
  return (
    <footer className="relative bg-background-dark overflow-hidden">
      <div className="relative z-10 w-full px-2 sm:px-3 py-10 lg:py-14">
        {/* ─── Rounded Card Container ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="bg-neutral-800 rounded-3xl overflow-hidden border border-white/5"
        >
          {/* Top Section: Logo + Links */}
          <div className="px-8 sm:px-10 lg:px-14 pt-12 lg:pt-16 pb-10">
            {/* Brand */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-12">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white">
                  <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <span className="text-xl font-bold text-white">
                  Admission<span className="text-red-500">X</span>
                </span>
              </Link>

              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                Your one-stop platform for college admissions, entrance exams, 
                scholarships, and study abroad guidance.
              </p>
            </div>

            {/* Links Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
            >
              {Object.entries(footerLinks).map(([title, links]) => (
                <motion.div key={title} variants={itemVariants}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                    {title}
                  </h3>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-neutral-400 hover:text-red-400 transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="border-t border-white/10 px-8 sm:px-10 lg:px-14 py-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-neutral-500 text-center sm:text-left">
              Copyright © 2026 – 2027 | All Rights Reserved.
              <span className="font-semibold text-white ml-1">
                Admission<span className="text-red-500">X</span>
              </span>
            </p>

            <div className="flex items-center gap-4">
              {[
                { icon: "language", href: "https://admissionx.com", label: "Website" },
                { icon: "mail", href: "mailto:info@admissionx.com", label: "Email" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-neutral-400 hover:text-red-400 transition-colors">
                    {social.icon}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
