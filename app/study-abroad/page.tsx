import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";

// Modular Components
import Hero from "./components/Hero";
import WhyStudyAbroad from "./components/WhyStudyAbroad";
import Destinations from "./components/Destinations";
import StreamList from "./components/StreamList";
import CollegeGrid from "./components/CollegeGrid";

// Utils
import { getDestinationMeta } from "./utils/destinationMeta";

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

async function fetchAbroadCollegesBase(opts: {
  stream: string;
  degree: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { stream, degree, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  // 1. Build filter conditions
  const conditions: string[] = [
    "(cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1)",
    "(cp.registeredAddressCountryId IS NOT NULL OR cp.campusAddressCountryId IS NOT NULL)",
  ];
  const params: (string | number)[] = [];

  if (stream) {
    conditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm_f1
      INNER JOIN functionalarea fa_f1 ON fa_f1.id = cm_f1.functionalarea_id
      WHERE cm_f1.collegeprofile_id = cp.id AND fa_f1.pageslug = ?
    )`);
    params.push(stream);
  }

  if (degree) {
    conditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm_f2
      INNER JOIN degree d_f2 ON d_f2.id = cm_f2.degree_id
      WHERE cm_f2.collegeprofile_id = cp.id AND d_f2.pageslug = ?
    )`);
    params.push(degree);
  }

  if (feesMax && !isNaN(parseInt(feesMax))) {
    conditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm_f3
      WHERE cm_f3.collegeprofile_id = cp.id
        AND cm_f3.fees > 0 AND cm_f3.fees <= ?
    )`);
    params.push(parseInt(feesMax));
  }

  const whereClause = conditions.join(" AND ");
  let orderBy = "cp.rating DESC, cp.id DESC";
  if (sort === "ranking") {
    orderBy = "(cp.ranking IS NULL OR cp.ranking = 0) ASC, cp.ranking ASC";
  }

  // 2. ID-only query (Fast)
  const idSql = `
    SELECT cp.id
    FROM collegeprofile cp
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // 3. Count query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    WHERE ${whereClause}
  `;

  try {
    const [[idRows], [countRows]] = await Promise.all([
      pool.query(idSql, params) as Promise<[{ id: number }[], unknown]>,
      pool.query(countSql, params) as Promise<[CountRow[], unknown]>,
    ]);

    const total = countRows[0]?.total ?? 0;
    if (idRows.length === 0) {
      return { colleges: [], total, totalPages: 0 };
    }

    // 4. Enrich query (Touching only the needed IDs)
    const idList = idRows.map((r) => r.id).join(",");
    const enrichSql = `
      SELECT
        cp.id,
        cp.slug,
        COALESCE(NULLIF(TRIM(u.firstname), ''), NULLIF(TRIM(cp.slug), ''), 'College') AS name,
        COALESCE(cp.registeredSortAddress, '') AS location,
        c.name AS city_name,
        c.state_id,
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
        GROUP_CONCAT(DISTINCT fa.name ORDER BY fa.name SEPARATOR '|') AS streams_raw,
        MIN(CASE WHEN cm.fees > 0 THEN cm.fees END) AS min_fees,
        MAX(CASE WHEN cm.fees > 0 THEN cm.fees END) AS max_fees
      FROM collegeprofile cp
      LEFT JOIN users u ON u.id = cp.users_id
      LEFT JOIN city c ON c.id = cp.registeredAddressCityId
      LEFT JOIN collegemaster cm ON cm.collegeprofile_id = cp.id
      LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
      WHERE cp.id IN (${idList})
      GROUP BY cp.id, u.firstname, c.name, c.state_id
      ORDER BY FIELD(cp.id, ${idList})
    `;

    const [dataRows] = (await pool.query(enrichSql)) as [CollegeRow[], unknown];

    return {
      colleges: buildColleges(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[study-abroad/page.tsx fetchAbroadCollegesBase]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

const fetchAbroadColleges = unstable_cache(
  fetchAbroadCollegesBase,
  ["study-abroad-colleges"],
  { revalidate: 300 }
);

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: import("next").Metadata = {
  title: "Study Abroad — International Colleges & Universities | AdmissionX",
  description:
    "Explore top international colleges and universities for study abroad. Find the best programs, fees, and admission details for studying outside India.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 300; // Cache for 5 minutes

// ─── Data Components for Streaming ──────────────────────────────────────────

async function CollegeSection() {
  const { colleges, total } = await fetchAbroadColleges({
    stream: "",
    degree: "",
    feesMax: "",
    sort: "rating",
    page: 1,
    limit: 12,
  });

  return <CollegeGrid colleges={colleges} total={total} />;
}

const getDestinationSectionData = unstable_cache(
  async () => {
    return safeQuery<CountryRow>(`
      SELECT c.id, c.name, c.pageslug, c.logoimage,
             COALESCE(counts.college_count, 0) AS college_count
      FROM country c
      LEFT JOIN (
        SELECT country_id, COUNT(*) AS college_count
        FROM (
          SELECT id, registeredAddressCountryId AS country_id FROM collegeprofile WHERE registeredAddressCountryId != 1 AND registeredAddressCountryId IS NOT NULL
          UNION
          SELECT id, campusAddressCountryId AS country_id FROM collegeprofile WHERE campusAddressCountryId != 1 AND campusAddressCountryId IS NOT NULL
        ) AS unique_colleges
        GROUP BY country_id
      ) counts ON counts.country_id = c.id
      WHERE c.id != 1 AND c.name IS NOT NULL AND c.name != ''
      ORDER BY c.isShowOnHome DESC, c.name ASC
      LIMIT 12
    `);
  },
  ["study-abroad-destinations"],
  { revalidate: 600 }
);

async function DestinationSection() {
  const countryRows = await getDestinationSectionData();

  return (
    <Destinations countries={countryRows} getDestinationMeta={getDestinationMeta} />
  );
}

const getStreamSectionData = unstable_cache(
  async () => {
    return safeQuery<StreamRow>(`
      SELECT fa.id, fa.name, fa.pageslug,
             COALESCE(counts.college_count, 0) AS college_count
      FROM functionalarea fa
      LEFT JOIN (
        SELECT cm.functionalarea_id, COUNT(DISTINCT cp.id) AS college_count
        FROM collegemaster cm
        INNER JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
        WHERE cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1
        GROUP BY cm.functionalarea_id
      ) counts ON counts.functionalarea_id = fa.id
      WHERE fa.name IS NOT NULL AND fa.name != ''
      ORDER BY fa.isShowOnTop DESC, fa.name ASC
      LIMIT 20
    `);
  },
  ["study-abroad-streams"],
  { revalidate: 600 }
);

async function StreamSection() {
  const streamRows = await getStreamSectionData();

  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    count: r.college_count,
  }));

  return <StreamList streams={streamOptions} />;
}

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

  // If filters are active, show search results directly (blocking search render)
  if (showSearchResults) {
    const [{ colleges, total, totalPages }, streamRows, degreeRows] =
      await Promise.all([
        fetchAbroadColleges({ stream, degree, feesMax, sort, page, limit: 12 }),
        safeQuery<StreamRow>(`
          SELECT id, name, pageslug, 0 AS college_count
          FROM functionalarea
          ORDER BY isShowOnTop DESC, name ASC LIMIT 20
        `),
        safeQuery<DegreeRow>(`
          SELECT id, name, pageslug
          FROM degree
          WHERE isShowOnTop = 1
          ORDER BY name LIMIT 50
        `),
      ]);

    const streamOptions: FilterOption[] = streamRows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    }));

    const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    }));

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

  // ── Landing page view (Streaming enabled via Suspense) ───────────────────
  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* ── Full Page Background ── */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero section: renders immediately */}
        <Hero totalColleges={0} totalCountries={0} />

      {/* Why Study Abroad: static content, renders immediately */}
      <WhyStudyAbroad />

      {/* Dynamic sections wrapped in Suspense for streaming */}
      <Suspense fallback={<div className="h-40 animate-pulse bg-neutral-100 mx-auto max-w-7xl rounded-3xl my-8" />}>
        <DestinationSection />
      </Suspense>

      <Suspense fallback={<div className="h-20 animate-pulse bg-neutral-100 mx-auto max-w-7xl rounded-2xl my-8" />}>
        <StreamSection />
      </Suspense>

      <Suspense fallback={<div className="py-12 px-4 mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse bg-neutral-100 rounded-2xl" />
        ))}
      </div>}>
        <CollegeSection />
      </Suspense>

      <Footer />
      </div>
    </div>
  );
}
