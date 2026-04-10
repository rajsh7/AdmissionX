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

// ── GET /api/college/dashboard/[slug]/scholarships ────────────────────────────
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
      `SELECT id, title, description, created_at, updated_at
       FROM college_scholarships
       WHERE collegeprofile_id = ?
       ORDER BY id ASC`,
      [auth.collegeprofile_id],
    );

    return NextResponse.json({
      scholarships: rows,
      total: (rows as unknown[]).length,
    });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/scholarships ───────────────────────────
// Body: { title: string, description?: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const description = body.description?.trim() || null;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO college_scholarships
         (title, description, collegeprofile_id, users_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [title, description, auth.collegeprofile_id, auth.users_id],
    );

    const insertId = (result as { insertId: number }).insertId;

    const [newRows] = await conn.query(
      `SELECT id, title, description, created_at, updated_at
       FROM college_scholarships WHERE id = ?`,
      [insertId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Scholarship added successfully.",
        scholarship: (newRows as unknown[])[0],
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/scholarships?scholarshipId=X ────────────
// Body: { title?: string, description?: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scholarshipId = req.nextUrl.searchParams.get("scholarshipId");
  if (!scholarshipId) {
    return NextResponse.json(
      { error: "scholarshipId query param is required." },
      { status: 400 },
    );
  }

  let body: { title?: string; description?: string };
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

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify ownership
    const [check] = await conn.query(
      `SELECT id FROM college_scholarships
       WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [scholarshipId, auth.collegeprofile_id],
    );
    if (!(check as unknown[]).length) {
      return NextResponse.json(
        { error: "Scholarship not found or does not belong to your college." },
        { status: 404 },
      );
    }

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    await conn.query(
      `UPDATE college_scholarships SET ${setClauses.join(", ")} WHERE id = ?`,
      [...values, scholarshipId],
    );

    const [updated] = await conn.query(
      `SELECT id, title, description, created_at, updated_at
       FROM college_scholarships WHERE id = ?`,
      [scholarshipId],
    );

    return NextResponse.json({
      success: true,
      message: "Scholarship updated successfully.",
      scholarship: (updated as unknown[])[0],
    });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/college/dashboard/[slug]/scholarships?scholarshipId=X ─────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scholarshipId = req.nextUrl.searchParams.get("scholarshipId");
  if (!scholarshipId) {
    return NextResponse.json(
      { error: "scholarshipId query param is required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM college_scholarships
       WHERE id = ? AND collegeprofile_id = ?`,
      [scholarshipId, auth.collegeprofile_id],
    );

    const affected = (result as { affectedRows: number }).affectedRows;
    if (!affected) {
      return NextResponse.json(
        { error: "Scholarship not found or does not belong to your college." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Scholarship deleted successfully.",
    });
  } finally {
    conn.release();
  }
}
