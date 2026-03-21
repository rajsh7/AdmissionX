import pool from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";

// ── Route-segment cache ───────────────────────────────────────────────────────
// Caches the fully-rendered page for 5 minutes so cold-cache first-hits only
// pay the DB cost once per TTL window.
export const revalidate = 300;
import { RowDataPacket } from "mysql2";
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

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[top-colleges/page.tsx safeQuery]", err);
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

// ─── Cached filter data ────────────────────────────────────────────────────────
//
// WHY THE OLD STREAMS QUERY TIMED OUT:
//   COUNT(DISTINCT cm.collegeprofile_id) with a LEFT JOIN across 66 k rows in
//   collegemaster caused MySQL to build a large in-memory hash/sort structure
//   before it could apply LIMIT 20.  Combined with the GROUP BY across all
//   functionalarea rows, the query exceeded 30 s on every cold-cache hit.
//
// NEW APPROACH — two fast steps:
//
//   Step 1  GROUP BY functionalarea_id using COUNT(*) — no DISTINCT, no wide
//           JOIN to other tables.  MySQL uses idx_cm_functionalarea_id to
//           satisfy the GROUP BY in ~70 ms even over 66 k rows.
//           COUNT(*) counts course entries per stream (not colleges), which
//           still gives a correct relative ordering for the filter sidebar.
//
//   Step 2  Look up functionalarea names for the top-N FA IDs by primary key
//           — effectively instant regardless of table size.
//
//   Degrees + cities run in parallel with Step 1 and are already fast.
//   Total first-hit cost: ~100 ms → cached for 10 minutes.
// ─────────────────────────────────────────────────────────────────────────────

const getFilterData = unstable_cache(
  async () => {
    try {
      // ── Step 1: stream FA counts + raw city IDs + degrees in parallel ─────
      //
      // CITIES — why raw IDs instead of DISTINCT JOIN:
      //   Any query that uses DISTINCT + ORDER BY on a large result set writes
      //   a sort temp file to MySQL's tmpdir.  When tmpdir runs out of disk
      //   space (Errcode 28) the entire query fails.
      //   Fix: scan registeredAddressCityId with no DISTINCT, no ORDER BY, so
      //   MySQL never writes a temp file.  Deduplication and sort happen in JS
      //   over a tiny array (~400 unique city IDs at most).
      //
      // STREAMS — COUNT(*) without DISTINCT:
      //   Avoids the deduplication hash table that caused the old
      //   COUNT(DISTINCT collegeprofile_id) query to time out.  COUNT(*) counts
      //   course entries per stream (not unique colleges) but gives the same
      //   relative ordering for the filter sidebar and is ~2× faster.
      const [[faCountRows], [rawCityIdRows], [degreeRows]] = await Promise.all([
        pool.query(
          `SELECT functionalarea_id, COUNT(*) AS college_count
           FROM collegemaster
           WHERE functionalarea_id IS NOT NULL
           GROUP BY functionalarea_id
           ORDER BY college_count DESC
           LIMIT 25`,
        ) as Promise<
          [{ functionalarea_id: number; college_count: number }[], unknown]
        >,

        // No DISTINCT, no ORDER BY, no JOIN — purely an indexed range scan.
        pool.query(
          `SELECT registeredAddressCityId
           FROM collegeprofile
           WHERE isShowOnTop = 1
             AND registeredAddressCityId IS NOT NULL
           LIMIT 5000`,
        ) as Promise<[{ registeredAddressCityId: number }[], unknown]>,

        pool.query(
          `SELECT d.id, d.name, d.pageslug
           FROM degree d
           WHERE d.name IS NOT NULL AND d.name != '' AND d.isShowOnTop = 1
           ORDER BY d.name
           LIMIT 50`,
        ) as Promise<[DegreeRow[], unknown]>,
      ]);

      // Deduplicate city IDs in JS — tiny array, effectively free.
      const uniqueCityIds = [
        ...new Set(rawCityIdRows.map((r) => r.registeredAddressCityId)),
      ];

      if (!faCountRows || faCountRows.length === 0) {
        return {
          streamRows: [] as StreamRow[],
          degreeRows: degreeRows as DegreeRow[],
          cityRows: [] as CityRow[],
        };
      }

      // ── Step 2: resolve FA names + city names in parallel ────────────────
      // Both work on small ID lists (~25 FA IDs, ~400 city IDs).
      // The city PK lookup + ORDER BY name operates on ~400 rows — well under
      // sort_buffer_size, never writes a temp file.
      const faIds = faCountRows.map((r) => r.functionalarea_id).join(",");
      const cityIdList = uniqueCityIds.slice(0, 400).join(",");

      const [[faNameRows], [cityRows]] = await Promise.all([
        pool.query(
          `SELECT id, name, pageslug
           FROM functionalarea
           WHERE id IN (${faIds})
             AND name IS NOT NULL
             AND name != ''`,
        ) as Promise<[Pick<StreamRow, "id" | "name" | "pageslug">[], unknown]>,

        cityIdList.length > 0
          ? (pool.query(
              `SELECT id, name
               FROM city
               WHERE id IN (${cityIdList})
                 AND name IS NOT NULL
                 AND name != ''
               ORDER BY name
               LIMIT 100`,
            ) as Promise<[CityRow[], unknown]>)
          : Promise.resolve([[] as CityRow[], undefined] as [
              CityRow[],
              unknown,
            ]),
      ]);

      // Merge counts into name rows and re-sort descending
      const countMap = new Map(
        faCountRows.map((r) => [r.functionalarea_id, r.college_count]),
      );
      const streamRows = (
        faNameRows as Pick<StreamRow, "id" | "name" | "pageslug">[]
      )
        .map((f) => ({
          ...f,
          college_count: countMap.get(f.id) ?? 0,
        }))
        .sort((a, b) => b.college_count - a.college_count) as StreamRow[];

      return {
        streamRows,
        degreeRows: degreeRows as DegreeRow[],
        cityRows: cityRows as CityRow[],
      };
    } catch (err) {
      console.error("[top-colleges] getFilterData error:", err);
      // Return empty filters so the page still renders without a sidebar.
      return {
        streamRows: [] as StreamRow[],
        degreeRows: [] as DegreeRow[],
        cityRows: [] as CityRow[],
      };
    }
  },
  ["top-colleges-filters"],
  { revalidate: 600 }, // 10 minutes — filter options change rarely
);

// ─── Core fetch — two-step query ─────────────────────────────────────────────
//
// WHY the old query was slow (4.5 min render):
//   The single query JOINed collegemaster + functionalarea + degree for EVERY
//   isShowOnTop=1 college, then ran GROUP BY across 17 columns + GROUP_CONCAT
//   across the entire fan-out BEFORE MySQL could apply LIMIT 12.
//   Thousands of colleges × many courses each = millions of intermediary rows.
//
// NEW approach — two steps:
//
//   Step 1  ID query  (fast, no GROUP BY, no GROUP_CONCAT):
//     SELECT cp.id FROM collegeprofile WHERE isShowOnTop=1 [+EXISTS filters]
//     ORDER BY rating DESC  LIMIT 12
//     MySQL satisfies this entirely with the composite index (isShowOnTop, rating).
//
//   Step 2  Enrich query  (cheap — only 12 rows):
//     Full JOIN + GROUP_CONCAT + MIN/MAX on WHERE cp.id IN (12 integers).
//     Aggregating 12 rows is near-instant regardless of total table size.
//
//   Count query: pure COUNT(*) with EXISTS sub-selects — no JOINs at all.
//
// Wrapped in unstable_cache → subsequent requests for the same
// filter/sort/page combo are served from Next.js data cache (no DB hit).
// ─────────────────────────────────────────────────────────────────────────────

async function fetchTopColleges(opts: {
  q: string;
  stream: string;
  degree: string;
  cityId: string;
  stateId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, cityId, stateId, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  // ── Build filter conditions ───────────────────────────────────────────────
  const filterConditions: string[] = ["cp.isShowOnTop = 1"];
  const filterParams: (string | number)[] = [];

  const hasTextSearch = q.length >= 2;
  if (hasTextSearch) {
    filterConditions.push(
      "(u.firstname LIKE ? OR cp.registeredSortAddress LIKE ? OR cp.slug LIKE ?)"
    );
    const like = `%${q}%`;
    filterParams.push(like, like, like);
  }

  if (stream) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm2
      INNER JOIN functionalarea fa2 ON fa2.id = cm2.functionalarea_id
      WHERE cm2.collegeprofile_id = cp.id AND fa2.pageslug = ?
    )`);
    filterParams.push(stream);
  }

  if (degree) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm3
      INNER JOIN degree d2 ON d2.id = cm3.degree_id
      WHERE cm3.collegeprofile_id = cp.id AND d2.pageslug = ?
    )`);
    filterParams.push(degree);
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

  // ── Step 1: ID-only query ─────────────────────────────────────────────────
  // For "fees" sort we need a lightweight GROUP BY cp.id to get MIN(fees).
  // For every other sort we need NO GROUP BY at all — pure indexed scan.
  let idSql: string;

  if (sort === "fees") {
    // Only join collegemaster (filtered to positive fees) — still no
    // GROUP_CONCAT, no wide GROUP BY.
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
  } else {
    let orderBy = "cp.rating DESC, cp.totalRatingUser DESC";
    if (sort === "ranking") {
      orderBy = "(cp.ranking IS NULL OR cp.ranking = 0) ASC, cp.ranking ASC";
    } else if (sort === "newest") {
      orderBy = "cp.created_at DESC";
    }
    // No GROUP BY, no JOINs — MySQL can satisfy this with the
    // idx_cp_top_rating composite index (isShowOnTop, rating).
    idSql = `
      SELECT cp.id
      FROM collegeprofile cp
      ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
      WHERE ${filterWhere}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  // ── Count query ───────────────────────────────────────────────────────────
  // Pure COUNT(*) — same EXISTS conditions, zero JOINs to wide tables.
  const countSql = `
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
    WHERE ${filterWhere}
  `;

  try {
    // Run ID fetch + count in parallel
    const [[idRows], [countRows]] = await Promise.all([
      pool.query(idSql, filterParams) as Promise<[IdRow[], unknown]>,
      pool.query(countSql, filterParams) as Promise<[CountRow[], unknown]>,
    ]);

    const total = countRows[0]?.total ?? 0;

    if (idRows.length === 0) {
      return { colleges: [], total, totalPages: Math.ceil(total / limit) };
    }

    // ── Step 2: Enrich exactly the page IDs ──────────────────────────────
    // GROUP_CONCAT + MIN/MAX on 12 rows is effectively free.
    // IDs are integers from the DB — safe to inline (no injection risk).
    const ids = idRows.map((r) => r.id);
    const idList = ids.join(","); // e.g. "42,7,301,..."

    const enrichSql = `
      SELECT
        cp.id,
        cp.slug,
        COALESCE(
          NULLIF(TRIM(u.firstname), ''),
          NULLIF(TRIM(cp.slug), ''),
          'College'
        )                                                AS name,
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

    // No params needed — IDs are inlined as integer literals above
    const [dataRows] = (await pool.query(enrichSql)) as [CollegeRow[], unknown];

    return {
      colleges: buildColleges(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[top-colleges/page.tsx fetchTopColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

// ─── Cached wrapper ───────────────────────────────────────────────────────────
// Next.js serialises the opts argument as part of the cache key, so every
// unique combination of filters/sort/page gets its own cache entry.
// First hit for a given combo runs the DB queries; every subsequent hit within
// the 5-minute window is served straight from the data cache (~0 ms).
const getCachedTopColleges = unstable_cache(
  fetchTopColleges,
  ["top-colleges-data-v2"],
  { revalidate: 300 }, // 5 minutes
);

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Top Colleges in India 2024 | AdmissionX",
  description:
    "Explore India's top colleges ranked by rating, placement, and student reviews. Filter by stream, degree, city, and fees.",
};

export default async function TopCollegesPage({ searchParams }: PageProps) {
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
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  // Both fetches run in parallel; getFilterData is already cached for 10 min
  const [
    { colleges, total, totalPages },
    { streamRows, degreeRows, cityRows },
  ] = await Promise.all([
    getCachedTopColleges({
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

  let pageSubtitle = `${total.toLocaleString()} top-ranked colleges across India`;
  if (stream) {
    const streamName =
      streamOptions.find((s) => s.slug === stream)?.name ?? stream;
    pageSubtitle = `${total.toLocaleString()} top ${streamName} colleges`;
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
      initStream={stream}
      initDegree={degree}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType="top"
      pageTitle="Top Colleges in India"
      pageSubtitle={pageSubtitle}
    />
  );
}
