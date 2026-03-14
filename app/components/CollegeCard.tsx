"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface CollegeCardProps {
  college: CollegeResult;
  index?: number;
  entityName?: string;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`material-symbols-outlined text-[13px] ${
              s <= stars ? "text-amber-400" : "text-neutral-200"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
      </div>
      <span className="text-xs font-semibold text-neutral-700">
        {rating > 0 ? rating.toFixed(1) : "N/A"}
      </span>
      {count > 0 && (
        <span className="text-xs text-neutral-400">({count})</span>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const lower = type.toLowerCase();
  const isGovt =
    lower.includes("government") ||
    lower.includes("govt") ||
    lower.includes("public");
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        isGovt
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-blue-50 text-blue-700 border border-blue-200"
      }`}
    >
      {isGovt ? "Govt." : "Private"}
    </span>
  );
}

function formatFees(fees: number | null): string {
  if (!fees) return "View Fees";
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
}

export default function CollegeCard({
  college,
  index = 0,
  entityName = "College",
}: CollegeCardProps) {
  const {
    slug,
    name,
    location,
    image,
    rating,
    totalRatingUser,
    ranking,
    isTopUniversity,
    topUniversityRank,
    universityType,
    estyear,
    verified,
    streams,
    min_fees,
    max_fees,
  } = college;

  const displayRank = topUniversityRank ?? ranking;
  const feesLabel =
    min_fees && max_fees && min_fees !== max_fees
      ? `${formatFees(min_fees)} – ${formatFees(max_fees)}`
      : formatFees(min_fees ?? max_fees);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.06, 0.36),
      }}
    >
      <Link
        href={`/college/${slug}`}
        className="group flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-black/5 hover:-translate-y-1 hover:border-red-200 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden h-full"
      >
        {/* ── Image ── */}
        <div className="relative h-44 overflow-hidden bg-neutral-100 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top-left: Rank badge */}
          {displayRank ? (
            <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-red-600/30">
              #{displayRank}
            </div>
          ) : isTopUniversity ? (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-lg">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Top
            </div>
          ) : null}

          {/* Top-right: Verified */}
          {verified ? (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Verified
            </div>
          ) : null}

          {/* Bottom-left: Location */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">
              location_on
            </span>
            <span className="truncate max-w-[160px]">
              {location || "India"}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-4">
          {/* Name */}
          <h3 className="text-sm font-bold text-neutral-900 leading-snug mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2">
            {name}
          </h3>

          {/* Rating row */}
          <StarRating rating={rating} count={totalRatingUser} />

          {/* Divider */}
          <div className="my-3 h-px bg-neutral-100" />

          {/* Streams (tags) */}
          {streams.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {streams.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-semibold rounded uppercase tracking-wide"
                >
                  {s}
                </span>
              ))}
              {streams.length > 3 && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-400 text-[10px] font-semibold rounded uppercase tracking-wide">
                  +{streams.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer: fees + type */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <div>
              <span className="block text-xs text-neutral-400">Avg. Fees</span>
              <span className="text-sm font-bold text-neutral-800">
                {feesLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {estyear && (
                <span className="text-[10px] text-neutral-400 font-medium">
                  Est. {estyear}
                </span>
              )}
              <TypeBadge type={universityType} />
            </div>
          </div>
        </div>

        {/* ── CTA strip ── */}
        <div className="px-4 pb-4">
          <span className="w-full flex items-center justify-center gap-2 bg-neutral-900 group-hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300">
            View {entityName}
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
