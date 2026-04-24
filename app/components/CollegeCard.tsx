"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CollegeResult } from "@/app/api/search/colleges/route";
import AskQueryModal from "@/app/college/[slug]/components/AskQueryModal";
import ApplyAuthModal from "@/app/components/ApplyAuthModal";
import { useApplyGuard } from "@/app/hooks/useApplyGuard";

interface CollegeCardProps {
  college: CollegeResult;
  index?: number;
  entityName?: string;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  if (rating === 0) return null;
  const countStr = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  return (
    <div className="absolute top-3 right-0 bg-white px-2.5 py-1 flex items-center gap-1.5 shadow-md rounded-l-[5px] border border-r-0 border-neutral-100 z-10">
      <span className="material-symbols-rounded text-[#FF3C3C] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="font-semibold" style={{ fontSize: "13px", color: "#3E3E3E" }}>
        {rating.toFixed(1)}
        <span className="ml-1 font-medium">( {countStr} Reviews )</span>
      </span>
    </div>
  );
}

function formatFees(fees: number | null): string {
  if (!fees || fees <= 0) return "";
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
}

function FeesDisplay({ min_fees, max_fees }: { min_fees: number | null; max_fees: number | null }) {
  const minF = formatFees(min_fees);
  const maxF = formatFees(max_fees);

  if (!minF && !maxF) {
    return <span className="text-[13px] font-semibold text-slate-400 italic">Contact college for fees</span>;
  }

  const label = minF && maxF && minF !== maxF ? `${minF} – ${maxF}` : (minF || maxF);
  return (
    <span className="text-[18px] font-black text-[#FF3C3C]">
      {label} <span className="text-[12px] font-bold text-slate-400 uppercase">/ year</span>
    </span>
  );
}

export default function CollegeCard({ college, index = 0, entityName = "College" }: CollegeCardProps) {
  const { handleApply, modalSlug, closeModal } = useApplyGuard();
  const { slug, name, location, image, rating, totalRatingUser, ranking, topUniversityRank, min_fees, max_fees } = college;
  const displayRank = topUniversityRank ?? ranking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.24) }}
    >
      <div className="group relative flex flex-col bg-white rounded-[5px] border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
        <Link href={`/college/${slug}`} className="absolute inset-0 z-10" aria-label={`View ${name}`} />

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50 flex-shrink-0">
          {image && image !== "" ? (
            <Image src={image} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3C3C]/10 to-[#FF3C3C]/5 flex flex-col items-center justify-center p-4 text-center group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-4xl text-[#FF3C3C]/30 mb-2">account_balance</span>
              <span className="text-sm font-bold text-[#FF3C3C]/40 uppercase tracking-widest leading-tight line-clamp-2">{name}</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-[5px] bg-[#FF3C3C] text-white text-[10px] font-medium uppercase tracking-wider shadow-lg">
              {displayRank ? `#${displayRank} Ranked` : "Featured"}
            </span>
          </div>
          <StarRating rating={rating} count={totalRatingUser} />
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
          <h3 className="text-[16px] sm:text-[18px] lg:text-[22px] font-bold text-[#6C6C6C] leading-snug group-hover:text-[#FF3C3C] transition-colors line-clamp-2 mb-3">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-[#6C6C6C] mb-3">
            <span className="material-symbols-rounded text-[18px]">location_on</span>
            <span className="text-[13px] sm:text-[15px] lg:text-[16px] font-medium truncate">{location || "India"}</span>
          </div>
          <div className="mb-6 flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Starting Fees</span>
            <FeesDisplay min_fees={min_fees} max_fees={max_fees} />
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex flex-row items-center gap-2 pt-4 border-t border-slate-200 relative z-20">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(slug); }}
              className="flex-1 flex items-center justify-center gap-1 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-[11px] lg:text-[12px] font-bold px-1.5 py-2.5 rounded-[5px] transition-all duration-300 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[14px]">edit_document</span>
              Apply Now
            </button>
            <AskQueryModal slug={slug} collegeName={name}
              renderTrigger={(onClick) => (
                <button onClick={onClick}
                  className="flex-1 flex items-center justify-center gap-1 bg-white border border-[#FF3C3C] hover:bg-red-50 text-[#FF3C3C] text-[11px] lg:text-[12px] font-bold px-1.5 py-2.5 rounded-[5px] transition-all duration-300 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">help</span>
                  Ask Query
                </button>
              )}
            />
          </div>
        </div>
      </div>

      {modalSlug && <ApplyAuthModal redirectTo={`/apply/${modalSlug}`} onClose={closeModal} />}
    </motion.div>
  );
}
