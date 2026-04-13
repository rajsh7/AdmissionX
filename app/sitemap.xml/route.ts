import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://admissionx.in"
).replace(/\/$/, "");

function url(
  loc: string,
  opts: { lastmod?: string | null; changefreq?: string; priority?: string } = {},
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

function deriveCategory(misc: string | null, title: string): string {
  if (misc && misc.trim()) {
    return misc.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30);
  }
  const first = title.trim().split(/\s+/)[0] ?? "board";
  return first.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/top-colleges", changefreq: "daily", priority: "0.9" },
  { loc: "/top-university", changefreq: "daily", priority: "0.9" },
  { loc: "/stream", changefreq: "weekly", priority: "0.8" },
  { loc: "/examination", changefreq: "daily", priority: "0.9" },
  { loc: "/blogs", changefreq: "daily", priority: "0.8" },
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

export async function GET(): Promise<NextResponse> {
  const db = await getDb();

  const [
    collegeDocs,
    universityDocs,
    blogDocs,
    newsDocs,
    examDocs,
    streamDocs,
    careerDocs,
    boardDocs,
  ] = await Promise.all([
    db.collection("collegemaster")
      .find({ slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, updated_at: 1 } })
      .sort({ updated_at: -1 }).limit(5000).toArray(),

    db.collection("collegemaster")
      .find({ isTopUniversity: 1, slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, updated_at: 1, topUniversityRank: 1 } })
      .sort({ topUniversityRank: 1 }).limit(500).toArray(),

    db.collection("blogs")
      .find({ isactive: 1, slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, updated_at: 1 } })
      .sort({ updated_at: -1 }).limit(2000).toArray(),

    db.collection("news")
      .find({ isactive: 1, slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, updated_at: 1 } })
      .sort({ updated_at: -1 }).limit(2000).toArray(),

    db.collection("examination_details").aggregate([
      { $match: { status: 1, slug: { $exists: true, $ne: "" } } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: false } },
      { $match: { "fa.pageslug": { $exists: true, $ne: "" } } },
      { $project: { slug: 1, stream_slug: "$fa.pageslug", updated_at: 1 } },
      { $sort: { updated_at: -1 } },
      { $limit: 2000 },
    ]).toArray(),

    db.collection("functionalarea")
      .find({ pageslug: { $exists: true, $ne: "" } }, { projection: { pageslug: 1, updated_at: 1 } })
      .sort({ id: 1 }).toArray(),

    db.collection("counseling_career_details")
      .find({ status: 1, slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, updated_at: 1 } })
      .sort({ updated_at: -1 }).limit(500).toArray(),

    db.collection("counseling_boards")
      .find({ status: 1, slug: { $exists: true, $ne: "" } }, { projection: { slug: 1, misc: 1, title: 1, updated_at: 1 } })
      .sort({ id: 1 }).toArray(),
  ]);

  const parts: string[] = [];

  for (const p of STATIC_PAGES) {
    parts.push(url(p.loc, { changefreq: p.changefreq, priority: p.priority }));
  }

  for (const row of collegeDocs) {
    if (!row.slug) continue;
    parts.push(url(`/college/${row.slug}`, { lastmod: row.updated_at, changefreq: "weekly", priority: "0.7" }));
  }

  const uniSlugs = new Set<string>();
  for (const row of universityDocs) {
    if (!row.slug || uniSlugs.has(row.slug)) continue;
    uniSlugs.add(row.slug);
    parts.push(url(`/university/${row.slug}`, { lastmod: row.updated_at, changefreq: "weekly", priority: "0.8" }));
  }

  for (const row of blogDocs) {
    if (!row.slug) continue;
    parts.push(url(`/blogs/${row.slug}`, { lastmod: row.updated_at, changefreq: "monthly", priority: "0.6" }));
  }

  for (const row of newsDocs) {
    if (!row.slug) continue;
    parts.push(url(`/news/${row.slug}`, { lastmod: row.updated_at, changefreq: "weekly", priority: "0.7" }));
  }

  for (const row of examDocs) {
    if (!row.slug || !row.stream_slug) continue;
    parts.push(url(`/examination/${row.stream_slug}/${row.slug}`, { lastmod: row.updated_at, changefreq: "weekly", priority: "0.7" }));
  }

  for (const row of streamDocs) {
    if (!row.pageslug) continue;
    parts.push(url(`/careers/opportunities/${row.pageslug}`, { changefreq: "weekly", priority: "0.6" }));
  }

  for (const row of careerDocs) {
    if (!row.slug) continue;
    parts.push(url(`/popular-careers/${row.slug}`, { lastmod: row.updated_at, changefreq: "monthly", priority: "0.6" }));
  }

  for (const row of boardDocs) {
    if (!row.slug) continue;
    const category = deriveCategory(row.misc ?? null, row.title ?? "");
    parts.push(url(`/board/${category}/${row.slug}`, { lastmod: row.updated_at, changefreq: "monthly", priority: "0.5" }));
  }

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
