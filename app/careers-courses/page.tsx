import pool from "@/lib/db";
import type { Metadata } from "next";
import type { RowDataPacket } from "mysql2";
import ListingSearchV4NoSSR from "@/app/components/ListingSearchV4NoSSR";
import type { CourseResult } from "@/app/api/search/courses/route";

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

export const metadata: Metadata = {
  title: "Career Courses — Find the Right Course for Your Future | AdmissionX",
  description:
    "Explore top career-oriented courses across engineering, medicine, management, law, arts and more. Get details on eligibility, job scope, and top colleges.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[careers-courses/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CareerCoursesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const level = getString("level");
  const stream = getString("stream");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;
  const offset = (page - 1) * limit;

  // ── Build filter conditions ──
  const filterConditions: string[] = ["c.pageslug IS NOT NULL AND c.pageslug != ''"];
  const filterParams: (string | number)[] = [];

  if (q.length >= 2) {
    filterConditions.push("(c.name LIKE ? OR c.pagedescription LIKE ?)");
    const like = `%${q}%`;
    filterParams.push(like, like);
  }

  if (level) {
    filterConditions.push("d.pageslug = ?");
    filterParams.push(level);
  }

  if (stream) {
    filterConditions.push("fa.pageslug = ?");
    filterParams.push(stream);
  }

  const filterWhere = filterConditions.join(" AND ");

  // ── Fetch data in parallel ──
  const [levelRows, streamRows, courseRows, countRows] = await Promise.all([
    // Education levels for filter (now mapped to degree)
    safeQuery<RowDataPacket>(`
      SELECT id, name, pageslug as slug FROM degree
      WHERE name IS NOT NULL AND name != ''
      ORDER BY isShowOnTop DESC, name ASC
    `),

    // Streams for filter
    safeQuery<RowDataPacket>(`
      SELECT id, name, pageslug as slug FROM functionalarea
      WHERE name IS NOT NULL AND name != ''
      ORDER BY name ASC
    `),

    // Initial courses
    safeQuery<RowDataPacket>(`
      SELECT
        c.id,
        c.name AS title,
        c.pagedescription AS description,
        c.logoimage AS image,
        c.pageslug AS slug,
        d.name      AS level_name,
        d.pageslug  AS level_slug,
        fa.name     AS stream_name,
        fa.pageslug AS stream_slug
      FROM course c
      LEFT JOIN degree d ON d.id = c.degree_id
      LEFT JOIN functionalarea fa ON fa.id = c.functionalarea_id
      WHERE ${filterWhere}
      ORDER BY c.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `, filterParams),

    // Total count
    safeQuery<RowDataPacket>(`
      SELECT COUNT(*) as total
      FROM course c
      LEFT JOIN degree d ON d.id = c.degree_id
      LEFT JOIN functionalarea fa ON fa.id = c.functionalarea_id
      WHERE ${filterWhere}
    `, filterParams),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const initialCourses: CourseResult[] = courseRows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: buildImageUrl(row.image),
    description: row.description,
    level_name: row.level_name,
    level_slug: row.level_slug,
    stream_name: row.stream_name,
    stream_slug: row.stream_slug,
    bestChoiceOfCourse: null,
    jobsCareerOpportunityDesc: null,
  }));

  return (
    <ListingSearchV4NoSSR
      initialCourses={initialCourses}
      initialTotal={total}
      initialTotalPages={totalPages}
      levels={levelRows as FilterOption[]}
      streams={streamRows as FilterOption[]}
      initQ={q}
      initLevel={level}
      initStream={stream}
      initPage={page}
    />
  );
}
