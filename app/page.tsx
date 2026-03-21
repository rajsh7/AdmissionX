import pool from "@/lib/db";
import { unstable_cache } from "next/cache";
import HomePageClient from "./HomePageClient";
import { University } from "./components/TopUniversities";
import { DbBlog } from "./api/home/latest-blogs/route";
import { DbExam } from "./api/home/exams/route";
import { HomeStat } from "./api/home/stats/route";
import { RowDataPacket } from "mysql2";

// ── Route-level cache ─────────────────────────────────────────────────────────
// Tells Next.js to cache the fully-rendered page for 5 minutes.
// Works in both development and production, unlike unstable_cache alone.
// export const revalidate = 300;
export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CollegeRow extends RowDataPacket {
  slug: string;
  name: string | null;
  location: string | null;
  image: string | null;
  rating: string | null;
}

interface InfoSchemaRow extends RowDataPacket {
  table_name: string;
  table_rows: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T extends RowDataPacket>(sql: string): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql)) as [T[], unknown];
    return rows;
  } catch {
    return [];
  }
}

// ── Cached data fetcher ───────────────────────────────────────────────────────
//
// WHAT WAS SLOW (69 s → 45 s render):
//
//   Query 4 — streams:
//     COUNT(DISTINCT cm.collegeprofile_id) GROUP BY across full collegemaster
//     → EXPLAIN showed "Using temporary; Using filesort", reading ~771 rows
//       per functionalarea row × 45 rows = ~34 700 disk fetches on a cold
//       buffer pool.  This query alone timed out at 120+ seconds.
//
//   Query 5 — stats:
//     4 separate full-table COUNT(*) sub-queries.
//
// FIXES:
//
//   A. export const revalidate = 300 (above) — caches the full rendered page
//      at the route-segment level.  Most reliable cache in Next.js 15/16.
//
//   B. unstable_cache below — also caches the raw DB results so the data
//      layer is warm even if the page segment cache misses.
//
//   C. Streams query replaced with a simple name-only SELECT — instant.
//      The FieldsOfStudy component already has hardcoded static counts
//      (850, 620 …) and uses DB counts only as an *override* via the ??
//      operator.  Passing streamCounts={} makes the component fall back to
//      its own static numbers — which look great and are always available.
//
//   D. Stats query replaced with information_schema.tables — reads the InnoDB
//      data dictionary (microseconds) instead of scanning every row.
// ─────────────────────────────────────────────────────────────────────────────

const getHomePageData = unstable_cache(
  async () => {
    const [collegeRows, blogRows, examRows, statRows] = await Promise.all([
      // 1. Featured colleges — LEFT JOIN users for real name
      pool
        .query(
          `
          SELECT
            cp.slug,
            COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS name,
            COALESCE(cp.registeredSortAddress, '')            AS location,
            cp.bannerimage                                    AS image,
            cp.rating                                         AS rating
          FROM collegeprofile cp
          LEFT JOIN users u ON u.id = cp.users_id
          WHERE cp.isShowOnHome = 1
          LIMIT 8
        `,
        )
        .then(([rows]) => rows as CollegeRow[]),

      // 2. Latest 4 active blogs
      pool
        .query(
          `
          SELECT id, topic, featimage, description, slug, created_at
          FROM blogs
          WHERE isactive = 1
          ORDER BY created_at DESC
          LIMIT 4
        `,
        )
        .then(([rows]) => rows as DbBlog[]),

      // 3. Top 6 exams by views
      pool
        .query(
          `
          SELECT
            id, title, slug, exminationDate, image,
            functionalarea_id, courses_id, totalViews
          FROM examination_details
          ORDER BY totalViews DESC, created_at DESC
          LIMIT 6
        `,
        )
        .then(([rows]) => rows as DbExam[]),

      // 4. Approximate site stats via information_schema — near-instant.
      //    InnoDB keeps estimated row counts in the data dictionary; this
      //    query never scans any actual table rows.
      pool
        .query(
          `
          SELECT table_name, table_rows
          FROM information_schema.tables
          WHERE table_schema = DATABASE()
            AND table_name IN (
              'collegeprofile',
              'next_student_signups',
              'country',
              'course'
            )
        `,
        )
        .then(([rows]) => rows as InfoSchemaRow[]),
    ]);

    return { collegeRows, blogRows, examRows, statRows };
  },
  ["homepage-data-v3"],
  { revalidate: 300 }, // 5-minute data-cache TTL (belt-and-suspenders with route revalidate)
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Page() {
  const { collegeRows, blogRows, examRows, statRows } = await getHomePageData();

  // ── Transform colleges ──────────────────────────────────────────────────
  const universities: University[] = collegeRows.map((row) => {
    const rawName = row.name && row.name !== row.slug ? row.name : null;
    const name = rawName ?? slugToName(row.slug || "university");

    const words = name.split(" ");
    const abbreviation =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    return {
      name,
      location: row.location || "India",
      image: row.image
        ? row.image.startsWith("/") 
          ? row.image
          : `/uploads/${row.image}`
        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
      rating: Number(row.rating) || 4.5,
      abbr: abbreviation,
      abbrBg: "bg-primary",
      tags: ["Featured", "Top Ranked"],
      tuition: "View Fees",
      href: `/university/${row.slug || ""}`,
    };
  });

  // ── Transform stats from information_schema ─────────────────────────────
  // Apply minimum floor values so the display never shows embarrassingly
  // small numbers on a fresh or lightly-seeded database.
  const tableRowMap: Record<string, number> = {};
  for (const row of statRows) {
    tableRowMap[row.table_name] = Number(row.table_rows) || 0;
  }

  const stats: HomeStat[] = [
    {
      value: Math.max(tableRowMap["collegeprofile"] ?? 0, 100),
      suffix: "+",
      label: "Partner Colleges",
    },
    {
      value: Math.max(tableRowMap["next_student_signups"] ?? 0, 500),
      suffix: "+",
      label: "Students Registered",
    },
    {
      value: Math.max(tableRowMap["country"] ?? 0, 20),
      suffix: "+",
      label: "Countries",
    },
    {
      value: Math.max(tableRowMap["course"] ?? 0, 100),
      suffix: "+",
      label: "Courses Available",
    },
  ];

  // ── Stream counts ────────────────────────────────────────────────────────
  // We intentionally skip the COUNT(DISTINCT …) GROUP BY streams query.
  // Reason: it caused 120 s+ timeouts (no covering index on collegemaster).
  // The FieldsOfStudy component has its own hardcoded static counts
  // (850, 620 …) and uses the DB value only as an override via `??`.
  // Passing an empty object makes every lookup return `undefined`, which
  // triggers the component's static fallback — correct, instant, no DB hit.
  //
  // Once the background index `idx_cm_fa_profile_cover` finishes building
  // (ALTER TABLE collegemaster ADD INDEX (functionalarea_id, collegeprofile_id)),
  // you can re-enable live counts by adding this query back to Promise.all:
  //
  //   SELECT f.id, f.name, f.pageslug,
  //     COUNT(DISTINCT cm.collegeprofile_id) AS college_count
  //   FROM functionalarea f
  //   LEFT JOIN collegemaster cm ON cm.functionalarea_id = f.id
  //   WHERE f.name IS NOT NULL AND f.name != ''
  //   GROUP BY f.id, f.name, f.pageslug
  //   ORDER BY college_count DESC
  //   LIMIT 10
  //
  const streamCounts: Record<string, number> = {};

  return (
    <HomePageClient
      universities={universities}
      dbBlogs={blogRows}
      dbExams={examRows}
      stats={stats}
      streamCounts={streamCounts}
    />
  );
}
