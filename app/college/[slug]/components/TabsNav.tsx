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
    <div className="w-full bg-white border-b border-gray-200 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-12">
        <div className="flex space-x-2 py-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`px-6 py-2.5 text-sm font-extrabold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-white rounded shadow-md"
                    : "text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded"
                }`}
                style={isActive ? { backgroundColor: "#8bc6ba", color: "#00473a" } : {}}
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
