import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  bannerimage: string | null;
  college_count: number;
  degree_count: number;
  course_count: number;
}

interface StreamCard {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  college_count: number;
  degree_count: number;
  course_count: number;
  color: string;
  icon: string;
  gradient: string;
}

// ─── Stream color + icon mapping ─────────────────────────────────────────────

const STREAM_META: Record<
  string,
  { color: string; icon: string; gradient: string }
> = {
  engineering: {
    color: "text-blue-700",
    icon: "engineering",
    gradient: "from-blue-500 to-blue-700",
  },
  management: {
    color: "text-purple-700",
    icon: "business_center",
    gradient: "from-purple-500 to-purple-700",
  },
  mba: {
    color: "text-indigo-700",
    icon: "trending_up",
    gradient: "from-indigo-500 to-indigo-700",
  },
  medical: {
    color: "text-red-700",
    icon: "medical_services",
    gradient: "from-red-500 to-red-700",
  },
  law: {
    color: "text-amber-700",
    icon: "gavel",
    gradient: "from-amber-500 to-amber-600",
  },
  arts: {
    color: "text-rose-700",
    icon: "palette",
    gradient: "from-rose-500 to-rose-700",
  },
  science: {
    color: "text-emerald-700",
    icon: "science",
    gradient: "from-emerald-500 to-emerald-700",
  },
  commerce: {
    color: "text-orange-700",
    icon: "account_balance",
    gradient: "from-orange-500 to-orange-600",
  },
  computer: {
    color: "text-cyan-700",
    icon: "computer",
    gradient: "from-cyan-500 to-cyan-700",
  },
  education: {
    color: "text-teal-700",
    icon: "school",
    gradient: "from-teal-500 to-teal-700",
  },
  pharmacy: {
    color: "text-green-700",
    icon: "medication",
    gradient: "from-green-500 to-green-700",
  },
  design: {
    color: "text-pink-700",
    icon: "draw",
    gradient: "from-pink-500 to-pink-700",
  },
  hospitality: {
    color: "text-yellow-700",
    icon: "hotel",
    gradient: "from-yellow-500 to-yellow-600",
  },
  media: {
    color: "text-violet-700",
    icon: "movie",
    gradient: "from-violet-500 to-violet-700",
  },
  agriculture: {
    color: "text-lime-700",
    icon: "agriculture",
    gradient: "from-lime-500 to-lime-700",
  },
  architecture: {
    color: "text-stone-700",
    icon: "architecture",
    gradient: "from-stone-500 to-stone-700",
  },
  default: {
    color: "text-neutral-700",
    icon: "menu_book",
    gradient: "from-neutral-500 to-neutral-700",
  },
};

function getStreamMeta(name: string) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(STREAM_META)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return STREAM_META.default;
}

const GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-red-500 to-rose-700",
  "from-emerald-500 to-teal-700",
  "from-purple-500 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-green-500 to-emerald-700",
  "from-violet-500 to-purple-700",
  "from-orange-500 to-red-600",
];

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Explore Study Streams | AdmissionX",
  description:
    "Browse all study streams — Engineering, MBA, Medical, Law, Arts, Science and more. Find colleges by your area of interest.",
};

// ─── Route-level cache ────────────────────────────────────────────────────────
// Cache this page for 5 minutes to avoid slow query on every request
export const revalidate = 300;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StreamPage() {
  // Fetch all streams with aggregated counts - optimized query
  let streamRows: StreamRow[] = [];

  try {
    const [rows] = (await pool.query(`
      SELECT
        f.id,
        f.name,
        f.pageslug,
        f.logoimage,
        f.bannerimage,
        COALESCE(
          (SELECT COUNT(DISTINCT cm.collegeprofile_id)
           FROM collegemaster cm
           WHERE cm.functionalarea_id = f.id), 0
        ) AS college_count,
        COALESCE(
          (SELECT COUNT(*)
           FROM degree d
           WHERE d.functionalarea_id = f.id), 0
        ) AS degree_count,
        COALESCE(
          (SELECT COUNT(*)
           FROM course c
           WHERE c.functionalarea_id = f.id), 0
        ) AS course_count
      FROM functionalarea f
      WHERE f.name IS NOT NULL AND f.name != ''
      ORDER BY f.isShowOnTop DESC, f.name ASC
      LIMIT 50
    `)) as [StreamRow[], unknown];
    streamRows = rows;
  } catch (err) {
    console.error("[stream/page.tsx]", err);
  }

  // Sort by college count after fetching
  streamRows.sort((a, b) => Number(b.college_count) - Number(a.college_count));

  // Build stream cards
  const streams: StreamCard[] = streamRows.map((row, i) => {
    const slug =
      row.pageslug ??
      row.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const meta = getStreamMeta(row.name);
    return {
      id: row.id,
      name: row.name,
      slug,
      image: row.bannerimage
        ? `https://admin.admissionx.in/uploads/${row.bannerimage}`
        : null,
      college_count: Number(row.college_count) || 0,
      degree_count: Number(row.degree_count) || 0,
      course_count: Number(row.course_count) || 0,
      color: meta.color,
      icon: meta.icon,
      gradient: meta.gradient || GRADIENTS[i % GRADIENTS.length],
    };
  });

  const totalColleges = streams.reduce((s, r) => s + r.college_count, 0);
  const totalStreams = streams.length;

  // Split: featured (top 6 by college count) + rest
  const featured = streams.slice(0, 6);
  const remaining = streams.slice(6);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Streams</span>
          </nav>

          <div className="max-w-3xl">
            {/* Label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">
                  school
                </span>
                Explore by Stream
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                Field of Study
              </span>
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8">
              Browse {totalStreams} streams across India&apos;s top colleges.
              Pick your passion — from Engineering to Arts, Medical to Law.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { label: "Streams", value: totalStreams, icon: "category" },
                {
                  label: "Colleges",
                  value: `${Math.floor(totalColleges / 100) * 100}+`,
                  icon: "account_balance",
                },
                { label: "Degrees", value: "200+", icon: "workspace_premium" },
                { label: "Courses", value: "1500+", icon: "menu_book" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-red-400">
                    {stat.icon}
                  </span>
                  <div>
                    <span className="text-white font-black text-lg leading-none">
                      {stat.value}
                    </span>
                    <span className="text-neutral-500 text-xs block">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {/* ── Featured Streams (large cards) ── */}
        {featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-neutral-900">
                  Popular Streams
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Most-searched fields of study
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((stream, i) => (
                <Link
                  key={stream.id}
                  href={`/search?stream=${stream.slug}`}
                  className="group relative overflow-hidden rounded-3xl bg-neutral-900 min-h-[200px] flex flex-col justify-between p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-black/20"
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stream.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}
                  />

                  {/* Decorative circle */}
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full bg-white/5" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <span className="material-symbols-outlined text-[22px] text-white">
                        {stream.icon}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-white/90 transition-colors">
                      {stream.name}
                    </h3>

                    {/* College count */}
                    <p className="text-white/70 text-sm font-medium">
                      {stream.college_count.toLocaleString()} colleges
                    </p>
                  </div>

                  {/* Bottom stats */}
                  <div className="relative z-10 mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/60 text-xs font-medium">
                      {stream.degree_count > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">
                            workspace_premium
                          </span>
                          {stream.degree_count} degrees
                        </span>
                      )}
                      {stream.course_count > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">
                            menu_book
                          </span>
                          {stream.course_count} courses
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors group-hover:bg-white group-hover:text-neutral-900 duration-300">
                      Explore
                      <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── All Streams grid ── */}
        {remaining.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-neutral-900">
                  All Streams
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {remaining.length} more streams to explore
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {remaining.map((stream, i) => (
                <Link
                  key={stream.id}
                  href={`/search?stream=${stream.slug}`}
                  className="group flex items-center gap-3 bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 p-4"
                >
                  {/* Icon bubble */}
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">
                      {stream.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors truncate">
                      {stream.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {stream.college_count.toLocaleString()} colleges
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="material-symbols-outlined text-[18px] text-neutral-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {streams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[40px] text-neutral-300">
                school
              </span>
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">
              No streams found
            </h3>
            <p className="text-sm text-neutral-500 max-w-xs">
              We couldn&apos;t load the streams right now. Please try again
              shortly.
            </p>
          </div>
        )}

        {/* ── CTA Banner ── */}
        {streams.length > 0 && (
          <div className="mt-16 rounded-3xl bg-neutral-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Can&apos;t decide your stream?
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm">
                  Browse all colleges across every stream, apply filters, and
                  find the perfect fit for your career goals.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    search
                  </span>
                  Explore All Colleges
                </Link>
                <Link
                  href="/top-colleges"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    emoji_events
                  </span>
                  Top Colleges
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
