"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ExamTabsUnifiedProps {
  basePath: string;
  faqCount: number;
  questionCount: number;
}

interface Tab {
  label: string;
  href: string;
  icon: string;
  count?: number;
  exact?: boolean;
}

export default function ExamTabsUnified({
  basePath,
  faqCount,
  questionCount,
}: ExamTabsUnifiedProps) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
      label: "Overview",
      href: basePath,
      icon: "info",
      exact: true,
    },
    {
      label: "FAQs",
      href: `${basePath}/faqs`,
      icon: "help",
      count: faqCount > 0 ? faqCount : undefined,
    },
    {
      label: "Q&A",
      href: `${basePath}/questions`,
      icon: "forum",
      count: questionCount > 0 ? questionCount : undefined,
    },
  ];

  function isActive(tab: Tab): boolean {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  }

  return (
    <div 
      id="exam-tabs-unified-container"
      className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-md"
    >
      <div className="w-full px-4 lg:px-8 xl:px-12">
        <nav
          className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide"
          aria-label="Exam sections"
        >
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative flex items-center gap-2 px-4 py-4 text-sm font-bold
                  whitespace-nowrap transition-colors duration-150 shrink-0
                  border-b-2 -mb-px
                  ${
                    active
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
                  }
                `}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-all ${
                    active ? "text-red-600" : "text-neutral-400"
                  }`}
                  style={{
                    fontVariationSettings: active
                      ? "'FILL' 1"
                      : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>

                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[20px] h-5
                      text-[10px] font-black px-1.5 rounded-full transition-colors
                      ${
                        active
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-500"
                      }
                    `}
                  >
                    {tab.count}
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
