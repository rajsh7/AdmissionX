"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Admin {
  id: string;
  name: string;
  email: string;
}

import { NavItem, NavGroup, NAV_GROUPS } from "./nav-config";
export type { NavItem, NavGroup };
export { NAV_GROUPS };

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
        {[1, 2].map((g) => (
          <div key={`skel-group-${g}`} className="space-y-2">
            <div className="h-3 w-16 bg-white/5 rounded ml-3" />
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={`skel-item-${g}-${i}`} className="h-10 w-full bg-white/5 rounded-xl" />
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
    <nav className="flex flex-col h-full select-none bg-[#3b3b3b]">
      {/* Logo Area */}
      <div className="p-4 flex-shrink-0">
        <div className="bg-white rounded p-3 flex items-center justify-center border-2 border-cyan-400">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-black font-extrabold text-2xl tracking-tighter">
              admissi<span className="text-red-500">o</span>n<span className="text-cyan-400">X</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={`nav-group-${group.label || gIdx}`}>
            {group.label && (
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider px-6 mb-2 mt-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-0 text-[13px] font-medium">
              {group.items.map((item, iIdx) => {
                const hasSubItems = !!(item.subItems && item.subItems.length > 0);
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
                const isItemActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
                const active = isItemActive || isSubItemActive;
                const isExpanded = expandedItems[item.label] || isSubItemActive;

                return (
                  <li key={`nav-item-${group.label || gIdx}-${item.label}-${iIdx}`}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={`w-full flex items-center justify-between gap-3 px-6 py-3 transition-all duration-150 ${active
                            ? "bg-[#963737] text-white border-l-4 border-red-800"
                            : "text-white/80 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                            }`}
                        >
                          <div className="flex items-center gap-4 truncate">
                            <span
                              className="material-symbols-rounded text-[20px] flex-shrink-0"
                              style={active ? ICO_FILL : ICO}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate flex-1 text-left">{item.label}</span>
                          </div>
                          <span
                            className={`material-symbols-rounded text-base transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            style={active ? ICO_FILL : ICO}
                          >
                            expand_more
                          </span>
                        </button>

                        {isExpanded && (
                          <ul className="bg-black/10 py-1">
                            {item.subItems?.map((sub, sIdx) => {
                               const subActive = pathname === sub.href;
                               return (
                                 <li key={`sub-item-${item.label}-${sub.label}-${sIdx}`}>
                                   <Link
                                     href={sub.href}
                                     className={`flex items-center px-14 py-2 text-[12px] font-medium transition-all ${subActive
                                       ? "text-white"
                                       : "text-white/60 hover:text-white"
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
                        className={`flex items-center gap-4 px-6 py-3 transition-all duration-150 ${active
                          ? "bg-[#963737] text-white border-l-4 border-[#6e2222]"
                          : "text-white/80 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                          }`}
                      >
                        <span
                          className="material-symbols-rounded text-[20px] flex-shrink-0"
                          style={active ? ICO_FILL : ICO}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate flex-1">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}




