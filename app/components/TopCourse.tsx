"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FadeIn from "./FadeIn";

const courses = [
  {
    id: 1,
    name: "Medical",
    count: "10 universities +",
    icon: "medical_services",
    slug: "medicine",
    description: "Prepare for a rewarding career in healthcare. From anatomy to clinical practice, learn from the best in the field.",
    stats: { colleges: "850+", salary: "₹ 8L-25L+", growth: "12%+" },
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Engineering",
    count: "10 universities +",
    icon: "engineering",
    slug: "engineering",
    description: "From robotics to renewable energy, engineering shapes tomorrow. Dive into cutting-edge programs that turn ideas into reality.",
    stats: { colleges: "850+", salary: "₹ 6L-20L+", growth: "18%+" },
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Management",
    count: "10 universities +",
    icon: "business_center",
    slug: "management",
    description: "Lead organizations and drive innovation. Our management courses provide the skills you need to excel in the global business landscape.",
    stats: { colleges: "720+", salary: "₹ 8L-45L+", growth: "15%+" },
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Business",
    count: "10 universities +",
    icon: "payments",
    slug: "commerce",
    description: "Master the fundamentals of trade and finance. Our business programs prepare you for the dynamic world of commerce.",
    stats: { colleges: "450+", salary: "₹ 5L-15L+", growth: "10%+" },
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Law and order",
    count: "10 universities +",
    icon: "gavel",
    slug: "law",
    description: "Uphold justice and the rule of law. Our legal studies programs offer deep insights into various legal systems and practices.",
    stats: { colleges: "280+", salary: "₹ 6L-20L+", growth: "8%+" },
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Architect",
    count: "10 universities +",
    icon: "architecture",
    slug: "design",
    description: "Design the spaces of the future. Our architecture programs blend creativity with technical expertise.",
    stats: { colleges: "310+", salary: "₹ 7L-18L+", growth: "14%+" },
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Humanities",
    count: "10 universities +",
    icon: "palette",
    slug: "arts",
    description: "Explore the vast world of literature, history, and social sciences to understand the human experience.",
    stats: { colleges: "1.2k+", salary: "₹ 4L-12L+", growth: "9%+" },
    image: "https://images.unsplash.com/photo-1491843351663-7c116e8148ad?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Pharmacy",
    count: "10 universities +",
    icon: "medication",
    slug: "pharmacy",
    description: "Combine chemistry and biology to become an expert in medications and patient care.",
    stats: { colleges: "560+", salary: "₹ 4L-10L+", growth: "11%+" },
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Agriculture",
    count: "10 universities +",
    icon: "agriculture",
    slug: "agriculture",
    description: "Learn sustainable farming, biotechnology, and agri-business to feed the future.",
    stats: { colleges: "420+", salary: "₹ 3L-9L+", growth: "15%+" },
    image: "https://images.unsplash.com/photo-1523348830342-d0187cf0c28d?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Design",
    count: "10 universities +",
    icon: "brush",
    slug: "design",
    description: "Unleash your creativity through graphic design, fashion, interior design, and more. Build a career that blends art with innovation.",
    stats: { colleges: "380+", salary: "₹ 4L-14L+", growth: "13%+" },
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop"
  }
];

export default function TopCourse() {
  const router = useRouter();
  const [active, setActive] = useState(0); // Start with Medical as per Figma
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const current = courses[active] || courses[0];

  return (
    <section className="w-full py-24 lg:py-32 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">

      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 relative z-10">
        <FadeIn>
          <div className="mb-16">
            <div className="flex items-center justify-between gap-12 mb-6">
              <h2 className="text-[40px] lg:text-[68px] font-semibold text-slate-900 tracking-tight leading-[1.1]">
                Discover the Top <span style={{ color: '#FF3C3C' }}>Course</span>
              </h2>
              <Link href="/careers-courses" className="px-6 py-3 rounded-[5px] bg-white border border-slate-200 shadow-sm text-slate-600 font-medium text-base hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap">
                View All Course <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
              </Link>
            </div>
            <p className="text-slate-500 font-medium text-[25px] max-w-4xl leading-relaxed">
              Filter through thousands of institutions worldwide based on your specific academic preferences and <span className="text-blue-500">career</span> goals.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Left Column: Featured Course ──────────────────────────── */}
          <FadeIn className="lg:col-span-8 flex flex-col gap-10" direction="left">
            <div className="relative aspect-[3/2] rounded-none overflow-hidden group shadow-2xl shadow-black/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.image}
                    alt={current.name}
                    fill
                    className="object-cover object-[center_10%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[40px] lg:text-[56px] font-bold text-slate-900 tracking-tight leading-none">
                {current.name}
              </h3>
              <p className="text-xl text-slate-500 font-normal leading-relaxed max-w-2xl">
                {current.description}
              </p>
              <div className="flex flex-wrap gap-12 mt-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-slate-900">{current.stats.colleges}</span>
                  <span className="text-sm font-medium text-slate-400">Colleges</span>
                </div>
                <span className="w-px h-12" style={{ backgroundColor: 'rgba(34, 34, 34, 1)' }} />
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-slate-900">{current.stats.salary}</span>
                  <span className="text-sm font-medium text-slate-400">Avg. Salary</span>
                </div>
                <span className="w-px h-12" style={{ backgroundColor: 'rgba(34, 34, 34, 1)' }} />
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold" style={{ color: 'rgba(0, 177, 33, 1)' }}>{current.stats.growth}</span>
                  <span className="text-sm font-medium text-slate-400">Job Growth</span>
                </div>
                <Link
                  href={`/careers-courses?stream=${current.slug}`}
                  className="flex items-center gap-2 hover:translate-x-1 transition-transform ml-4"
                  style={{ color: '#FF3C3C', fontSize: '25px', fontWeight: 700 }}
                >
                  View more <span className="material-symbols-outlined" style={{ fontSize: '25px', fontWeight: 700 }}>arrow_forward</span>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* ── Right Column: Selector List ───────────────────────────── */}
          <FadeIn className="lg:col-span-4 bg-white rounded-[5px] border border-slate-200 p-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col h-full overflow-hidden" direction="right" delay={0.1}>
            <div className="border-b border-slate-100">
              <div className="relative border border-slate-200 rounded-[5px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6C6C6C' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search your course"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-10 pr-4 outline-none rounded-[5px] transition-all"
                  style={{ backgroundColor: 'rgba(244, 244, 244, 1)', fontSize: '20px', fontWeight: 400, color: 'rgba(108, 108, 108, 1)' }}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-0">
              {filteredCourses.map((course, idx) => {
                const originalIdx = courses.findIndex(c => c.id === course.id);
                return (
                  <button
                    key={course.id}
                    onMouseEnter={() => setActive(originalIdx)}
                    onClick={() => router.push(`/careers-courses?stream=${course.slug}`)}
                    className={`flex items-center gap-4 p-4 transition-all duration-300 text-left border-b ${active === originalIdx
                        ? 'bg-[#fff5f5] text-slate-900 border-l-4'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    style={active === originalIdx ? { borderLeftColor: 'rgba(216, 0, 5, 1)' } : { borderBottomColor: '#D9D9D9' }}
                  >
                    <div className="w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0 transition-colors border border-black">
                      <span className="material-symbols-outlined text-[20px] text-black">{course.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="leading-none" style={{ fontWeight: 500, fontSize: '20px', color: 'rgba(108, 108, 108, 1)' }}>
                        {course.name}
                      </div>
                      <div className="text-[11px] mt-1 font-medium uppercase tracking-[0.1em] text-[#6C6C6C]">
                        {course.count}
                      </div>
                    </div>
                    {active === originalIdx && (
                      <span className="material-symbols-outlined text-[#6C6C6C] text-[20px]">arrow_forward</span>
                    )}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
