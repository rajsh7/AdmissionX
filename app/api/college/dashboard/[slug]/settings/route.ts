import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
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
    return { payload, collegeprofile_id: list[0].collegeprofile_id };
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/settings ────────────────────────────────
// Body: { action: "change_password", currentPassword: string, newPassword: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, currentPassword, newPassword } = body;

  // ── Action: change_password ───────────────────────────────────────────────
  if (action === "change_password") {
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "currentPassword and newPassword are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must differ from the current password." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      // Fetch current hash from next_college_signups using the email in the JWT
      const [rows] = await conn.query(
        `SELECT id, password_hash
         FROM next_college_signups
         WHERE LOWER(email) = LOWER(?)
         LIMIT 1`,
        [auth.payload.email],
      );
      const list = rows as { id: number; password_hash: string | null }[];

      if (!list.length || !list[0].password_hash) {
        return NextResponse.json(
          { error: "College account not found or no password set." },
          { status: 404 },
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, list[0].password_hash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 403 },
        );
      }

      const newHash = await bcrypt.hash(newPassword, 12);

      await conn.query(
        `UPDATE next_college_signups SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newHash, list[0].id],
      );

      return NextResponse.json({
        success: true,
        message: "Password changed successfully.",
      });
    } finally {
      conn.release();
    }
  }

  // ── Unknown action ────────────────────────────────────────────────────────
  return NextResponse.json(
    { error: `Unknown action: "${action}". Supported: change_password` },
    { status: 400 },
  );
}
