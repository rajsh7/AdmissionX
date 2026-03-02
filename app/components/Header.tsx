"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const navLinks = [
  { label: "Colleges", href: "/colleges" },
  { label: "Courses", href: "/courses" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Exams", href: "/exams" },
  { label: "News", href: "/news" },
];

const loginOptions = [
  { label: "Student Login", href: "/login/student", icon: "school" },
  { label: "College Login", href: "/login/college", icon: "apartment" },
  { label: "Admin Login", href: "/login/admin", icon: "admin_panel_settings" },
];

const signupOptions = [
  { label: "Student Signup", href: "/signup/student", icon: "person_add" },
  { label: "College Signup", href: "/signup/college", icon: "domain_add" },
];

function Dropdown({
  items,
  isOpen,
  onClose,
}: {
  items: { label: string; href: string; icon: string }[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute top-full right-0 mt-2 w-52 rounded-xl bg-white shadow-2xl shadow-black/15 border border-neutral-100 overflow-hidden z-50"
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-neutral-400">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [mobileSignupOpen, setMobileSignupOpen] = useState(false);

  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const loginTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const signupTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(
    scrollYProgress,
    [0, 0.02],
    ["rgba(10,10,10,0)", "rgba(10,10,10,0.85)"]
  );
  const headerBorder = useTransform(
    scrollYProgress,
    [0, 0.02],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]
  );

  const openLogin = () => {
    if (loginTimer.current) clearTimeout(loginTimer.current);
    setSignupOpen(false);
    setLoginOpen(true);
  };
  const closeLogin = () => {
    loginTimer.current = setTimeout(() => setLoginOpen(false), 150);
  };
  const openSignup = () => {
    if (signupTimer.current) clearTimeout(signupTimer.current);
    setLoginOpen(false);
    setSignupOpen(true);
  };
  const closeSignup = () => {
    signupTimer.current = setTimeout(() => setSignupOpen(false), 150);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
      if (signupRef.current && !signupRef.current.contains(e.target as Node)) {
        setSignupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: scrollYProgress }}
      />

      <motion.header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-lg shadow-black/20 transition-colors"
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white overflow-hidden">
              <span className="material-symbols-outlined text-xl relative z-10">school</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent-violet opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Admission<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions — Login & Signup Dropdowns */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Login Dropdown */}
            <div
              ref={loginRef}
              className="relative"
              onMouseEnter={openLogin}
              onMouseLeave={closeLogin}
            >
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/5">
                Login
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              <Dropdown items={loginOptions} isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>

            {/* Signup Dropdown */}
            <div
              ref={signupRef}
              className="relative"
              onMouseEnter={openSignup}
              onMouseLeave={closeSignup}
            >
              <button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25">
                Signup
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${signupOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              <Dropdown items={signupOptions} isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[80px] z-40 mx-auto w-[95%] max-w-6xl left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 lg:hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="block py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/10 my-3" />

              {/* Mobile Login Accordion */}
              <div>
                <button
                  onClick={() => setMobileLoginOpen(!mobileLoginOpen)}
                  className="flex items-center justify-between w-full py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${mobileLoginOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {mobileLoginOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pb-2 space-y-1">
                        {loginOptions.map((opt) => (
                          <Link
                            key={opt.label}
                            href={opt.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {opt.icon}
                            </span>
                            {opt.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Signup Accordion */}
              <div>
                <button
                  onClick={() => setMobileSignupOpen(!mobileSignupOpen)}
                  className="flex items-center justify-between w-full py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Signup
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${mobileSignupOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {mobileSignupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pb-2 space-y-1">
                        {signupOptions.map((opt) => (
                          <Link
                            key={opt.label}
                            href={opt.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {opt.icon}
                            </span>
                            {opt.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
