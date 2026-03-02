"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const heroWords = ["Dream", "College", "Future", "Career", "Journey"];

const heroImages = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=2574&auto=format&fit=crop",
];

export default function HeroSection() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [location, setLocation] = useState("");
  const [degree, setDegree] = useState("");
  const [course, setCourse] = useState("");

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    const imageInterval = setInterval(nextImage, 4000);
    return () => clearInterval(imageInterval);
  }, [nextImage]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (degree) params.set("degree", degree);
    if (course) params.set("course", course);
    router.push(`/colleges?${params.toString()}`);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">

      {/* ─── Background Image Slides ─── */}
      {heroImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out select-none ${
            idx === currentImage ? "opacity-100" : "opacity-0"
          }`}
          style={{
            zIndex: 0,
            animation: idx === currentImage ? "heroZoom 6s ease-out forwards" : "none",
          }}
        />
      ))}

      {/* ─── Dark Overlay (makes text readable) ─── */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* ─── Red accent glow (subtle brand touch) ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: "radial-gradient(ellipse at 20% 80%, rgba(220,38,38,0.12) 0%, transparent 60%)",
        }}
      />

      {/* ─── Slide Indicator Dots ─── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2.5" style={{ zIndex: 30 }}>
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`rounded-full transition-all duration-500 ${
              idx === currentImage
                ? "w-9 h-2.5 bg-red-500"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ─── Main Content ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 sm:px-6 pt-32 pb-20 lg:pt-40 lg:pb-28 mx-auto max-w-7xl w-full"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 text-xs font-semibold text-white/90 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Trusted by 10,000+ Students
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.05]"
          >
            Find Your
            <br />
            <span className="relative inline-block min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="gradient-text inline-block"
                >
                  {heroWords[currentWord]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                key={`line-${currentWord}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-slate-200 font-light max-w-2xl leading-relaxed"
          >
            Every great journey begins with a single step. Discover top
            universities, explore courses, and chart the path to your
            extraordinary future.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/register")}
              className="group relative h-14 px-8 rounded-2xl bg-red-600 text-white font-bold text-base overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-600/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => {
                document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300"
            >
              Explore Programs
            </button>
          </motion.div>
        </div>

        {/* Search Card */}
        <motion.div variants={itemVariants} className="mt-16 lg:mt-20">
          <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-6 max-w-5xl shadow-2xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Location
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 material-symbols-outlined text-[20px]">
                    location_on
                  </span>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-8 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  >
                    <option value="" className="bg-neutral-900">Select State</option>
                    <option value="california" className="bg-neutral-900">California</option>
                    <option value="new-york" className="bg-neutral-900">New York</option>
                    <option value="texas" className="bg-neutral-900">Texas</option>
                    <option value="massachusetts" className="bg-neutral-900">Massachusetts</option>
                    <option value="uk" className="bg-neutral-900">United Kingdom</option>
                    <option value="singapore" className="bg-neutral-900">Singapore</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 material-symbols-outlined text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Degree
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 material-symbols-outlined text-[20px]">
                    school
                  </span>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-8 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  >
                    <option value="" className="bg-neutral-900">Select Degree</option>
                    <option value="bachelors" className="bg-neutral-900">Bachelors</option>
                    <option value="masters" className="bg-neutral-900">Masters</option>
                    <option value="phd" className="bg-neutral-900">PhD</option>
                    <option value="diploma" className="bg-neutral-900">Diploma</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 material-symbols-outlined text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Course Interest
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 material-symbols-outlined text-[20px]">
                    menu_book
                  </span>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-8 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  >
                    <option value="" className="bg-neutral-900">All Courses</option>
                    <option value="cs" className="bg-neutral-900">Computer Science</option>
                    <option value="business" className="bg-neutral-900">Business Admin</option>
                    <option value="medicine" className="bg-neutral-900">Medicine</option>
                    <option value="engineering" className="bg-neutral-900">Engineering</option>
                    <option value="law" className="bg-neutral-900">Law</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 material-symbols-outlined text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Search Colleges
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-4xl"
        >
          {[
            { value: 500, suffix: "+", label: "Universities" },
            { value: 10000, suffix: "+", label: "Students Placed" },
            { value: 50, suffix: "+", label: "Countries" },
            { value: 98, suffix: "%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-left">
              <div className="text-3xl sm:text-4xl font-black text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2.5} />
              </div>
              <div className="mt-1 text-sm text-white/50 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 20 }}
      >
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="material-symbols-outlined text-white/40 text-2xl">expand_more</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
