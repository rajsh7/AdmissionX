"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  Cpu,
  GraduationCap,
  Landmark,
  LucideIcon,
  Palette,
  PenTool,
  Pill,
  Search,
  Sprout,
  Stethoscope,
  WalletCards,
} from "lucide-react";
import FadeIn from "./FadeIn";

type CourseItem = {
  id: number;
  name: string;
  count: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  iconColor: string;
  slug: string;
  description: string;
  stats: {
    colleges: string;
    salary: string;
    growth: string;
  };
  image: string;
};

const courses: CourseItem[] = [
  {
    id: 1,
    name: "Medical",
    count: "10 universities +",
    icon: Stethoscope,
    accent: "from-rose-500 via-red-500 to-orange-400",
    accentSoft: "bg-rose-50",
    iconColor: "text-rose-700",
    slug: "medicine",
    description:
      "Prepare for a rewarding career in healthcare. From anatomy to clinical practice, learn from the best in the field.",
    stats: { colleges: "850+", salary: "Rs 8L-25L+", growth: "12%+" },
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Engineering",
    count: "10 universities +",
    icon: Cpu,
    accent: "from-sky-500 via-cyan-500 to-blue-600",
    accentSoft: "bg-sky-50",
    iconColor: "text-sky-700",
    slug: "engineering",
    description:
      "From robotics to renewable energy, engineering shapes tomorrow. Dive into cutting-edge programs that turn ideas into reality.",
    stats: { colleges: "850+", salary: "Rs 6L-20L+", growth: "18%+" },
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Management",
    count: "10 universities +",
    icon: BriefcaseBusiness,
    accent: "from-violet-500 via-fuchsia-500 to-purple-600",
    accentSoft: "bg-violet-50",
    iconColor: "text-violet-700",
    slug: "management",
    description:
      "Lead organizations and drive innovation. Our management courses provide the skills you need to excel in the global business landscape.",
    stats: { colleges: "720+", salary: "Rs 8L-45L+", growth: "15%+" },
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Business",
    count: "10 universities +",
    icon: WalletCards,
    accent: "from-amber-400 via-orange-400 to-red-500",
    accentSoft: "bg-amber-50",
    iconColor: "text-amber-700",
    slug: "commerce",
    description:
      "Master the fundamentals of trade and finance. Our business programs prepare you for the dynamic world of commerce.",
    stats: { colleges: "450+", salary: "Rs 5L-15L+", growth: "10%+" },
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Law and order",
    count: "10 universities +",
    icon: Landmark,
    accent: "from-slate-500 via-slate-600 to-zinc-800",
    accentSoft: "bg-slate-100",
    iconColor: "text-slate-700",
    slug: "law",
    description:
      "Uphold justice and the rule of law. Our legal studies programs offer deep insights into various legal systems and practices.",
    stats: { colleges: "280+", salary: "Rs 6L-20L+", growth: "8%+" },
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Architect",
    count: "10 universities +",
    icon: Compass,
    accent: "from-emerald-400 via-teal-500 to-cyan-600",
    accentSoft: "bg-emerald-50",
    iconColor: "text-emerald-700",
    slug: "design",
    description:
      "Design the spaces of the future. Our architecture programs blend creativity with technical expertise.",
    stats: { colleges: "310+", salary: "Rs 7L-18L+", growth: "14%+" },
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Humanities",
    count: "10 universities +",
    icon: Palette,
    accent: "from-pink-400 via-rose-500 to-fuchsia-600",
    accentSoft: "bg-pink-50",
    iconColor: "text-pink-700",
    slug: "arts",
    description:
      "Explore the vast world of literature, history, and social sciences to understand the human experience.",
    stats: { colleges: "1.2k+", salary: "Rs 4L-12L+", growth: "9%+" },
    image:
      "https://images.unsplash.com/photo-1491843351663-7c116e8148ad?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Pharmacy",
    count: "10 universities +",
    icon: Pill,
    accent: "from-lime-400 via-green-500 to-emerald-600",
    accentSoft: "bg-lime-50",
    iconColor: "text-green-700",
    slug: "pharmacy",
    description:
      "Combine chemistry and biology to become an expert in medications and patient care.",
    stats: { colleges: "560+", salary: "Rs 4L-10L+", growth: "11%+" },
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Agriculture",
    count: "10 universities +",
    icon: Sprout,
    accent: "from-green-400 via-emerald-500 to-teal-500",
    accentSoft: "bg-green-50",
    iconColor: "text-green-700",
    slug: "agriculture",
    description:
      "Learn sustainable farming, biotechnology, and agri-business to feed the future.",
    stats: { colleges: "420+", salary: "Rs 3L-9L+", growth: "15%+" },
    image:
      "https://images.unsplash.com/photo-1523348830342-d0187cf0c28d?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Design",
    count: "10 universities +",
    icon: PenTool,
    accent: "from-indigo-500 via-purple-500 to-pink-500",
    accentSoft: "bg-indigo-50",
    iconColor: "text-indigo-700",
    slug: "design",
    description:
      "Unleash your creativity through graphic design, fashion, interior design, and more. Build a career that blends art with innovation.",
    stats: { colleges: "380+", salary: "Rs 4L-14L+", growth: "13%+" },
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2664&auto=format&fit=crop",
  },
  {
    id: 13,
    name: "Education",
    count: "10 universities +",
    icon: GraduationCap,
    accent: "from-orange-400 via-amber-500 to-yellow-500",
    accentSoft: "bg-orange-50",
    iconColor: "text-orange-700",
    slug: "education",
    description:
      "Prepare for impactful careers in teaching, curriculum design, and academic leadership with modern education studies.",
    stats: { colleges: "290+", salary: "Rs 3L-9L+", growth: "9%+" },
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 15,
    name: "Literature",
    count: "10 universities +",
    icon: BookOpen,
    accent: "from-red-400 via-rose-500 to-pink-600",
    accentSoft: "bg-rose-50",
    iconColor: "text-rose-700",
    slug: "literature",
    description:
      "Dive into language, criticism, writing, and world literature with programs that sharpen thought and expression.",
    stats: { colleges: "340+", salary: "Rs 3L-10L+", growth: "8%+" },
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2670&auto=format&fit=crop",
  },
];

export default function TopCourse() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const current = courses[active] || courses[0];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-24 lg:py-32">
      <div className="home-page-shell relative z-10">
        <FadeIn>
          <div className="mb-16">
            <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-12">
              <h2 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-slate-900 lg:text-[68px]">
                Discover the Top <span style={{ color: "#FF3C3C" }}>Course</span>
              </h2>
              <Link
                href="/careers-courses"
                className="whitespace-nowrap rounded-[5px] border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                View All Course{" "}
                <span className="material-symbols-outlined ml-1 text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
            <p className="max-w-4xl text-xl font-medium leading-relaxed text-slate-500">
              Filter through thousands of institutions worldwide based on your
              specific academic preferences and{" "}
              career goals.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeIn className="flex flex-col gap-10 lg:col-span-8" direction="left">
            <div className="group relative aspect-[3/2] overflow-hidden rounded-none shadow-2xl shadow-black/5">
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

              <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                {Array.from({ length: 5 }, (_, dotIndex) => {
                  const isActiveDot = active % 5 === dotIndex;
                  return (
                    <span
                      key={dotIndex}
                      className={`block rounded-full border border-white/40 transition-all duration-300 ${isActiveDot
                          ? "h-3 w-3 bg-[#ff6b4a] shadow-[0_0_0_2px_rgba(255,255,255,0.15)]"
                          : "h-3 w-3 bg-white"
                        }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[35px] font-semibold leading-none tracking-tight text-[#222222] lg:text-[40px]">
                {current.name}
              </h3>
              <p className="max-w-2xl text-xl font-normal leading-relaxed text-slate-500">
                {current.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-12">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-slate-900">
                    {current.stats.colleges}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    Colleges
                  </span>
                </div>
                <span className="h-12 w-px bg-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-slate-900">
                    {current.stats.salary}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    Avg. Salary
                  </span>
                </div>
                <span className="h-12 w-px bg-slate-300" />
                <div className="flex flex-col">
                  <span
                    className="text-[28px] font-bold"
                    style={{ color: "rgba(0, 177, 33, 1)" }}
                  >
                    {current.stats.growth}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    Job Growth
                  </span>
                </div>
                <Link
                  href={`/careers-courses?stream=${current.slug}`}
                  className="ml-4 flex items-center gap-2 text-[25px] font-bold text-[#FF3C3C] transition-transform hover:translate-x-1"
                >
                  View more{" "}
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "25px", fontWeight: 700 }}
                  >
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn
            className="flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-200 bg-white p-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)] lg:col-span-4"
            direction="right"
            delay={0.1}
          >
            <div className="border-b border-slate-100">
              <div className="relative rounded-[5px] border border-slate-200">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C6C6C]">
                  <Search className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <input
                  type="text"
                  placeholder="Search your course"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 w-full rounded-[5px] pl-10 pr-4 outline-none transition-all"
                  style={{
                    backgroundColor: "rgba(244, 244, 244, 1)",
                    fontSize: "20px",
                    fontWeight: 400,
                    color: "rgba(108, 108, 108, 1)",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-0">
              {filteredCourses.map((course) => {
                const originalIdx = courses.findIndex((c) => c.id === course.id);
                const Icon = course.icon;
                const isActive = active === originalIdx;

                return (
                  <button
                    key={course.id}
                    onMouseEnter={() => setActive(originalIdx)}
                    onClick={() =>
                      router.push(`/careers-courses?stream=${course.slug}`)
                    }
                    className={`group flex items-center gap-4 border-b p-4 text-left transition-all duration-300 ${isActive
                        ? "border-l-[10px] bg-[#fff5f5] text-slate-900"
                        : "bg-white text-slate-900 hover:bg-slate-50"
                      }`}
                    style={
                      isActive
                        ? { borderLeftColor: "rgba(216, 0, 5, 1)" }
                        : { borderBottomColor: "#D9D9D9" }
                    }
                  >
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-300 ${isActive
                          ? `bg-gradient-to-br ${course.accent} border-transparent shadow-lg shadow-rose-200/60`
                          : `${course.accentSoft} border-slate-200 group-hover:-translate-y-0.5 group-hover:shadow-md`
                        }`}
                    >
                      <div
                        className={`absolute inset-[1px] rounded-[4px] ${isActive ? "bg-white/18 backdrop-blur-[2px]" : "bg-white/80"
                          }`}
                      />
                      <div className="relative flex items-center justify-center">
                        <Icon
                          className={`h-[22px] w-[22px] transition-transform duration-300 ${isActive
                              ? "scale-110 text-white"
                              : `${course.iconColor} group-hover:scale-110`
                            }`}
                          strokeWidth={2.1}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div
                        className="leading-none"
                        style={{
                          fontWeight: 500,
                          fontSize: "20px",
                          color: "rgba(108, 108, 108, 1)",
                        }}
                      >
                        {course.name}
                      </div>
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6C6C6C]">
                        {course.count}
                      </div>
                    </div>

                    {isActive && (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#6C6C6C] shadow-sm">
                        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
                      </span>
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
