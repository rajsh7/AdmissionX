"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  subItems?: { href: string; label: string }[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Navigation config ────────────────────────────────────────────────────────

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/admin/colleges",
        icon: "apartment",
        label: "Colleges",
        subItems: [
          { href: "/admin/colleges/contact", label: "College Contact Card" },
          { href: "/admin/colleges/profile", label: "Profile Information" },
          { href: "/admin/colleges/management", label: "College Management Information" },
          { href: "/admin/colleges/courses", label: "College Course" },
          { href: "/admin/colleges/events", label: "College Events" },
          { href: "/admin/colleges/facilities", label: "College Facilities" },
          { href: "/admin/colleges/faculty", label: "College Faculty" },
          { href: "/admin/colleges/placements", label: "College Placement" },
          { href: "/admin/colleges/scholarships", label: "College Scholarship" },
          { href: "/admin/colleges/cut-offs", label: "College Cut Offs" },
          { href: "/admin/colleges/sports", label: "College Sports & Activity" },
          { href: "/admin/colleges/admission", label: "College Admission Procedure" },
          { href: "/admin/colleges/reviews", label: "College Reviews" },
          { href: "/admin/colleges/faqs", label: "College Faqs" },
        ],
      },
      {
        href: "/admin/students",
        icon: "school",
        label: "Students",
        subItems: [
          { href: "/admin/students/profile", label: "Profile Information" },
          { href: "/admin/students/bookmarks", label: "Bookmarks" },
        ],
      },
      {
        href: "/admin/members",
        icon: "groups",
        label: "Members",
        subItems: [
          { href: "/admin/members/users", label: "Users" },
          { href: "/admin/members/roles", label: "User Roles" },
          { href: "/admin/members/status", label: "User Status" },
          { href: "/admin/members/privilege", label: "User Privilege" },
          { href: "/admin/members/groups", label: "User Group" },
        ],
      },

      { href: "/admin/applications", icon: "description", label: "Applications" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blogs", icon: "article", label: "Blogs" },
      { href: "/admin/news", icon: "newspaper", label: "News" },
    ],
  },
  {
    label: "Academic",
    items: [
      { href: "/admin/exams", icon: "quiz", label: "Exams" },
      { href: "/admin/universities", icon: "account_balance", label: "Universities" },
      { href: "/admin/degrees", icon: "workspace_premium", label: "Degrees" },
      { href: "/admin/courses", icon: "menu_book", label: "Courses" },
      { href: "/admin/streams", icon: "category", label: "Streams" },
      { href: "/admin/cities", icon: "location_city", label: "Cities" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/seo", icon: "travel_explore", label: "SEO" },
      { href: "/admin/ads", icon: "campaign", label: "Ads" },
      { href: "/admin/reports", icon: "bar_chart", label: "Reports" },
      { href: "/admin/users", icon: "manage_accounts", label: "Admin Users" },
    ],
  },
];

// ─── Icon style helpers ───────────────────────────────────────────────────────

export const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
export const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// ─── Sidebar inner content (shared between desktop + mobile overlay) ──────────

export function SidebarSkeleton() {
  return (
    <nav className="flex flex-col h-full select-none animate-pulse">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-32 bg-white/10 rounded" />
        </div>
      </div>

      {/* Nav groups skeleton */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 bg-white/5 rounded ml-3" />
            <div className="space-y-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0 space-y-3">
        <div className="h-8 w-full bg-white/5 rounded-xl" />
        <div className="flex items-center gap-3 px-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-2 w-24 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-8 w-full bg-white/10 rounded-xl" />
      </div>
    </nav>
  );
}

export function SidebarContent({
  admin,
  pathname,
  onLogout,
}: {
  admin: Admin;
  pathname: string;
  onLogout: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
                const hasSubItems = !!(item.subItems && item.subItems.length > 0);
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
                const isItemActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
                const active = isItemActive || isSubItemActive;

                const isExpanded = expandedItems[item.label] || isSubItemActive;

                return (
                  <li key={item.href}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
                            ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                            : "text-white/55 hover:text-white hover:bg-white/8"
                            }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span
                              className="material-symbols-rounded text-[19px] flex-shrink-0"
                              style={active ? ICO_FILL : ICO}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span
                            className={`material-symbols-rounded text-base transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            style={active ? ICO_FILL : ICO}
                          >
                            expand_more
                          </span>
                        </button>

                        {isExpanded && (
                          <ul className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-0.5">
                            {item.subItems?.map((sub) => {
                              const subActive = pathname === sub.href;
                              return (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    className={`flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${subActive
                                      ? "text-red-400 bg-red-400/10"
                                      : "text-white/40 hover:text-white hover:bg-white/5"
                                      }`}
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
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
                    )}
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
