import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface CollegeRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  location: string | null;
  city_name: string | null;
  state_id: number | null;
  image: string | null;
  rating: string | null;
  totalRatingUser: string | null;
  ranking: string | null;
  isTopUniversity: number;
  topUniversityRank: string | null;
  universityType: string | null;
  estyear: string | null;
  verified: number;
  totalStudent: string | null;
  streams_raw: string | null;
  min_fees: string | null;
  max_fees: string | null;
}

interface StreamRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  college_count: number;
}

interface DegreeRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
}

interface CountryRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  college_count: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[study-abroad/page.tsx safeQuery]", err);
    return [];
  }
}

function buildColleges(rows: CollegeRow[]): CollegeResult[] {
  return rows.map((row) => {
    const name =
      row.name && row.name !== row.slug
        ? row.name
        : slugToName(row.slug || "college");

    const streams = row.streams_raw
      ? row.streams_raw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return {
      id: row.id,
      slug: row.slug,
      name,
      location: row.location || row.city_name || "International",
      city_name: row.city_name,
      state_id: row.state_id,
      image: buildImageUrl(row.image),
      rating: parseFloat(String(row.rating)) || 0,
      totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
      ranking: row.ranking ? parseInt(String(row.ranking)) : null,
      isTopUniversity: row.isTopUniversity ?? 0,
      topUniversityRank: row.topUniversityRank
        ? parseInt(String(row.topUniversityRank))
        : null,
      universityType: row.universityType || null,
      estyear: row.estyear || null,
      verified: row.verified ?? 0,
      totalStudent: row.totalStudent
        ? parseInt(String(row.totalStudent))
        : null,
      streams,
      min_fees: row.min_fees ? parseInt(String(row.min_fees)) : null,
      max_fees: row.max_fees ? parseInt(String(row.max_fees)) : null,
    };
  });
}

// ─── Page-specific fetch (international colleges) ─────────────────────────────

async function fetchAbroadColleges(opts: {
  stream: string;
  degree: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { stream, degree, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  // Simplified query - just get international colleges
  const conditions: string[] = [
    "cp.registeredAddressCountryId != 1",
    "cp.registeredAddressCountryId IS NOT NULL",
  ];
  const params: (string | number)[] = [];

  const whereClause = conditions.join(" AND ");
  const orderBy = "cp.rating DESC, cp.id DESC";

  const dataSql = `
    SELECT
      cp.id,
      cp.slug,
      COALESCE(NULLIF(TRIM(cp.slug), ''), 'College') AS name,
      COALESCE(cp.registeredSortAddress, '') AS location,
      NULL AS city_name,
      NULL AS state_id,
      cp.bannerimage AS image,
      COALESCE(cp.rating, 0) AS rating,
      COALESCE(cp.totalRatingUser, 0) AS totalRatingUser,
      cp.ranking,
      cp.isTopUniversity,
      cp.topUniversityRank,
      cp.universityType,
      cp.estyear,
      cp.verified,
      cp.totalStudent,
      '' AS streams_raw,
      NULL AS min_fees,
      NULL AS max_fees
    FROM collegeprofile cp
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    WHERE ${whereClause}
  `;

  try {
    const [[dataRows], [countRows]] = await Promise.all([
      pool.query(dataSql, params) as Promise<[CollegeRow[], unknown]>,
      pool.query(countSql, params) as Promise<[CountRow[], unknown]>,
    ]);
    const total = countRows[0]?.total ?? 0;
    return {
      colleges: buildColleges(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[study-abroad/page.tsx fetchAbroadColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: import("next").Metadata = {
  title: "Study Abroad — International Colleges & Universities | AdmissionX",
  description:
    "Explore top international colleges and universities for study abroad. Find the best programs, fees, and admission details for studying outside India.",
};

// ─── Destination country cards ─────────────────────────────────────────────────

const DESTINATION_META: Record<
  string,
  { flag: string; highlight: string; color: string }
> = {
  "united states": {
    flag: "🇺🇸",
    highlight: "World-class research & innovation",
    color: "from-blue-600 to-blue-800",
  },
  usa: {
    flag: "🇺🇸",
    highlight: "World-class research & innovation",
    color: "from-blue-600 to-blue-800",
  },
  "united kingdom": {
    flag: "🇬🇧",
    highlight: "Prestigious heritage universities",
    color: "from-indigo-600 to-indigo-800",
  },
  uk: {
    flag: "🇬🇧",
    highlight: "Prestigious heritage universities",
    color: "from-indigo-600 to-indigo-800",
  },
  canada: {
    flag: "🇨🇦",
    highlight: "Welcoming & multicultural campuses",
    color: "from-red-600 to-red-800",
  },
  australia: {
    flag: "🇦🇺",
    highlight: "Global rankings, vibrant lifestyle",
    color: "from-yellow-500 to-orange-600",
  },
  germany: {
    flag: "🇩🇪",
    highlight: "Free / low-cost tuition options",
    color: "from-neutral-700 to-neutral-900",
  },
  singapore: {
    flag: "🇸🇬",
    highlight: "Asia's top education hub",
    color: "from-red-500 to-rose-700",
  },
  "new zealand": {
    flag: "🇳🇿",
    highlight: "Safe & high quality of life",
    color: "from-emerald-600 to-teal-700",
  },
  ireland: {
    flag: "🇮🇪",
    highlight: "Tech hub with post-study work visa",
    color: "from-green-600 to-green-800",
  },
  france: {
    flag: "🇫🇷",
    highlight: "Art, culture & top business schools",
    color: "from-blue-500 to-violet-700",
  },
  netherlands: {
    flag: "🇳🇱",
    highlight: "Innovation & English-taught programs",
    color: "from-orange-500 to-orange-700",
  },
};

function getDestinationMeta(countryName: string) {
  const lower = countryName.toLowerCase();
  return (
    DESTINATION_META[lower] ?? {
      flag: "🌍",
      highlight: "Quality education abroad",
      color: "from-neutral-600 to-neutral-800",
    }
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 300; // Cache for 5 minutes

export default async function StudyAbroadPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const stream = getString("stream");
  const degree = getString("degree");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const showSearchResults = !!(stream || degree || feesMax || page > 1);
  const limit = 12;

  // ── Parallel data fetches (simplified to avoid timeouts) ────────────────
  const [{ colleges, total, totalPages }, streamRows, degreeRows, countryRows] =
    await Promise.all([
      // Abroad colleges
      fetchAbroadColleges({ stream, degree, feesMax, sort, page, limit }),

      // Streams - simple query without counts
      safeQuery<StreamRow>(`
        SELECT id, name, pageslug, 0 AS college_count
        FROM functionalarea
        WHERE name IS NOT NULL AND name != ''
        ORDER BY isShowOnTop DESC, name ASC
        LIMIT 20
      `),

      // Degrees
      safeQuery<DegreeRow>(`
        SELECT id, name, pageslug
        FROM degree
        WHERE name IS NOT NULL AND name != '' AND isShowOnTop = 1
        ORDER BY name
        LIMIT 50
      `),

      // Countries - simple query without counts
      safeQuery<CountryRow>(`
        SELECT id, name, pageslug, logoimage, 0 AS college_count
        FROM country
        WHERE id != 1 AND name IS NOT NULL AND name != ''
        ORDER BY isShowOnHome DESC, name ASC
        LIMIT 12
      `),
    ]);

  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    count: r.college_count,
  }));

  const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
  }));

  // If filters are active, show search results directly
  if (showSearchResults) {
    return (
      <SearchClient
        initialColleges={colleges}
        initialTotal={total}
        initialTotalPages={totalPages}
        streams={streamOptions}
        degrees={degreeOptions}
        cities={[]}
        initQ=""
        initStream={stream}
        initDegree={degree}
        initCityId=""
        initStateId=""
        initFeesMax={feesMax}
        initSort={sort}
        initPage={page}
        initType="abroad"
        pageTitle="Study Abroad Colleges"
        pageSubtitle={`${total.toLocaleString()} international colleges and universities`}
      />
    );
  }

  // ── Landing page view (no active filters) ─────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="relative bg-neutral-900 overflow-hidden pt-24 pb-20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[100px] translate-y-1/2" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-7">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Study Abroad</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">
                  flight_takeoff
                </span>
                Study Abroad
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
              Study at the World&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                Best Universities
              </span>
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Discover top international colleges in the USA, UK, Canada,
              Australia, and more. Compare programs, fees, and admission
              requirements — all in one place.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              {[
                {
                  icon: "public",
                  label: "Countries",
                  value: `${countryRows.length}+`,
                },
                {
                  icon: "account_balance",
                  label: "Colleges",
                  value: `${total}+`,
                },
                { icon: "school", label: "Programs", value: "500+" },
                {
                  icon: "currency_rupee",
                  label: "Scholarships",
                  value: "100+",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-red-400">
                      {stat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none">
                      {stat.value}
                    </p>
                    <p className="text-neutral-500 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/study-abroad?stream=engineering"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-red-600/20"
              >
                <span className="material-symbols-outlined text-[18px]">
                  search
                </span>
                Explore Programs
              </Link>
              <Link
                href="#destinations"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  public
                </span>
                Browse Destinations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Study Abroad ── */}
      <div className="bg-white py-14 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">
              Why Study Abroad?
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">
              An international degree opens doors to global opportunities,
              diverse cultures, and world-class education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "public",
                title: "Global Recognition",
                desc: "Degrees from top international universities are valued by employers worldwide.",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: "diversity_3",
                title: "Cultural Exposure",
                desc: "Experience diverse cultures, languages, and perspectives that shape your worldview.",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: "trending_up",
                title: "Higher Salary",
                desc: "International graduates command 40–60% higher salaries in competitive job markets.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: "hub",
                title: "Global Network",
                desc: "Build lifelong connections with peers and professionals from around the world.",
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-start p-5 bg-neutral-50 rounded-2xl border border-neutral-100"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${item.color}`}
                  >
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-sm font-black text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular Destinations ── */}
      {countryRows.length > 0 && (
        <div id="destinations" className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1">
                  Popular Destinations
                </h2>
                <p className="text-neutral-500 text-sm">
                  Top countries for Indian students studying abroad
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {countryRows.map((country) => {
                const meta = getDestinationMeta(country.name);
                const slug =
                  country.pageslug ??
                  country.name.toLowerCase().replace(/\s+/g, "-");

                return (
                  <Link
                    key={country.id}
                    href={`/search?type=abroad`}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-900 p-5 min-h-[140px] flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
                  >
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-80 group-hover:opacity-90 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{meta.flag}</div>
                      <h3 className="text-base font-black text-white mb-0.5">
                        {country.name}
                      </h3>
                      <p className="text-white/60 text-xs leading-snug">
                        {meta.highlight}
                      </p>
                    </div>

                    {/* College count */}
                    <div className="relative z-10 mt-4 flex items-center justify-between">
                      <span className="text-white/70 text-xs font-medium">
                        {Number(country.college_count)} colleges
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Browse by Stream ── */}
      {streamOptions.length > 0 && (
        <div className="bg-white py-14 border-t border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1">
                  Browse by Stream
                </h2>
                <p className="text-neutral-500 text-sm">
                  Find international programs in your field
                </p>
              </div>
              <Link
                href="/study-abroad?page=1"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {streamOptions.slice(0, 12).map((stream, i) => {
                const STREAM_ICONS: Record<string, string> = {
                  engineering: "engineering",
                  management: "business_center",
                  medical: "medical_services",
                  law: "gavel",
                  arts: "palette",
                  science: "science",
                  commerce: "account_balance",
                  computer: "computer",
                  design: "draw",
                  media: "movie",
                };

                const iconKey = Object.keys(STREAM_ICONS).find((k) =>
                  stream.name.toLowerCase().includes(k),
                );
                const icon = iconKey ? STREAM_ICONS[iconKey] : "school";

                const COLORS = [
                  "bg-blue-50 text-blue-600",
                  "bg-purple-50 text-purple-600",
                  "bg-red-50 text-red-600",
                  "bg-emerald-50 text-emerald-600",
                  "bg-amber-50 text-amber-600",
                  "bg-cyan-50 text-cyan-600",
                ];

                return (
                  <Link
                    key={stream.id}
                    href={`/study-abroad?stream=${stream.slug}`}
                    className="group flex flex-col items-center text-center gap-2 bg-neutral-50 hover:bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-md p-4 transition-all duration-200"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${COLORS[i % COLORS.length]} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 group-hover:text-red-600 transition-colors line-clamp-1">
                        {stream.name}
                      </p>
                      {stream.count !== undefined && (
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {stream.count} colleges
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Latest Abroad Colleges ── */}
      {colleges.length > 0 && (
        <div className="py-14 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1">
                  International Colleges
                </h2>
                <p className="text-neutral-500 text-sm">
                  {total.toLocaleString()} colleges available abroad
                </p>
              </div>
              <Link
                href="/study-abroad?page=1"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Browse All
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {colleges.slice(0, 8).map((college) => (
                <Link
                  key={college.id}
                  href={`/college/${college.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-36 overflow-hidden bg-neutral-100">
                    <img
                      src={college.image}
                      alt={college.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white text-xs font-medium">
                      <span className="material-symbols-outlined text-[13px]">
                        location_on
                      </span>
                      <span className="truncate max-w-[140px]">
                        {college.location}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {college.name}
                    </h3>

                    {college.streams.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {college.streams.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-semibold rounded uppercase tracking-wide"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-[13px] text-amber-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-xs font-bold text-neutral-700">
                          {college.rating > 0
                            ? college.rating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-red-600 group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View all CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/study-abroad?page=1"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-red-600 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-600/25"
              >
                <span className="material-symbols-outlined text-[18px]">
                  flight_takeoff
                </span>
                Explore All {total.toLocaleString()} International Colleges
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA Banner ── */}
      <div className="bg-white py-14 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl bg-neutral-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-blue-600/10 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Ready to Apply Abroad?
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm">
                  Get free guidance from our counselors. We help you choose the
                  right university, prepare your application, and secure
                  scholarships.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/study-abroad?page=1"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    flight_takeoff
                  </span>
                  Browse Colleges
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    support_agent
                  </span>
                  Free Counseling
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
