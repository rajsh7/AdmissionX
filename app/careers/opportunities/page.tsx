import { getDb } from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Career Opportunities — Explore Career Paths | AdmissionX",
  description:
    "Discover career opportunities across engineering, medicine, management, law, and more. Explore salary ranges, skill requirements, and the best courses.",
};

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
  // If it already looks formatted, return as-is
  if (/[₹$£€]/.test(cleaned) || /lpa|lac|lakh|pa/i.test(cleaned)) {
    return cleaned.slice(0, 40);
  }
  const num = parseFloat(cleaned);
  if (!isNaN(num)) {
    if (num >= 100000)
      return `₹${(num / 100000).toFixed(1)} LPA`;
    return `₹${num.toLocaleString("en-IN")}/yr`;
  }
  return cleaned.slice(0, 40);
}

interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  career_count: number;
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
  functionalarea_id: number | null;
  slug: string;
  stream_name: string | null;
  stream_slug: string | null;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const DIFFICULTY_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  low:    { label: "Easy",     color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  medium: { label: "Moderate", color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200"  },
  high:   { label: "Hard",     color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200"    },
  default:{ label: "",         color: "text-neutral-600", bg: "bg-neutral-100", border: "border-neutral-200"},
};

function getDifficultyMeta(raw: string | null) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("low") || lower.includes("easy")) return DIFFICULTY_META.low;
  if (lower.includes("high") || lower.includes("hard")) return DIFFICULTY_META.high;
  if (lower.includes("med") || lower.includes("mod"))   return DIFFICULTY_META.medium;
  return { ...DIFFICULTY_META.default, label: raw.slice(0, 20) };
}

const STREAM_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  engineering:  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: "engineering"      },
  medical:      { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: "medical_services" },
  management:   { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: "business_center"  },
  mba:          { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  icon: "trending_up"      },
  law:          { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: "gavel"            },
  arts:         { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    icon: "palette"          },
  science:      { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    icon: "science"          },
  commerce:     { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  icon: "store"            },
  computer:     { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    icon: "computer"         },
  design:       { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    icon: "draw"             },
  default:      { bg: "bg-neutral-50", text: "text-neutral-700", border: "border-neutral-200", icon: "work"             },
};

function getStreamMeta(slug: string | null) {
  if (!slug) return STREAM_COLORS.default;
  const lower = slug.toLowerCase();
  for (const key of Object.keys(STREAM_COLORS)) {
    if (lower.includes(key)) return STREAM_COLORS[key];
  }
  return STREAM_COLORS.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CareerOpportunitiesPage() {
  const db = await getDb();

  const careerDocs = await db.collection("counseling_career_relevants")
    .find({ status: 1, slug: { $exists: true, $ne: "" } })
    .sort({ id: 1 }).limit(120)
    .project({ id: 1, title: 1, description: 1, image: 1, salery: 1, stream: 1, mandatorySubject: 1, academicDifficulty: 1, careerInterest: 1, functionalarea_id: 1, slug: 1 })
    .toArray();

  const faIds = [...new Set(careerDocs.map((c) => c.functionalarea_id).filter(Boolean))];
  const faDocs = faIds.length ? await db.collection("functionalarea").find({ id: { $in: faIds } }).project({ id: 1, name: 1, pageslug: 1 }).toArray() : [];
  const faMap = Object.fromEntries(faDocs.map((f) => [f.id, f]));

  const careerRows: CareerRelevantRow[] = careerDocs.map((c) => {
    const fa = c.functionalarea_id ? faMap[c.functionalarea_id] : null;
    return {
      id: c.id, title: c.title, description: c.description ?? null, image: c.image ?? null,
      salery: c.salery ?? null, stream: c.stream ?? null, mandatorySubject: c.mandatorySubject ?? null,
      academicDifficulty: c.academicDifficulty ?? null, careerInterest: c.careerInterest ?? null,
      functionalarea_id: c.functionalarea_id ?? null, slug: c.slug,
      stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null,
    };
  });

  const streamCountMap: Record<number, number> = {};
  for (const c of careerRows) {
    if (c.functionalarea_id) streamCountMap[c.functionalarea_id] = (streamCountMap[c.functionalarea_id] ?? 0) + 1;
  }
  const streamRows: StreamRow[] = faDocs
    .filter((f) => (streamCountMap[f.id] ?? 0) > 0)
    .map((f) => ({ id: f.id, name: f.name, pageslug: f.pageslug, career_count: streamCountMap[f.id] ?? 0 }))
    .sort((a, b) => b.career_count - a.career_count)
    .slice(0, 24);

  const totalCareers = careerRows.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/popular-careers" className="hover:text-white transition-colors">
              Careers
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Opportunities</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">explore</span>
                Career Opportunities
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                Career Opportunity
              </span>
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-2xl">
              Explore {totalCareers > 0 ? `${totalCareers}+ ` : ""}career opportunities across
              streams. Each opportunity shows salary expectations, required subjects, academic
              difficulty, and what it takes to succeed.
            </p>

            {/* Stats pills */}
            {totalCareers > 0 && (
              <div className="flex flex-wrap gap-5">
                {[
                  { icon: "work",     label: "Opportunities", value: totalCareers      },
                  { icon: "category", label: "Fields",        value: streamRows.length },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[18px] text-red-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {s.icon}
                    </span>
                    <span className="text-white font-black text-lg leading-none">
                      {s.value}
                    </span>
                    <span className="text-neutral-500 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stream filter bar ──────────────────────────────────────────── */}
      {streamRows.length > 0 && (
        <div className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest shrink-0 mr-1">
                Filter:
              </span>
              <a
                href="#all"
                className="shrink-0 inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-full"
              >
                <span className="material-symbols-outlined text-[13px]">apps</span>
                All ({totalCareers})
              </a>
              {streamRows.map((s) => {
                const slug =
                  s.pageslug ?? s.name.toLowerCase().replace(/\s+/g, "-");
                const meta = getStreamMeta(slug);
                return (
                  <a
                    key={s.id}
                    href={`/careers/opportunities/${slug}`}
                    className={`shrink-0 inline-flex items-center gap-1.5 ${meta.bg} ${meta.text} border ${meta.border} text-xs font-bold px-3.5 py-2 rounded-full transition-all hover:shadow-sm`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {meta.icon}
                    </span>
                    {s.name}
                    <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                      {s.career_count}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10" id="all">
        {totalCareers === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {careerRows.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        )}

        {/* ── CTA banner ── */}
        {totalCareers > 0 && (
          <div className="mt-14 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[24px] text-red-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-1">
                  Want detailed career profiles?
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                  Browse in-depth career guides with job roles, salary data,
                  required skills, and top colleges that can get you there.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/popular-careers"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-900/30 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">star</span>
                Popular Careers
              </Link>
              <Link
                href="/careers-courses"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">
                  menu_book
                </span>
                Career Courses
              </Link>
            </div>
          </div>
        )}
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
  const streamSlug =
    career.stream_slug ??
    (career.stream_name ?? "").toLowerCase().replace(/\s+/g, "-");
  const streamMeta = getStreamMeta(streamSlug);
  const difficultyMeta = getDifficultyMeta(career.academicDifficulty);

  // Parse mandatory subjects for chips
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

        {/* Stream badge */}
        {career.stream_name && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold ${streamMeta.bg} ${streamMeta.text} border ${streamMeta.border} px-2.5 py-1 rounded-full backdrop-blur-sm`}
          >
            {career.stream_name}
          </span>
        )}

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

        {/* Mandatory subjects */}
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

        {/* Difficulty + Interest */}
        <div className="flex flex-wrap gap-1.5">
          {difficultyMeta && difficultyMeta.label && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold ${difficultyMeta.color} ${difficultyMeta.bg} border ${difficultyMeta.border} px-2 py-0.5 rounded-full`}
            >
              <span className="material-symbols-outlined text-[11px]">
                signal_cellular_alt
              </span>
              {difficultyMeta.label}
            </span>
          )}
          {career.careerInterest && typeof career.careerInterest === 'string' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[11px]">
                favorite
              </span>
              {career.careerInterest.slice(0, 20)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-medium">
            Career path
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 group-hover:gap-1.5 transition-all">
            Learn more
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[36px] text-neutral-300">
          work_off
        </span>
      </div>
      <h2 className="text-lg font-black text-neutral-700 mb-2">
        No opportunities found
      </h2>
      <p className="text-sm text-neutral-400 max-w-sm mb-6">
        Career opportunities are being added. Check back soon.
      </p>
      <div className="flex gap-3">
        <Link
          href="/popular-careers"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">star</span>
          Popular Careers
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">home</span>
          Home
        </Link>
      </div>
    </div>
  );
}
