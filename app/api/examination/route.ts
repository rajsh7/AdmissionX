import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  applicationFrom: string | null;
  applicationTo: string | null;
  exminationDate: string | null;
  resultAnnounce: string | null;
  totalViews: number;
  totalLikes: number;
  stream_name: string | null;
  stream_slug: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── GET /api/examination ─────────────────────────────────────────────────────
// Query params:
//   stream  — functional area pageslug or name substring  (optional)
//   limit   — items per page, 1–50, default 12
//   offset  — zero-based offset, default 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const stream = (searchParams.get("stream") ?? "").trim().toLowerCase();
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 1),
    50,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10) || 0,
    0,
  );

  // Build the optional stream WHERE clause and its bound params
  const streamClause = stream
    ? `AND (LOWER(fa.pageslug) = ? OR LOWER(fa.name) LIKE ?)`
    : "";
  const streamParams: string[] = stream ? [stream, `%${stream}%`] : [];

  try {
    const conn = await pool.getConnection();

    // ── Data query ────────────────────────────────────────────────────────────
    const dataSQL = `
      SELECT
        ed.id,
        ed.title,
        ed.slug,
        ed.description,
        ed.image,
        ed.applicationFrom,
        ed.applicationTo,
        ed.exminationDate,
        ed.resultAnnounce,
        ed.totalViews,
        ed.totalLikes,
        fa.name     AS stream_name,
        fa.pageslug AS stream_slug
      FROM examination_details ed
      LEFT JOIN functionalarea fa ON fa.id = ed.functionalarea_id
      WHERE ed.status = 1
        AND ed.slug IS NOT NULL
        AND ed.slug != ''
        ${streamClause}
      ORDER BY ed.totalViews DESC, ed.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // ── Count query ───────────────────────────────────────────────────────────
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM examination_details ed
      LEFT JOIN functionalarea fa ON fa.id = ed.functionalarea_id
      WHERE ed.status = 1
        AND ed.slug IS NOT NULL
        AND ed.slug != ''
        ${streamClause}
    `;

    const [rows] = (await conn.query(dataSQL, [
      ...streamParams,
      limit,
      offset,
    ])) as [ExamRow[], unknown];

    const [countRows] = (await conn.query(
      countSQL,
      streamParams,
    )) as [CountRow[], unknown];

    conn.release();

    const total = countRows[0]?.total ?? 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
    });
  } catch (err) {
    console.error("[api/examination GET]", err);
    return NextResponse.json(
      {
        success: false,
        data: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        error: "Failed to fetch examination data.",
      },
      { status: 500 },
    );
  }
}
