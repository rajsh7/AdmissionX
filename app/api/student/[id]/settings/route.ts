import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

// ── PUT /api/student/[id]/settings ────────────────────────────────────────────
// Body: { action: "change_password", currentPassword, newPassword }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const payload = await checkAuth(id);
  if (!payload) {
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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
      // Fetch current hash
      const [rows] = await conn.query(
        `SELECT password_hash FROM next_student_signups WHERE id = ? LIMIT 1`,
        [id],
      );
      const list = rows as { password_hash: string }[];

      if (!list.length) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
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
        `UPDATE next_student_signups SET password_hash = ? WHERE id = ?`,
        [newHash, id],
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
