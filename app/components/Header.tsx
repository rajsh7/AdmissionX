"use client";
// v2 - redesign cache bust

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
  { label: "Home", href: "/" },
  { label: "Top colleges", href: "/top-colleges" },
  { label: "Top Courses", href: "/courses" },
  {
    label: "Study Abroad",
    href: "/study-abroad",
    subItems: [
      { label: "UK", href: "/study-abroad/uk", icon: "public" },
      { label: "USA", href: "/study-abroad/usa", icon: "public" },
      { label: "Canada", href: "/study-abroad/canada", icon: "public" },
      { label: "Australia", href: "/study-abroad/australia", icon: "public" },
    ]
  },
  {
    label: "More",
    href: "#",
    subItems: [
      { label: "Counselling", href: "/counselling", icon: "support_agent" },
      { label: "Examination", href: "/examination", icon: "engineering" },
      { label: "Top Universities", href: "/top-university", icon: "school" },
      { label: "Streams", href: "/stream", icon: "grid_view" },
      { label: "News & Articles", href: "/news", icon: "newspaper" },
      { label: "Latest Blogs", href: "/blog", icon: "article" },
    ]
  },
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
  const role = user.role?.toLowerCase() || "student";
  let dashboardBase = `/dashboard/student/${user.id}`;
  let userMenuItems = [];

  if (role === "admin") {
    dashboardBase = `/admin`;
    userMenuItems = [
      { label: "Admin Dashboard", href: dashboardBase, icon: "admin_panel_settings" },
    ];
  } else if (role === "college") {
    dashboardBase = `/dashboard/college/${user.id}`;
    userMenuItems = [
      { label: "College Dashboard", href: dashboardBase, icon: "dashboard" },
      { label: "College Profile", href: `${dashboardBase}?tab=profile`, icon: "domain" },
    ];
  } else {
    userMenuItems = [
      { label: "My Dashboard", href: dashboardBase, icon: "dashboard" },
      { label: "My Profile", href: `${dashboardBase}?tab=profile`, icon: "person" },
      { label: "My Applications", href: `${dashboardBase}?tab=applications`, icon: "description" },
    ];
  }

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
  // Trigger cache invalidation for hydration mismatch
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
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

      <motion.header className="fixed top-0 left-0 right-0 z-50 w-full min-h-[80px] flex items-center bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-colors">
        <div className="flex items-center justify-between px-6 sm:px-12 w-full max-w-[1920px] mx-auto">
          {/* Logo Area */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/admissionx-v2-logo.png" alt="AdmissionX logo" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* Right Side: Nav + Actions */}
          <div className="hidden lg:flex items-center gap-10">
            {/* Nav Links Area */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group/nav">
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold text-slate-700 hover:text-[#008080] transition-colors relative"
                  >
                    {link.label}
                    {link.subItems && (
                      <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover/nav:text-[#008080] transition-colors">
                        expand_more
                      </span>
                    )}
                  </Link>

                  {link.subItems && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 pt-3 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-50 overflow-hidden py-1.5">
                        {link.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-[#008080]/5 hover:text-[#008080] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px] text-slate-400">
                              {sub.icon}
                            </span>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Area (Actions) */}
            <div className="flex items-center gap-3">
              <button className="text-slate-500 hover:text-[#008080] transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-50">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              {!authChecked ? (
                <div className="h-9 w-24 bg-slate-100 rounded-full animate-pulse" />
              ) : authUser ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    <span className="text-[14px] font-bold">Account</span>
                    <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  <UserMenuDropdown user={authUser} isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Login Dropdown */}
                  <div ref={loginRef} className="relative" onMouseEnter={openLogin} onMouseLeave={closeLogin}>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-slate-700 hover:bg-slate-50 transition-all font-bold text-[15px]"
                    >
                      Login
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    <Dropdown items={loginOptions} isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
                  </div>

                  {/* Sign Up Dropdown */}
                  <div ref={signupRef} className="relative" onMouseEnter={openSignup} onMouseLeave={closeSignup}>
                    <button
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/10 font-bold text-[14px]"
                    >
                      Sign Up
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${signupOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    <Dropdown items={signupOptions} isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
                  </div>
                </div>
              )}
            </div>
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
              {navLinks.map((item, i) => {
                const isExpanded = expandedMobileItem === item.label;
                return (
                  <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between py-3">
                        <Link
                          href={item.href}
                          className="text-sm font-bold text-slate-800 uppercase tracking-tight"
                          onClick={() => {
                            if (!item.subItems) setMobileMenuOpen(false);
                            else setExpandedMobileItem(isExpanded ? null : item.label);
                          }}
                        >
                          {item.label}
                        </Link>
                        {item.subItems && (
                          <button
                            onClick={() => setExpandedMobileItem(isExpanded ? null : item.label)}
                            className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                              expand_more
                            </span>
                          </button>
                        )}
                      </div>

                      {item.subItems && (
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-slate-50/50 rounded-2xl"
                            >
                              <div className="py-2 px-3 space-y-1">
                                {item.subItems.map((sub) => (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    className="flex items-center gap-3 px-3 py-3 text-[13px] font-medium text-slate-600 hover:text-teal-600 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                                      {sub.icon}
                                    </span>
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              <div className="h-px bg-slate-100 my-4" />

              {authUser ? (
                <div className="space-y-1">
<<<<<<< HEAD
                  <Link
                    href={`/dashboard/student/${authUser?.id}`}
                    className="flex items-center gap-3 px-3 py-4 text-sm font-bold text-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[#008080]">dashboard</span>
                    My Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-4 px-3 text-sm font-bold text-rose-500 w-full text-left">
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
=======
                   <Link 
                     href={
                       authUser.role?.toLowerCase() === "admin" 
                         ? "/admin" 
                         : authUser.role?.toLowerCase() === "college" 
                           ? `/dashboard/college/${authUser.id}` 
                           : `/dashboard/student/${authUser.id}`
                     }
                     className="flex items-center gap-3 px-3 py-4 text-sm font-bold text-slate-800"
                     onClick={() => setMobileMenuOpen(false)}
                   >
                     <span className="material-symbols-outlined text-teal-600">
                       {authUser.role?.toLowerCase() === "admin" ? "admin_panel_settings" : "dashboard"}
                     </span>
                     {authUser.role?.toLowerCase() === "admin" ? "Admin Dashboard" : authUser.role?.toLowerCase() === "college" ? "College Dashboard" : "My Dashboard"}
                   </Link>
                   <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-4 px-3 text-sm font-bold text-rose-500 w-full text-left">
                     <span className="material-symbols-outlined">logout</span>
                     Sign Out
                   </button>
>>>>>>> bbebef06cf6a0b699f51eed9c84a8156e9056444
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login/student"
                      className="flex items-center justify-center py-3.5 rounded-2xl bg-slate-50 text-slate-800 text-[13px] font-bold border border-slate-100 shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup/student"
                      className="flex items-center justify-center py-3.5 rounded-2xl text-white text-[13px] font-bold shadow-lg shadow-teal-500/20"
                      style={{ backgroundColor: '#008080' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
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
