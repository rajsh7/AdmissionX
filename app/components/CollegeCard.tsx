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
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-[10px] px-2.5 py-1 flex items-center gap-1 shadow-sm">
      <span className="material-symbols-rounded text-yellow-500 text-[18px]">
        star
      </span>
      <span className="text-sm font-normal text-slate-800">
        {rating.toFixed(1)}
      </span>
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.24),
      }}
    >
      <Link
        href={`/college/${slug}`}
        className="group flex flex-col bg-white rounded-[10px] border border-slate-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
      >
        {/* -- Image -- */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50 flex-shrink-0">
          {image && image !== "" ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3C3C]/10 to-[#FF3C3C]/5 flex flex-col items-center justify-center p-4 text-center group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-4xl text-[#FF3C3C]/30 mb-2">account_balance</span>
              <span className="text-sm font-bold text-[#FF3C3C]/40 uppercase tracking-widest leading-tight line-clamp-2">{name}</span>
            </div>
          )}

          {/* Tag Overlay (Dynamic Rank / Featured) */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-[10px] bg-[#FF3C3C] text-white text-[10px] font-normal uppercase tracking-wider shadow-lg">
              {displayRank ? `#${displayRank} Ranked` : "Featured"}
            </span>
          </div>

          {/* Top-right: Rating Badge */}
          <StarRating rating={rating} count={totalRatingUser} />
        </div>

        {/* -- Body -- */}
        <div className="p-8 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[22px] font-bold text-[#6C6C6C] leading-snug group-hover:text-[#FF3C3C] transition-colors line-clamp-2">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[#6C6C6C] mb-4">
            <span className="material-symbols-rounded text-[20px]">
              location_on
            </span>
            <span className="text-[16px] font-medium truncate">
              {location || "India"}
            </span>
          </div>

          {/* Courses offered */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(streams.length > 0 ? streams : ["Engineering"]).slice(0, 3).map((course) => (
              <span
                key={course}
                className="inline-flex items-center rounded-[5px] border border-slate-400 px-3 py-1.5 text-[13px] font-semibold text-[#6C6C6C] leading-none"
              >
                {course}
              </span>
            ))}
            {streams.length > 3 && (
              <span className="inline-flex items-center rounded-[5px] border border-slate-400 px-3 py-1.5 text-[13px] font-semibold text-[#6C6C6C] leading-none">
                +{streams.length - 3} More
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-200">
            <div className="text-[16px] font-medium text-[#6C6C6C]">
              Avg. Package: <span className="font-bold text-[#FF3C3C]">
                {min_fees
                  ? `₹${(min_fees / 100000).toFixed(1)} LPA`
                  : max_fees
                  ? `₹${(max_fees / 100000).toFixed(1)} LPA`
                  : "N/A"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[16px] font-bold text-[#FF3C3C] group-hover:translate-x-1 transition-transform">
              View Details
              <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}




