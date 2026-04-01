import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AskQuestionRow {
  id: number;
  question: string;
  questionDate: string | null;
  slug: string | null;
  likes: number;
  share: number;
  views: number;
  totalAnswerCount: number;
  totalCommentsCount: number;
  askQuestionTagIds: string | null;
  created_at: string;
  status: number;
}

export interface AskTagRow {
  id: number;
  name: string;
  slug: string;
}

interface CountRow {
  total: number;
}

// ─── GET /api/ask ─────────────────────────────────────────────────────────────
// Query params:
//   q      — full-text search on question text          (optional)
//   tag    — filter by ask_question_tags.slug           (optional)
//   sort   — "latest" (default) | "popular" | "answered"
//   limit  — 1–50, default 15
//   offset — default 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q      = (searchParams.get("q")    ?? "").trim();
  const tag    = (searchParams.get("tag")  ?? "").trim().toLowerCase();
  const sort   = (searchParams.get("sort") ?? "latest").trim().toLowerCase();
  const limit  = Math.min(Math.max(parseInt(searchParams.get("limit")  ?? "15", 10) || 15, 1), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0",  10) || 0, 0);

  try {
    const conn = await pool.getConnection();

    // ── Resolve tag filter to an ID ────────────────────────────────────────────
    let tagId: number | null = null;
    if (tag) {
      const [tagRows] = (await conn.query(
        `SELECT id FROM ask_question_tags WHERE slug = ? LIMIT 1`,
        [tag],
      )) as [AskTagRow[], unknown];
      tagId = tagRows[0]?.id ?? null;
    }

    // ── WHERE clauses ──────────────────────────────────────────────────────────
    const conditions: string[] = ["aq.status = 1"];
    const dataParams: (string | number)[] = [];

    if (q) {
      conditions.push("aq.question LIKE ?");
      dataParams.push(`%${q}%`);
    }

    if (tagId !== null) {
      conditions.push("FIND_IN_SET(?, aq.askQuestionTagIds)");
      dataParams.push(tagId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // ── ORDER BY ───────────────────────────────────────────────────────────────
    let orderBy = "aq.created_at DESC";
    if (sort === "popular")  orderBy = "aq.likes DESC, aq.views DESC";
    if (sort === "answered") orderBy = "aq.totalAnswerCount DESC, aq.created_at DESC";
    if (sort === "views")    orderBy = "aq.views DESC";

    // ── Data query ─────────────────────────────────────────────────────────────
    const [rows] = (await conn.query(
      `SELECT
         aq.id,
         aq.question,
         aq.questionDate,
         aq.slug,
         aq.likes,
         aq.share,
         aq.views,
         aq.totalAnswerCount,
         aq.totalCommentsCount,
         aq.askQuestionTagIds,
         aq.created_at,
         aq.status
       FROM ask_questions aq
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...dataParams, limit, offset],
    )) as [AskQuestionRow[], unknown];

    // ── Count query ────────────────────────────────────────────────────────────
    const [countRows] = (await conn.query(
      `SELECT COUNT(*) AS total FROM ask_questions aq ${whereClause}`,
      dataParams,
    )) as [CountRow[], unknown];

    // ── All tags (for filter UI) ───────────────────────────────────────────────
    const [allTags] = (await conn.query(
      `SELECT id, name, slug FROM ask_question_tags ORDER BY name ASC`,
    )) as [AskTagRow[], unknown];

    conn.release();

    const total   = countRows[0]?.total ?? 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: rows,
      tags: allTags,
      pagination: { total, limit, offset, hasMore },
    });
  } catch (err) {
    console.error("[api/ask GET]", err);
    return NextResponse.json(
      {
        success: false,
        data: [],
        tags: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        error: "Failed to fetch Q&A data.",
      },
      { status: 500 },
    );
  }
}
