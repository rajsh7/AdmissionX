"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { SidebarSkeleton, NAV_GROUPS, ICO, Admin } from "./Sidebar";

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
