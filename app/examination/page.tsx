import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExamListClient from "./ExamListClient";

export const dynamic = 'force-dynamic';

const DEFAULT_EXAM_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600";

export const metadata: Metadata = {
  title: "Entrance Exams 2024–25 | Dates, Syllabus & Results – AdmissionX",
  description:
    "Explore all entrance exams — JEE, NEET, CAT, GATE and more. Get exam dates, eligibility, syllabus, admit cards, results and preparation tips.",
};

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || raw === "NULL") return DEFAULT_EXAM_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `https://admin.admissionx.in/uploads/${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const SECTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  engineering:  { icon: "engineering",      color: "text-blue-700",    bg: "bg-blue-50"    },
  medical:      { icon: "medical_services", color: "text-red-700",     bg: "bg-red-50"     },
  management:   { icon: "business_center",  color: "text-purple-700",  bg: "bg-purple-50"  },
  mba:          { icon: "trending_up",      color: "text-indigo-700",  bg: "bg-indigo-50"  },
  law:          { icon: "gavel",            color: "text-amber-700",   bg: "bg-amber-50"   },
  arts:         { icon: "palette",          color: "text-pink-700",    bg: "bg-pink-50"    },
  science:      { icon: "science",          color: "text-teal-700",    bg: "bg-teal-50"    },
  commerce:     { icon: "account_balance",  color: "text-emerald-700", bg: "bg-emerald-50" },
  computer:     { icon: "computer",         color: "text-cyan-700",    bg: "bg-cyan-50"    },
  pharmacy:     { icon: "medication",       color: "text-lime-700",    bg: "bg-lime-50"    },
  design:       { icon: "brush",            color: "text-rose-700",    bg: "bg-rose-50"    },
  architecture: { icon: "architecture",     color: "text-orange-700",  bg: "bg-orange-50"  },
  agriculture:  { icon: "eco",              color: "text-green-700",   bg: "bg-green-50"   },
  default:      { icon: "quiz",             color: "text-neutral-600", bg: "bg-neutral-100"},
};

function getSectionMeta(name: string) {
  const key = name.toLowerCase().split(/\s+/)[0];
  return SECTION_ICONS[key] ?? SECTION_ICONS.default;
}

export default async function ExaminationHubPage() {
  const db = await getDb();

  const [sectionRows, examRows] = await Promise.all([
    db.collection("exam_sections")
      .find({ status: 1 })
      .sort({ isShowOnTop: -1, isShowOnHome: -1, id: 1 })
      .limit(16)
      .project({ id: 1, name: 1, slug: 1, iconImage: 1, functionalarea_id: 1 })
      .toArray(),
    db.collection("examination_details")
      .find({ status: 1 })
      .sort({ created_at: -1 })
      .limit(50)
      .project({ id: 1, title: 1, slug: 1, image: 1, description: 1, applicationFrom: 1, applicationTo: 1, exminationDate: 1, functionalarea_id: 1 })
      .toArray(),
  ]);

  const faIds = [...new Set([
    ...sectionRows.map((s) => s.functionalarea_id),
    ...examRows.map((e) => e.functionalarea_id),
  ].filter(Boolean))];

  const [faRows, examCounts] = await Promise.all([
    db.collection("functionalarea")
      .find({ id: { $in: faIds } })
      .project({ id: 1, name: 1, pageslug: 1 })
      .toArray(),
    db.collection("examination_details").aggregate([
      { $match: { status: 1, functionalarea_id: { $in: faIds } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const faMap = Object.fromEntries(faRows.map((f) => [f.id, f]));
  const examCountMap = Object.fromEntries(examCounts.map((e) => [e._id, e.count]));

  const [totalExams, totalStreams] = await Promise.all([
    db.collection("examination_details").countDocuments({ status: 1 }),
    db.collection("exam_sections").countDocuments({ status: 1 }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <div className="relative z-10">
        <Header />

        {/* Hero section */}
        <div className="pt-24 pb-8 w-full px-4 lg:px-8 xl:px-12 max-w-[1400px] mx-auto min-h-[500px]">
          <div className="relative bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "360px" }}>
            <div className="absolute inset-0 z-0" style={{ background: "repeating-linear-gradient(-45deg, #f8fafc, #f8fafc 60px, #ffffff 60px, #ffffff 120px)" }}></div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-neutral-700 leading-[1.15] mb-4">
                Finds Your Next <br /> Competitive exam
              </h1>
              <p className="text-neutral-500 font-semibold text-sm md:text-base max-w-[400px] mb-8 leading-relaxed">
                Discover all exams which can refine your future, unlock gate for dream University.
              </p>

              <div className="flex w-full max-w-[420px] bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm">
                <div className="flex items-center pl-4 pr-2 text-neutral-400">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder="Location, universities, courses..."
                  className="flex-1 py-3 px-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent font-medium"
                />
                <button suppressHydrationWarning className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 transition-colors text-sm tracking-wide">
                  Search
                </button>
              </div>
            </div>

            <div className="relative w-[40%] min-h-[250px] md:min-h-full flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200"
                alt="Competitive Exam"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent hidden md:block"></div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full px-4 lg:px-8 xl:px-12 py-10 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left Column */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] sm:text-[19px] font-black text-[#444]">Upcoming & Urgent</h2>
                <Link href="/examination" className="text-[13px] font-bold text-neutral-500 hover:text-neutral-800 transition-colors">View All</Link>
              </div>

              {examRows.length === 0 ? (
                <div className="bg-white rounded-md p-8 text-center text-neutral-500 border border-neutral-200 shadow-sm">No exams available.</div>
              ) : (
                <ExamListClient
                  exams={examRows.map((exam) => ({
                    id: exam.id,
                    title: exam.title,
                    slug: exam.slug,
                    streamSlug: exam.functionalarea_id ? faMap[exam.functionalarea_id]?.pageslug ?? "general" : "general",
                    streamName: exam.functionalarea_id ? faMap[exam.functionalarea_id]?.name ?? null : null,
                    description: stripHtml(exam.description),
                    applicationTo: exam.applicationTo ?? null,
                    exminationDate: exam.exminationDate ?? null,
                  }))}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full max-w-[280px] flex-shrink-0 space-y-6 pt-10">

              {/* Calendar Card */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                  </button>
                  <div className="font-black text-2xl text-neutral-900">March 2026</div>
                  <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                  </button>
                </div>
                <div className="flex justify-around text-center text-xs font-semibold text-neutral-400 mb-3">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="flex justify-between gap-3 flex-wrap text-center text-sm font-medium">
                  {(() => {
                    const year = 2026, month = 2;
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
                    return Array.from({ length: total }, (_, i) => {
                      const dayNum = i - firstDay + 1;
                      if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="h-9" />;
                      let cls = "h-7 w-7 flex items-center justify-center rounded-2xl transition-colors hover:bg-neutral-100";
                      if (dayNum === 19) cls += " bg-red-100 text-red-600 font-bold";
                      else if (dayNum === 23) cls += " bg-red-600 text-white font-bold";
                      return <div key={i} className={cls}>{dayNum}</div>;
                    });
                  })()}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-100 space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="text-red-500 mt-px">•</span>
                    <div>
                      <div className="font-semibold text-red-500">NOV 28, 2026</div>
                      <div className="text-neutral-600">CAT 2026 EXAM DAY</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-red-500 mt-px">•</span>
                    <div>
                      <div className="font-semibold text-red-500">NOV 28, 2026</div>
                      <div className="text-neutral-600">CAT 2026 EXAM DAY</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Most Searched Card */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-xl mb-5 text-neutral-900">Most Searched</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div className="font-semibold text-neutral-900">JEE Mains</div>
                      <div className="text-xs text-neutral-500">Central Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div className="font-semibold text-neutral-900">CUET UG</div>
                      <div className="text-xs text-neutral-500">State Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div className="font-semibold text-neutral-900">CUET UG</div>
                      <div className="text-xs text-neutral-500">State Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="w-full px-4 lg:px-8 xl:px-12 pb-12 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/colleges", icon: "apartment", label: "Top Colleges", desc: "Browse best colleges across India", iconBg: "bg-blue-50", iconColor: "text-blue-600", border: "hover:border-blue-200", arrow: "group-hover:text-blue-600" },
              { href: "/careers-courses", icon: "menu_book", label: "Top Courses", desc: "Explore popular courses & careers", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", border: "hover:border-emerald-200", arrow: "group-hover:text-emerald-600" },
              { href: "/top-university", icon: "school", label: "Top Universities", desc: "Discover top ranked universities", iconBg: "bg-purple-50", iconColor: "text-purple-600", border: "hover:border-purple-200", arrow: "group-hover:text-purple-600" },
              { href: "/stream", icon: "category", label: "Streams", desc: "Find your stream & specialisation", iconBg: "bg-red-50", iconColor: "text-red-600", border: "hover:border-red-200", arrow: "group-hover:text-red-600" },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group bg-white border border-neutral-200 ${card.border} rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {card.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-black text-[15px] text-neutral-800">{card.label}</p>
                  <p className="text-[12px] text-neutral-500 font-medium mt-0.5 leading-snug">{card.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[12px] font-bold text-neutral-400 ${card.arrow} transition-colors`}>Explore</span>
                  <span className={`material-symbols-outlined text-[15px] text-neutral-400 ${card.arrow} transition-colors`}>arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
