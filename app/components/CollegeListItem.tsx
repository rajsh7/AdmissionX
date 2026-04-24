"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CollegeResult } from "@/app/api/search/colleges/route";
import AskQueryModal from "@/app/college/[slug]/components/AskQueryModal";
import ApplyAuthModal from "@/app/components/ApplyAuthModal";
import { useApplyGuard } from "@/app/hooks/useApplyGuard";

interface CollegeListItemProps {
  college: CollegeResult;
  index?: number;
  entityName?: string;
}

function formatFees(fees: number | null): string {
  if (!fees || fees <= 0) return "";
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  if (rating === 0) return null;
  const countStr = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  return (
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-rounded text-[#FCD34D] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="font-semibold" style={{ fontSize: "13px", color: "#3E3E3E" }}>
        {rating.toFixed(1)}
        <span className="ml-1 font-medium">( {countStr} Reviews )</span>
      </span>
    </div>
  );
}

export default function CollegeListItem({ college, index = 0, entityName = "College" }: CollegeListItemProps) {
  const { handleApply, modalSlug, closeModal } = useApplyGuard();
  const { slug, name, location, image, rating, totalRatingUser, ranking, isTopUniversity, topUniversityRank, universityType, estyear, verified, streams, min_fees, max_fees } = college;

  const displayRank = topUniversityRank ?? ranking;
  const minF = formatFees(min_fees);
  const maxF = formatFees(max_fees);
  const feesLabel = minF && maxF && minF !== maxF ? `${minF} – ${maxF}` : (minF || maxF || null);

  const isGovt = universityType
    ? universityType.toLowerCase().includes("government") || universityType.toLowerCase().includes("govt") || universityType.toLowerCase().includes("public")
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.3) }}
    >
      <div className="group relative flex flex-col sm:flex-row items-start justify-between gap-4 bg-white rounded-[5px] border border-neutral-100 hover:border-[#FF3C3C]/20 hover:shadow-xl hover:shadow-[#FF3C3C]/5 transition-all duration-300 p-4 sm:p-5 pr-6 sm:pr-8">
        <Link href={`/college/${slug}`} className="absolute inset-0 z-0" aria-label={`View ${name}`} />

        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative z-10 w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0 rounded-[5px] overflow-hidden bg-neutral-100 flex items-center justify-center">
            {image && image !== "" ? (
              <Image src={image} alt={name} fill sizes="150px" className="object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF3C3C]/10 to-[#FF3C3C]/5 flex items-center justify-center p-2 text-center pointer-events-none">
                <span className="material-symbols-outlined text-3xl text-[#FF3C3C]/30">account_balance</span>
              </div>
            )}
            <div className="absolute top-1 right-0 bg-white px-1.5 py-0.5 flex items-center gap-1 shadow-md rounded-l-[5px] border border-r-0 border-neutral-100 z-10">
              <span className="material-symbols-rounded text-[#FF3C3C] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-semibold" style={{ fontSize: "11px", color: "#3E3E3E" }}>{rating.toFixed(1)}</span>
            </div>
            {displayRank && (
              <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-[5px] bg-[#FF3C3C] text-white flex items-center justify-center text-[10px] font-black shadow-md">
                #{displayRank}
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0 z-10 relative">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Link href={`/college/${slug}`} className="text-sm sm:text-base font-extrabold text-[#333333] group-hover:text-[#FF3C3C] transition-colors leading-snug line-clamp-2">
                {name}
              </Link>
            </div>
            <p className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              <span className="truncate">{location || "India"}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <StarRating rating={rating} count={totalRatingUser} />
              <div className="w-px h-3 bg-neutral-200" />
              {universityType && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isGovt ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {isGovt ? "Govt." : "Private"}
                </span>
              )}
              
              {verified ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </span>
              ) : null}
              {isTopUniversity ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  Top University
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pointer-events-none">
              {streams.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {streams.slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-neutral-50 text-neutral-600 text-[10px] font-bold rounded-full border border-neutral-100 group-hover:border-[#FF3C3C]/20 group-hover:text-[#FF3C3C] group-hover:bg-[#FF3C3C]/5 transition-all">{s}</span>
                  ))}
                  {streams.length > 4 && <span className="px-2 py-0.5 bg-neutral-50 text-neutral-400 text-[10px] font-bold rounded-full border border-neutral-50 italic">+{streams.length - 4}</span>}
                </div>
              )}
              {estyear && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-neutral-400">calendar_month</span>
                  <span className="text-[10px] text-neutral-400 font-bold">Est. {estyear}</span>
                </div>
              )}
            </div>
            <div className="flex items-center mt-5 gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-neutral-400">currency_rupee</span>
              <span className="text-sm text-neutral-500 font-medium">Starting Fees:</span>
              {feesLabel ? (
                <>
                  <span className="text-md font-black text-[#FF3C3C]">{feesLabel}</span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">/ year</span>
                </>
              ) : (
                <span className="text-[12px] font-semibold text-slate-400 italic">Contact college</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row sm:flex-col justify-end  item-end gap-2 relative z-20 w-full sm:w-[130px] shrink-0 mt-2 sm:mt-0">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(slug); }}
            className="flex items-center justify-center gap-1.5 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-xs font-bold px-3 py-2 rounded-[8px] transition-all duration-300 flex-1 sm:w-full cursor-pointer whitespace-nowrap shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">edit_document</span>
            Apply Now
          </button>
          <AskQueryModal slug={slug} collegeName={name}   
            renderTrigger={(onClick) => (
              <button onClick={onClick}
                className="flex items-center justify-center gap-1.5 bg-white border border-[#FF3C3C] hover:bg-red-50 text-[#FF3C3C] text-xs font-bold px-3 py-2 rounded-[8px] transition-all duration-300 flex-1 sm:w-full cursor-pointer whitespace-nowrap shadow-sm">
                <span className="material-symbols-outlined text-[15px]">help</span>
                Ask Query
              </button>
            )}
          />
        </div>
      </div>

      {modalSlug && <ApplyAuthModal redirectTo={`/apply/${modalSlug}`} onClose={closeModal} />}
    </motion.div>
  );
}
