import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Force this route to be server-rendered on every request so the sitemap
// always reflects the latest DB content rather than a stale prerendered copy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Base URL ─────────────────────────────────────────────────────────────────

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://admissionx.in"
).replace(/\/$/, "");

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(sql: string): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql)) as [T[], unknown];
    return rows;
  } catch {
    return [];
  }
}

function url(
  loc: string,
  opts: {
    lastmod?: string | null;
    changefreq?: string;
    priority?: string;
  } = {},
): string {
  const lastmod =
    opts.lastmod && !isNaN(Date.parse(opts.lastmod))
      ? `\n    <lastmod>${new Date(opts.lastmod).toISOString().slice(0, 10)}</lastmod>`
      : "";
  const changefreq = opts.changefreq
    ? `\n    <changefreq>${opts.changefreq}</changefreq>`
    : "";
  const priority = opts.priority
    ? `\n    <priority>${opts.priority}</priority>`
    : "";
  return `\n  <url>\n    <loc>${BASE}${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
}

// Board category slug helper (mirrors boards/page.tsx logic)
function deriveCategory(misc: string | null, title: string): string {
  if (misc && misc.trim()) {
    return misc
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
  }
  const first = title.trim().split(/\s+/)[0] ?? "board";
  return first.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlugRow extends RowDataPacket {
  slug: string;
  updated_at: string | null;
}

interface ExamRow extends RowDataPacket {
  slug: string;
  stream_slug: string | null;
  updated_at: string | null;
}

interface BoardRow extends RowDataPacket {
  slug: string;
  misc: string | null;
  title: string;
  updated_at: string | null;
}

// ─── Static pages ─────────────────────────────────────────────────────────────

const STATIC_PAGES: Array<{
  loc: string;
  changefreq: string;
  priority: string;
}> = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/top-colleges", changefreq: "daily", priority: "0.9" },
  { loc: "/top-university", changefreq: "daily", priority: "0.9" },
  { loc: "/stream", changefreq: "weekly", priority: "0.8" },
  { loc: "/examination", changefreq: "daily", priority: "0.9" },
  { loc: "/education-blogs", changefreq: "daily", priority: "0.8" },
  { loc: "/news", changefreq: "hourly", priority: "0.9" },
  { loc: "/study-abroad", changefreq: "weekly", priority: "0.8" },
  { loc: "/search", changefreq: "daily", priority: "0.8" },
  { loc: "/boards", changefreq: "weekly", priority: "0.7" },
  { loc: "/ask", changefreq: "daily", priority: "0.7" },
  { loc: "/popular-careers", changefreq: "weekly", priority: "0.8" },
  { loc: "/careers/opportunities", changefreq: "weekly", priority: "0.7" },
  { loc: "/careers-courses", changefreq: "weekly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact-us", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
  { loc: "/terms-and-conditions", changefreq: "monthly", priority: "0.3" },
  { loc: "/disclaimer", changefreq: "monthly", priority: "0.3" },
  { loc: "/cancellation-refunds", changefreq: "monthly", priority: "0.3" },
  { loc: "/help-center", changefreq: "monthly", priority: "0.5" },
  { loc: "/login", changefreq: "yearly", priority: "0.2" },
  { loc: "/signup", changefreq: "yearly", priority: "0.3" },
  { loc: "/signup/student", changefreq: "yearly", priority: "0.3" },
  { loc: "/signup/college", changefreq: "yearly", priority: "0.3" },
];

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  // ── Parallel DB fetches ────────────────────────────────────────────────────
  const [
    collegeRows,
    universityRows,
    blogRows,
    newsRows,
    examRows,
    streamRows,
    careerRows,
    boardRows,
  ] = await Promise.all([
    // All colleges with a slug
    safeQuery<SlugRow>(
      `SELECT slug, updated_at
       FROM collegeprofile
       WHERE slug IS NOT NULL AND slug != ''
       ORDER BY updated_at DESC
       LIMIT 5000`,
    ),

    // Top universities (subset — also in /university/[slug])
    safeQuery<SlugRow>(
      `SELECT slug, updated_at
       FROM collegeprofile
       WHERE isTopUniversity = 1
         AND slug IS NOT NULL AND slug != ''
       ORDER BY topUniversityRank ASC
       LIMIT 500`,
    ),

    // Active blogs
    safeQuery<SlugRow>(
      `SELECT slug, updated_at
       FROM blogs
       WHERE isactive = 1 AND slug IS NOT NULL AND slug != ''
       ORDER BY updated_at DESC
       LIMIT 2000`,
    ),

    // Active news
    safeQuery<SlugRow>(
      `SELECT slug, updated_at
       FROM news
       WHERE isactive = 1 AND slug IS NOT NULL AND slug != ''
       ORDER BY updated_at DESC
       LIMIT 2000`,
    ),

    // Active exams with stream slug
    safeQuery<ExamRow>(
      `SELECT ed.slug, f.pageslug AS stream_slug, ed.updated_at
       FROM examination_details ed
       LEFT JOIN functionalarea f ON f.id = ed.functionalarea_id
       WHERE ed.status = 1
         AND ed.slug IS NOT NULL AND ed.slug != ''
         AND f.pageslug IS NOT NULL AND f.pageslug != ''
       ORDER BY ed.updated_at DESC
       LIMIT 2000`,
    ),

    // Streams (for /careers/opportunities/[stream])
    safeQuery<SlugRow>(
      `SELECT pageslug AS slug, updated_at
       FROM functionalarea
       WHERE pageslug IS NOT NULL AND pageslug != ''
       ORDER BY id ASC`,
    ),

    // Popular careers
    safeQuery<SlugRow>(
      `SELECT slug, updated_at
       FROM counseling_career_details
       WHERE status = 1 AND slug IS NOT NULL AND slug != ''
       ORDER BY updated_at DESC
       LIMIT 500`,
    ),

    // Active boards
    safeQuery<BoardRow>(
      `SELECT cb.slug, cb.misc, cb.title, cb.updated_at
       FROM counseling_boards cb
       WHERE cb.status = 1
         AND cb.slug IS NOT NULL AND cb.slug != ''
       ORDER BY cb.id ASC`,
    ),
  ]);

  // ── Build URL blocks ───────────────────────────────────────────────────────
  const parts: string[] = [];

  // Static
  for (const p of STATIC_PAGES) {
    parts.push(url(p.loc, { changefreq: p.changefreq, priority: p.priority }));
  }

  // Colleges  /college/[slug]
  for (const row of collegeRows) {
    if (!row.slug) continue;
    parts.push(
      url(`/college/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "weekly",
        priority: "0.7",
      }),
    );
  }

  // Universities  /university/[slug]
  const uniSlugs = new Set<string>();
  for (const row of universityRows) {
    if (!row.slug || uniSlugs.has(row.slug)) continue;
    uniSlugs.add(row.slug);
    parts.push(
      url(`/university/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "weekly",
        priority: "0.8",
      }),
    );
  }

  // Blogs  /blogs/[slug]
  for (const row of blogRows) {
    if (!row.slug) continue;
    parts.push(
      url(`/blogs/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "monthly",
        priority: "0.6",
      }),
    );
  }

  // News  /news/[slug]
  for (const row of newsRows) {
    if (!row.slug) continue;
    parts.push(
      url(`/news/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "weekly",
        priority: "0.7",
      }),
    );
  }

  // Exams  /examination/[stream]/[slug]
  for (const row of examRows) {
    if (!row.slug || !row.stream_slug) continue;
    parts.push(
      url(`/examination/${row.stream_slug}/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "weekly",
        priority: "0.7",
      }),
    );
  }

  // Streams  /careers/opportunities/[stream]
  for (const row of streamRows) {
    if (!row.slug) continue;
    parts.push(
      url(`/careers/opportunities/${row.slug}`, {
        changefreq: "weekly",
        priority: "0.6",
      }),
    );
  }

  // Popular careers  /popular-careers/[slug]
  for (const row of careerRows) {
    if (!row.slug) continue;
    parts.push(
      url(`/popular-careers/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "monthly",
        priority: "0.6",
      }),
    );
  }

  // Boards  /board/[category]/[slug]
  for (const row of boardRows) {
    if (!row.slug) continue;
    const category = deriveCategory(row.misc, row.title);
    parts.push(
      url(`/board/${category}/${row.slug}`, {
        lastmod: row.updated_at,
        changefreq: "monthly",
        priority: "0.5",
      }),
    );
  }

  // ── Assemble XML ───────────────────────────────────────────────────────────
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>${parts.join("")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
