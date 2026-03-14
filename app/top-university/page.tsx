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

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

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
const getFilterData = unstable_cache(
  async () => {
    try {
      const [[faCountRows], [rawCityIdRows], [degreeRows]] = await Promise.all([
        pool.query(
          `SELECT functionalarea_id, COUNT(*) AS college_count
           FROM collegemaster cm
           INNER JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
           WHERE cp.isTopUniversity = 1 AND functionalarea_id IS NOT NULL
           GROUP BY functionalarea_id
           ORDER BY college_count DESC
           LIMIT 25`,
        ) as Promise<
          [{ functionalarea_id: number; college_count: number }[], unknown]
        >,

        pool.query(
          `SELECT registeredAddressCityId
           FROM collegeprofile
           WHERE isTopUniversity = 1
             AND registeredAddressCityId IS NOT NULL
           LIMIT 2000`,
        ) as Promise<[{ registeredAddressCityId: number }[], unknown]>,

        pool.query(
          `SELECT DISTINCT d.id, d.name, d.pageslug
           FROM degree d
           INNER JOIN collegemaster cm ON cm.degree_id = d.id
           INNER JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
           WHERE cp.isTopUniversity = 1 AND d.name IS NOT NULL AND d.name != ''
           ORDER BY d.name
           LIMIT 50`,
        ) as Promise<[DegreeRow[], unknown]>,
      ]);

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
      console.error("[top-university] getFilterData error:", err);
      return {
        streamRows: [] as StreamRow[],
        degreeRows: [] as DegreeRow[],
        cityRows: [] as CityRow[],
      };
    }
  },
  ["top-university-filters"],
  { revalidate: 600 },
);

// ─── Core fetch ─────────────────────────────────────────────────────────────
async function fetchTopUniversities(opts: {
  stream: string;
  degree: string;
  cityId: string;
  stateId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}) {
  const { stream, degree, cityId, stateId, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  const filterConditions: string[] = ["cp.isTopUniversity = 1"];
  const filterParams: (string | number)[] = [];

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
    WHERE ${filterWhere}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  if (sort === "fees") {
      idSql = `
        SELECT cp.id
        FROM collegeprofile cp
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

    const [dataRows] = (await pool.query(enrichSql)) as [UniversityRow[], unknown];

    return {
      universities: buildUniversities(dataRows),
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[top-university] fetch error:", err);
    return { universities: [], total: 0, totalPages: 0 };
  }
}

const getCachedTopUniversities = unstable_cache(
  fetchTopUniversities,
  ["top-university-data"],
  { revalidate: 300 },
);

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Top Universities in India 2024 | AdmissionX",
  description: "Explore India's top universities ranked by academic excellence, placements, and infrastructure. Filter by stream, degree, city, and fees.",
};

export default async function TopUniversityPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

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
    const streamName = streamOptions.find((s) => s.slug === stream)?.name ?? stream;
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
