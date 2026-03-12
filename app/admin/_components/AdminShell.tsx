"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Admin {
  id: number;
  name: string;
  email: string;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: "dashboard",       label: "Dashboard"    },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/colleges",     icon: "apartment",          label: "Colleges"      },
      { href: "/admin/students",     icon: "school",             label: "Students"      },
      { href: "/admin/applications", icon: "description",        label: "Applications"  },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blogs", icon: "article",   label: "Blogs" },
      { href: "/admin/news",  icon: "newspaper", label: "News"  },
    ],
  },
  {
    label: "Academic",
    items: [
      { href: "/admin/exams",        icon: "quiz",               label: "Exams"         },
      { href: "/admin/universities", icon: "account_balance",    label: "Universities"  },
      { href: "/admin/degrees",      icon: "workspace_premium",  label: "Degrees"       },
      { href: "/admin/courses",      icon: "menu_book",          label: "Courses"       },
      { href: "/admin/streams",      icon: "category",           label: "Streams"       },
      { href: "/admin/cities",       icon: "location_city",      label: "Cities"        },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/seo",     icon: "travel_explore",  label: "SEO"         },
      { href: "/admin/ads",     icon: "campaign",        label: "Ads"         },
      { href: "/admin/reports", icon: "bar_chart",       label: "Reports"     },
      { href: "/admin/users",   icon: "manage_accounts", label: "Admin Users" },
    ],
  },
];

// ─── Icon style helpers ───────────────────────────────────────────────────────

const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// ─── Sidebar inner content (shared between desktop + mobile overlay) ──────────

function SidebarContent({
  admin,
  pathname,
  onLogout,
}: {
  admin: Admin;
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <nav className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-white font-black text-lg tracking-tight">
            Admission<span className="text-red-400">X</span>
          </span>
          <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full tracking-wider uppercase">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href + "/")) ||
                  (item.href !== "/admin/dashboard" &&
                    pathname === item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                          : "text-white/55 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      <span
                        className="material-symbols-rounded text-[19px] flex-shrink-0"
                        style={active ? ICO_FILL : ICO}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Admin user footer */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0 space-y-1">
        {/* View site link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl text-xs font-medium transition-all"
        >
          <span className="material-symbols-rounded text-[17px]" style={ICO}>
            open_in_new
          </span>
          View Public Site
        </Link>

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {admin.name}
            </p>
            <p className="text-white/35 text-[10px] truncate leading-tight">
              {admin.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-red-400 hover:bg-red-900/20 rounded-xl text-xs font-medium transition-all"
        >
          <span className="material-symbols-rounded text-[17px]" style={ICO}>
            logout
          </span>
          Sign out
        </button>
      </div>
    </nav>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function AdminShell({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: Admin;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  }

  // Derive current page label for the topbar breadcrumb
  const currentLabel = (() => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + "/")
        ) {
          return item.label;
        }
      }
    }
    return "Admin";
  })();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-display">

      {/* ── Desktop sidebar (always visible ≥ lg) ──────────────────────────── */}
      <aside className="hidden lg:flex w-56 xl:w-60 bg-slate-900 flex-col flex-shrink-0 overflow-hidden">
        <SidebarContent admin={admin} pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile sidebar overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-slate-900 shadow-2xl">
            <SidebarContent admin={admin} pathname={pathname} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 h-14 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm z-10">

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-rounded text-[22px]" style={ICO}>
              menu
            </span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              AdmissionX
            </span>
            <span className="text-slate-300 hidden sm:block">/</span>
            <span className="text-sm font-semibold text-slate-700 truncate">
              {currentLabel}
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Admin ID badge */}
            <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              ADX-A-{String(admin.id).padStart(4, "0")}
            </span>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-slate-200" />

            {/* Avatar + name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                {admin.name.split(" ")[0]}
              </span>
            </div>

            {/* Sign out (topbar, desktop) */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-rounded text-[16px]" style={ICO}>
                logout
              </span>
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
