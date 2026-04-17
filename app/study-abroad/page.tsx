import pool, { getDb } from "@/lib/db";
import Header from "@/app/components/Header";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";
import { unstable_cache } from "next/cache";
import ExploreCards from "@/app/components/ExploreCards";
import type { AdItem } from "@/app/components/AdsSection";

// Premium Components
import HeroSection from "./components/HeroSection";
import TopDestinations from "./components/TopDestinations";
import CostCalculator from "./components/CostCalculator";
import JourneySteps from "./components/JourneySteps";
import Footer from "@/app/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface CollegeRow {
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

interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
}

interface DegreeRow {
  id: number;
  name: string;
  pageslug: string | null;
}

interface CountryRow {
  id: number;
  name: string;
  college_count?: number;
}

interface CountRow {
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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAdsFilter(positions: string[]) {
  return {
    ads_position: {
      $regex: `^\\s*(?:${positions.map(escapeRegex).join("|")})\\s*$`,
      $options: "i",
    },
    $or: [
      { isactive: 1 },
      { isactive: "1" },
      { isactive: " 1" },
      { isactive: /^\s*1\s*$/ },
    ],
  };
}

async function safeQuery<T>(
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
      avg_package: null,
    };
  });
}

// ─── Page-specific fetch (international colleges) ─────────────────────────────

async function fetchAbroadCollegesBase(opts: {
  q: string;
  stream: string;
  degree: string;
  countryId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, countryId, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = [
    "(cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1)",
    "(cp.registeredAddressCountryId IS NOT NULL OR cp.campusAddressCountryId IS NOT NULL)",
  ];
  const params: (string | number)[] = [];

  if (q.trim()) {
    const likeQuery = `%${q.trim()}%`;
    conditions.push(`(
      cp.slug LIKE ?
      OR COALESCE(cp.registeredSortAddress, '') LIKE ?
      OR EXISTS (
        SELECT 1 FROM users u_q
        WHERE u_q.id = cp.users_id
          AND TRIM(COALESCE(u_q.firstname, '')) LIKE ?
      )
    )`);
    params.push(likeQuery, likeQuery, likeQuery);
  }

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

  if (countryId && !isNaN(parseInt(countryId))) {
    conditions.push(`(
      cp.registeredAddressCountryId = ?
      OR cp.campusAddressCountryId = ?
    )`);
    params.push(parseInt(countryId), parseInt(countryId));
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

  const idSql = `
    SELECT cp.id
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
    const [[idRows], [countRows]] = await Promise.all([
      pool.query(idSql, params) as Promise<[{ id: number }[], unknown]>,
      pool.query(countSql, params) as Promise<[CountRow[], unknown]>,
    ]);

    const total = countRows[0]?.total ?? 0;
    if (idRows.length === 0) {
      return { colleges: [], total, totalPages: 0 };
    }

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

const fetchStudyAbroadAds = unstable_cache(
  async (): Promise<AdItem[]> => {
    try {
      const db = await getDb();
      return await db
        .collection("ads_managements")
        .find(buildAdsFilter(["study_abroad", "study-abroad", "study abroad"]))
        .sort({ created_at: -1 })
        .limit(8)
        .project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
        .toArray() as AdItem[];
    } catch (error) {
      console.error("[study-abroad/page.tsx fetchStudyAbroadAds]", error);
      return [];
    }
  },
  ["study-abroad-ads"],
  { revalidate: 300 }
);

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: import("next").Metadata = {
  title: "Study Abroad — International Colleges & Universities | AdmissionX",
  description:
    "Explore top international colleges and universities for study abroad. Find the best programs, fees, and admission details for studying outside India.",
};

interface StudyAbroadPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StudyAbroadPage({ searchParams }: StudyAbroadPageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const countryId = getString("country_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const view = getString("view");
  const showSearchResults = !!(q || stream || degree || countryId || feesMax || page > 1 || view === "all");

  if (showSearchResults) {
    const [{ colleges, total, totalPages }, streamRows, degreeRows, countryRows] =
      await Promise.all([
        fetchAbroadColleges({ q, stream, degree, countryId, feesMax, sort, page, limit: 12 }),
        safeQuery<StreamRow>(`
          SELECT id, name, pageslug
          FROM functionalarea
          ORDER BY isShowOnTop DESC, name ASC LIMIT 20
        `),
        safeQuery<DegreeRow>(`
          SELECT id, name, pageslug
          FROM degree
          WHERE isShowOnTop = 1
          ORDER BY name LIMIT 50
        `),
        safeQuery<CountryRow>(`
          SELECT DISTINCT c.id, c.name
          FROM country c
          INNER JOIN collegeprofile cp
            ON cp.registeredAddressCountryId = c.id
            OR cp.campusAddressCountryId = c.id
          WHERE c.id != 1
          ORDER BY c.name
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

    const countryOptions: FilterOption[] = countryRows.map((r) => ({
      id: r.id,
      name: r.name,
    }));

    const selectedCountryName =
      countryOptions.find((country) => String(country.id) === countryId)?.name ?? "";

    const pageSubtitle = selectedCountryName
      ? `${total.toLocaleString()} international colleges and universities in ${selectedCountryName}`
      : `${total.toLocaleString()} international colleges and universities`;

    return (
      <SearchClient
        initialColleges={colleges}
        initialTotal={total}
        initialTotalPages={totalPages}
        streams={streamOptions}
        degrees={degreeOptions}
        cities={[]}
        countries={countryOptions}
        initQ={q}
        initStream={stream}
        initDegree={degree}
        initCityId=""
        initStateId=""
        initCountryId={countryId}
        initFeesMax={feesMax}
        initSort={sort}
        initPage={page}
        initType="abroad"
        pageTitle="Study Abroad Colleges"
        pageSubtitle={pageSubtitle}
      />
    );
  }

  const [countryRows, ads] = await Promise.all([
    safeQuery<CountryRow>(`
      SELECT c.id, c.name, COUNT(DISTINCT cp.id) AS college_count
      FROM country c
      INNER JOIN collegeprofile cp
        ON cp.registeredAddressCountryId = c.id
        OR cp.campusAddressCountryId = c.id
      WHERE c.id != 1
      GROUP BY c.id, c.name
      ORDER BY college_count DESC, c.name ASC
    `),
    fetchStudyAbroadAds(),
  ]);

  const countries = countryRows
    .map((country) => ({
      id: country.id,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const quickFilters = [...countryRows]
    .sort(
      (a, b) =>
        (b.college_count ?? 0) - (a.college_count ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 3)
    .map((country) => ({
      id: country.id,
      name: country.name,
    }));

  return (
    <div className="min-h-screen bg-white flex flex-col relative font-[family-name:var(--font-outfit)]">
      <Header theme="dark" />
      
      <main className="flex-1">
        <HeroSection
          countries={countries}
          quickFilters={quickFilters}
        />
        
        <TopDestinations countries={countries} />
        
        <CostCalculator />
        
        <JourneySteps ads={ads} />

        {/* Explore Cards */}
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 pb-16">
          <ExploreCards />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Force cache invalidation 3




