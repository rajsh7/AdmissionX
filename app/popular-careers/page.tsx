import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_CAREER_IMAGE =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600";

export const metadata: Metadata = {
  title: "Popular Careers — Explore Career Options | AdmissionX",
  description:
    "Discover the most in-demand careers across engineering, medicine, management, law, and more. Get salary insights, skill requirements, and top colleges.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || raw.trim() === "") return DEFAULT_CAREER_IMAGE;
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

function excerpt(text: string | null | undefined, maxLen = 120): string {
  const clean = stripHtml(text);
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  career_count: number;
}

interface CareerRow {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  jobProfileDesc: string | null;
  pros: string | null;
  cons: string | null;
  futureGrowthPurpose: string | null;
  employeeOpportunities: string | null;
  slug: string;
  status: number;
  functionalarea_id: number | null;
  stream_name: string | null;
  stream_slug: string | null;
  totalLikes: number;
}

// ─── Stream colour map ────────────────────────────────────────────────────────

const STREAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  engineering:  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"  },
  medical:      { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200"   },
  management:   { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200"},
  mba:          { bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200"},
  law:          { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  arts:         { bg: "bg-pink-50",    text: "text-pink-700",   border: "border-pink-200"  },
  science:      { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200"},
  commerce:     { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200"},
  computer:     { bg: "bg-cyan-50",    text: "text-cyan-700",   border: "border-cyan-200"  },
  design:       { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200"  },
  default:      { bg: "bg-neutral-50", text: "text-neutral-700",border: "border-neutral-200"},
};

function getStreamColor(slug: string | null) {
  if (!slug) return STREAM_COLORS.default;
  const lower = slug.toLowerCase();
  for (const key of Object.keys(STREAM_COLORS)) {
    if (lower.includes(key)) return STREAM_COLORS[key];
  }
  return STREAM_COLORS.default;
}

const STREAM_ICONS: Record<string, string> = {
  engineering: "engineering",
  medical: "medical_services",
  management: "business_center",
  mba: "trending_up",
  law: "gavel",
  arts: "palette",
  science: "science",
  commerce: "store",
  computer: "computer",
  design: "draw",
  default: "work",
};

function getStreamIcon(slug: string | null): string {
  if (!slug) return STREAM_ICONS.default;
  const lower = slug.toLowerCase();
  for (const key of Object.keys(STREAM_ICONS)) {
    if (lower.includes(key)) return STREAM_ICONS[key];
  }
  return STREAM_ICONS.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PopularCareersPage() {
  const db = await getDb();

  const careerDocs = await db.collection("counseling_career_details")
    .find({ status: 1, slug: { $exists: true, $ne: "" } })
    .sort({ totalLikes: -1, id: -1 })
    .limit(60)
    .project({ id: 1, title: 1, description: 1, image: 1, jobProfileDesc: 1, pros: 1, cons: 1, futureGrowthPurpose: 1, employeeOpportunities: 1, slug: 1, status: 1, functionalarea_id: 1, totalLikes: 1 })
    .toArray();

  const faIds = [...new Set(careerDocs.map((c) => c.functionalarea_id).filter(Boolean))];
  const faDocs = faIds.length
    ? await db.collection("functionalarea").find({ id: { $in: faIds } }).project({ id: 1, name: 1, pageslug: 1 }).toArray()
    : [];
  const faMap = Object.fromEntries(faDocs.map((f) => [f.id, f]));

  const careerRows: CareerRow[] = careerDocs.map((c) => {
    const fa = c.functionalarea_id ? faMap[c.functionalarea_id] : null;
    return {
      id: c.id, title: c.title, description: c.description ?? null, image: c.image ?? null,
      jobProfileDesc: c.jobProfileDesc ?? null, pros: c.pros ?? null, cons: c.cons ?? null,
      futureGrowthPurpose: c.futureGrowthPurpose ?? null, employeeOpportunities: c.employeeOpportunities ?? null,
      slug: c.slug, status: c.status, functionalarea_id: c.functionalarea_id ?? null,
      stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null,
      totalLikes: Number(c.totalLikes) || 0,
    };
  });

  // Count careers per stream
  const streamCountMap: Record<number, number> = {};
  for (const c of careerRows) {
    if (c.functionalarea_id) streamCountMap[c.functionalarea_id] = (streamCountMap[c.functionalarea_id] ?? 0) + 1;
  }
  const streamRows: StreamRow[] = faDocs
    .filter((f) => (streamCountMap[f.id] ?? 0) > 0)
    .map((f) => ({ id: f.id, name: f.name, pageslug: f.pageslug, career_count: streamCountMap[f.id] ?? 0 }))
    .sort((a, b) => b.career_count - a.career_count)
    .slice(0, 20);

  const totalCareers = careerRows.length;

  // ─── Group by stream for the "by stream" section ─────────────────────────
  const careersByStream = new Map<string, CareerRow[]>();
  for (const c of careerRows) {
    const key = c.stream_slug ?? "other";
    if (!careersByStream.has(key)) careersByStream.set(key, []);
    careersByStream.get(key)!.push(c);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <section className="bg-neutral-900 pt-24 pb-16 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #dc2626 0%, transparent 50%), radial-gradient(circle at 75% 20%, #7c3aed 0%, transparent 40%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Popular Careers</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">star</span>
                Career Guidance
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Explore{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                Popular Careers
              </span>
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-2xl">
              Discover in-demand career paths with detailed insights on job roles,
              salary ranges, required skills, and top institutions to study at.
            </p>

            {/* Quick stats */}
            {totalCareers > 0 && (
              <div className="flex flex-wrap gap-5 mt-8">
                {[
                  { icon: "work", label: "Career Profiles", value: totalCareers },
                  { icon: "category", label: "Fields", value: streamRows.length },
                  {
                    icon: "trending_up",
                    label: "Avg. Salary Data",
                    value: "Available",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-white/80">
                        {stat.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-none">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </p>
                      <p className="text-neutral-500 text-[11px] mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stream Filter Chips ── */}
      {streamRows.length > 0 && (
        <section className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest shrink-0 mr-1">
                Browse by:
              </span>
              <a
                href="#all-careers"
                className="shrink-0 inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors hover:bg-red-700"
              >
                <span className="material-symbols-outlined text-[13px]">apps</span>
                All ({totalCareers})
              </a>
              {streamRows.map((s) => {
                const slug = s.pageslug ?? s.name.toLowerCase().replace(/\s+/g, "-");
                const colors = getStreamColor(slug);
                const icon = getStreamIcon(slug);
                return (
                  <a
                    key={s.id}
                    href={`#stream-${slug}`}
                    className={`shrink-0 inline-flex items-center gap-1.5 ${colors.bg} ${colors.text} border ${colors.border} text-xs font-bold px-3.5 py-2 rounded-full transition-all hover:shadow-sm`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {icon}
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
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-14">
        {/* ── No Data State ── */}
        {totalCareers === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[36px] text-neutral-300">
                work_off
              </span>
            </div>
            <h2 className="text-lg font-black text-neutral-700 mb-2">
              No career profiles yet
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm">
              Career profiles are being added. Check back soon.
            </p>
          </div>
        )}

        {/* ── All Careers (flat grid) ── */}
        {totalCareers > 0 && streamRows.length === 0 && (
          <section id="all-careers">
            <SectionHeader
              icon="work"
              title="All Career Profiles"
              count={totalCareers}
            />
            <CareerGrid careers={careerRows} />
          </section>
        )}

        {/* ── Grouped by stream ── */}
        {streamRows.length > 0 && (
          <>
            {/* All careers anchor */}
            <div id="all-careers" />

            {streamRows.map((stream) => {
              const slug =
                stream.pageslug ??
                stream.name.toLowerCase().replace(/\s+/g, "-");
              const careers = careersByStream.get(slug) ?? [];
              if (careers.length === 0) return null;
              const colors = getStreamColor(slug);
              const icon = getStreamIcon(slug);

              return (
                <section key={stream.id} id={`stream-${slug}`} className="scroll-mt-20">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${colors.text}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icon}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-neutral-900">
                          {stream.name}
                        </h2>
                        <p className="text-xs text-neutral-500">
                          {careers.length} career profile
                          {careers.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {careers.length > 6 && (
                      <Link
                        href={`/careers/opportunities/${slug}`}
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        View all {stream.name} careers
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>

                  <CareerGrid careers={careers.slice(0, 6)} />

                  {careers.length > 6 && (
                    <div className="mt-4 text-center sm:hidden">
                      <Link
                        href={`/careers/opportunities/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        View all {stream.name} careers
                        <span className="material-symbols-outlined text-[15px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}

        {/* ── CTA Banner ── */}
        <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[24px] text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                explore
              </span>
            </div>
            <div>
              <h3 className="text-white font-black text-xl mb-1">
                Not sure which career suits you?
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                Take a career assessment to discover paths aligned with your
                interests, skills, and academic background.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/careers/opportunities"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-white/10 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                explore
              </span>
              Career Opportunities
            </Link>
            <Link
              href="/top-colleges"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-900/30 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                school
              </span>
              Find Colleges
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-7 bg-red-600 rounded-full block shrink-0" />
      <span
        className="material-symbols-outlined text-[22px] text-red-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <h2 className="text-xl font-black text-neutral-900">{title}</h2>
      <span className="text-sm text-neutral-400 font-semibold">
        ({count})
      </span>
    </div>
  );
}

// ─── Career Grid ──────────────────────────────────────────────────────────────

function CareerGrid({ careers }: { careers: CareerRow[] }) {
  if (careers.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {careers.map((career) => (
        <CareerCard key={career.id} career={career} />
      ))}
    </div>
  );
}

// ─── Career Card ──────────────────────────────────────────────────────────────

function CareerCard({ career }: { career: CareerRow }) {
  const imgUrl = buildImageUrl(career.image);
  const descText = excerpt(career.description ?? career.jobProfileDesc, 115);
  const streamSlug =
    career.stream_slug ??
    (career.stream_name ?? "").toLowerCase().replace(/\s+/g, "-");
  const colors = getStreamColor(streamSlug);

  // Count pros / cons for a quick badge
  const prosCount = career.pros
    ? career.pros
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean).length
    : 0;
  const consCount = career.cons
    ? career.cons
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean).length
    : 0;

  return (
    <Link
      href={`/popular-careers/${career.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-200/60 hover:border-neutral-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 bg-neutral-100 overflow-hidden">
        <Image
          src={imgUrl}
          alt={career.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={undefined}
          unoptimized={imgUrl.startsWith("http") && !imgUrl.includes("unsplash")}
        />
        {/* Stream badge */}
        {career.stream_name && (
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} ${colors.border} border text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm`}
            >
              {career.stream_name}
            </span>
          </div>
        )}
        {/* Likes */}
        {career.totalLikes > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[11px] font-bold text-neutral-600 px-2.5 py-1 rounded-full shadow-sm">
            <span
              className="material-symbols-outlined text-[13px] text-red-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            {career.totalLikes.toLocaleString()}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
          {career.title}
        </h3>

        {descText && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mb-4 flex-1">
            {descText}
          </p>
        )}

        {/* Pros / Cons pills */}
        {(prosCount > 0 || consCount > 0) && (
          <div className="flex items-center gap-2 mb-4">
            {prosCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[12px]">
                  thumb_up
                </span>
                {prosCount} pro{prosCount !== 1 ? "s" : ""}
              </span>
            )}
            {consCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[12px]">
                  thumb_down
                </span>
                {consCount} con{consCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Feature pills row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {career.futureGrowthPurpose && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[11px]">
                trending_up
              </span>
              Growth Insights
            </span>
          )}
          {career.employeeOpportunities && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[11px]">
                apartment
              </span>
              Job Opportunities
            </span>
          )}
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-[11px] text-neutral-400 font-medium">
            Career Profile
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:gap-2 transition-all">
            Explore
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
