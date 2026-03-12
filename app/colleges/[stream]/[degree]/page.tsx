import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
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
  college_count: number;
}

interface CityRow extends RowDataPacket {
  id: number;
  name: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface SlugNameRow extends RowDataPacket {
  name: string;
  pageslug: string | null;
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
    console.error("[colleges/[stream]/[degree]/page.tsx safeQuery]", err);
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

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function fetchCollegesByStreamDegree(opts: {
  streamSlug: string;
  degreeSlug: string;
  cityId: string;
  stateId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const {
    streamSlug,
    degreeSlug,
    cityId,
    stateId,
    feesMax,
    sort,
    page,
    limit,
  } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = ["fa.pageslug = ?", "d.pageslug = ?"];
  const params: (string | number)[] = [streamSlug, degreeSlug];

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

  const joins = `
    LEFT JOIN users u           ON u.id  = cp.users_id
    LEFT JOIN city c            ON c.id  = cp.registeredAddressCityId
    LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
    LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
    LEFT JOIN degree d          ON d.id  = cm.degree_id
  `;

  const dataSql = `
    SELECT
      cp.id,
      cp.slug,
      COALESCE(NULLIF(TRIM(u.firstname), ''), NULLIF(TRIM(cp.slug), ''), 'College') AS name,
      COALESCE(cp.registeredSortAddress, '')             AS location,
      c.name                                             AS city_name,
      c.state_id,
      cp.bannerimage                                     AS image,
      COALESCE(cp.rating, 0)                             AS rating,
      COALESCE(cp.totalRatingUser, 0)                    AS totalRatingUser,
      cp.ranking,
      cp.isTopUniversity,
      cp.topUniversityRank,
      cp.universityType,
      cp.estyear,
      cp.verified,
      cp.totalStudent,
      GROUP_CONCAT(DISTINCT fa2.name ORDER BY fa2.name SEPARATOR '|') AS streams_raw,
      MIN(NULLIF(cm.fees, 0)) AS min_fees,
      MAX(NULLIF(cm.fees, 0)) AS max_fees
    FROM collegeprofile cp
    ${joins}
    LEFT JOIN collegemaster cm2 ON cm2.collegeprofile_id = cp.id
    LEFT JOIN functionalarea fa2 ON fa2.id = cm2.functionalarea_id
    WHERE ${whereClause}
    GROUP BY
      cp.id, cp.slug, u.firstname, cp.registeredSortAddress,
      c.name, c.state_id, cp.bannerimage, cp.rating, cp.totalRatingUser,
      cp.ranking, cp.isTopUniversity, cp.topUniversityRank, cp.universityType,
      cp.estyear, cp.verified, cp.totalStudent
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Lightweight count — uses correlated EXISTS instead of heavy JOINs
  const countSql = `
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    WHERE
      EXISTS (
        SELECT 1 FROM collegemaster cm2
        JOIN functionalarea fa2 ON fa2.id = cm2.functionalarea_id AND fa2.pageslug = ?
        JOIN degree d2          ON d2.id  = cm2.degree_id          AND d2.pageslug  = ?
        WHERE cm2.collegeprofile_id = cp.id
      )
      ${cityId && !isNaN(parseInt(cityId)) ? "AND cp.registeredAddressCityId = ?" : ""}
      ${stateId && !isNaN(parseInt(stateId)) ? "AND EXISTS (SELECT 1 FROM city c2 WHERE c2.id = cp.registeredAddressCityId AND c2.state_id = ?)" : ""}
      ${feesMax && !isNaN(parseInt(feesMax)) ? "AND EXISTS (SELECT 1 FROM collegemaster cm3 WHERE cm3.collegeprofile_id = cp.id AND cm3.fees <= ?)" : ""}
  `;

  const countParams: (string | number)[] = [streamSlug, degreeSlug];
  if (cityId && !isNaN(parseInt(cityId))) countParams.push(parseInt(cityId));
  if (stateId && !isNaN(parseInt(stateId))) countParams.push(parseInt(stateId));
  if (feesMax && !isNaN(parseInt(feesMax))) countParams.push(parseInt(feesMax));

  try {
    const [[dataRows], [countRows]] = await Promise.all([
      pool.query(dataSql, params) as Promise<[CollegeRow[], unknown]>,
      pool.query(countSql, countParams) as Promise<[CountRow[], unknown]>,
    ]);
    const total = countRows[0]?.total ?? 0;
    return {
      colleges: buildColleges(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[colleges/[stream]/[degree] fetchColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ stream: string; degree: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { stream: streamSlug, degree: degreeSlug } = await params;

  // Try to resolve human-readable names from the DB
  const [streamRows, degreeRows] = await Promise.all([
    safeQuery<SlugNameRow>(
      "SELECT name, pageslug FROM functionalarea WHERE pageslug = ? LIMIT 1",
      [streamSlug],
    ),
    safeQuery<SlugNameRow>(
      "SELECT name, pageslug FROM degree WHERE pageslug = ? LIMIT 1",
      [degreeSlug],
    ),
  ]);

  const streamName = streamRows[0]?.name ?? slugToName(streamSlug);
  const degreeName = degreeRows[0]?.name ?? slugToName(degreeSlug);

  return {
    title: `Top ${degreeName} Colleges in ${streamName} 2024 | AdmissionX`,
    description: `Find the best ${degreeName} colleges in ${streamName}. Compare fees, placements, ratings, and facilities to choose the right college for you.`,
  };
}

export default async function CollegesByStreamDegreePage({
  params,
  searchParams,
}: PageProps) {
  const { stream: streamSlug, degree: degreeSlug } = await params;
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const cityId = getString("city_id");
  const stateId = getString("state_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  // ── Resolve slugs → human-readable names ──────────────────────────────────
  const [streamNameRows, degreeNameRows] = await Promise.all([
    safeQuery<SlugNameRow>(
      "SELECT name, pageslug FROM functionalarea WHERE pageslug = ? LIMIT 1",
      [streamSlug],
    ),
    safeQuery<SlugNameRow>(
      "SELECT name, pageslug FROM degree WHERE pageslug = ? LIMIT 1",
      [degreeSlug],
    ),
  ]);

  const streamName = streamNameRows[0]?.name ?? slugToName(streamSlug);
  const degreeName = degreeNameRows[0]?.name ?? slugToName(degreeSlug);

  // ── Parallel data fetches ─────────────────────────────────────────────────
  const [{ colleges, total, totalPages }, streamRows, degreeRows, cityRows] =
    await Promise.all([
      // 1. Filtered college results
      fetchCollegesByStreamDegree({
        streamSlug,
        degreeSlug,
        cityId,
        stateId,
        feesMax,
        sort,
        page,
        limit,
      }),

      // 2. All streams with counts
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

      // 3. Degrees in this stream (for filter panel)
      safeQuery<DegreeRow>(
        `
      SELECT
        d.id,
        d.name,
        d.pageslug,
        COUNT(DISTINCT cm.collegeprofile_id) AS college_count
      FROM degree d
      INNER JOIN functionalarea fa ON fa.id = d.functionalarea_id AND fa.pageslug = ?
      LEFT JOIN collegemaster cm ON cm.degree_id = d.id
      WHERE d.name IS NOT NULL AND d.name != ''
      GROUP BY d.id, d.name, d.pageslug
      ORDER BY college_count DESC
      LIMIT 50
    `,
        [streamSlug],
      ),

      // 4. Cities that have colleges in this stream+degree
      safeQuery<CityRow>(
        `
      SELECT DISTINCT c.id, c.name
      FROM city c
      INNER JOIN collegeprofile cp ON cp.registeredAddressCityId = c.id
      INNER JOIN collegemaster cm ON cm.collegeprofile_id = cp.id
      INNER JOIN functionalarea fa ON fa.id = cm.functionalarea_id AND fa.pageslug = ?
      INNER JOIN degree d ON d.id = cm.degree_id AND d.pageslug = ?
      WHERE c.name IS NOT NULL AND c.name != ''
      ORDER BY c.name
      LIMIT 80
    `,
        [streamSlug, degreeSlug],
      ),
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
    count: r.college_count,
  }));

  const cityOptions: FilterOption[] = cityRows.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  // ── Page title ─────────────────────────────────────────────────────────────
  let pageSubtitle = `${total.toLocaleString()} ${degreeName} colleges in ${streamName}`;
  if (cityId) {
    const cityName = cityOptions.find((c) => String(c.id) === cityId)?.name;
    if (cityName) {
      pageSubtitle = `${total.toLocaleString()} ${degreeName} colleges in ${cityName}`;
    }
  }

  return (
    <SearchClient
      initialColleges={colleges}
      initialTotal={total}
      initialTotalPages={totalPages}
      streams={streamOptions}
      degrees={degreeOptions}
      cities={cityOptions}
      initQ=""
      initStream={streamSlug}
      initDegree={degreeSlug}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType=""
      pageTitle={`${degreeName} Colleges — ${streamName}`}
      pageSubtitle={pageSubtitle}
    />
  );
}
