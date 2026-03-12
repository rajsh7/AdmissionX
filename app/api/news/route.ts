import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewsRow extends RowDataPacket {
  id: number;
  topic: string;
  featimage: string | null;
  description: string | null;
  slug: string;
  newstypeids: string | null;
  newstagsids: string | null;
  created_at: string;
  updated_at: string | null;
}

interface NewsTypeRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

interface NewsTagRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── GET /api/news ────────────────────────────────────────────────────────────
// Query params:
//   q      — full-text search on topic / description    (optional)
//   type   — news_types.slug to filter by               (optional)
//   tag    — news_tags.slug to filter by                (optional)
//   limit  — items per page, 1–50, default 12
//   offset — zero-based offset, default 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q      = (searchParams.get("q")    ?? "").trim();
  const type   = (searchParams.get("type") ?? "").trim().toLowerCase();
  const tag    = (searchParams.get("tag")  ?? "").trim().toLowerCase();
  const limit  = Math.min(Math.max(parseInt(searchParams.get("limit")  ?? "12", 10) || 12, 1), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  try {
    const conn = await pool.getConnection();

    // ── Resolve type → id ─────────────────────────────────────────────────────
    let typeId: number | null = null;
    if (type) {
      const [typeRows] = (await conn.query(
        `SELECT id FROM news_types WHERE LOWER(slug) = ? LIMIT 1`,
        [type],
      )) as [NewsTypeRow[], unknown];
      typeId = typeRows[0]?.id ?? null;
    }

    // ── Resolve tag → id ──────────────────────────────────────────────────────
    let tagId: number | null = null;
    if (tag) {
      const [tagRows] = (await conn.query(
        `SELECT id FROM news_tags WHERE LOWER(slug) = ? LIMIT 1`,
        [tag],
      )) as [NewsTagRow[], unknown];
      tagId = tagRows[0]?.id ?? null;
    }

    // ── Build WHERE conditions ────────────────────────────────────────────────
    const conditions: string[] = [
      "isactive = 1",
      "slug IS NOT NULL",
      "slug != ''",
    ];
    const dataParams: (string | number)[] = [];

    if (q) {
      conditions.push("(topic LIKE ? OR description LIKE ?)");
      dataParams.push(`%${q}%`, `%${q}%`);
    }
    if (typeId !== null) {
      conditions.push("FIND_IN_SET(?, newstypeids)");
      dataParams.push(typeId);
    }
    if (tagId !== null) {
      conditions.push("FIND_IN_SET(?, newstagsids)");
      dataParams.push(tagId);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    // ── Data query ────────────────────────────────────────────────────────────
    const [rows] = (await conn.query(
      `SELECT id, topic, featimage, description, slug,
              newstypeids, newstagsids, created_at, updated_at
       FROM news
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...dataParams, limit, offset],
    )) as [NewsRow[], unknown];

    // ── Count query ───────────────────────────────────────────────────────────
    const [countRows] = (await conn.query(
      `SELECT COUNT(*) AS total FROM news ${where}`,
      dataParams,
    )) as [CountRow[], unknown];

    // ── Fetch all types and tags for filter UI ────────────────────────────────
    const [types] = (await conn.query(
      `SELECT id, name, slug FROM news_types ORDER BY name ASC`,
    )) as [NewsTypeRow[], unknown];

    const [tags] = (await conn.query(
      `SELECT id, name, slug FROM news_tags ORDER BY name ASC`,
    )) as [NewsTagRow[], unknown];

    conn.release();

    const total   = countRows[0]?.total ?? 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: rows,
      types,
      tags,
      pagination: { total, limit, offset, hasMore },
    });
  } catch (err) {
    console.error("[api/news GET]", err);
    return NextResponse.json(
      {
        success: false,
        data:    [],
        types:   [],
        tags:    [],
        pagination: { total: 0, limit, offset, hasMore: false },
        error: "Failed to fetch news.",
      },
      { status: 500 },
    );
  }
}
