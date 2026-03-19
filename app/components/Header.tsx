"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, AnimatePresence } from "framer-motion";

interface HeaderProps {
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const navLinks = [
  { label: "Top Colleges", href: "/top-colleges" },
  { label: "Universities", href: "/top-university" },
  { label: "Streams", href: "/stream" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Exams", href: "/examination" },
  { label: "Ask", href: "/ask" },
  { label: "Blogs", href: "/education-blogs" },
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
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-[#008080]/5 hover:text-[#008080] transition-colors"
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

function UserMenuDropdown({
  user,
  isOpen,
  onClose,
  onLogout,
}: {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const dashboardBase = `/dashboard/student/${user.id}`;
  const userMenuItems = [
    { label: "My Dashboard", href: dashboardBase, icon: "dashboard" },
    {
      label: "My Profile",
      href: `${dashboardBase}?tab=profile`,
      icon: "person",
    },
    {
      label: "My Applications",
      href: `${dashboardBase}?tab=applications`,
      icon: "description",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute top-full right-0 mt-2 w-60 rounded-xl bg-white shadow-2xl shadow-black/15 border border-neutral-100 overflow-hidden z-50"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 bg-[#008080]/5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#008080] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-800 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {userMenuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-[#008080]/5 hover:text-[#008080] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-neutral-400">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {/* Divider + Logout */}
          <div className="border-t border-neutral-100">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Header({ }: HeaderProps) {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [mobileSignupOpen, setMobileSignupOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const signupTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const { scrollYProgress } = useScroll();

  // ── Auth check ────────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAuthUser(data.user ?? null);
      }
    } catch {
      setAuthUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setAuthUser(null);
    router.push("/");
    router.refresh();
  };

  // ── Dropdown helpers ──────────────────────────────────────────────────────
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

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node))
        setLoginOpen(false);
      if (signupRef.current && !signupRef.current.contains(e.target as Node))
        setSignupOpen(false);
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── User initials avatar ──────────────────────────────────────────────────
  const initials = authUser
    ? authUser.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

  const firstName = authUser?.name?.split(" ")[0] ?? "";

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar h-1 fixed top-0 left-0 right-0 z-[60] origin-left"
        style={{ scaleX: scrollYProgress, backgroundColor: '#008080' }}
      />

      <motion.header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white/95 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-colors">
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
             <img src="/admissionx-logo.png" alt="AdmissionX logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center xl:gap-8 lg:gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-black uppercase tracking-widest text-slate-600 hover:text-[#008080] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#008080' }} />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {!authChecked ? (
              <div className="h-9 w-32 bg-slate-100 rounded-full animate-pulse" />
            ) : authUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: '#008080' }}>
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                    {firstName}
                  </span>
                  <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <UserMenuDropdown user={authUser} isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} onLogout={handleLogout} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div ref={loginRef} className="relative" onMouseEnter={openLogin} onMouseLeave={closeLogin}>
                  <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50">
                    Login
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  <Dropdown items={loginOptions} isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
                </div>
                <div ref={signupRef} className="relative" onMouseEnter={openSignup} onMouseLeave={closeSignup}>
                  <button 
                    className="flex items-center gap-1.5 px-6 py-2.5 text-[13px] font-black uppercase tracking-widest text-white rounded-full hover:brightness-110 transition-all duration-200 hover:shadow-lg"
                    style={{ backgroundColor: '#008080' }}
                  >
                    Signup
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${signupOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  <Dropdown items={signupOptions} isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-0 top-[88px] z-40 mx-auto w-[95%] max-w-6xl left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl lg:hidden">
            <div className="px-6 py-8 space-y-1">
              {navLinks.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={item.href} className="block py-3 text-sm font-black uppercase tracking-tighter text-slate-600 hover:text-[#008080]" onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="h-px bg-slate-100 my-4" />
              {authUser ? (
                <div className="space-y-1">
                   {/* ... */}
                   <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-3 px-2 text-sm font-bold text-rose-500 w-full text-left">
                     Sign Out
                   </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setMobileLoginOpen(!mobileLoginOpen)} className="py-3 rounded-2xl bg-slate-50 text-slate-600 text-[13px] font-black uppercase tracking-widest border border-slate-100">Login</button>
                      <button onClick={() => setMobileSignupOpen(!mobileSignupOpen)} className="py-3 rounded-2xl text-white text-[13px] font-black uppercase tracking-widest" style={{ backgroundColor: '#008080' }}>Signup</button>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
