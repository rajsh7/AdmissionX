"use client";

import Link from "next/link";

const CARDS = [
  {
    title: "Browse Colleges",
    description: "Search all colleges across India",
    icon: "school",
    href: "/top-colleges",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Top Universities",
    description: "Discover top ranked universities",
    icon: "workspace_premium",
    href: "/top-university",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Top Courses",
    description: "Find the right course for you",
    icon: "menu_book",
    href: "/careers-courses",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Free Counselling",
    description: "Get expert admission guidance",
    icon: "support_agent",
    href: "/counselling",
    gradient: "from-green-500 to-green-600",
  },
];

export default function ExploreCards() {
  return (
    <section className="w-full pb-16">
      <div className="w-full px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative overflow-hidden rounded-[5px] border border-neutral-200/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
            <div className="relative">
              <div className={`w-12 h-12 rounded-[5px] bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.icon}
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">{card.title}</h3>
              <p className="text-sm text-neutral-600 mb-3">{card.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#E52E2E]">
                Explore
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </section>
  );
}
