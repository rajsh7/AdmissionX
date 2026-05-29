import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExamListClient from "../ExamListClient";
import ExploreCards from "@/app/components/ExploreCards";
import ExamCalendarCard from "../ExamCalendarCard";

export const dynamic = 'force-dynamic';

const DEFAULT_EXAM_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600";
const HERO_BG = encodeURI(
  "/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55 (1).png",
);

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: { params: Promise<{ stream: string }> }): Promise<Metadata> {
  const { stream } = await params;
  const db = await getDb();
  const sec = await db.collection("exam_sections").findOne({ slug: stream }, { projection: { name: 1 } });
  const name = sec?.name ?? stream.replace(/-/g, " ");
  return {
    title: `${name} Entrance Exams 2026 | Dates, Syllabus & Results – AdmissionX`,
    description: `Explore all ${name} entrance exams — JEE, NEET, CAT, GATE and more. Get exam dates, eligibility, syllabus, admit cards, results and preparation tips.`,
  };
}

export default async function ExaminationStreamPage({
  params,
  searchParams,
}: {
  params: Promise<{ stream: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { stream } = await params;
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const db = await getDb();

  const secDoc = await db.collection("exam_sections").findOne({ slug: stream });
  if (!secDoc) notFound();

  const streamName: string = secDoc.name;
  let exams: any[] = [];

  if (secDoc.functionalarea_id) {
    const examFilter: Record<string, any> = {
      functionalarea_id: secDoc.functionalarea_id,
      slug: { $exists: true, $ne: "" },
      status: 1,
    };
    if (q) {
      examFilter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const examDocs = await db.collection("examination_details")
      .find(examFilter)
      .sort({ created_at: -1 })
      .project({
        id: 1,
        title: 1,
        slug: 1,
        image: 1,
        description: 1,
        applicationFrom: 1,
        applicationTo: 1,
        exminationDate: 1,
        functionalarea_id: 1,
        getMoreInfoLink: 1,
        syllabus: 1,
      })
      .toArray();

    exams = examDocs;
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <Header />
      <div className="relative z-10">

        {/* Hero section */}
        <div className="pt-[100px] lg:pt-[104px] pb-8 w-full px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
          <div
            className="relative bg-white rounded-[5px] shadow-lg border border-neutral-200 overflow-hidden flex flex-col md:flex-row bg-cover bg-right bg-no-repeat"
            style={{ minHeight: "360px", backgroundImage: `url("${HERO_BG}")` }}
          >

            <div className="relative z-10 pt-10 pb-16 px-8 md:px-12 lg:px-16 flex-1 flex flex-col justify-start">
              <h1
                className="leading-[1.15] mb-4 text-[32px] sm:text-[48px]"
                style={{ fontWeight: 600, color: "rgba(62, 62, 62, 1)" }}
              >
                Finds Your Next Competitive {streamName} exam
              </h1>
              <p
                className="max-w-[520px] mb-8 leading-relaxed text-base sm:text-[20px]"
                style={{ fontWeight: 500, color: "rgba(62, 62, 62, 0.71)" }}
              >
                Discover all {streamName.toLowerCase()} exams which can refine your future,
                <br />
                unlock gate for dream University.
              </p>

              <form method="GET" action={`/examination/${stream}`} className="flex flex-col sm:flex-row w-full max-w-[800px] sm:h-[60px] gap-2 sm:gap-0 rounded-[5px] sm:shadow-md transition-all">
                <div className="flex flex-1 items-center bg-white border border-neutral-200 sm:border-r-0 rounded-[5px] sm:rounded-r-none h-[60px] sm:h-auto shadow-md sm:shadow-none">
                  <div className="flex items-center pl-5 pr-2 text-neutral-400">
                    <span className="material-symbols-outlined text-[24px]">search</span>
                  </div>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    suppressHydrationWarning
                    placeholder={`Search ${streamName.toLowerCase()} exams, dates, syllabus...`}
                    className="flex-1 px-2 text-base text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent font-medium min-w-0"
                  />
                </div>
                <button type="submit" suppressHydrationWarning className="flex-shrink-0 bg-[#FF3C3C] hover:bg-[#E23434] text-white font-bold px-12 h-[60px] sm:h-auto transition-colors text-base tracking-wide rounded-[5px] sm:rounded-l-none shadow-md sm:shadow-none">
                  Search
                </button>
              </form>
            </div>

            <div className="relative w-full md:w-[40%] min-h-[250px] md:min-h-full flex-shrink-0">
              <div className="relative w-full h-full min-h-[220px] rounded-none overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200"
                  alt={`${streamName} Entrance Exam`}
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
                <h2 className="text-[17px] sm:text-[19px] font-black text-[#444]">{streamName} Entrance Exams</h2>
                <Link href="/examination" className="text-[13px] font-bold text-neutral-500 hover:text-neutral-800 transition-colors">View All Streams</Link>
              </div>

              {exams.length === 0 ? (
                <div className="bg-white rounded-[5px] p-8 text-center text-neutral-500 border border-neutral-200 shadow-md">No {streamName.toLowerCase()} exams available.</div>
              ) : (
                <ExamListClient
                  exams={exams.map((exam) => ({
                    id: exam.id,
                    title: exam.title,
                    slug: exam.slug ?? "",
                    streamSlug: stream,
                    streamName: streamName,
                    description: stripHtml(exam.description),
                    applicationTo: exam.applicationTo ?? null,
                    exminationDate: exam.exminationDate ?? null,
                    getMoreInfoLink: exam.getMoreInfoLink ?? null,
                    syllabus: exam.syllabus ?? null,
                  }))}
                  search={q}
                  hideFilters={true}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:max-w-[280px] flex-shrink-0 space-y-6 pt-0 lg:pt-10">

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
