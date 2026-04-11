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
  const avgPackage = "₹ 6.5 LPA";

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
              <span className="text-xs font-bold text-primary/50 uppercase tracking-widest leading-tight line-clamp-2">{title}</span>
            </div>
          )}

          {/* Heart / Wishlist icon */}
          <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-[6px] bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm border border-neutral-100">
            <span className="material-symbols-outlined text-[16px]">favorite</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-3">
          {/* Title */}
          <h3 className="text-[14px] font-medium text-neutral-800 mb-2.5 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Info blocks: Duration, Level (Row 1) + Package (Row 2) */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-2 bg-neutral-50 border border-neutral-100 py-2 px-2 rounded-[6px] transition-colors group-hover:bg-white group-hover:border-neutral-200">
                <span className="material-symbols-outlined text-[16px] text-neutral-400">schedule</span>
                <span className="text-[11px] font-bold text-neutral-600 truncate">{duration}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 bg-neutral-50 border border-neutral-100 py-2 px-2 rounded-[6px] transition-colors group-hover:bg-white group-hover:border-neutral-200">
                <span className="material-symbols-outlined text-[16px] text-neutral-400">school</span>
                <span className="text-[11px] font-bold text-neutral-600 truncate">{degreeLevel === "Bachelor" ? "Certificate Course" : degreeLevel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 py-2.5 px-3 rounded-[6px] transition-colors group-hover:bg-white group-hover:border-neutral-200">
              <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">payments</span>
              <div className="flex items-center justify-between flex-1">
                <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-tight">Avg. Package</span>
                <span className="text-[13px] font-black text-[#FF3C3C]">{avgPackage}</span>
              </div>
            </div>
          </div>

          {/* Student discussion forum button */}
          <button className="w-full py-2 px-3 rounded-[6px] border border-neutral-200 text-[11px] font-medium text-neutral-500 bg-white hover:bg-neutral-50 transition-colors mb-2">
            Student discussion forum
          </button>

          {/* View details + Compare */}
          <div className="flex gap-2">
            <Link
              href={`/careers-courses/${slug}`}
              className="flex-1 bg-[#FF3C3C] hover:bg-[#E63636] text-white text-[11px] font-bold py-2 rounded-[6px] transition-all text-center"
            >
              View details
            </Link>
            <button className="flex-1 bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-[11px] font-bold py-2 rounded-[6px] transition-all">
              Compare
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}




