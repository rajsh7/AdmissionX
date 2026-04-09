"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface CollegeListItemProps {
  college: CollegeResult;
  index?: number;
  entityName?: string;
}

function formatFees(fees: number | null): string {
  if (!fees) return "View Fees";
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined text-[12px] ${
            s <= stars ? "text-amber-400" : "text-neutral-200"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
      <span className="text-xs font-semibold text-neutral-700 ml-0.5">
        {rating > 0 ? rating.toFixed(1) : "N/A"}
      </span>
    </div>
  );
}

export default function CollegeListItem({
  college,
  index = 0,
  entityName = "College",
}: CollegeListItemProps) {
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

  const isGovt =
    universityType
      ? universityType.toLowerCase().includes("government") ||
        universityType.toLowerCase().includes("govt") ||
        universityType.toLowerCase().includes("public")
      : false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.05, 0.3),
      }}
    >
      <Link
        href={`/college/${slug}`}
        className="group flex items-start gap-4 bg-white rounded-[10px] border border-neutral-100 hover:border-[#FF3C3C]/20 hover:shadow-xl hover:shadow-[#FF3C3C]/5 transition-all duration-300 p-4 sm:p-5"
      >
        {/* -- Thumbnail -- */}
        <div className="relative w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0 rounded-[10px] overflow-hidden bg-neutral-100 flex items-center justify-center">
          {image && image !== "" ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="150px"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3C3C]/10 to-[#FF3C3C]/5 flex items-center justify-center p-2 text-center">
               <span className="material-symbols-outlined text-3xl text-[#FF3C3C]/30">account_balance</span>
            </div>
          )}
          {/* Rank overlay */}
          {displayRank ? (
            <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-[10px] bg-[#FF3C3C] text-white flex items-center justify-center text-[10px] font-black shadow-md">
              #{displayRank}
            </div>
          ) : null}
        </div>

        {/* -- Main Info -- */}
        <div className="flex-1 min-w-0">
          {/* Top row: name + badges */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#333333] group-hover:text-[#FF3C3C] transition-colors leading-snug line-clamp-2">
              {name}
            </h3>

            {/* Desktop action */}
            <span className="hidden sm:inline-flex items-center gap-1.5 flex-shrink-0 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-xs font-bold px-4 py-2 rounded-[10px] transition-all duration-300 whitespace-nowrap">
              View {entityName}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </span>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
            <span className="material-symbols-outlined text-[13px]">
              location_on
            </span>
            <span className="truncate">{location || "India"}</span>
          </p>

          {/* Rating + badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <StarRating rating={rating} />

            {totalRatingUser > 0 && (
              <span className="text-[10px] text-neutral-400">
                ({totalRatingUser} reviews)
              </span>
            )}

            <div className="w-px h-3 bg-neutral-200" />

            {universityType && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  isGovt
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {isGovt ? "Govt." : "Private"}
              </span>
            )}

            {verified ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
                <span
                  className="material-symbols-outlined text-[11px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                Verified
              </span>
            ) : null}

            {isTopUniversity ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
                <span
                  className="material-symbols-outlined text-[11px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emoji_events
                </span>
                Top University
              </span>
            ) : null}
          </div>

          {/* Bottom row: streams + fees + est year */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Streams */}
            {streams.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {streams.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-neutral-50 text-neutral-600 text-[10px] font-bold rounded-full border border-neutral-100 group-hover:border-[#FF3C3C]/20 group-hover:text-[#FF3C3C] group-hover:bg-[#FF3C3C]/5 transition-all"
                  >
                    {s}
                  </span>
                ))}
                {streams.length > 4 && (
                  <span className="px-2 py-0.5 bg-neutral-50 text-neutral-400 text-[10px] font-bold rounded-full border border-neutral-50 italic">
                    +{streams.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Fees */}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-neutral-400">
                currency_rupee
              </span>
              <span className="text-xs font-black text-[#FF3C3C]">
                {feesLabel}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">/ year</span>
            </div>

            {/* Est. year */}
            {estyear && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-neutral-400">
                  calendar_month
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">
                  Est. {estyear}
                </span>
              </div>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="sm:hidden mt-3">
            <span className="inline-flex items-center gap-1.5 bg-[#FF3C3C] text-white text-xs font-bold px-4 py-2 rounded-[10px] transition-all duration-300">
              View {entityName}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}




