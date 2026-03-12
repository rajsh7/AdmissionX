"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
  icon: string;
}

const TABS: Tab[] = [
  { label: "Overview",            href: "",                    icon: "home" },
  { label: "Courses",             href: "/courses",            icon: "menu_book" },
  { label: "Faculty",             href: "/faculty",            icon: "groups" },
  { label: "Reviews",             href: "/reviews",            icon: "star" },
  { label: "Admission",           href: "/admission-procedure",icon: "assignment" },
  { label: "FAQs",                href: "/faqs",               icon: "help" },
];

interface CollegeTabsProps {
  slug: string;
  counts?: {
    courses?: number;
    faculty?: number;
    reviews?: number;
    admissionProcedures?: number;
    faqs?: number;
  };
}

export default function CollegeTabs({ slug, counts = {} }: CollegeTabsProps) {
  const pathname = usePathname();
  const base = `/college/${slug}`;

  const badgeFor: Record<string, number | undefined> = {
    "/courses":             counts.courses,
    "/faculty":             counts.faculty,
    "/reviews":             counts.reviews,
    "/admission-procedure": counts.admissionProcedures,
    "/faqs":                counts.faqs,
  };

  return (
    <div className="bg-white border-b border-neutral-100 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className="flex items-center gap-0 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TABS.map((tab) => {
            const href = `${base}${tab.href}`;
            const isActive =
              tab.href === ""
                ? pathname === base
                : pathname === href || pathname.startsWith(href + "/");

            const badge = badgeFor[tab.href];

            return (
              <Link
                key={tab.label}
                href={href}
                className={`
                  relative flex items-center gap-1.5 px-4 py-4 text-sm font-semibold
                  whitespace-nowrap transition-all duration-200 flex-shrink-0
                  border-b-2 -mb-px
                  ${
                    isActive
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isActive ? "text-red-600" : "text-neutral-400"
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {tab.icon}
                </span>
                {tab.label}
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-red-100 text-red-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
