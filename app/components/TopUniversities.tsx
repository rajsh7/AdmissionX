"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface University {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
}

interface TopUniversitiesProps {
  universities: University[];
}

function RankBadge({ rank, size = "md" }: { rank: number; size?: "lg" | "md" | "sm" }) {
  const cls =
    size === "lg"
      ? "w-14 h-14 text-xl"
      : size === "md"
        ? "w-10 h-10 text-sm"
        : "w-8 h-8 text-xs";
  return (
    <div
      className={`${cls} rounded-xl bg-red-600 text-white font-black flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0`}
    >
      {String(rank).padStart(2, "0")}
    </div>
  );
}

export default function TopUniversities({ universities }: TopUniversitiesProps) {
  if (!universities.length) return null;

  const featured = universities[0];
  const podium = universities.slice(1, 3);
  const remaining = universities.slice(3);

  return (
    <section className="relative w-full py-20 lg:py-28 bg-neutral-50 overflow-hidden">
      {/* Subtle accent */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-red-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── Chapter Heading ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
              02
            </span>
            <div className="h-px w-8 bg-red-500/30" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              Discover
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
            Meet Your Future Alma Mater
          </h2>
          <p className="mt-4 text-lg text-neutral-500 font-light max-w-xl leading-relaxed">
            Handpicked for excellence. These universities have shaped
            thousands of success stories — yours could be next.
          </p>
        </motion.div>

        {/* ─── Podium: Featured + Top 2 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* ── #01 Featured Card (full height) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <Link
              href={featured.href}
              className="group relative block rounded-3xl overflow-hidden bg-neutral-900 h-full min-h-[420px] lg:min-h-[480px]"
            >
              {/* Image */}
              <img
                src={featured.image}
                alt={featured.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-7 lg:p-9 min-h-[420px] lg:min-h-[480px]">
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <RankBadge rank={1} size="lg" />
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-yellow-400 text-[16px]">
                      star
                    </span>
                    <span className="text-sm font-bold text-white">
                      {featured.rating}
                    </span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featured.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                      #1 Featured
                    </span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight group-hover:text-red-400 transition-colors">
                    {featured.name}
                  </h3>
                  <p className="text-sm text-white/60 flex items-center gap-1.5 mb-5">
                    <span className="material-symbols-outlined text-[16px]">
                      location_on
                    </span>
                    {featured.location}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div>
                      <span className="block text-white font-bold text-lg">
                        {featured.tuition}
                      </span>
                      <span className="text-xs text-white/40">Avg. Tuition</span>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold text-sm px-5 py-2.5 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-xl shadow-black/20">
                      View Details
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── #02 & #03 Stacked (right side) ── */}
          <div className="grid grid-cols-1 gap-5">
            {podium.map((uni, i) => (
              <motion.div
                key={uni.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1] as const,
                  delay: 0.1 + i * 0.1,
                }}
              >
                <Link
                  href={uni.href}
                  className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 h-full"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0 h-48 sm:h-auto overflow-hidden">
                    <img
                      src={uni.image}
                      alt={uni.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <RankBadge rank={i + 2} size="md" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center flex-1 p-5 lg:p-6">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {uni.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-red-600 transition-colors">
                      {uni.name}
                    </h3>
                    <p className="text-sm text-neutral-400 flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      {uni.location}
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                          star
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          {uni.rating}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-neutral-200" />
                      <span className="text-sm font-bold text-neutral-900">
                        {uni.tuition}
                      </span>
                      <span className="ml-auto material-symbols-outlined text-lg text-neutral-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Fallback if fewer than 3 universities */}
            {podium.length < 2 && (
              <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-10 text-neutral-400 text-sm font-medium">
                More universities coming soon
              </div>
            )}
          </div>
        </div>

        {/* ─── Remaining Universities: Compact List ─── */}
        {remaining.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {remaining.map((uni, i) => (
              <Link
                key={uni.name}
                href={uni.href}
                className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-400"
              >
                {/* Rank */}
                <RankBadge rank={i + 4} size="sm" />

                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 truncate group-hover:text-red-600 transition-colors">
                    {uni.name}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate">
                    {uni.location}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-yellow-500 text-[14px]">
                    star
                  </span>
                  <span className="text-xs font-bold text-neutral-700">
                    {uni.rating}
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* ─── View All Link ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/universities"
            className="group inline-flex items-center gap-3 bg-neutral-900 text-white font-bold text-sm px-7 py-4 rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
          >
            Explore All Universities
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
