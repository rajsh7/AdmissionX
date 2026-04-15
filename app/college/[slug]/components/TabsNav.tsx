"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TabsNavContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "about";

  const tabs = [
    { id: "about", label: "About University" },
    { id: "courses", label: "Courses" },
    { id: "placements", label: "Placements" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="sticky top-[80px] w-full bg-white border-b border-neutral-100 shadow-sm z-40">
      <div className="max-w-[1920px] mx-auto px-8 lg:px-12 xl:px-20">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`px-8 py-4 text-[15px] font-bold whitespace-nowrap transition-all duration-300 border-b-4 ${
                  isActive
                    ? "border-[#FF3C3C] bg-red-50/50"
                    : "border-transparent hover:bg-slate-50"
                }`}
                style={{ color: '#6C6C6C' }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TabsNav() {
  return (
    <Suspense fallback={<div className="h-[65px] w-full bg-white border-b border-gray-200"></div>}>
      <TabsNavContent />
    </Suspense>
  );
}
