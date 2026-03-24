"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CourseResult } from "@/app/api/search/courses/route";

interface CourseCardProps {
  course: CourseResult;
  index?: number;
}

export default function CourseCardV2({
  course,
  index = 0,
}: CourseCardProps) {
  const {
    slug,
    title,
    image,
    description,
    level_name,
    stream_name,
    bestChoiceOfCourse,
    jobsCareerOpportunityDesc,
  } = course;

  // For demo purposes, we'll use some placeholder data for duration and level if not available
  const duration = "4 Years"; 
  const degreeLevel = level_name || "Bachelor";
  const avgPackage = "$120k"; // Placeholder or from DB if added later

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
      <div className="group flex flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        {/* ── Image ── */}
        <div className="relative h-44 overflow-hidden bg-neutral-50 flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/10 to-[#008080]/5 flex flex-col items-center justify-center p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-[#008080]/30 mb-2">menu_book</span>
              <span className="text-sm font-bold text-[#008080]/40 uppercase tracking-widest leading-tight line-clamp-2">{title}</span>
            </div>
          )}

          {/* Top-right: Heart icon */}
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5">
          {/* Title */}
          <h3 className="text-[17px] font-extrabold text-[#333333] mb-4 group-hover:text-[#008080] transition-colors line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Meta Info Row */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span className="text-[13px] font-bold">{duration}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="material-symbols-outlined text-[18px]">school</span>
              <span className="text-[13px] font-bold">{degreeLevel}</span>
            </div>
          </div>

          {/* Avg Package Row */}
          <div className="flex items-center gap-2 text-neutral-700 font-bold mb-6">
            <span className="material-symbols-outlined text-[18px]">paid</span>
            <span className="text-[13px]">Avg. Package:</span>
            <span className="text-[13px] text-[#008080]">{avgPackage}</span>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto space-y-3">
             <button className="w-full py-2.5 px-4 rounded-xl border border-neutral-100 text-[13px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                Student discussion forum
             </button>
             
             <div className="flex gap-2">
                <Link
                  href={`/careers-courses/${slug}`}
                  className="flex-1 bg-[#008080] hover:bg-[#006666] text-white text-[13px] font-black py-3 rounded-xl transition-all text-center"
                >
                  View details
                </Link>
                <button className="flex-1 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[13px] font-black py-3 rounded-xl transition-all">
                  Compare
                </button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
