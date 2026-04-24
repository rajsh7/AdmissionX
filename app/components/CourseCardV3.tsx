"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CourseResult } from "@/app/api/search/courses/route";

interface CourseCardProps {
  course: CourseResult;
  index?: number;
}

export default function CourseCardV3({
  course,
  index = 0,
}: CourseCardProps) {
  const {
    slug,
    title,
    image,
    level_name,
  } = course;

  const duration = "4 Years";
  const degreeLevel = level_name || "Bachelor";
  const avgPackage = "$120k";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.04, 0.24),
      }}
    >
      <div className="group flex flex-col bg-white rounded-[5px] border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
        {/* ── Image ── */}
        <div className="relative h-[140px] overflow-hidden bg-neutral-100 flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-primary/60 mb-2">menu_book</span>
              <span className="text-xs font-bold text-primary/50 uppercase tracking-widest leading-tight line-clamp-1 truncate">{title}</span>
            </div>
          )}

        </div>
        
{/* ── Body ── */}
        <div className="flex flex-col flex-1 p-3">
          {/* Title */}
          <h3 className="text-[20px] font-semibold mb-2.5 line-clamp-1 leading-snug" style={{ color: 'rgba(62, 62, 62, 1)' }}>
            {title}
          </h3>

          {/* Info blocks: Duration, Level (Row 1) + Package (Row 2) */}
          <div className="flex flex-col gap-0 mb-4">
            <div className="flex items-stretch border-t border-[#6C6C6C]/20">
              <div className="flex items-center gap-2 w-1/2 border-r border-[#6C6C6C]/20 pr-3 pt-2 pb-2 pl-3 border-b border-[#6C6C6C]/20">
                <span className="material-symbols-outlined text-[16px]" style={{ color: 'rgba(62, 62, 62, 1)' }}>schedule</span>
                <span className="text-[16px] font-medium text-[#6C6C6C] truncate">{duration}</span>
              </div>
              <div className="flex items-center gap-2 w-1/2 pt-2 pb-2 pl-3 border-b border-[#6C6C6C]/20">
                <span className="material-symbols-outlined text-[16px]" style={{ color: 'rgba(62, 62, 62, 1)' }}>school</span>
                <span className="text-[16px] font-medium text-[#6C6C6C] truncate">{degreeLevel === "Bachelor" ? "Certificate Course" : degreeLevel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 pb-2.5 px-3">
              <span className="material-symbols-outlined text-[18px]" style={{ color: 'rgba(62, 62, 62, 1)' }}>payments</span>
              <div className="flex items-center justify-between flex-1">
                <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-tight">Avg. Package</span>
                <span className="text-[13px] font-black text-[#FF3C3C]">{avgPackage}</span>
              </div>
            </div>
</div>
          <div className="border-b border-[#6C6C6C]/20" />

          {/* View details */}
          <div className="flex gap-2">
            <Link
              href={`/careers-courses/${slug}`}
              className="flex-1 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-[16px] font-medium py-2 rounded-[6px] transition-all text-center"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
