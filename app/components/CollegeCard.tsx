"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface CollegeCardProps {
  college: CollegeResult;
  index?: number;
  entityName?: string;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  if (rating === 0) return null;
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-[10px] shadow-lg border border-white/20">
      <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
        star
      </span>
      <span className="text-[11px] font-black text-neutral-800">
        {rating.toFixed(1)}
      </span>
      {count > 0 && <span className="text-[10px] text-neutral-400">({count}+)</span>}
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isGovt
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}
    >
      {isGovt ? "Govt." : "Private"}
    </span>
  );
}

function formatFees(fees: number | null): string {
  if (!fees) return "View Details";
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
        delay: Math.min(index * 0.04, 0.24),
      }}
    >
      <Link
        href={`/college/${slug}`}
        className="group flex flex-col bg-white rounded-[10px] border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
      >
        {/* ── Image ── */}
        <div className="relative h-48 overflow-hidden bg-neutral-50 flex-shrink-0 flex items-center justify-center">
          {image && image !== "" ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/10 to-[#008080]/5 flex flex-col items-center justify-center p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-[#008080]/30 mb-2">account_balance</span>
              <span className="text-sm font-bold text-[#008080]/40 uppercase tracking-widest leading-tight line-clamp-2">{name}</span>
            </div>
          )}

          {/* Top-left: Rank badge */}
          {displayRank ? (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#008080] text-white text-[10px] font-black px-2.5 py-1 rounded-[10px] shadow-lg">
              #{displayRank}
            </div>
          ) : null}

          {/* Top-right: Rating Badge */}
          <StarRating rating={rating} count={totalRatingUser} />
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5">
          {/* Name */}
          <h3 className="text-[17px] font-medium text-[#333333] mb-1 group-hover:text-[#008080] transition-colors line-clamp-2">
            {name}
          </h3>

          {/* Location below name */}
          <div className="flex items-center gap-1 text-neutral-400 mb-4">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="text-[13px] font-medium truncate">{location || "India"}</span>
          </div>

          {/* Streams (Outlined pills) */}
          {streams.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {streams.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-transparent text-neutral-600 text-[11px] font-bold rounded-full border border-neutral-100 transition-all group-hover:bg-[#008080]/10 group-hover:text-[#008080] group-hover:border-[#008080]/20"
                >
                  {s}
                </span>
              ))}
              {streams.length > 2 && (
                <span className="px-3 py-1.5 bg-transparent text-neutral-400 text-[11px] font-bold rounded-full border border-neutral-50 italic">
                  +{streams.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <div className="mb-6 h-[34px]" /> // Spacer if no streams
          )}

          {/* Footer: Fees */}
          <div className="mt-auto pt-4 border-t border-neutral-50 flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Avg. Package</span>
              <span className="text-base font-black text-[#008080]">
                {feesLabel}
              </span>
            </div>

            <span className="flex items-center gap-1 text-[13px] font-black text-[#008080] group-hover:gap-1.5 transition-all">
              View Details
              <span className="material-symbols-outlined text-[16px] mt-0.5">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
