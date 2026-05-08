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

  const degreeLevel = level_name || null;

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
          <h3 className="text-[20px] font-semibold mb-2.5 line-clamp-1 leading-snug" style={{ color: 'rgba(62, 62, 62, 1)' }}>
            {title}
          </h3>

          {degreeLevel && (
            <div className="flex items-center gap-2 border-t border-[#6C6C6C]/20 pt-2 pb-2 mb-2">
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'rgba(62, 62, 62, 1)' }}>school</span>
              <span className="text-[14px] font-medium text-[#6C6C6C] truncate">{degreeLevel}</span>
            </div>
          )}

          <div className="border-b border-[#6C6C6C]/20 mb-2" />

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
