import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth + ownership helper ───────────────────────────────────────────────────
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT cp.id AS collegeprofile_id, cp.users_id
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { collegeprofile_id: number; users_id: number }[];
    if (!list.length) return null;
    return { payload, collegeprofile_id: list[0].collegeprofile_id, users_id: list[0].users_id };
  } finally {
    conn.release();
  }
}

// ── GET /api/college/dashboard/[slug]/cutoffs ─────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT
         cc.id,
         cc.title,
         cc.description,
         cc.degree_id,
         cc.course_id,
         cc.functionalarea_id,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name,
         cc.created_at,
         cc.updated_at
       FROM college_cut_offs cc
       LEFT JOIN degree         d  ON d.id  = cc.degree_id
       LEFT JOIN course         co ON co.id = cc.course_id
       LEFT JOIN functionalarea fa ON fa.id = cc.functionalarea_id
       WHERE cc.collegeprofile_id = ?
       ORDER BY cc.id ASC`,
      [auth.collegeprofile_id],
    );

    // Fetch dropdown options for the form
    const [degreeOptions] = await conn.query(
      `SELECT id, name FROM degree ORDER BY name ASC LIMIT 200`,
    );
    const [courseOptions] = await conn.query(
      `SELECT id, name FROM course ORDER BY name ASC LIMIT 500`,
    );
    const [streamOptions] = await conn.query(
      `SELECT id, name FROM functionalarea ORDER BY name ASC LIMIT 100`,
    );

    return NextResponse.json({
      cutoffs: rows,
      total: (rows as unknown[]).length,
      options: {
        degrees: degreeOptions,
        courses: courseOptions,
        streams: streamOptions,
      },
    });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/cutoffs ────────────────────────────────
// Body: { title: string, description?: string, degree_id?, course_id?, functionalarea_id? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    title?: string;
    description?: string;
    degree_id?: number | null;
    course_id?: number | null;
    functionalarea_id?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const description      = body.description?.trim()     || null;
  const degree_id        = body.degree_id        ?? null;
  const course_id        = body.course_id        ?? null;
  const functionalarea_id = body.functionalarea_id ?? null;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO college_cut_offs
         (title, description, degree_id, course_id, functionalarea_id,
          collegeprofile_id, users_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        title, description,
        degree_id, course_id, functionalarea_id,
        auth.collegeprofile_id, auth.users_id,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    const [newRows] = await conn.query(
      `SELECT
         cc.id, cc.title, cc.description,
         cc.degree_id, cc.course_id, cc.functionalarea_id,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name,
         cc.created_at, cc.updated_at
       FROM college_cut_offs cc
       LEFT JOIN degree         d  ON d.id  = cc.degree_id
       LEFT JOIN course         co ON co.id = cc.course_id
       LEFT JOIN functionalarea fa ON fa.id = cc.functionalarea_id
       WHERE cc.id = ?`,
      [insertId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cut-off entry added successfully.",
        cutoff: (newRows as unknown[])[0],
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/cutoffs?cutoffId=X ─────────────────────
// Body: { title?, description?, degree_id?, course_id?, functionalarea_id? }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cutoffId = req.nextUrl.searchParams.get("cutoffId");
  if (!cutoffId) {
    return NextResponse.json(
      { error: "cutoffId query param is required." },
      { status: 400 },
    );
  }

  let body: {
    title?: string;
    description?: string;
    degree_id?: number | null;
    course_id?: number | null;
    functionalarea_id?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "title cannot be empty." }, { status: 400 });
    setClauses.push("title = ?");
    values.push(t);
  }
  if (body.description !== undefined) {
    setClauses.push("description = ?");
    values.push(body.description.trim() || null);
  }
  if (Object.prototype.hasOwnProperty.call(body, "degree_id")) {
    setClauses.push("degree_id = ?");
    values.push(body.degree_id ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(body, "course_id")) {
    setClauses.push("course_id = ?");
    values.push(body.course_id ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(body, "functionalarea_id")) {
    setClauses.push("functionalarea_id = ?");
    values.push(body.functionalarea_id ?? null);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify ownership
    const [check] = await conn.query(
      `SELECT id FROM college_cut_offs
       WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [cutoffId, auth.collegeprofile_id],
    );
    if (!(check as unknown[]).length) {
      return NextResponse.json(
        { error: "Cut-off entry not found or does not belong to your college." },
        { status: 404 },
      );
    }

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    await conn.query(
      `UPDATE college_cut_offs SET ${setClauses.join(", ")} WHERE id = ?`,
      [...values, cutoffId],
    );

    const [updated] = await conn.query(
      `SELECT
         cc.id, cc.title, cc.description,
         cc.degree_id, cc.course_id, cc.functionalarea_id,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name,
         cc.created_at, cc.updated_at
       FROM college_cut_offs cc
       LEFT JOIN degree         d  ON d.id  = cc.degree_id
       LEFT JOIN course         co ON co.id = cc.course_id
       LEFT JOIN functionalarea fa ON fa.id = cc.functionalarea_id
       WHERE cc.id = ?`,
      [cutoffId],
    );

    return NextResponse.json({
      success: true,
      message: "Cut-off entry updated successfully.",
      cutoff: (updated as unknown[])[0],
    });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/college/dashboard/[slug]/cutoffs?cutoffId=X ──────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cutoffId = req.nextUrl.searchParams.get("cutoffId");
  if (!cutoffId) {
    return NextResponse.json(
      { error: "cutoffId query param is required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM college_cut_offs
       WHERE id = ? AND collegeprofile_id = ?`,
      [cutoffId, auth.collegeprofile_id],
    );

    const affected = (result as { affectedRows: number }).affectedRows;
    if (!affected) {
      return NextResponse.json(
        { error: "Cut-off entry not found or does not belong to your college." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cut-off entry deleted successfully.",
    });
  } finally {
    conn.release();
  }
}
