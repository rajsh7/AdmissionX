"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { label: "About University", href: "" },
  { label: "Courses", href: "/courses" },
  { label: "Placements", href: "/placements" },
  { label: "Reviews", href: "/reviews" },
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

  return (
    <div className="sticky top-[58px] z-40 w-full px-6 md:px-16 lg:px-24 mx-auto max-w-[1920px] -mt-[26px]">
      <div className="w-full">
        <nav className="flex items-center h-[52px] overflow-x-auto hide-scrollbar shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] bg-white rounded-[5px] overflow-hidden w-full">
          <div className="flex w-full h-full justify-between sm:justify-start">
            {TABS.map((tab) => {
              const href = `${base}${tab.href}`;
              const isActive = tab.href === "" ? pathname === base : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={tab.label} href={href}
                  className="flex items-center h-full px-6 md:px-10 text-sm font-bold transition-colors whitespace-nowrap"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #F6A1A1 0%, #E87B7B 100%)" : "transparent",
                    color: isActive ? "#D40C11" : "#6C6C6C",
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
