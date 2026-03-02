"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = {
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact" },
    { label: "Help Center", href: "/help" },
    { label: "Become a Partner", href: "/partner" },
  ],
  "Top Courses": [
    { label: "Engineering", href: "/courses/engineering" },
    { label: "Management", href: "/courses/management" },
    { label: "Science", href: "/courses/science" },
    { label: "Medical", href: "/courses/medical" },
    { label: "Art & Humanities", href: "/courses/arts" },
  ],
  "Top Exams": [
    { label: "SAT", href: "/exams/sat" },
    { label: "GRE", href: "/exams/gre" },
    { label: "JEE Main", href: "/exams/jee" },
    { label: "GMAT", href: "/exams/gmat" },
    { label: "NEET", href: "/exams/neet" },
  ],
  "Study Abroad": [
    { label: "Study in USA", href: "/study-abroad/usa" },
    { label: "Study in UK", href: "/study-abroad/uk" },
    { label: "Study in Australia", href: "/study-abroad/australia" },
    { label: "Study in Canada", href: "/study-abroad/canada" },
    { label: "Study in Germany", href: "/study-abroad/germany" },
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
    <footer className="relative bg-background-dark border-t border-white/5 overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16"
        >
          {Object.entries(footerLinks).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <span className="text-lg font-bold text-white">
              Admission<span className="text-primary">x</span>
            </span>
          </Link>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Admissionx. All rights reserved.
          </p>

          <div className="flex gap-6">
            {["Privacy", "Terms", "Help"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
