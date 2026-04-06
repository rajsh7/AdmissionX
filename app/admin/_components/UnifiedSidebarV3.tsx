"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NavItem, NavGroup, NAV_GROUPS } from "./nav-config";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Admin {
  id: string;
  name: string;
  email: string;
}

export type { NavItem, NavGroup };
export { NAV_GROUPS };

// ─── Icon style helpers ───────────────────────────────────────────────────────
export const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
export const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export function UnifiedSidebarV3({
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
    setExpandedItems((prev) => {
      const groupWithItem = NAV_GROUPS.find(g => g.items.some(i => i.label === label));
      const item = groupWithItem?.items.find(i => i.label === label);
      const isSubItemActive = !!(item?.subItems?.some(sub => pathname === sub.href));
      const currentVal = prev[label] !== undefined ? prev[label] : isSubItemActive;
      return { ...prev, [label]: !currentVal };
    });
  };

  return (
    <nav className="flex flex-col h-full select-none" style={{ backgroundColor: '#313131' }}>
      {/* Logo Area */}
      <div className="p-4 flex-shrink-0">
        <div className="bg-white rounded p-3 flex items-center justify-center" style={{ border: '2px solid #00b5ad' }}>
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-black font-extrabold text-2xl tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
              admissi<span style={{ color: '#FF3C3C' }}>o</span>n<span style={{ color: '#00b5ad' }}>X</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-6">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={`v3-group-${group.label || gIdx}`}>
            {group.label && (
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-6 mb-2 mt-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, iIdx) => {
                const hasSubItems = !!(item.subItems && item.subItems.length > 0);
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
                const isItemActive = pathname === item.href;
                const active = isItemActive || isSubItemActive;
                const isExpanded = expandedItems[item.label] !== undefined ? expandedItems[item.label] : isSubItemActive;

                const activeStyles = { backgroundColor: '#963737', borderLeft: '4px solid #6e2222', color: 'white' };
                const inactiveStyles = { borderLeft: '4px solid transparent', color: 'rgba(255,255,255,0.7)' };

                return (
                  <li key={`v3-item-${item.label}-${iIdx}`}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className="w-full flex items-center justify-between gap-3 px-6 py-3 transition-colors text-[13px] font-bold"
                          style={active ? activeStyles : inactiveStyles}
                        >
                          <div className="flex items-center gap-4 truncate">
                            <span className="material-symbols-rounded text-[20px] flex-shrink-0" style={active ? ICO_FILL : ICO}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className={`material-symbols-rounded text-base transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        {isExpanded && (
                          <ul className="bg-black/20 py-1">
                            {item.subItems?.map((sub, sIdx) => {
                               const subActive = pathname === sub.href;
                               return (
                                 <li key={`v3-sub-${sub.label}-${sIdx}`}>
                                   <Link
                                     href={sub.href}
                                     className="flex items-center gap-3 px-11 py-2.5 text-[12px] font-bold transition-colors"
                                     style={{ color: subActive ? 'white' : 'rgba(255,255,255,0.5)' }}
                                   >
                                     <span className="material-symbols-rounded text-[18px] flex-shrink-0" style={subActive ? ICO_FILL : ICO}>
                                       {sub.icon || 'chat_bubble_outline'}
                                     </span>
                                     <span className="truncate">{sub.label}</span>
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
                        className="flex items-center gap-4 px-6 py-3 transition-colors text-[13px] font-bold"
                        style={active ? activeStyles : inactiveStyles}
                      >
                        <span className="material-symbols-rounded text-[20px] flex-shrink-0" style={active ? ICO_FILL : ICO}>
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
    </nav>
  );
}
