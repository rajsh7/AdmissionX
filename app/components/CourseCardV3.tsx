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
      <div className="group flex flex-col bg-white rounded-[8px] border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
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
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-teal-400/60 mb-2">menu_book</span>
              <span className="text-xs font-bold text-teal-600/50 uppercase tracking-widest leading-tight line-clamp-2">{title}</span>
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

          {/* Duration + Degree row */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1 text-neutral-500">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span className="text-[11px] font-medium">{duration}</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <span className="material-symbols-outlined text-[14px]">school</span>
              <span className="text-[11px] font-medium">{degreeLevel}</span>
            </div>
          </div>

          {/* Avg Package row */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[11px] text-neutral-600">Avg. Package:</span>
            <span className="text-[11px] text-[#008080] font-bold">{avgPackage}</span>
          </div>

          {/* Student discussion forum button */}
          <button className="w-full py-2 px-3 rounded-[6px] border border-neutral-200 text-[11px] font-medium text-neutral-500 bg-white hover:bg-neutral-50 transition-colors mb-2">
            Student discussion forum
          </button>

          {/* View details + Compare */}
          <div className="flex gap-2">
            <Link
              href={`/careers-courses/${slug}`}
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white text-[11px] font-bold py-2 rounded-[6px] transition-all text-center"
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
