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
  sortMode?: string;
}

function formatFees(fees: number | null): string {
  if (!fees || fees < 500) return "";
  return `₹ ${fees.toLocaleString("en-IN")}`;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <span key={i} className="text-[#FF8F00] text-lg">★</span>
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <span key={i} className="text-[#FF8F00] text-lg">★</span>
      );
    } else {
      stars.push(
        <span key={i} className="text-[#CCCCCC] text-lg">★</span>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[13.5px] font-semibold text-[#3E3E3E] mr-1">{rating.toFixed(1)}</span>
      <div className="flex items-center mr-1.5">{stars}</div>
      <span className="text-[13.5px] font-medium text-[#3E3E3E]">( {count} )</span>
    </div>
  );
}

export default function CollegeListItem({ college, index = 0, entityName = "College", sortMode }: CollegeListItemProps) {
  const { handleApply, modalSlug, closeModal } = useApplyGuard();
  const { slug, name, location, image, rating, totalRatingUser, ranking, isTopUniversity, topUniversityRank, universityType, collegetype_id, estyear, verified, streams, min_fees, max_fees } = college;

  const displayRank = topUniversityRank ?? ranking;
  const feesValue = sortMode === "fees_high"
    ? ((max_fees && max_fees >= 1000) ? max_fees : null)
    : ((min_fees && min_fees >= 1000) ? min_fees : (max_fees && max_fees >= 1000) ? max_fees : null);
  const feesLabel = formatFees(feesValue) || null;

  // collegetype_id: 2=Government College, 3=Government University
  const isGovt = collegetype_id === 2 || collegetype_id === 3;

  const formattedLocation = (location || "Indore , Madhya Pradesh , India")
    .trim()
    .replace(/^\s*,\s*/g, "")
    .replace(/\s*,\s*/g, " , ");

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.3) }}
    >
      <div className="group relative flex flex-col md:flex-row gap-5 bg-white border border-[#e5e7eb] hover:shadow-lg transition-all duration-300 p-5 md:py-16 pl-5 pr-4 md:pr-5 md:mr-10 rounded-[5px] min-h-[300px]">
        {/* Left Side: Thumbnail / Logo */}
        <div className="relative flex-shrink-0 w-full md:w-[180px] h-[130px] flex items-center justify-center bg-white border border-[#f3f4f6]">
          {image && image !== "" && !image.includes("default") ? (
            <div className="relative w-full h-full p-2">
              <Image src={image} alt={name} fill sizes="180px" className="object-contain pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-[100px] h-[75px] text-[#2f4f4f]" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Left wing */}
                <rect x="25" y="45" width="25" height="55" rx="2" />
                {/* Right wing */}
                <rect x="110" y="45" width="25" height="55" rx="2" />
                {/* Central body */}
                <rect x="50" y="32" width="60" height="68" rx="2" />
                {/* Gable triangle roof */}
                <polygon points="50,32 80,15 110,32" fill="white" />
                {/* Central gable circle */}
                <circle cx="80" cy="24" r="5" strokeWidth="3" />
                {/* Central door */}
                <rect x="71" y="68" width="18" height="32" rx="1" />
                <line x1="80" y1="68" x2="80" y2="100" />
                
                {/* Flag pole */}
                <line x1="80" y1="15" x2="80" y2="3" />
                {/* Flag */}
                <polygon points="80,3 95,8 80,13" fill="#2f4f4f" />

                {/* Windows - Left Wing */}
                <line x1="31" y1="53" x2="31" y2="60" />
                <line x1="44" y1="53" x2="44" y2="60" />
                <line x1="31" y1="68" x2="31" y2="75" />
                <line x1="44" y1="68" x2="44" y2="75" />
                <line x1="31" y1="83" x2="31" y2="90" />
                <line x1="44" y1="83" x2="44" y2="90" />

                {/* Windows - Right Wing */}
                <line x1="116" y1="53" x2="116" y2="60" />
                <line x1="129" y1="53" x2="129" y2="60" />
                <line x1="116" y1="68" x2="116" y2="75" />
                <line x1="129" y1="68" x2="129" y2="75" />
                <line x1="116" y1="83" x2="116" y2="90" />
                <line x1="129" y1="83" x2="129" y2="90" />

                {/* Windows - Central Body */}
                <line x1="60" y1="42" x2="65" y2="42" />
                <line x1="70" y1="42" x2="75" y2="42" />
                <line x1="85" y1="42" x2="90" y2="42" />
                <line x1="95" y1="42" x2="100" y2="42" />

                <line x1="60" y1="54" x2="65" y2="54" />
                <line x1="70" y1="54" x2="75" y2="54" />
                <line x1="85" y1="54" x2="90" y2="54" />
                <line x1="95" y1="54" x2="100" y2="54" />

                <line x1="60" y1="66" x2="65" y2="66" />
                <line x1="95" y1="66" x2="100" y2="66" />
              </svg>
            </div>
          )}
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0 md:pr-[195px]">
          {/* Title */}
          <h2 className="text-[17px] font-bold text-[#1f2937] leading-snug mb-1">
            <Link href={`/college/${slug}`} className="hover:underline">
              {name}
            </Link>
          </h2>

          {/* Rating */}
          <div className="mb-2">
            <StarRating rating={rating} count={totalRatingUser} />
          </div>

          {/* Location */}
          <p className="text-[13px] text-[#374151] mb-2.5">
            <span className="font-bold text-[#1f2937]">Location:</span> {formattedLocation}
          </p>

          {/* Bulleted Links */}
          <div className="border-t border-neutral-100 pt-2 mb-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-[#e2583e] font-semibold">
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}`} className="hover:underline">About</Link>
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}/courses`} className="hover:underline">Courses & Fees</Link>
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}/faculty`} className="hover:underline">Faculty</Link>
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}/admission-procedure`} className="hover:underline">Admission Procedure</Link>
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}/reviews`} className="hover:underline">Reviews</Link>
              <span className="text-[#e2583e]">•</span>
              <Link href={`/college/${slug}/faqs`} className="hover:underline">FAQs</Link>
              <span className="text-[#e2583e]">•</span>
            </div>
          </div>
        </div>

        {/* Right Top Side: Fee Info */}
        <div className="md:absolute md:top-4 md:right-4 text-right flex-shrink-0">
          {feesLabel ? (
            <div className="flex flex-col items-end">
              <span className="text-[17px] font-black text-[#bf360c]">{feesLabel}</span>
              <span className="text-[10px] text-green-700 font-bold uppercase tracking-tight">Per year</span>
            </div>
          ) : (
            <span className="text-[15px] font-bold text-[#bf360c]">Fee : N/A</span>
          )}
        </div>

        {/* Right Bottom Side: Action Buttons */}
        <div className="md:absolute md:bottom-4 md:right-4 flex flex-wrap items-center gap-2 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-neutral-100 w-full md:w-auto">
          {!isGovt && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(slug); }}
              className="flex-1 md:flex-initial border border-[#ff7a00] hover:bg-[#ff7a00]/5 text-[#ff7a00] text-[13px] font-semibold px-4 py-1.5 rounded-[3px] transition-all duration-200 whitespace-nowrap text-center cursor-pointer"
            >
              Apply Now
            </button>
          )}
          <AskQueryModal slug={slug} collegeName={name}
            renderTrigger={(onClick) => (
              <button onClick={onClick}
                className="flex-1 md:flex-initial border border-[#ff7a00] hover:bg-[#ff7a00]/5 text-[#ff7a00] text-[13px] font-semibold px-4 py-1.5 rounded-[3px] transition-all duration-200 whitespace-nowrap text-center cursor-pointer">
                Query
              </button>
            )}
          />
          <Link href={`/college/${slug}`} className="flex-1 md:flex-initial border border-[#ff7a00] hover:bg-[#ff7a00]/5 text-[#ff7a00] text-[13px] font-semibold px-4 py-1.5 rounded-[3px] transition-all duration-200 whitespace-nowrap text-center">
            View Details
          </Link>
        </div>

      </div>

      {modalSlug && <ApplyAuthModal redirectTo={`/apply/${modalSlug}`} onClose={closeModal} />}
    </motion.div>
  );
}
