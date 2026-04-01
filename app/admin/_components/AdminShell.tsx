"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { NAV_GROUPS } from "./nav-config";
import { Admin, SidebarSkeleton, ICO } from "./Sidebar";

// ─── Dynamic components ────────────────────────────────────────────────────────

const SidebarContent = dynamic(() => import("./Sidebar").then(mod => mod.SidebarContent), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
});

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
  const router = useRouter();

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
    // 1st pass: Search for exact sub-item matches across all groups
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.subItems) {
          for (const sub of item.subItems) {
            if (pathname === sub.href) {
              return `${item.label} / ${sub.label}`;
            }
          }
        }
      }
    }

    // 2nd pass: Search for exact main item matches
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (pathname === item.href) return item.label;
      }
    }

    // 3rd pass: Fallback to startsWith for nested functional pages
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href + "/")) {
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

          {/* Search bar (Mockup) */}
          <div className="flex-1 flex items-center px-4">
            <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-lg w-full max-w-md">
              <span className="material-symbols-rounded text-[20px]" style={ICO}>search</span>
              <input 
                type="text" 
                placeholder="Location, universities, courses..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-5 flex-shrink-0 pr-2">
            
            {/* Action Icons */}
            <div className="flex items-center gap-3 text-slate-600">
              <button className="hover:text-slate-900 transition-colors p-1">
                <span className="material-symbols-rounded text-[24px]" style={ICO}>chat_bubble_outline</span>
              </button>
              <button className="hover:text-slate-900 transition-colors p-1 relative">
                <span className="material-symbols-rounded text-[24px]" style={ICO}>notifications</span>
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  3
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-300" />

            {/* Avatar + name */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded bg-slate-200 overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center text-slate-500 font-bold overflow-hidden relative">
                 {/* Provide fallback initials if no image */}
                 <span className="absolute z-0">{admin.name.charAt(0).toUpperCase()}</span>
                 {/* Pretend we have a user avatar image to match the mockup */}
                 <img src="/api/image-proxy?url=https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="" className="w-full h-full object-cover z-10" />
              </div>
              <div className="flex items-center gap-1 text-slate-600 group-hover:text-slate-900 transition-colors">
                <span className="hidden sm:block text-sm font-semibold">
                  Admin
                </span>
                <span className="material-symbols-rounded text-[18px]" style={ICO}>expand_more</span>
              </div>
            </div>

            {/* Hidden logout for functional completeness */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="hidden"
            >
              Sign out
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




