"use client";
// v2 - redesign cache bust

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  theme?: "light" | "dark";
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface MegaCategory {
  label: string;
  icon: string;
  links: { label: string; href: string }[];
}

interface NavLink {
  label: string;
  href: string;
  mega?: MegaCategory[];
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Colleges",
    href: "/top-colleges",
    mega: [
      {
        label: "By Stream",
        icon: "school",
        links: [
          { label: "Engineering", href: "/top-colleges?stream=engineering" },
          { label: "MBA / Management", href: "/top-colleges?stream=management" },
          { label: "Medical", href: "/top-colleges?stream=medical" },
          { label: "Law", href: "/top-colleges?stream=law" },
          { label: "Arts & Science", href: "/top-colleges?stream=arts-science" },
          { label: "Commerce", href: "/top-colleges?stream=commerce" },
          { label: "Design", href: "/top-colleges?stream=design" },
          { label: "Pharmacy", href: "/top-colleges?stream=pharmacy" },
        ],
      },
      {
        label: "By Type",
        icon: "apartment",
        links: [
          { label: "Top Colleges", href: "/top-colleges" },
          { label: "Top Universities", href: "/top-university" },
          { label: "Government Colleges", href: "/top-colleges?ownerships=Public+%2F+Government" },
          { label: "Private Colleges", href: "/top-colleges?ownerships=Private" },
          { label: "Deemed Universities", href: "/top-university?type=deemed" },
          { label: "Central Universities", href: "/top-university?type=central" },
        ],
      },
      {
        label: "Tools",
        icon: "build",
        links: [
          { label: "Compare Colleges", href: "/compare" },
          { label: "Compare Courses", href: "/compare-course" },
          { label: "College Predictor", href: "/counselling" },
        ],
      },
    ],
  },
  {
    label: "Courses",
    href: "/careers-courses",
    mega: [
      {
        label: "By Level",
        icon: "layers",
        links: [
          { label: "UG Courses", href: "/careers-courses?level=ug" },
          { label: "PG Courses", href: "/careers-courses?level=pg" },
          { label: "Diploma Courses", href: "/careers-courses?level=diploma" },
          { label: "Certificate Courses", href: "/careers-courses?level=certificate" },
          { label: "PhD / Doctorate", href: "/careers-courses?level=phd" },
        ],
      },
      {
        label: "Popular Courses",
        icon: "trending_up",
        links: [
          { label: "B.Tech", href: "/careers-courses/btech" },
          { label: "MBA", href: "/careers-courses/mba" },
          { label: "MBBS", href: "/careers-courses/mbbs" },
          { label: "BCA", href: "/careers-courses/bca" },
          { label: "BBA", href: "/careers-courses/bba" },
          { label: "B.Com", href: "/careers-courses/bcom" },
          { label: "LLB", href: "/careers-courses/llb" },
          { label: "B.Sc", href: "/careers-courses/bsc" },
        ],
      },
      {
        label: "By Career",
        icon: "work",
        links: [
          { label: "Popular Careers", href: "/popular-careers" },
          { label: "Career Guidance", href: "/counselling" },
        ],
      },
    ],
  },
  {
    label: "Exams",
    href: "/examination",
    mega: [
      {
        label: "Engineering",
        icon: "engineering",
        links: [
          { label: "JEE Main", href: "/examination/engineering" },
          { label: "JEE Advanced", href: "/examination/engineering" },
          { label: "BITSAT", href: "/examination/engineering" },
          { label: "VITEEE", href: "/examination/engineering" },
        ],
      },
      {
        label: "Management",
        icon: "business_center",
        links: [
          { label: "CAT", href: "/examination/management" },
          { label: "MAT", href: "/examination/management" },
          { label: "XAT", href: "/examination/management" },
          { label: "SNAP", href: "/examination/management" },
        ],
      },
      {
        label: "Medical",
        icon: "medical_services",
        links: [
          { label: "NEET UG", href: "/examination/medical" },
          { label: "NEET PG", href: "/examination/medical" },
          { label: "AIIMS", href: "/examination/medical" },
        ],
      },
      {
        label: "Law & Others",
        icon: "gavel",
        links: [
          { label: "CLAT", href: "/examination/law" },
          { label: "LSAT", href: "/examination/law" },
          { label: "All Exams", href: "/examination" },
        ],
      },
    ],
  },
  { label: "Study Abroad", href: "/study-abroad" },
  {
    label: "More",
    href: "#",
    mega: [
      {
        label: "Resources",
        icon: "library_books",
        links: [
          { label: "News & Articles", href: "/news" },
          { label: "Latest Blogs", href: "/blogs" },
          { label: "Boards", href: "/boards" },
        ],
      },
      {
        label: "Help",
        icon: "support_agent",
        links: [
          { label: "Counselling", href: "/counselling" },
          { label: "Help Center", href: "/help-center" },
          { label: "Contact Us", href: "/contact-us" },
        ],
      },
    ],
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
          className="absolute top-full right-0 mt-2 w-52 rounded-[10px] bg-white shadow-2xl shadow-black/15 border border-neutral-100 overflow-hidden z-50"
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-[16px] font-normal text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
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
          className="absolute top-full right-0 mt-2 w-60 rounded-[10px] bg-white shadow-2xl shadow-black/15 border border-neutral-100 overflow-hidden z-50"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 bg-primary/5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-normal shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-normal text-neutral-800 truncate">
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
              className="flex items-center gap-3 px-4 py-3 text-[16px] font-normal text-neutral-700 hover:bg-primary/5 hover:text-primary transition-colors"
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
              className="w-full flex items-center gap-3 px-4 py-3 text-[16px] font-normal text-rose-600 hover:bg-rose-50 transition-colors"
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

export default function Header({ theme }: HeaderProps) {
  // Trigger cache invalidation for hydration mismatch
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [mobileSignupOpen, setMobileSignupOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<Record<string, string>>({});

  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const signupTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Auth check ────────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "default",
        headers: { "Cache-Control": "max-age=30" },
      });
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
    setMounted(true);
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // If theme is specifically "dark", we don't strictly need to track scroll for color,
    // but we can still track it for shrinking padding.
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkAuth]);

  // Determine if we should show the "active/scrolled" state (white bg, dark text)
  const showActiveState = theme === "dark" || isScrolled;

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
      {/* Scroll Progress Bar — CSS only, no framer-motion overhead */}
      {mounted && (
        <div className="scroll-progress-bar fixed top-0 left-0 right-0 z-[60] h-[3px]" />
      )}

      <motion.header 
        className={`site-header fixed top-0 left-0 right-0 z-[100] w-full flex items-center transition-all duration-300 min-h-[58px] ${
          isScrolled
            ? "bg-white shadow-[0_4px_30px_rgba(0,0,0,0.08)] py-2 border-b border-neutral-100"
            : "bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.05)] py-3"
        }`}
      >
        <div className="home-page-shell flex w-full items-center justify-between">
          {/* Logo Area */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/admissionx-logo.png" alt="AdmissionX" className="h-6 sm:h-7 w-auto object-contain bg-transparent mix-blend-multiply" />
            </Link>
          </div>

          {/* Right Side: Nav + Actions */}
          <div className="hidden lg:flex items-center gap-10">
          {/* Nav Links Area */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const activeCat = hoveredCat[link.label] ?? link.mega?.[0]?.label ?? "";
                const activeCatData = link.mega?.find(c => c.label === activeCat) ?? link.mega?.[0];
                return (
                  <div
                    key={link.label}
                    className="relative group/nav"
                    onMouseLeave={() => setHoveredCat(p => ({ ...p, [link.label]: link.mega?.[0]?.label ?? "" }))}
                  >
                    <Link
                      href={link.href}
                      prefetch={true}
                      className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors text-slate-700 hover:text-primary"
                    >
                      {link.label}
                      {link.mega && mounted && (
                        <span className="material-symbols-outlined text-[17px] text-slate-300 group-hover/nav:text-primary transition-transform duration-200 group-hover/nav:rotate-180">
                          expand_more
                        </span>
                      )}
                    </Link>

                    {link.mega && (
                      <div
                        className="fixed left-0 right-0 pt-1 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-200 z-50"
                        style={{ top: isScrolled ? '54px' : '60px' }}
                      >
                        <div className="max-w-[1200px] mx-auto px-4">
                          <div className="bg-white rounded-[12px] shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden flex min-h-[200px]">
                            {/* Left: Categories */}
                            <div className="w-[200px] shrink-0 bg-slate-50 border-r border-slate-100 py-3">
                              {link.mega.map((cat) => {
                                const isActive = activeCat === cat.label;
                                return (
                                  <div
                                    key={cat.label}
                                    onMouseEnter={() => setHoveredCat(p => ({ ...p, [link.label]: cat.label }))}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 cursor-default transition-colors ${
                                      isActive ? "bg-white border-l-2 border-primary" : "hover:bg-white border-l-2 border-transparent"
                                    }`}
                                  >
                                    {mounted && (
                                      <span className={`material-symbols-outlined text-[17px] transition-colors ${
                                        isActive ? "text-primary" : "text-slate-400"
                                      }`}>
                                        {cat.icon}
                                      </span>
                                    )}
                                    <span className={`text-[13px] font-semibold transition-colors ${
                                      isActive ? "text-primary" : "text-slate-600"
                                    }`}>
                                      {cat.label}
                                    </span>
                                    <span className="material-symbols-outlined text-[14px] text-slate-300 ml-auto">chevron_right</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Right: Only active category links */}
                            <div className="flex-1 p-5">
                              {activeCatData && (
                                <>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                    {activeCatData.label}
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                    {activeCatData.links.map((lnk) => (
                                      <Link
                                        key={lnk.label}
                                        href={lnk.href}
                                        className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                        {lnk.label}
                                      </Link>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Area (Actions) */}
            <div className="flex items-center gap-3">
              {(!mounted || !authChecked) ? (
                <div className="h-9 w-24 bg-slate-100 rounded-full animate-pulse" />
              ) : authUser ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    <span className="text-[14px] font-normal">Account</span>
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
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] transition-all font-medium text-[16px] text-slate-700 hover:bg-slate-50"
                    >
                      Login
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    <Dropdown items={loginOptions} isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
                  </div>

                   {/* Sign Up Dropdown */}
                   <div ref={signupRef} className="relative" onMouseEnter={openSignup} onMouseLeave={closeSignup}>
                     <button
                       className="flex items-center gap-1.5 px-6 py-2.5 rounded-[5px] text-white hover:bg-neutral-800 transition-all shadow-md font-medium text-[16px]"
                       style={{ backgroundColor: 'rgba(34, 34, 34, 1)' }}
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

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full transition-all text-slate-700 hover:bg-slate-50">
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[98] lg:hidden backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[99] w-[85%] max-w-sm bg-white shadow-2xl lg:hidden h-full"
            >
              <div className="absolute inset-0 flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white z-10">
                  <span className="text-lg font-bold text-slate-800 tracking-tight">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 pb-28 space-y-1">
              {navLinks.map((item) => {
                const isExpanded = expandedMobileItem === item.label;
                const allSubLinks = item.mega?.flatMap(cat => cat.links) ?? [];
                return (
                  <div key={item.label} className="flex flex-col">
                    <div className="flex items-center justify-between py-3">
                      {item.mega ? (
                        <button
                          className="flex-1 text-left text-[16px] font-medium text-slate-800 uppercase tracking-tight flex items-center justify-between"
                          onClick={() => setExpandedMobileItem(isExpanded ? null : item.label)}
                        >
                          {item.label}
                          <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 p-1 hover:bg-slate-50 rounded-[10px] ${isExpanded ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex-1 text-[16px] font-medium text-slate-800 uppercase tracking-tight"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                    {item.mega && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50 rounded-2xl"
                          >
                            <div className="py-2 px-3 space-y-1">
                              {allSubLinks.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-normal text-slate-600 hover:text-primary transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}

              <div className="h-px bg-slate-100 my-4" />

              {authUser ? (
                <div className="space-y-1">
                  <Link
                    href={
                      authUser.role?.toLowerCase() === "admin"
                        ? "/admin"
                        : authUser.role?.toLowerCase() === "college"
                          ? `/dashboard/college/${authUser.id}`
                          : `/dashboard/student/${authUser.id}`
                    }
                    className="flex items-center gap-3 px-3 py-4 text-sm font-normal text-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-primary">
                      {authUser.role?.toLowerCase() === "admin" ? "admin_panel_settings" : "dashboard"}
                    </span>
                    {authUser.role?.toLowerCase() === "admin" ? "Admin Dashboard" : authUser.role?.toLowerCase() === "college" ? "College Dashboard" : "My Dashboard"}
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-4 px-3 text-sm font-normal text-rose-500 w-full text-left">
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setMobileLoginOpen(!mobileLoginOpen);
                        if (mobileSignupOpen) setMobileSignupOpen(false);
                      }}
                      className="flex items-center justify-center gap-1 py-3.5 rounded-[10px] bg-slate-50 text-slate-800 text-[16px] font-medium border border-slate-100 shadow-sm"
                    >
                      Login
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${mobileLoginOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileSignupOpen(!mobileSignupOpen);
                        if (mobileLoginOpen) setMobileLoginOpen(false);
                      }}
                      className="flex items-center justify-center gap-1 py-3.5 rounded-[5px] text-white text-[16px] font-medium shadow-md"
                      style={{ backgroundColor: 'rgba(34, 34, 34, 1)' }}
                    >
                      Sign Up
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${mobileSignupOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {(mobileLoginOpen || mobileSignupOpen) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 rounded-2xl"
                      >
                        <div className="py-2 px-3 space-y-1">
                          {(mobileLoginOpen ? loginOptions : signupOptions).map((opt) => (
                            <Link
                              key={opt.label}
                              href={opt.href}
                              className="flex items-center gap-3 px-3 py-3 text-[16px] font-normal text-slate-600 hover:text-primary transition-colors"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileLoginOpen(false);
                                setMobileSignupOpen(false);
                              }}
                            >
                              {mounted && (
                                <span className="material-symbols-outlined text-[18px] text-slate-400">
                                  {opt.icon}
                                </span>
                              )}
                              {opt.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



