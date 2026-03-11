import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type CourseRow = Record<string, string | number | null>;

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = (searchParams.get("q") ?? "").trim();
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(toPositiveInt(searchParams.get("limit"), 12), 100);
  const offset = (page - 1) * limit;

  const degreeId = toPositiveInt(searchParams.get("degreeId"), 0);
  const educationLevelId = toPositiveInt(searchParams.get("educationLevelId"), 0);
  const streamId = toPositiveInt(searchParams.get("streamId"), 0);
  const cityId = toPositiveInt(searchParams.get("cityId"), 0);
  const stateId = toPositiveInt(searchParams.get("stateId"), 0);
  const countryId = toPositiveInt(searchParams.get("countryId"), 0);
  const collegeId = toPositiveInt(searchParams.get("collegeId"), 0);

  const sort = (searchParams.get("sort") ?? "name").toLowerCase();
  const order = (searchParams.get("order") ?? "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  let conn: Awaited<ReturnType<typeof pool.getConnection>> | null = null;

  try {
    conn = await pool.getConnection();

    const [columnRows] = (await conn.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course'`
    )) as [{ COLUMN_NAME: string }[], unknown];

    const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));
    if (!columns.has("id") || !columns.has("name")) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: page > 1 },
        message: "No compatible course table schema found.",
      });
    }

    const pickColumn = (choices: string[]) => choices.find((c) => columns.has(c));
    const degreeCol = pickColumn(["degree_id", "degreeId", "degree"]);

    const where: string[] = [];
    const params: Array<string | number> = [];

    if (q) {
      where.push("c.name LIKE ?");
      params.push(`%${q}%`);
    }

    if (degreeId && degreeCol) {
      where.push(`c.${degreeCol} = ?`);
      params.push(degreeId);
    }

    if (streamId) {
      where.push(`c.functionalarea_id = ?`);
      params.push(streamId);
    }

    if (educationLevelId) {
      where.push(`c.id IN (SELECT course_id FROM collegemaster WHERE educationlevel_id = ?)`);
      params.push(educationLevelId);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sortBy = sort === "id" ? "c.id" : "c.name";

    const [countRows] = (await conn.query(
      `SELECT COUNT(*) AS total FROM course c ${whereSql}`,
      params
    )) as [{ total: number }[], unknown];
    const total = countRows[0]?.total ?? 0;

    const [rows] = (await conn.query(
      `SELECT c.id, c.name, c.pageslug, c.logoimage, c.bannerimage, fa.name AS functional_area_name
       FROM course c
       LEFT JOIN functionalarea fa ON c.functionalarea_id = fa.id
       ${whereSql} 
       ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )) as [CourseRow[], unknown];

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      appliedFilters: { q, degreeId, educationLevelId, streamId, cityId, stateId, countryId, collegeId, sort: sortBy, order },
    });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses", data: [] },
      { status: 500 }
    );
  } finally {
    conn?.release();
  }
}
