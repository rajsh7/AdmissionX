import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string | null | undefined, maxLen = 110): string {
  const clean = stripHtml(text);
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function formatSalary(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "";
  const cleaned = raw.trim();
  if (/[₹$£€]/.test(cleaned) || /lpa|lac|lakh|pa/i.test(cleaned)) {
    return cleaned.slice(0, 40);
  }
  const num = parseFloat(cleaned);
  if (!isNaN(num)) {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} LPA`;
    return `₹${num.toLocaleString("en-IN")}/yr`;
  }
  return cleaned.slice(0, 40);
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  bannerimage: string | null;
  description: string | null;
}

interface CareerRelevantRow {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  salery: string | null;
  stream: string | null;
  mandatorySubject: string | null;
  academicDifficulty: string | null;
  careerInterest: string | null;
  slug: string;
}

interface RelatedStreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  career_count: number;
}

// ─── Difficulty helpers ───────────────────────────────────────────────────────

const DIFFICULTY_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "Easy",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  medium: {
    label: "Moderate",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  high: {
    label: "Hard",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  default: {
    label: "",
    color: "text-neutral-600",
    bg: "bg-neutral-100",
    border: "border-neutral-200",
  },
};

function getDifficultyMeta(raw: string | null) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("low") || lower.includes("easy"))
    return DIFFICULTY_META.low;
  if (lower.includes("high") || lower.includes("hard"))
    return DIFFICULTY_META.high;
  if (lower.includes("med") || lower.includes("mod"))
    return DIFFICULTY_META.medium;
  return { ...DIFFICULTY_META.default, label: raw.slice(0, 20) };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ stream: string }> }): Promise<Metadata> {
  const { stream } = await params;
  const db = await getDb();
  const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { name: 1 } });
  const name = fa?.name ?? stream.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} Career Opportunities — Paths, Salary & More | AdmissionX`,
    description: `Explore career opportunities in ${name}. Get salary ranges, mandatory subjects, difficulty levels, and more.`,
  };
}
export default async function CareerOpportunitiesByStreamPage({ params }: { params: Promise<{ stream: string }> }) {
  const { stream } = await params;
  const db = await getDb();

  const faDoc = await db.collection("functionalarea").findOne({ pageslug: stream });
  if (!faDoc) notFound();
  const streamInfo: StreamRow = { id: faDoc.id, name: faDoc.name, pageslug: faDoc.pageslug ?? null, bannerimage: faDoc.bannerimage ?? null, description: faDoc.pagedescription ?? null };
  const streamName = streamInfo.name;

  const [careerDocs, relatedFaDocs] = await Promise.all([
    db.collection("counseling_career_relevants")
      .find({ functionalarea_id: streamInfo.id, status: 1, slug: { $exists: true, $ne: "" } })
      .sort({ id: 1 })
      .project({ id: 1, title: 1, description: 1, image: 1, salery: 1, stream: 1, mandatorySubject: 1, academicDifficulty: 1, careerInterest: 1, slug: 1 })
      .toArray(),
    db.collection("counseling_career_relevants").aggregate([
      { $match: { status: 1, functionalarea_id: { $ne: streamInfo.id } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "functionalarea", localField: "_id", foreignField: "id", as: "fa" } },
      { $unwind: "$fa" },
      { $project: { id: "$fa.id", name: "$fa.name", pageslug: "$fa.pageslug", career_count: "$count" } },
    ]).toArray(),
  ]);

  const careers: CareerRelevantRow[] = careerDocs.map((c) => ({
    id: c.id, title: c.title, description: c.description ?? null, image: c.image ?? null,
    salery: c.salery ?? null, stream: c.stream ?? null, mandatorySubject: c.mandatorySubject ?? null,
    academicDifficulty: c.academicDifficulty ?? null, careerInterest: c.careerInterest ?? null, slug: c.slug,
  }));
  const relatedStreams: RelatedStreamRow[] = relatedFaDocs.map((r) => ({ id: r.id, name: r.name, pageslug: r.pageslug ?? null, career_count: r.career_count }));
  const totalCareers = careers.length;

  // ── Group careers by careerInterest ──────────────────────────────────────
  const byInterest = new Map<string, CareerRelevantRow[]>();
  for (const c of careers) {
    const key = c.careerInterest?.trim() || "General";
    if (!byInterest.has(key)) byInterest.set(key, []);
    byInterest.get(key)!.push(c);
  }

  const interestGroups = Array.from(byInterest.entries());
  const useGrouped =
    interestGroups.length > 1 && interestGroups.length <= 6;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-14 relative overflow-hidden">
        {/* Subtle tinted background */}
        {streamInfo.bannerimage && (
          <div className="absolute inset-0 z-0 opacity-10">
            <Image
              src={buildImageUrl(streamInfo.bannerimage)}
              alt=""
              fill
              priority
              className="object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-900/95 to-neutral-900" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <Link
              href="/careers/opportunities"
              className="hover:text-white transition-colors"
            >
              Career Opportunities
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">{streamName}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">
                    explore
                  </span>
                  Career Opportunities
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                {streamName}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                  Careers
                </span>
              </h1>

              {streamInfo.description ? (
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                  {excerpt(streamInfo.description, 200)}
                </p>
              ) : (
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                  Explore career opportunities in {streamName} — with salary
                  insights, required subjects, difficulty levels, and more.
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-black text-white">{totalCareers}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  Careers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interest Group Filter ─────────────────────────────────────────── */}
      {useGrouped && (
        <div className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest shrink-0 mr-1">
                Interest:
              </span>
              {interestGroups.map(([key]) => (
                <a
                  key={key}
                  href={`#interest-${key.toLowerCase().replace(/\s+/g, "-")}`}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-3.5 py-2 rounded-full hover:bg-red-100 transition-colors"
                >
                  {key}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {totalCareers === 0 ? (
          <EmptyState streamName={streamName} />
        ) : useGrouped ? (
          <div className="space-y-12">
            {interestGroups.map(([interestKey, groupCareers]) => (
              <section
                key={interestKey}
                id={`interest-${interestKey.toLowerCase().replace(/\s+/g, "-")}`}
                className="scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-1 h-6 bg-red-600 rounded-full block" />
                  <h2 className="text-lg font-black text-neutral-900">
                    {interestKey}
                  </h2>
                  <span className="text-sm text-neutral-400">
                    ({groupCareers.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {groupCareers.map((career) => (
                    <CareerCard key={career.id} career={career} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat grid when no meaningful grouping */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {careers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        )}

        {/* ── Related Streams ──────────────────────────────────────────── */}
        {relatedStreams.length > 0 && (
          <div className="mt-14">
            <h3 className="text-base font-black text-neutral-900 mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-red-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                explore
              </span>
              Explore Other Career Streams
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedStreams.map((s) => {
                const slug =
                  s.pageslug ??
                  s.name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={s.id}
                    href={`/careers/opportunities/${slug}`}
                    className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-700 hover:text-red-700 text-xs font-bold px-4 py-2 rounded-full transition-all"
                  >
                    {s.name}
                    <span className="text-neutral-400 text-[10px]">
                      {s.career_count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA strip ─────────────────────────────────────────────────── */}
        <div className="mt-14 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[24px] text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <div>
              <h3 className="text-white font-black text-lg mb-1">
                Ready to pursue a {streamName} career?
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                Find top colleges offering {streamName} programmes and apply
                directly through AdmissionX.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/top-colleges"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-900/30 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">
                apartment
              </span>
              Find Colleges
            </Link>
            <Link
              href="/popular-careers"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">
                star
              </span>
              Popular Careers
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── Career Card ──────────────────────────────────────────────────────────────

function CareerCard({ career }: { career: CareerRelevantRow }) {
  const imgUrl = buildImageUrl(career.image);
  const descText = excerpt(career.description, 110);
  const salary = formatSalary(career.salery);
  const difficultyMeta = getDifficultyMeta(career.academicDifficulty);

  const subjects: string[] = career.mandatorySubject
    ? career.mandatorySubject
        .split(/[,/;]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)
        .slice(0, 3)
    : [];

  return (
    <Link
      href={`/popular-careers/${career.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-lg hover:shadow-neutral-200/60 overflow-hidden transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-40 bg-neutral-100 overflow-hidden">
        <Image
          src={imgUrl}
          alt={career.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 300px"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Salary badge */}
        {salary && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-emerald-600">
              payments
            </span>
            <span className="text-[10px] font-black text-emerald-700">
              {salary}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
          {career.title}
        </h3>

        {descText && (
          <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-3 flex-1">
            {descText}
          </p>
        )}

        {/* Subject chips */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subjects.map((sub, i) => (
              <span
                key={i}
                className="text-[9px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-wide"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Difficulty pill */}
        {difficultyMeta && difficultyMeta.label && (
          <span
            className={`self-start inline-flex items-center gap-1 text-[10px] font-bold ${difficultyMeta.color} ${difficultyMeta.bg} border ${difficultyMeta.border} px-2.5 py-0.5 rounded-full`}
          >
            <span className="material-symbols-outlined text-[11px]">
              signal_cellular_alt
            </span>
            {difficultyMeta.label}
          </span>
        )}

        {/* Footer */}
        <div className="pt-2.5 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-medium">
            Career path
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 group-hover:gap-1.5 transition-all">
            View Profile
            <span className="material-symbols-outlined text-[13px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ streamName }: { streamName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[36px] text-red-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          work_off
        </span>
      </div>
      <h2 className="text-lg font-black text-neutral-700 mb-2">
        No {streamName} career opportunities yet
      </h2>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed mb-6">
        Career opportunities for this stream are being added. Browse all
        available opportunities in the meantime.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/careers/opportunities"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">explore</span>
          All Opportunities
        </Link>
        <Link
          href="/popular-careers"
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">star</span>
          Popular Careers
        </Link>
      </div>
    </div>
  );
}
