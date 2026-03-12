import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import SearchClient from "./SearchClient";
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

interface CityRow extends RowDataPacket {
  id: number;
  name: string;
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
    console.error("[search/page.tsx safeQuery]", err);
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
      location: row.location || row.city_name || "India",
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

// ─── Core DB fetch ────────────────────────────────────────────────────────────

async function fetchColleges(opts: {
  q: string;
  stream: string;
  degree: string;
  cityId: string;
  stateId: string;
  feesMax: string;
  sort: string;
  type: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const {
    q,
    stream,
    degree,
    cityId,
    stateId,
    feesMax,
    sort,
    type,
    page,
    limit,
  } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = ["1=1"];
  const params: (string | number)[] = [];

  if (q.length >= 2) {
    conditions.push(
      "(u.firstname LIKE ? OR cp.registeredSortAddress LIKE ? OR cp.slug LIKE ?)",
    );
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (stream) {
    conditions.push("fa.pageslug = ?");
    params.push(stream);
  }
  if (degree) {
    conditions.push("d.pageslug = ?");
    params.push(degree);
  }
  if (feesMax && !isNaN(parseInt(feesMax))) {
    conditions.push("cm.fees <= ?");
    params.push(parseInt(feesMax));
  }
  if (cityId && !isNaN(parseInt(cityId))) {
    conditions.push("cp.registeredAddressCityId = ?");
    params.push(parseInt(cityId));
  }
  if (stateId && !isNaN(parseInt(stateId))) {
    conditions.push("c.state_id = ?");
    params.push(parseInt(stateId));
  }
  if (type === "top") {
    conditions.push("cp.isShowOnTop = 1");
  } else if (type === "university") {
    conditions.push("cp.isTopUniversity = 1");
  } else if (type === "abroad") {
    conditions.push("cp.registeredAddressCountryId != 1");
  }

  const whereClause = conditions.join(" AND ");

  let orderBy = "cp.rating DESC, cp.totalRatingUser DESC";
  if (sort === "ranking") {
    orderBy =
      "CASE WHEN cp.ranking IS NULL OR cp.ranking = 0 THEN 1 ELSE 0 END, cp.ranking ASC";
  } else if (sort === "fees") {
    orderBy = "MIN(NULLIF(cm.fees, 0)) ASC";
  } else if (sort === "newest") {
    orderBy = "cp.created_at DESC";
  }

  const dataSql = `
    SELECT
      cp.id,
      cp.slug,
      COALESCE(
        NULLIF(TRIM(u.firstname), ''),
        NULLIF(TRIM(cp.slug), ''),
        'College'
      )                                                 AS name,
      COALESCE(cp.registeredSortAddress, '')            AS location,
      c.name                                            AS city_name,
      c.state_id,
      cp.bannerimage                                    AS image,
      COALESCE(cp.rating, 0)                            AS rating,
      COALESCE(cp.totalRatingUser, 0)                   AS totalRatingUser,
      cp.ranking,
      cp.isTopUniversity,
      cp.topUniversityRank,
      cp.universityType,
      cp.estyear,
      cp.verified,
      cp.totalStudent,
      GROUP_CONCAT(DISTINCT fa.name ORDER BY fa.name SEPARATOR '|') AS streams_raw,
      MIN(NULLIF(cm.fees, 0))  AS min_fees,
      MAX(NULLIF(cm.fees, 0))  AS max_fees
    FROM collegeprofile cp
    LEFT JOIN users u           ON u.id  = cp.users_id
    LEFT JOIN city c            ON c.id  = cp.registeredAddressCityId
    LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
    LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
    LEFT JOIN degree d          ON d.id  = cm.degree_id
    WHERE ${whereClause}
    GROUP BY
      cp.id, cp.slug, u.firstname, cp.registeredSortAddress,
      c.name, c.state_id, cp.bannerimage, cp.rating, cp.totalRatingUser,
      cp.ranking, cp.isTopUniversity, cp.topUniversityRank, cp.universityType,
      cp.estyear, cp.verified, cp.totalStudent
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Count query — uses LEFT JOINs (same as data query) so all filter conditions work correctly
  const countSql = `
    SELECT COUNT(DISTINCT cp.id) AS total
    FROM collegeprofile cp
    LEFT JOIN users u           ON u.id  = cp.users_id
    LEFT JOIN city c            ON c.id  = cp.registeredAddressCityId
    LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
    LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
    LEFT JOIN degree d          ON d.id  = cm.degree_id
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
    console.error("[search/page.tsx fetchColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const cityId = getString("city_id");
  const stateId = getString("state_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const type = getString("type");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  // ── Parallel: initial college results + filter options ─────────────────────
  const [{ colleges, total, totalPages }, streamRows, degreeRows, cityRows] =
    await Promise.all([
      // 1. College results
      fetchColleges({
        q,
        stream,
        degree,
        cityId,
        stateId,
        feesMax,
        sort,
        type,
        page,
        limit,
      }),

      // 2. Streams with college counts
      safeQuery<StreamRow>(`
      SELECT
        f.id,
        f.name,
        f.pageslug,
        COUNT(DISTINCT cm.collegeprofile_id) AS college_count
      FROM functionalarea f
      LEFT JOIN collegemaster cm ON cm.functionalarea_id = f.id
      WHERE f.name IS NOT NULL AND f.name != ''
      GROUP BY f.id, f.name, f.pageslug
      ORDER BY college_count DESC
      LIMIT 20
    `),

      // 3. Popular degrees
      safeQuery<DegreeRow>(`
      SELECT d.id, d.name, d.pageslug
      FROM degree d
      WHERE d.name IS NOT NULL AND d.name != '' AND d.isShowOnTop = 1
      ORDER BY d.name
      LIMIT 50
    `),

      // 4. Popular cities (cities that have colleges)
      safeQuery<CityRow>(`
      SELECT DISTINCT c.id, c.name
      FROM city c
      INNER JOIN collegeprofile cp ON cp.registeredAddressCityId = c.id
      WHERE c.name IS NOT NULL AND c.name != ''
      ORDER BY c.name
      LIMIT 100
    `),
    ]);

  // ── Build filter option lists ──────────────────────────────────────────────
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

  const cityOptions: FilterOption[] = cityRows.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  // ── Dynamic page title ─────────────────────────────────────────────────────
  let pageTitle = "Search Colleges";
  let pageSubtitle = "Find and filter from thousands of colleges across India";

  if (type === "top") {
    pageTitle = "Top Colleges in India";
    pageSubtitle = "Explore the highest-rated and most sought-after colleges";
  } else if (type === "university") {
    pageTitle = "Top Universities";
    pageSubtitle = "India's leading universities ranked by excellence";
  } else if (type === "abroad") {
    pageTitle = "Study Abroad Colleges";
    pageSubtitle = "Explore international colleges and universities worldwide";
  } else if (q) {
    pageTitle = `Search: "${q}"`;
    pageSubtitle = `${total.toLocaleString()} colleges match your search`;
  } else if (stream) {
    const streamName =
      streamOptions.find((s) => s.slug === stream)?.name ?? stream;
    pageTitle = `${streamName} Colleges`;
    pageSubtitle = `Browse all ${streamName} colleges in India`;
  }

  return (
    <SearchClient
      initialColleges={colleges}
      initialTotal={total}
      initialTotalPages={totalPages}
      streams={streamOptions}
      degrees={degreeOptions}
      cities={cityOptions}
      initQ={q}
      initStream={stream}
      initDegree={degree}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType={type}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
    />
  );
}
