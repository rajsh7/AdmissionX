import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogRow extends RowDataPacket {
  id: number;
  topic: string;
  featimage: string | null;
  fullimage: string | null;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── GET /api/blogs ───────────────────────────────────────────────────────────
// Query params:
//   q       — full-text search on topic + description  (optional)
//   limit   — items per page, 1–50, default 12
//   offset  — zero-based offset, default 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 1),
    50,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10) || 0,
    0,
  );

  // Build optional search clause
  const searchClause = q ? `AND (topic LIKE ? OR description LIKE ?)` : "";
  const searchParams2: string[] = q ? [`%${q}%`, `%${q}%`] : [];

  try {
    const conn = await pool.getConnection();

    const dataSQL = `
      SELECT
        id,
        topic,
        featimage,
        fullimage,
        description,
        slug,
        created_at,
        updated_at
      FROM blogs
      WHERE isactive = 1
        AND slug IS NOT NULL
        AND slug != ''
        ${searchClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSQL = `
      SELECT COUNT(*) AS total
      FROM blogs
      WHERE isactive = 1
        AND slug IS NOT NULL
        AND slug != ''
        ${searchClause}
    `;

    const [rows] = (await conn.query(dataSQL, [
      ...searchParams2,
      limit,
      offset,
    ])) as [BlogRow[], unknown];

    const [countRows] = (await conn.query(
      countSQL,
      searchParams2,
    )) as [CountRow[], unknown];

    conn.release();

    const total = countRows[0]?.total ?? 0;

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error("[api/blogs GET]", err);
    return NextResponse.json(
      {
        success: false,
        data: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        error: "Failed to fetch blog data.",
      },
      { status: 500 },
    );
  }
}
