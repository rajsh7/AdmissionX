"use client";

import { motion } from "framer-motion";

interface ChapterHeadingProps {
  number: string;
  label: string;
  title: string;
  subtitle: string;
  align?: "left" | "center";
  light?: boolean;
}

export default function ChapterHeading({
  number,
  label,
  title,
  subtitle,
  align = "left",
  light = false,
}: ChapterHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      className={`flex flex-col gap-4 mb-12 md:mb-16 ${alignClass}`}
    >
      <div className="flex items-center gap-3">
        <span className={`chapter-number text-xs font-bold tracking-[0.25em] uppercase ${light ? "text-primary/70" : "text-primary"}`}>
          {number}
        </span>
        <div className={`h-px w-8 ${light ? "bg-white/20" : "bg-primary/30"}`} />
        <span className={`text-xs font-semibold tracking-[0.15em] uppercase ${light ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
          {label}
        </span>
      </div>
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] ${light ? "text-white" : "text-slate-900 dark:text-white"}`}>
        {title}
      </h2>
      <p className={`text-lg max-w-2xl font-light leading-relaxed ${light ? "text-slate-300" : "text-slate-500 dark:text-slate-400"} ${align === "center" ? "mx-auto" : ""}`}>
        {subtitle}
      </p>
    </motion.div>
  );
}
