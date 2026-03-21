import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollegeResult {
  id: number;
  slug: string;
  name: string;
  location: string;
  city_name: string | null;
  state_id: number | null;
  image: string | null;
  rating: number;
  totalRatingUser: number;
  ranking: number | null;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  estyear: string | null;
  verified: number;
  totalStudent: number | null;
  streams: string[];
  min_fees: number | null;
  max_fees: number | null;
}

interface IdRow extends RowDataPacket {
  id: number;
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

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in"; 

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw; // <--- The crucial fix. Images are in the public/ folder!
  return `/uploads/${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── GET /api/search/colleges ─────────────────────────────────────────────────
//
// Query params:
//   q          – free-text (college name / location)
//   stream     – functionalarea.pageslug  e.g. "engineering"
//   degree     – degree.pageslug          e.g. "b-tech"
//   city_id    – city.id (integer)
//   state_id   – city.state_id (integer)
//   fees_max   – upper fee limit (integer, in ₹)
//   sort       – "rating" | "ranking" | "fees" | "newest"  (default: rating)
//   type       – "top" | "university" | "abroad"           (optional pre-filter)
//   page       – page number (default 1)
//   limit      – page size (default 12, max 48)
//
// HOW IT WORKS — two-step query:
//
//   Step 1  ID query  (fast — no GROUP BY, no GROUP_CONCAT):
//     SELECT cp.id FROM collegeprofile cp
//       [LEFT JOIN users u  ONLY when q is set — text search needs it]
//       [LEFT JOIN collegemaster cm  ONLY for fees sort]
//     WHERE <filter conditions via EXISTS sub-selects>
//     ORDER BY <sort column>
//     LIMIT limit OFFSET offset
//
//   Step 2  Enrich query  (cheap — only touches the returned IDs):
//     Full JOIN + GROUP_CONCAT on WHERE cp.id IN (id1, id2, …)
//     GROUP_CONCAT on ≤48 rows is near-instant regardless of table size.
//
//   Count query:
//     Pure COUNT(*) with EXISTS sub-selects — no joins to wide tables.
//
// This eliminates the old bottleneck: a full GROUP BY + GROUP_CONCAT across
// ALL matching rows before LIMIT could be applied, which caused multi-second
// (or multi-minute) renders on large datasets.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;

  const q = (sp.get("q") ?? "").trim();
  const stream = (sp.get("stream") ?? "").trim();
  const degree = (sp.get("degree") ?? "").trim();
  const cityId = sp.get("city_id") ? parseInt(sp.get("city_id")!) : null;
  const stateId = sp.get("state_id") ? parseInt(sp.get("state_id")!) : null;
  const feesMax = sp.get("fees_max") ? parseInt(sp.get("fees_max")!) : null;
  const sort = sp.get("sort") ?? "rating";
  const type = (sp.get("type") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(6, parseInt(sp.get("limit") ?? "12")));
  const offset = (page - 1) * limit;

  // ── Build filter conditions (all via EXISTS — no outer JOINs needed) ────────

  const filterConditions: string[] = [];
  const filterParams: (string | number)[] = [];

  // Text search — needs users JOIN in the ID query (can't use EXISTS easily
  // since firstname lives in users, not collegeprofile)
  const hasTextSearch = q.length >= 2;
  if (hasTextSearch) {
    filterConditions.push(
      "(u.firstname LIKE ? OR cp.registeredSortAddress LIKE ? OR cp.slug LIKE ?)",
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

  if (feesMax != null && !isNaN(feesMax)) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM collegemaster cm4
      WHERE cm4.collegeprofile_id = cp.id
        AND cm4.fees > 0 AND cm4.fees <= ?
    )`);
    filterParams.push(feesMax);
  }

  if (cityId != null) {
    filterConditions.push("cp.registeredAddressCityId = ?");
    filterParams.push(cityId);
  }

  if (stateId != null) {
    filterConditions.push(`EXISTS (
      SELECT 1 FROM city c2
      WHERE c2.id = cp.registeredAddressCityId AND c2.state_id = ?
    )`);
    filterParams.push(stateId);
  }

  // Type pre-filters
  if (type === "top") {
    filterConditions.push("cp.isShowOnTop = 1");
  } else if (type === "university") {
    filterConditions.push("cp.isTopUniversity = 1");
  } else if (type === "abroad") {
    filterConditions.push("cp.registeredAddressCountryId != 1");
  }

  const filterWhere =
    filterConditions.length > 0 ? filterConditions.join(" AND ") : "1=1";

  // ── Step 1: ID-only query ──────────────────────────────────────────────────
  // Text search requires a users JOIN (no other way to search by name).
  // Fees sort requires a collegemaster JOIN to compute MIN(fees).
  // Everything else runs with no extra JOINs.

  let idSql: string;

  if (sort === "fees") {
    // Need MIN(cm.fees) for ordering — lightweight GROUP BY cp.id only
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
      orderBy =
        "CASE WHEN cp.ranking IS NULL OR cp.ranking = 0 THEN 1 ELSE 0 END, cp.ranking ASC";
    } else if (sort === "newest") {
      orderBy = "cp.created_at DESC";
    }

    // No GROUP BY, no extra JOINs (except users when searching by name)
    idSql = `
      SELECT cp.id
      FROM collegeprofile cp
      ${hasTextSearch ? "LEFT JOIN users u ON u.id = cp.users_id" : ""}
      WHERE ${filterWhere}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  // ── Count query ────────────────────────────────────────────────────────────
  // Pure COUNT — same EXISTS conditions, zero extra JOINs (except users for q)
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
      return NextResponse.json({
        success: true,
        colleges: [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      });
    }

    // ── Step 2: Enrich the page IDs ──────────────────────────────────────────
    // GROUP_CONCAT + MIN/MAX across ≤48 rows is effectively free.
    // IDs are integers from the DB — safe to inline (no injection risk).
    const ids = idRows.map((r) => r.id);
    const idList = ids.join(",");

    const enrichSql = `
      SELECT
        cp.id,
        cp.slug,
        COALESCE(
          NULLIF(TRIM(u.firstname), ''),
          NULLIF(TRIM(cp.slug),     ''),
          'College'
        )                                                  AS name,
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
        GROUP_CONCAT(DISTINCT fa.name ORDER BY fa.name SEPARATOR '|') AS streams_raw,
        MIN(CASE WHEN cm.fees > 0 THEN cm.fees END)        AS min_fees,
        MAX(CASE WHEN cm.fees > 0 THEN cm.fees END)        AS max_fees
      FROM collegeprofile cp
      LEFT JOIN users u           ON u.id  = cp.users_id
      LEFT JOIN city c            ON c.id  = cp.registeredAddressCityId
      LEFT JOIN collegemaster cm  ON cm.collegeprofile_id  = cp.id
      LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
      WHERE cp.id IN (${idList})
      GROUP BY
        cp.id, cp.slug, u.firstname, cp.registeredSortAddress,
        c.name, c.state_id, cp.bannerimage, cp.rating, cp.totalRatingUser,
        cp.ranking, cp.isTopUniversity, cp.topUniversityRank, cp.universityType,
        cp.estyear, cp.verified, cp.totalStudent
      ORDER BY FIELD(cp.id, ${idList})
    `;

    // No params — IDs are inlined as integer literals above
    const [dataRows] = (await pool.query(enrichSql)) as [CollegeRow[], unknown];

    const colleges: CollegeResult[] = dataRows.map((row) => {
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

    return NextResponse.json({
      success: true,
      colleges,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    console.error("[/api/search/colleges]", err);
    return NextResponse.json(
      {
        success: false,
        colleges: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit,
      },
      { status: 500 },
    );
  }
}
