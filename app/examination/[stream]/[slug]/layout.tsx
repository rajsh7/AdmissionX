import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExamTabsUnified from "./ExamTabsUnified";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return DEFAULT_BANNER;
  const s = String(raw);
  return s.startsWith("http") ? s : `${IMAGE_BASE}${s}`;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return null as unknown as string;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isUpcoming(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = new Date(raw);
  return !isNaN(d.getTime()) && d > new Date();
}

function slugToName(slug: string | null | undefined): string {
  if (!slug) return "";
  return String(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stream: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const exam = await db.collection("examination_details").findOne(
    { slug },
    { projection: { title: 1, description: 1 } },
  );
  if (!exam) return { title: "Exam Details | AdmissionX" };

  const desc = exam.description
    ? String(exam.description).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
    : `Get complete information on ${exam.title} — exam dates, eligibility, syllabus, admit card, results and more.`;

  return {
    title: `${exam.title} 2024-25 — Dates, Syllabus, Eligibility | AdmissionX`,
    description: desc,
    openGraph: { title: exam.title, description: desc },
  };
}

export default async function ExamLayout({
  params,
  children,
}: {
  params: Promise<{ stream: string; slug: string }>;
  children: React.ReactNode;
}) {
  const { stream, slug } = await params;
  const db = await getDb();

  const examDocs = await db.collection("examination_details").aggregate([
    { $match: { slug } },
    { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
    { $lookup: { from: "exam_sections", localField: "functionalarea_id", foreignField: "functionalarea_id", as: "es" } },
    { $lookup: { from: "examination_types", localField: "typeOfExaminations_id", foreignField: "id", as: "et" } },
    { $limit: 1 },
    {
      $project: {
        id: 1, title: 1, slug: 1, image: 1, description: 1,
        applicationFrom: 1, applicationTo: 1, exminationDate: 1,
        resultAnnounce: 1, getMoreInfoLink: 1, totalViews: 1, totalLikes: 1,
        typeOfExaminations_id: 1, functionalarea_id: 1,
        stream_name: { $arrayElemAt: ["$fa.name", 0] },
        stream_slug: { $arrayElemAt: ["$fa.pageslug", 0] },
        section_slug: { $arrayElemAt: ["$es.slug", 0] },
        exam_type_name: { $arrayElemAt: ["$et.name", 0] },
      },
    },
  ]).toArray();

  const exam = examDocs[0];
  if (!exam) notFound();

  const examId = exam.id ?? exam._id;

  const [faqCount, questionCount] = await Promise.all([
    db.collection("exam_faqs").countDocuments({ typeOfExaminations_id: examId }),
    db.collection("exam_questions").countDocuments({ typeOfExaminations_id: examId }),
  ]);

  const sectionSlug = stream;
  const examTitle = exam.title ?? slugToName(slug);
  const bannerUrl = buildImageUrl(exam.image);

  const keyDates = [
    { icon: "edit_document", label: "Application Open", date: formatDate(exam.applicationFrom), upcoming: isUpcoming(exam.applicationFrom), color: "text-amber-700" },
    { icon: "event", label: "Exam Date", date: formatDate(exam.exminationDate), upcoming: isUpcoming(exam.exminationDate), color: "text-red-700" },
    { icon: "emoji_events", label: "Result Announcement", date: formatDate(exam.resultAnnounce), upcoming: isUpcoming(exam.resultAnnounce), color: "text-emerald-700" },
  ].filter((d) => d.date);

  const basePath = `/examination/${sectionSlug}/${slug}`;

  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <div className="fixed inset-0 w-full h-full -z-20 text-[0px] font-[0] leading-[0]">
        <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[2px] z-10" />
        <Image src={bannerUrl} alt="" fill priority sizes="100vw" quality={80} className="object-cover" />
      </div>

      <div className="relative pt-16 overflow-hidden">
        <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
          <Image src={bannerUrl} alt={examTitle} fill priority sizes="100vw" quality={90} className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 to-neutral-900/30" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pt-8">
          <div className="w-full px-4 lg:px-8 xl:px-12 pb-6 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mb-3 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <Link href="/examination" className="hover:text-white transition-colors">Examinations</Link>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <Link href={`/examination/${sectionSlug}`} className="hover:text-white transition-colors capitalize">
                {exam.stream_name ?? slugToName(sectionSlug)}
              </Link>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <span className="text-white font-semibold truncate max-w-[200px]">{examTitle}</span>
            </nav>

            <div className="flex flex-col items-center gap-3">
              <div className="flex-1 min-w-0">
                {exam.exam_type_name && (
                  <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                    <span className="material-symbols-outlined text-[12px]">label</span>
                    {exam.exam_type_name}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{examTitle}</h1>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                  {exam.stream_name && (
                    <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-400">category</span>
                      {exam.stream_name}
                    </span>
                  )}
                  {exam.exminationDate && (
                    <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-400">event</span>
                      {formatDate(exam.exminationDate)}
                    </span>
                  )}
                  {(exam.totalViews ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {Number(exam.totalViews).toLocaleString("en-IN")} views
                    </span>
                  )}
                </div>
              </div>

              {exam.getMoreInfoLink && (
                <a href={exam.getMoreInfoLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Official Site
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExamTabsUnified basePath={basePath} faqCount={faqCount} questionCount={questionCount} />

      <div className="w-full px-4 lg:px-8 xl:px-12 py-8 relative z-10">
        <div className="flex gap-6 lg:gap-8 items-start">
          <main className="flex-1 min-w-0">{children}</main>

          <aside className="hidden lg:flex flex-col gap-5 w-72 xl:w-80 flex-shrink-0">
            {keyDates.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden z-10">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2 bg-white">
                  <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                  <h3 className="text-sm font-black text-black">Key Dates</h3>
                </div>
                <div className="divide-y divide-neutral-100 bg-white">
                  {keyDates.map((kd) => (
                    <div key={kd.label} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <span className={`material-symbols-outlined text-[16px] ${kd.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{kd.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide leading-none mb-1">{kd.label}</p>
                        <p className="text-sm font-black text-black">{kd.date}</p>
                        {kd.upcoming && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-white border border-emerald-100 px-1.5 py-0.5 rounded-full mt-1 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden z-10">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2 bg-white">
                <span className="material-symbols-outlined text-[18px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <h3 className="text-sm font-black text-black">Quick Info</h3>
              </div>
              <div className="p-5 space-y-3 bg-white">
                {[
                  { label: "Stream", value: exam.stream_name, icon: "category" },
                  { label: "Type", value: exam.exam_type_name, icon: "label" },
                  { label: "FAQs", value: faqCount > 0 ? `${faqCount} available` : null, icon: "help" },
                  { label: "Q&A", value: questionCount > 0 ? `${questionCount} questions` : null, icon: "forum" },
                ]
                  .filter((r) => r.value)
                  .map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                        <span className="material-symbols-outlined text-[14px]">{row.icon}</span>
                        {row.label}
                      </span>
                      <span className="text-xs font-bold text-black text-right">{row.value}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-white font-black text-sm">Prepare for {examTitle}</h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Find colleges that accept {examTitle} scores and start your application process.
              </p>
              <Link href="/top-colleges"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[15px]">apartment</span>
                Find Accepting Colleges
              </Link>
              <Link href="/signup/student"
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[15px]">person_add</span>
                Register for Updates
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
