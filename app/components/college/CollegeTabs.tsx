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
    <div className="sticky top-16 z-40 bg-white w-full shadow-sm" style={{ borderBottom: "2px solid #e5e7eb" }}>
      <div className="w-full px-6 md:px-12 lg:px-16">
        <nav className="flex items-center overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const href = `${base}${tab.href}`;
            const isActive = tab.href === "" ? pathname === base : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={tab.label} href={href}
                className="relative flex-shrink-0 px-5 md:px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150"
                style={{
                  color: isActive ? "#FF3C3C" : "#6b7280",
                  borderBottom: isActive ? "2.5px solid #FF3C3C" : "2.5px solid transparent",
                  marginBottom: "-2px",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
