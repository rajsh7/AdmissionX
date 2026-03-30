import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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
      .limit(12)
      .project({ id: 1, title: 1, slug: 1, image: 1, description: 1, applicationFrom: 1, applicationTo: 1, exminationDate: 1, functionalarea_id: 1 })
      .toArray(),
  ]);

  // Enrich sections with exam counts and fa names
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
      <div className="fixed inset-0 z-0 text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background" fill priority sizes="100vw" quality={80} className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="pt-24 pb-16 relative overflow-hidden">
          <div className="relative w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Examinations</span>
            </nav>

            <div className="w-full max-w-4xl flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">quiz</span>
                  Entrance Exams
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                India&apos;s{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                  Entrance Exams
                </span>{" "}
                — All in One Place
              </h1>
              <p className="text-neutral-400 text-base max-w-2xl leading-relaxed mb-8 text-center">
                Dates, syllabus, eligibility, admit cards, results and preparation tips for every major entrance examination.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Exams", value: totalExams, icon: "description" },
                  { label: "Streams", value: totalStreams, icon: "category" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    <span className="text-white font-black text-lg leading-none">{s.value.toLocaleString("en-IN")}+</span>
                    <span className="text-neutral-500 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 lg:px-8 xl:px-12 py-10 space-y-14">
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Browse by Stream</h2>
              <p className="text-sm text-neutral-300 mt-0.5">Select a category to view all exams in that stream</p>
            </div>

            {sectionRows.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[30px] text-neutral-300">category</span>
                </div>
                <p className="text-sm font-bold text-neutral-600 mb-1">No exam categories yet</p>
                <p className="text-xs text-neutral-400 max-w-xs">Exam categories are being added. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {sectionRows.map((sec) => {
                  const meta = getSectionMeta(sec.name);
                  const examCount = examCountMap[sec.functionalarea_id] ?? 0;
                  return (
                    <Link
                      key={sec.id}
                      href={`/examination/${sec.slug}`}
                      className="group flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all duration-200"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <span className={`material-symbols-outlined text-[24px] ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                      </div>
                      <p className="text-xs font-bold text-neutral-800 group-hover:text-red-600 transition-colors leading-snug mb-1">{sec.name}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        {examCount > 0 ? `${examCount} exam${examCount !== 1 ? "s" : ""}` : "View exams"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Popular Entrance Exams</h2>
              <p className="text-sm text-neutral-300 mt-0.5">Most-searched exams with key dates and info</p>
            </div>

            {examRows.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[30px] text-neutral-300">quiz</span>
                </div>
                <p className="text-sm font-bold text-neutral-600 mb-1">No exams published yet</p>
                <p className="text-xs text-neutral-400 max-w-xs">Exam information is being updated. Please check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
                {examRows.map((exam) => {
                  const fa = exam.functionalarea_id ? faMap[exam.functionalarea_id] : null;
                  const streamSlug = fa?.pageslug ?? "general";
                  const description = stripHtml(exam.description);
                  return (
                    <Link
                      key={exam.id}
                      href={`/examination/${streamSlug}/${exam.slug}`}
                      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      <div className="relative h-36 overflow-hidden bg-neutral-100 flex-shrink-0">
                        <Image
                          src={buildImageUrl(exam.image)}
                          alt={exam.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {fa?.name && (
                          <span className="absolute top-2 left-2 bg-white/90 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{fa.name}</span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-4 gap-3">
                        <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">{exam.title}</h3>
                        {description && <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed flex-1">{description}</p>}
                        <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-neutral-50">
                          {exam.applicationTo && (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                              <span className="text-[10px] text-neutral-500 font-medium">Apply by: <span className="font-bold text-neutral-700">{formatDate(exam.applicationTo)}</span></span>
                            </div>
                          )}
                          {exam.exminationDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                              <span className="text-[10px] text-neutral-500 font-medium">Exam: <span className="font-bold text-neutral-700">{formatDate(exam.exminationDate)}</span></span>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                          View Details
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">Never Miss an Exam Deadline</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">Register as a student to track exams you&apos;re appearing for.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/signup/student" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20">
                <span className="material-symbols-outlined text-[17px]">person_add</span>
                Register Free
              </Link>
              <Link href="/top-colleges" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-white/10">
                <span className="material-symbols-outlined text-[17px]">apartment</span>
                Top Colleges
              </Link>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}
