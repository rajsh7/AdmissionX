import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExamListClient from "./ExamListClient";
import ExploreCards from "@/app/components/ExploreCards";
import ExamCalendarCard from "./ExamCalendarCard";

export const dynamic = 'force-dynamic';

const DEFAULT_EXAM_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600";
const HERO_BG = encodeURI(
  "/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55 (1).png",
);

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

export default async function ExaminationHubPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const db = await getDb();

  const examFilter: Record<string, unknown> = { status: 1 };
  if (q) {
    examFilter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const [sectionRows, examRows] = await Promise.all([
    db.collection("exam_sections")
      .find({ status: 1 })
      .sort({ isShowOnTop: -1, isShowOnHome: -1, id: 1 })
      .limit(16)
      .project({ id: 1, name: 1, slug: 1, iconImage: 1, functionalarea_id: 1 })
      .toArray(),
    db.collection("examination_details")
      .find(examFilter)
      .sort({ created_at: -1 })
      .limit(50)
      .project({ id: 1, title: 1, slug: 1, image: 1, description: 1, applicationFrom: 1, applicationTo: 1, exminationDate: 1, functionalarea_id: 1, getMoreInfoLink: 1, syllabus: 1 })
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
    db.collection("examination_details").countDocuments(examFilter),
    db.collection("exam_sections").countDocuments({ status: 1 }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <div className="relative z-10">
        <Header />

        {/* Hero section */}
        <div className="pt-20 sm:pt-24 pb-8 w-full px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
          <div
            className="relative bg-white rounded-[5px] shadow-lg border border-neutral-200 overflow-hidden flex flex-col md:flex-row bg-cover bg-right bg-no-repeat"
            style={{ minHeight: "360px", backgroundImage: `url("${HERO_BG}")` }}
          >

            <div className="relative z-10 pt-10 pb-16 px-8 md:px-12 lg:px-16 flex-1 flex flex-col justify-start">
              <h1
                className="leading-[1.15] mb-4"
                style={{ fontWeight: 600, fontSize: "48px", color: "rgba(62, 62, 62, 1)" }}
              >
                Finds Your Next Competitive exam
              </h1>
              <p
                className="max-w-[520px] mb-8 leading-relaxed"
                style={{ fontWeight: 500, fontSize: "20px", color: "rgba(62, 62, 62, 0.71)" }}
              >
                Discover all exams which can refine your future,
                <br />
                unlock gate for dream University.
              </p>

              <form method="GET" action="/examination" className="flex w-full max-w-[560px] h-[51.8px] rounded-[5px] shadow-md transition-all">
                <div className="flex flex-1 items-center bg-white border border-neutral-200 border-r-0 rounded-l-[5px]">
                  <div className="flex items-center pl-4 pr-2 text-neutral-400">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    suppressHydrationWarning
                    placeholder="Location, universities, courses..."
                    className="flex-1 px-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent font-medium min-w-0"
                  />
                </div>
                <button type="submit" suppressHydrationWarning className="flex-shrink-0 bg-[#FF3C3C] hover:bg-[#E23434] text-white font-bold px-10 transition-colors text-sm tracking-wide rounded-r-[5px]">
                  Search
                </button>
              </form>
            </div>

            <div className="relative w-[40%] min-h-[250px] md:min-h-full flex-shrink-0">
              <div className="relative w-full h-full min-h-[220px] rounded-none overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200"
                  alt="Competitive Exam"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-l from-transparent to-white/75 hidden md:block" />
            </div>
          </div>
        </div>

        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

            {/* Left Column */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] sm:text-[19px] font-black text-[#444]">Upcoming & Urgent</h2>
                <Link href="/examination" className="text-[13px] font-bold text-neutral-500 hover:text-neutral-800 transition-colors">View All</Link>
              </div>

              {examRows.length === 0 ? (
                <div className="bg-white rounded-[5px] p-8 text-center text-neutral-500 border border-neutral-200 shadow-md">No exams available.</div>
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
                    getMoreInfoLink: exam.getMoreInfoLink ?? null,
                    syllabus: exam.syllabus ?? null,
                  }))}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full max-w-[280px] flex-shrink-0 space-y-6 pt-10">

              <ExamCalendarCard />

              {/* Most Searched Card */}
              <div className="bg-white border border-neutral-200 rounded-[5px] p-6 shadow-md">
                <h3
                  className="mb-5"
                  style={{ fontWeight: 600, fontSize: "18px", color: "rgba(62, 62, 62, 1)" }}
                >
                  Most Searched
                </h3>
                <div className="space-y-6">
                  <Link href="/examination?q=JEE%20Mains" className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "16px", color: "rgba(62, 62, 62, 0.75)" }}>JEE Mains</div>
                      <div className="text-xs text-neutral-500">Central Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </Link>
                  <Link href="/examination?q=CUET%20UG" className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "16px", color: "rgba(62, 62, 62, 0.75)" }}>CUET UG</div>
                      <div className="text-xs text-neutral-500">State Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </Link>
                  <Link href="/examination?q=CUET%20PG" className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "16px", color: "rgba(62, 62, 62, 0.75)" }}>CUET PG</div>
                      <div className="text-xs text-neutral-500">Postgraduate Universities</div>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-neutral-400 group-hover:text-red-500 transition-colors">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Cards */}
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 pb-12">
          <ExploreCards />
        </div>

        <Footer />
      </div>
    </div>
  );
}
