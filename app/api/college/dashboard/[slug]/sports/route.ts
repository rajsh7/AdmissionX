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

const ACTIVITY_TYPES = ["Sports", "Cultural", "Technical", "Other"] as const;

// ── GET /api/college/dashboard/[slug]/sports ──────────────────────────────────
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
      `SELECT id, typeOfActivity, name, created_at, updated_at
       FROM college_sports_activities
       WHERE collegeprofile_id = ?
       ORDER BY typeOfActivity ASC, name ASC`,
      [auth.collegeprofile_id],
    );

    const activities = rows as {
      id: number;
      typeOfActivity: string;
      name: string;
      created_at: string;
      updated_at: string;
    }[];

    // Group by type for convenient UI rendering
    const grouped: Record<string, typeof activities> = {};
    for (const type of ACTIVITY_TYPES) {
      grouped[type] = activities.filter((a) => a.typeOfActivity === type);
    }
    // Any type not in the known list goes into "Other"
    const otherTypes = activities.filter(
      (a) => !(ACTIVITY_TYPES as readonly string[]).includes(a.typeOfActivity),
    );
    if (otherTypes.length) {
      grouped["Other"] = [...(grouped["Other"] ?? []), ...otherTypes];
    }

    return NextResponse.json({
      activities,
      grouped,
      total: activities.length,
      activityTypes: ACTIVITY_TYPES,
    });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/sports ─────────────────────────────────
// Body: { name: string, typeOfActivity?: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; typeOfActivity?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const typeOfActivity = body.typeOfActivity?.trim() || "Sports";

  // Guard: prevent duplicate name+type combo for same college
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query(
      `SELECT id FROM college_sports_activities
       WHERE collegeprofile_id = ? AND name = ? AND typeOfActivity = ?
       LIMIT 1`,
      [auth.collegeprofile_id, name, typeOfActivity],
    );
    if ((existing as unknown[]).length) {
      return NextResponse.json(
        { error: `"${name}" already exists under ${typeOfActivity}.` },
        { status: 409 },
      );
    }

    const [result] = await conn.query(
      `INSERT INTO college_sports_activities
         (name, typeOfActivity, collegeprofile_id, users_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, typeOfActivity, auth.collegeprofile_id, auth.users_id],
    );

    const insertId = (result as { insertId: number }).insertId;

    const [newRows] = await conn.query(
      `SELECT id, typeOfActivity, name, created_at, updated_at
       FROM college_sports_activities WHERE id = ?`,
      [insertId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Activity added successfully.",
        activity: (newRows as unknown[])[0],
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/sports?activityId=X ─────────────────────
// Body: { name?: string, typeOfActivity?: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activityId = req.nextUrl.searchParams.get("activityId");
  if (!activityId) {
    return NextResponse.json(
      { error: "activityId query param is required." },
      { status: 400 },
    );
  }

  let body: { name?: string; typeOfActivity?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    const n = body.name.trim();
    if (!n) return NextResponse.json({ error: "name cannot be empty." }, { status: 400 });
    setClauses.push("name = ?");
    values.push(n);
  }

  if (body.typeOfActivity !== undefined) {
    const t = body.typeOfActivity.trim();
    if (!t) return NextResponse.json({ error: "typeOfActivity cannot be empty." }, { status: 400 });
    setClauses.push("typeOfActivity = ?");
    values.push(t);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify ownership
    const [check] = await conn.query(
      `SELECT id FROM college_sports_activities
       WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [activityId, auth.collegeprofile_id],
    );
    if (!(check as unknown[]).length) {
      return NextResponse.json(
        { error: "Activity not found or does not belong to your college." },
        { status: 404 },
      );
    }

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    await conn.query(
      `UPDATE college_sports_activities SET ${setClauses.join(", ")} WHERE id = ?`,
      [...values, activityId],
    );

    const [updated] = await conn.query(
      `SELECT id, typeOfActivity, name, created_at, updated_at
       FROM college_sports_activities WHERE id = ?`,
      [activityId],
    );

    return NextResponse.json({
      success: true,
      message: "Activity updated successfully.",
      activity: (updated as unknown[])[0],
    });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/college/dashboard/[slug]/sports?activityId=X ─────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activityId = req.nextUrl.searchParams.get("activityId");
  if (!activityId) {
    return NextResponse.json(
      { error: "activityId query param is required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM college_sports_activities
       WHERE id = ? AND collegeprofile_id = ?`,
      [activityId, auth.collegeprofile_id],
    );

    const affected = (result as { affectedRows: number }).affectedRows;
    if (!affected) {
      return NextResponse.json(
        { error: "Activity not found or does not belong to your college." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully.",
    });
  } finally {
    conn.release();
  }
}
