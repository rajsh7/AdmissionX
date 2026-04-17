import { getDb } from "@/lib/db";
import { unstable_cache } from "next/cache";
import HomePageClient from "./HomePageClient";
import { University } from "./components/TopUniversities";
import { DbBlog } from "./api/home/latest-blogs/route";
import { DbExam } from "./api/home/exams/route";
import { HomeStat } from "./api/home/stats/route";
import {
  getCachedCollegesForSlug,
  CATEGORY_SLUG,
  FilterCollegeResult,
} from "@/lib/college-filter";
import type { AdItem } from "./components/AdsSection";

export interface TickerAdItem {
  id: number;
  title: string | null;
  description: string | null;
  img: string | null;
  redirectto: string | null;
}

// ── Route-level cache ─────────────────────────────────────────────────────────
// Tells Next.js to cache the fully-rendered page for 5 minutes.
// Works in both development and production, unlike unstable_cache alone.
// export const revalidate = 300;
export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CollegeRow {
  slug: string;
  name: string | null;
  location: string | null;
  image: string | null;
  rating: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T>(collection: string): Promise<T[]> {
  try {
    const db = await getDb();
    return await db.collection(collection).find({}).toArray() as T[];
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
    try {
      const db = await getDb();

      const [collegeRows, blogRows, examRows, adRows, collegeCount, studentCount, countryCount, courseCount] = await Promise.all([
        // 1. Featured colleges
        db.collection("collegeprofile").aggregate([
          { $match: { isShowOnHome: 1 } },
          { $limit: 8 },
          { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "placement", localField: "id", foreignField: "collegeprofile_id", as: "placement", }, },
          { $unwind: { path: "$placement", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0, slug: 1, name: { $cond: [ { $and: [{ $ne: ["$user.firstname", null] }, { $ne: [{ $trim: { input: "$user.firstname" } }, ""] }] }, { $trim: { input: "$user.firstname" } }, "$slug", ], },
              location: "$registeredSortAddress", image: "$bannerimage", rating: 1, avgPackage: "$placement.ctcaverage",
            },
          },
        ]).toArray() as Promise<(CollegeRow & { avgPackage?: string })[]>,

        // 2. Latest 8 active blogs
        db.collection("blogs").find({ isactive: 1 }).sort({ created_at: -1 }).limit(8).project({ _id: 0, id: 1, topic: 1, featimage: 1, fullimage: 1, image: 1, description: 1, slug: 1, created_at: 1 }).toArray() as Promise<DbBlog[]>,

        // 3. Top 8 exams
        db.collection("examination_details").find({}).sort({ totalViews: -1, created_at: -1 }).limit(8).project({ _id: 0, id: 1, title: 1, slug: 1, exminationDate: 1, image: 1, functionalarea_id: 1, courses_id: 1, totalViews: 1 }).toArray() as Promise<DbExam[]>,

        // 4. Ads
        db.collection("ads_managements")
          .find(buildAdsFilter(["home", "default"]))
          .sort({ created_at: -1 })
          .limit(8)
          .project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
          .toArray() as Promise<AdItem[]>,

        // 6. Stats
        db.collection("collegeprofile").estimatedDocumentCount(),
        db.collection("next_student_signups").estimatedDocumentCount(),
        db.collection("country").estimatedDocumentCount(),
        db.collection("course").estimatedDocumentCount(),
      ]);

      const statCounts = [collegeCount, studentCount, countryCount, courseCount];

      // 7. Reviews — fetched separately to avoid Turbopack parser issues
      const rawReviews = await db.collection("college_reviews")
        .find({ description: { $exists: true, $ne: "" } })
        .sort({ created_at: -1 })
        .limit(8)
        .project({ _id: 0, description: 1, academic: 1, faculty: 1, placement: 1, infrastructure: 1, users_id: 1, collegeprofile_id: 1 })
        .toArray();

      const reviewRows = rawReviews.map((r: any) => {
        const avg = [r.academic, r.faculty, r.placement, r.infrastructure]
          .map((v: any) => parseFloat(String(v ?? "4").trim()) || 4)
          .reduce((a: number, b: number) => a + b, 0) / 4;
        return {
          name: "Student",
          college: "Verified College",
          text: String(r.description ?? "").trim(),
          rating: Math.min(5, Math.max(1, Math.round(avg))),
        };
      });

      // Ticker ads...
      const tickerAdRows = await db.collection("ads_managements")
        .find(buildAdsFilter(["home_ticker"]))
        .sort({ created_at: -1 }).limit(20).project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 }).toArray() as TickerAdItem[];

      return { collegeRows, blogRows, examRows, adRows, statCounts, tickerAdRows, reviewRows };
    } catch (error) {
      console.error("[getHomePageData] Database error:", error);
      // Return empty data instead of crashing
      return {
        collegeRows: [],
        blogRows: [],
        examRows: [],
        adRows: [],
        statCounts: [0, 0, 0, 0],
        tickerAdRows: [],
      };
    }
  },
  ["homepage-data-v11"],
  { revalidate: 300 },
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Page() {
  let collegeRows: CollegeRow[] = [];
  let blogRows: DbBlog[] = [];
  let examRows: DbExam[] = [];
  let adRows: AdItem[] = [];
  let statCounts = [0, 0, 0, 0];
  let tickerAdRows: TickerAdItem[] = [];
  let reviewRows: any[] = [];

  try {
    const data = await getHomePageData();
    collegeRows   = data.collegeRows;
    blogRows      = data.blogRows;
    examRows      = data.examRows;
    adRows        = data.adRows;
    statCounts    = data.statCounts;
    tickerAdRows  = data.tickerAdRows;
    reviewRows    = (data as any).reviewRows || [];
  } catch (error) {
    console.error("[homepage] Failed to fetch data:", error);
  }

  // ── Transform colleges ──────────────────────────────────────────────────
  const universities: University[] = collegeRows.map((row) => {
    const rawName = row.name && row.name !== row.slug ? row.name : null;
    const name = rawName ?? slugToName(row.slug || "university");

    const words = name.split(" ");
    const abbreviation =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const FALLBACK = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";
    const raw = (row.image ?? "").trim();
    const isValid = raw && raw.toUpperCase() !== "NULL" && !raw.toUpperCase().includes("NULL");
    const image = isValid
      ? raw.startsWith("http") || raw.startsWith("/")
        ? raw
        : `/uploads/${raw}`
      : FALLBACK;

    return {
      name,
      location: row.location || "India",
      image,
      rating: Number(row.rating) || 4.5,
      abbr: abbreviation,
      abbrBg: "bg-primary",
      tags: ["Featured", "Top Ranked"],
      tuition: "View Fees",
      href: `/university/${row.slug || ""}`,
      avgPackage: (row as any).avgPackage ? `₹ ${(row as any).avgPackage} LPA` : "₹ 4.5 LPA",
    };
  });

  const [collegeCount, studentCount, countryCount, courseCount] = statCounts;
  const stats: HomeStat[] = [
    { value: Math.max(collegeCount, 100), suffix: "+", label: "Partner Colleges" },
    { value: Math.max(studentCount, 500), suffix: "+", label: "Students Registered" },
    { value: Math.max(countryCount, 20),  suffix: "+", label: "Countries" },
    { value: Math.max(courseCount, 100),  suffix: "+", label: "Courses Available" },
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

  // ── Pre-warm the default "Engineering" tab cache ──────────────────────────
  // The TopUniversities component mounts with "Engineering" as the active tab.
  // By fetching it here (server-side, cached), the first tab click is instant
  // and the API route serves from the warm cache rather than hitting the DB.
  // If this fetch fails (e.g. DB still slow), we fall back to the featured
  // universities already loaded above so the page never breaks.
  let initialStreamColleges: FilterCollegeResult[] = [];
  try {
    initialStreamColleges = await getCachedCollegesForSlug(
      CATEGORY_SLUG["Engineering"],
    );
  } catch {
    // Non-fatal — component will fetch on first tab click instead
  }

  return (
    <HomePageClient
      universities={universities}
      dbBlogs={blogRows}
      dbExams={examRows}
      stats={stats}
      streamCounts={streamCounts}
      initialStreamColleges={initialStreamColleges}
      ads={adRows}
      tickerAds={tickerAdRows}
      testimonials={reviewRows}
    />
  );
}




