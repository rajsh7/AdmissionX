"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ChapterHeading from "./ChapterHeading";

const countries = [
  {
    name: "MIT",
    fullName: "Massachusetts Institute of Technology",
    rank: "#1 QS Ranking",
    flag: "🇺🇸",
    country: "United States",
    tags: ["Engineering", "Computer Science", "Research"],
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=2574&auto=format&fit=crop",
    href: "/university/mit",
    stats: { acceptance: "4%", students: "11,500+" },
  },
  {
    name: "Cambridge",
    fullName: "University of Cambridge",
    rank: "#2 QS Ranking",
    flag: "🇬🇧",
    country: "United Kingdom",
    tags: ["Law", "Science", "Humanities"],
    image: "https://images.unsplash.com/photo-1580491934990-4e4172142bc4?q=80&w=2574&auto=format&fit=crop",
    href: "/university/cambridge",
    stats: { acceptance: "21%", students: "24,000+" },
  },
  {
    name: "NUS",
    fullName: "National University of Singapore",
    rank: "#8 QS Ranking",
    flag: "🇸🇬",
    country: "Singapore",
    tags: ["Business", "Technology", "Innovation"],
    image: "https://images.unsplash.com/photo-1496939376851-89342e90adcd?q=80&w=2670&auto=format&fit=crop",
    href: "/university/nus",
    stats: { acceptance: "12%", students: "42,000+" },
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function ParallaxCard({ uni, index }: { uni: typeof countries[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <Link
        href={uni.href}
        className="group relative block overflow-hidden rounded-3xl bg-slate-900 min-h-[440px]"
      >
        {/* Parallax Image */}
        <motion.div
          className="absolute inset-[-10%] z-0"
          style={{ y: imageY }}
        >
          <div
            className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${uni.image}')` }}
          />
        </motion.div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-20 p-8 h-full flex flex-col justify-between min-h-[440px]">
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <span className="glass px-3 py-1.5 rounded-full text-xs font-bold text-white">
              {uni.rank}
            </span>
            <div className="glass rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <span className="text-xl">{uni.flag}</span>
            </div>
          </div>

          {/* Bottom Content */}
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">{uni.country}</p>
            <h3 className="text-3xl font-black text-white mb-2 group-hover:text-primary transition-colors">
              {uni.name}
            </h3>
            <p className="text-slate-300 text-sm mb-5">{uni.fullName}</p>

            {/* Stats */}
            <div className="flex gap-6 mb-5">
              <div>
                <div className="text-lg font-bold text-white">{uni.stats.acceptance}</div>
                <div className="text-xs text-slate-400">Acceptance</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{uni.stats.students}</div>
                <div className="text-xs text-slate-400">Students</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {uni.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function StudyAbroad() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-white dark:bg-background-dark overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <ChapterHeading
            number="03"
            label="Go Global"
            title="The World Is Your Classroom"
            subtitle="Break boundaries. Study at the most prestigious institutions across the globe and build an international career."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {countries.map((uni, i) => (
            <ParallaxCard key={uni.name} uni={uni} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
