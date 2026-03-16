import React from "react";
import Link from "next/link";

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface StreamListProps {
  streams: FilterOption[];
}

const STREAM_ICONS: Record<string, string> = {
  engineering: "engineering",
  management: "business_center",
  medical: "medical_services",
  law: "gavel",
  arts: "palette",
  science: "science",
  commerce: "account_balance",
  computer: "computer",
  design: "draw",
  media: "movie",
};

const COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-red-50 text-red-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-cyan-50 text-cyan-600",
];

export default function StreamList({ streams }: StreamListProps) {
  if (streams.length === 0) return null;

  return (
    <div className="py-14">
      <div className="w-full px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Browse by Stream
            </h2>
            <p className="text-neutral-300 text-sm">
              Find international programs in your field
            </p>
          </div>
          <Link
            href="/study-abroad?page=1"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            View All
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {streams.slice(0, 12).map((stream, i) => {
            const iconKey = Object.keys(STREAM_ICONS).find((k) =>
              stream.name.toLowerCase().includes(k),
            );
            const icon = iconKey ? STREAM_ICONS[iconKey] : "school";

            return (
              <Link
                key={stream.id}
                href={`/study-abroad?stream=${stream.slug}`}
                className="group flex flex-col items-center text-center gap-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-red-500/50 hover:shadow-md p-4 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${COLORS[i % COLORS.length]} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {stream.name}
                  </p>
                  {stream.count !== undefined && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {stream.count} colleges
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
