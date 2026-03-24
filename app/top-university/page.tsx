import pool from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { RowDataPacket } from "mysql2";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

// ── Route-segment cache ───────────────────────────────────────────────────────
export const revalidate = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface UniversityRow extends RowDataPacket {
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

interface IdRow extends RowDataPacket {
  id: number;
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

const IMAGE_BASE = "https://admin.admissionx.in";

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildUniversities(rows: UniversityRow[]): CollegeResult[] {
  return rows.map((row) => {
    const name =
      row.name && row.name !== row.slug
        ? row.name
        : slugToName(row.slug || "university");

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

// ─── Cached filter data ────────────────────────────────────────────────────────
//
// PREVIOUS IMPLEMENTATION caused server-wide connection-pool exhaustion:
//   Query 1 — GROUP BY functionalarea_id across full collegemaster JOIN
//             collegeprofile  →  no covering index  →  120 s+ timeout
//   Query 3 — degree JOIN collegemaster JOIN collegeprofile DISTINCT
//             →  same problem
//
// FIX: replace both slow collegemaster JOINs with direct selects on the
// tiny lookup tables (functionalarea ≈ 45 rows, degree ≈ small).
// The filter sidebar renders these in plain <select> dropdowns — counts
// are never displayed — so removing the GROUP BY is invisible to users.
//
// City lookup keeps the two-step approach (collegeprofile → city) which
// only touches collegeprofile (fast) and the city table (small).
// ─────────────────────────────────────────────────────────────────────────────
const getFilterData = unstable_cache(
  async () => {
    try {
      const [[streamRows], [rawCityIdRows], [degreeRows]] = await Promise.all([
        // Streams: direct select on functionalarea (~45 rows) — always instant.
        // No GROUP BY, no collegemaster JOIN.
        pool.query(
          `SELECT id, name, pageslug
           FROM   functionalarea
           WHERE  name IS NOT NULL AND name != ''
           ORDER  BY name
           LIMIT  30`,
        ) as Promise<[Pick<StreamRow, "id" | "name" | "pageslug">[], unknown]>,

        // City IDs: only touches collegeprofile — fast.
        pool.query(
          `SELECT registeredAddressCityId
           FROM   collegeprofile
           WHERE  isTopUniversity = 1
             AND  registeredAddressCityId IS NOT NULL
           LIMIT  2000`,
        ) as Promise<[{ registeredAddressCityId: number }[], unknown]>,

        // Degrees: direct select on degree table — small table, fast.
        // No collegemaster JOIN needed.
        pool.query(
          `SELECT id, name, pageslug
           FROM   degree
           WHERE  name IS NOT NULL AND name != ''
           ORDER  BY name
           LIMIT  50`,
        ) as Promise<[DegreeRow[], unknown]>,
      ]);

      const uniqueCityIds = [
        ...new Set(rawCityIdRows.map((r) => r.registeredAddressCityId)),
      ];

      const cityIdList = uniqueCityIds.slice(0, 400).join(",");

      const [cityRows] =
        cityIdList.length > 0
          ? ((await pool.query(
              `SELECT id, name
             FROM   city
             WHERE  id IN (${cityIdList})
               AND  name IS NOT NULL
               AND  name != ''
             ORDER  BY name
             LIMIT  100`,
            )) as [CityRow[], unknown])
          : [[] as CityRow[]];

      // Attach a dummy college_count of 0 — the UI never displays it.
      const hydratedStreamRows: StreamRow[] = (
        streamRows as Pick<StreamRow, "id" | "name" | "pageslug">[]
      ).map((r) => ({ ...r, college_count: 0 })) as StreamRow[];

      return {
        streamRows: hydratedStreamRows,
        degreeRows: degreeRows as DegreeRow[],
        cityRows: cityRows as CityRow[],
      };
    } catch (err) {
      console.error("[top-university] getFilterData error:", err);
      throw err;
    }
  },
  ["top-university-filters-v3"],
  { revalidate: 3600 }, // 1 hour — lookup tables change rarely
);

// ─── Core fetch ─────────────────────────────────────────────────────────────
async function fetchTopUniversities(opts: {
  q: string;
  stream: string;
  degree: string;
  cityId: string;
  stateId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}) {
  const { q, stream, degree, cityId, stateId, feesMax, sort, page, limit } =
    opts;
  const offset = (page - 1) * limit;

  const filterConditions: string[] = ["cp.isTopUniversity = 1"];
  const filterParams: (string | number)[] = [];

  const hasTextSearch = q.length >= 2;
  if (hasTextSearch) {
    filterConditions.push(
      "(u.firstname LIKE ? OR cp.registeredSortAddress LIKE ? OR cp.slug LIKE ?)",
    );
    const like = `%${q}%`;
    filterParams.push(like, like, like);
  }

  if (stream) {
    // Pre-resolve pageslug → integer id so the EXISTS subquery uses a plain
    // integer equality on cm2.functionalarea_id instead of a JOIN + string
    // compare.  functionalarea is ~45 rows — this lookup is always instant.
    const [faRows] = (await pool.query(
      "SELECT id FROM functionalarea WHERE pageslug = ? LIMIT 1",
      [stream],
    )) as [{ id: number }[], unknown];
    if (faRows.length > 0) {
      filterConditions.push(`EXISTS (
        SELECT 1 FROM collegemaster cm2
        WHERE cm2.collegeprofile_id = cp.id
          AND cm2.functionalarea_id = ${faRows[0].id}
      )`);
    }
  }

  if (degree) {
    // Same pattern: pre-resolve degree pageslug → integer id.
    const [degRows] = (await pool.query(
      "SELECT id FROM degree WHERE pageslug = ? LIMIT 1",
      [degree],
    )) as [{ id: number }[], unknown];
    if (degRows.length > 0) {
      filterConditions.push(`EXISTS (
        SELECT 1 FROM collegemaster cm3
        WHERE cm3.collegeprofile_id = cp.id
          AND cm3.degree_id = ${degRows[0].id}
      )`);
    }
  }

  if (feesMax && !isNaN(parseInt(feesMax))) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm4
      WHERE cm4.collegeprofile_id = cp.id
        AND cm4.fees > 0 AND cm4.fees <= ?
    )`);
    filterParams.push(parseInt(feesMax));
  }

  if (cityId && !isNaN(parseInt(cityId))) {
    filterConditions.push("cp.registeredAddressCityId = ?");
    filterParams.push(parseInt(cityId));
  }

  if (stateId && !isNaN(parseInt(stateId))) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM city c2
      WHERE c2.id = cp.registeredAddressCityId AND c2.state_id = ?
    )`);
    filterParams.push(parseInt(stateId));
  }

  const filterWhere = filterConditions.join(" AND ");

  let orderBy = "cp.topUniversityRank ASC, cp.ranking ASC, cp.rating DESC";
  if (sort === "rating") {
    orderBy = "cp.rating DESC, cp.totalRatingUser DESC";
  } else if (sort === "ranking") {
    orderBy = "cp.topUniversityRank ASC, cp.ranking ASC";
  } else if (sort === "fees") {
    // Logic for fees sort needs a join in the id query if we want to sort by MIN(fees)
  }

  let idSql = `
    SELECT cp.id
    FROM collegeprofile cp
    ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
    WHERE ${filterWhere}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  if (sort === "fees") {
    idSql = `
        SELECT cp.id
        FROM collegeprofile cp
        ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
        LEFT JOIN collegemaster cm_s ON cm_s.collegeprofile_id = cp.id AND cm_s.fees > 0
        WHERE ${filterWhere}
        GROUP BY cp.id
        ORDER BY MIN(cm_s.fees) ASC, cp.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
  }

  const countSql = `
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
    WHERE ${filterWhere}
  `;

  try {
    const [[idRows], [countRows]] = await Promise.all([
      pool.query(idSql, filterParams) as Promise<[IdRow[], unknown]>,
      pool.query(countSql, filterParams) as Promise<[CountRow[], unknown]>,
    ]);

    const total = countRows[0]?.total ?? 0;

    if (idRows.length === 0) {
      return { universities: [], total, totalPages: Math.ceil(total / limit) };
    }

    const ids = idRows.map((r) => r.id);
    const idList = ids.join(",");

    const enrichSql = `
      SELECT
        cp.id,
        cp.slug,
        COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS name,
        COALESCE(cp.registeredSortAddress, '')           AS location,
        c.name                                           AS city_name,
        c.state_id,
        cp.bannerimage                                   AS image,
        COALESCE(cp.rating, 0)                           AS rating,
        COALESCE(cp.totalRatingUser, 0)                  AS totalRatingUser,
        cp.ranking,
        cp.isTopUniversity,
        cp.topUniversityRank,
        cp.universityType,
        cp.estyear,
        cp.verified,
        cp.totalStudent,
        GROUP_CONCAT(DISTINCT fa.name ORDER BY fa.name SEPARATOR '|') AS streams_raw,
        MIN(CASE WHEN cm.fees > 0 THEN cm.fees END)      AS min_fees,
        MAX(CASE WHEN cm.fees > 0 THEN cm.fees END)      AS max_fees
      FROM collegeprofile cp
      LEFT JOIN users u           ON u.id  = cp.users_id
      LEFT JOIN city c            ON c.id  = cp.registeredAddressCityId
      LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
      LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
      WHERE cp.id IN (${idList})
      GROUP BY
        cp.id, cp.slug, u.firstname, cp.registeredSortAddress,
        c.name, c.state_id, cp.bannerimage, cp.rating, cp.totalRatingUser,
        cp.ranking, cp.isTopUniversity, cp.topUniversityRank, cp.universityType,
        cp.estyear, cp.verified, cp.totalStudent
      ORDER BY FIELD(cp.id, ${idList})
    `;

    const [dataRows] = (await pool.query(enrichSql)) as [
      UniversityRow[],
      unknown,
    ];

    return {
      universities: buildUniversities(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[top-university] fetch error:", err);
    throw err;
  }
}

const getCachedTopUniversities = unstable_cache(
  fetchTopUniversities,
  ["top-university-data-v4"],
  { revalidate: 300 },
);

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Top Universities in India 2024 | AdmissionX",
  description:
    "Explore India's top universities ranked by academic excellence, placements, and infrastructure. Filter by stream, degree, city, and fees.",
};

export default async function TopUniversityPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const cityId = getString("city_id");
  const stateId = getString("state_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "ranking");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  const [
    { universities, total, totalPages },
    { streamRows, degreeRows, cityRows },
  ] = await Promise.all([
    getCachedTopUniversities({
      q,
      stream,
      degree,
      cityId,
      stateId,
      feesMax,
      sort,
      page,
      limit,
    }),
    getFilterData(),
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

  const cityOptions: FilterOption[] = cityRows.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  let pageSubtitle = `${total.toLocaleString()} top-ranked universities across India`;
  if (stream) {
    const streamName =
      streamOptions.find((s) => s.slug === stream)?.name ?? stream;
    pageSubtitle = `${total.toLocaleString()} top ${streamName} universities`;
  }

  return (
    <SearchClient
      initialColleges={universities}
      initialTotal={total}
      initialTotalPages={totalPages}
      streams={streamOptions}
      degrees={degreeOptions}
      cities={cityOptions}
      initQ=""
      initStream={stream}
      initDegree={degree}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType="university"
      pageTitle="Top Universities in India"
      pageSubtitle={pageSubtitle}
      entityName="University"
      entityNamePlural="Universities"
    />
  );
}
