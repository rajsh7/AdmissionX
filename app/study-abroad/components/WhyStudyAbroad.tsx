import React from "react";

const WHY_ABROAD_ITEMS = [
  {
    icon: "public",
    title: "Global Recognition",
    desc: "Degrees from top international universities are valued by employers worldwide.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: "diversity_3",
    title: "Cultural Exposure",
    desc: "Experience diverse cultures, languages, and perspectives that shape your worldview.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: "trending_up",
    title: "Higher Salary",
    desc: "International graduates command 40–60% higher salaries in competitive job markets.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: "hub",
    title: "Global Network",
    desc: "Build lifelong connections with peers and professionals from around the world.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function WhyStudyAbroad() {
  return (
    <div className="py-14">
      <div className="w-full px-4 lg:px-8 xl:px-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white mb-2">
            Why Study Abroad?
          </h2>
          <p className="text-neutral-300 text-sm max-w-xl mx-auto">
            An international degree opens doors to global opportunities,
            diverse cultures, and world-class education.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_ABROAD_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-start p-5 bg-white/5 rounded-2xl border border-white/10"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${item.color}`}
                >
                  {item.icon}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
