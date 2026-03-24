import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseResult {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  level_name: string | null;
  level_slug: string | null;
  stream_name: string | null;
  stream_slug: string | null;
  bestChoiceOfCourse: string | null;
  jobsCareerOpportunityDesc: string | null;
}

interface IdRow extends RowDataPacket {
  id: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

// ─── GET /api/search/courses ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;

  const q = (sp.get("q") ?? "").trim();
  const level = (sp.get("level") ?? "").trim();
  const stream = (sp.get("stream") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(6, parseInt(sp.get("limit") ?? "12")));
  const offset = (page - 1) * limit;

  // ── Build filter conditions ───────────────────────────────────────────────

  const filterConditions: string[] = ["ccd.slug IS NOT NULL AND ccd.slug != ''"];
  const filterParams: (string | number)[] = [];

  if (q.length >= 2) {
    filterConditions.push("(ccd.title LIKE ? OR ccd.description LIKE ?)");
    const like = `%${q}%`;
    filterParams.push(like, like);
  }

  if (level) {
    filterConditions.push("el.pageslug = ?");
    filterParams.push(level);
  }

  if (stream) {
    filterConditions.push("fa.pageslug = ?");
    filterParams.push(stream);
  }

  const filterWhere = filterConditions.join(" AND ");

  try {
    // ── Fetch data ──
    const [rows] = await pool.query(`
      SELECT
        ccd.id,
        ccd.title,
        ccd.description,
        ccd.image,
        ccd.bestChoiceOfCourse,
        ccd.jobsCareerOpportunityDesc,
        ccd.slug,
        el.name     AS level_name,
        el.pageslug AS level_slug,
        fa.name     AS stream_name,
        fa.pageslug AS stream_slug
      FROM counseling_courses_details ccd
      LEFT JOIN educationlevel   el ON el.id = ccd.educationlevel_id
      LEFT JOIN functionalarea   fa ON fa.id = ccd.functionalarea_id
      WHERE ${filterWhere}
      ORDER BY ccd.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `, filterParams) as [RowDataPacket[], any];

    // ── Fetch total count ──
    const [countRows] = await pool.query(`
      SELECT COUNT(*) as total
      FROM counseling_courses_details ccd
      LEFT JOIN educationlevel   el ON el.id = ccd.educationlevel_id
      LEFT JOIN functionalarea   fa ON fa.id = ccd.functionalarea_id
      WHERE ${filterWhere}
    `, filterParams) as [CountRow[], any];

    const total = countRows[0]?.total ?? 0;

    const courses: CourseResult[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      image: buildImageUrl(row.image),
      description: row.description,
      level_name: row.level_name,
      level_slug: row.level_slug,
      stream_name: row.stream_name,
      stream_slug: row.stream_slug,
      bestChoiceOfCourse: row.bestChoiceOfCourse,
      jobsCareerOpportunityDesc: row.jobsCareerOpportunityDesc,
    }));

    return NextResponse.json({
      success: true,
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    console.error("[/api/search/courses]", err);
    return NextResponse.json(
      { success: false, courses: [], total: 0, page: 1, totalPages: 0, limit },
      { status: 500 }
    );
  }
}
