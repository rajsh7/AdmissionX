import { unstable_cache } from "next/cache";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaRow extends RowDataPacket {
  id: number;
}

interface IdRow extends RowDataPacket {
  id: number;
}

interface CollegeRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  location: string | null;
  image: string | null;
  rating: string | null;
}

export interface FilterCollegeResult {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
}

// ─── UI-label → DB pageslug map ───────────────────────────────────────────────
// Keeps the mapping in one place so TopUniversities.tsx, the filter API route,
// and the homepage SSR all use exactly the same slugs.
export const CATEGORY_SLUG: Record<string, string> = {
  MBA: "management",
  Engineering: "engineering",
  MBBS: "medicine",
  "B.Com": "commerce",
  Design: "design",
  Fashion: "design", // Fashion colleges live under the Design stream
  Pharmacy: "pharmacy",
  Humanities: "arts",
};

// ─── Core fetcher (un-cached) ─────────────────────────────────────────────────
//
// WHY FOUR STEPS instead of one big JOIN
// ──────────────────────────────────────
// The `collegemaster` table has no index on `functionalarea_id`
// (a covering index is being built in the background — see the comment in
// top-university/page.tsx).  A single query joining collegemaster →
// functionalarea → collegeprofile forces a full table scan of collegemaster on
// every call, which times-out on cold buffer pools (120 s+).
//
// Step 1  Resolve the slug to an integer id on `functionalarea` (~45 rows).
//         Always instant — no index needed for a 45-row table.
//
// Step 2  Scan `collegemaster` with a direct integer equality on
//         `functionalarea_id`.  Even without an index an integer compare is
//         far cheaper than a JOIN + string comparison, and LIMIT 300 lets
//         MySQL short-circuit early.
//
// Step 3  Rank the ≤300 candidate college ids by rating inside
//         `collegeprofile` (tiny WHERE id IN (…)).  Always fast.
//
// Step 4  Enrich just those 8 ids — LEFT JOIN users for the real name.
//         GROUP_CONCAT / COALESCE on 8 rows is effectively free.
//
// The result is wrapped in unstable_cache (5-minute TTL) so the slow Step 2
// scan only ever runs once per stream per 5 minutes.
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCollegesForSlug(
  slug: string,
): Promise<FilterCollegeResult[]> {
  // ── Step 1: pageslug → functionalarea.id ─────────────────────────────────
  const [faRows] = (await pool.query(
    "SELECT id FROM functionalarea WHERE pageslug = ? LIMIT 1",
    [slug],
  )) as [FaRow[], unknown];

  if (!faRows.length) return [];

  const faId = faRows[0].id;

  // ── Step 2: collect up to 300 distinct college ids for this stream ────────
  // Direct integer equality on functionalarea_id — no JOIN to functionalarea.
  const [cmRows] = (await pool.query(
    `SELECT DISTINCT collegeprofile_id AS id
     FROM   collegemaster
     WHERE  functionalarea_id = ?
     LIMIT  300`,
    [faId],
  )) as [IdRow[], unknown];

  if (!cmRows.length) return [];

  // ── Step 3: rank those ≤300 candidates by rating, keep top 8 ─────────────
  // IDs are integers from the DB — safe to inline.
  const candidateList = cmRows.map((r) => r.id).join(",");

  const [topRows] = (await pool.query(
    `SELECT   id
     FROM     collegeprofile
     WHERE    id IN (${candidateList})
     ORDER BY rating          DESC,
              totalRatingUser  DESC
     LIMIT    8`,
  )) as [IdRow[], unknown];

  if (!topRows.length) return [];

  // ── Step 4: enrich the 8 ids ──────────────────────────────────────────────
  const idList = topRows.map((r) => r.id).join(",");

  const [dataRows] = (await pool.query(
    `SELECT
       cp.id,
       cp.slug,
       COALESCE(
         NULLIF(TRIM(u.firstname), ''),
         NULLIF(TRIM(cp.slug),    ''),
         'University'
       )                                      AS name,
       COALESCE(cp.registeredSortAddress, '') AS location,
       cp.bannerimage                         AS image,
       COALESCE(cp.rating, 0)                 AS rating
     FROM collegeprofile cp
     LEFT JOIN users u
       ON  u.id = cp.users_id
       AND u.firstname NOT LIKE 'Delete%'
     WHERE cp.id IN (${idList})
     ORDER BY FIELD(cp.id, ${idList})`,
  )) as [CollegeRow[], unknown];

  // ── Shape into the University object expected by TopUniversities.tsx ──────
  return dataRows.map((row) => {
    const name  = row.name || "University";
    const words = name.split(" ");
    const abbr  =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const rawImage = row.image ?? "";
    const image = rawImage
      ? rawImage.startsWith("http") || rawImage.startsWith("/")
        ? rawImage
        : `/uploads/${rawImage}`
      : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

    return {
      name,
      location: row.location || "India",
      image,
      rating: Math.round((Number(row.rating) || 4.5) * 10) / 10,
      abbr,
      abbrBg: "bg-primary",
      tags: ["Featured", "Top Ranked"],
      tuition: "View Fees",
      href: `/university/${row.slug || ""}`,
    };
  });
}

// ─── Cached wrapper ───────────────────────────────────────────────────────────
// One cache entry per slug, refreshed every 5 minutes.
// Errors propagate (not caught) so unstable_cache never stores a failed/empty
// result — the next request will retry the DB instead of serving stale zeros.
export const getCachedCollegesForSlug = unstable_cache(
  fetchCollegesForSlug,
  ["home-filter-colleges-v1"],
  { revalidate: 300 },
);
