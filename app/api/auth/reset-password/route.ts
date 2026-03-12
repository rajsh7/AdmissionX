import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string = (body.token ?? "").trim();
    const password: string = body.password ?? "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      // ── Look up the token ────────────────────────────────────────────────
      const [rows] = await conn.query(
        `SELECT id, email, role, expires_at, used
         FROM password_reset_tokens
         WHERE token = ?
         LIMIT 1`,
        [token],
      );

      const list = rows as {
        id: number;
        email: string;
        role: "student" | "college" | "admin";
        expires_at: Date;
        used: number;
      }[];

      if (!list.length) {
        return NextResponse.json(
          { error: "This reset link is invalid." },
          { status: 400 },
        );
      }

      const record = list[0];

      // ── Already used ─────────────────────────────────────────────────────
      if (record.used) {
        return NextResponse.json(
          { error: "This reset link has already been used." },
          { status: 400 },
        );
      }

      // ── Expired ──────────────────────────────────────────────────────────
      if (new Date() > new Date(record.expires_at)) {
        return NextResponse.json(
          {
            error:
              "This reset link has expired. Please request a new one.",
          },
          { status: 400 },
        );
      }

      // ── Hash the new password ────────────────────────────────────────────
      const hashed = await bcrypt.hash(password, 12);

      // ── Update the correct table based on role ───────────────────────────
      const email = record.email.toLowerCase();

      if (record.role === "student") {
        await conn.query(
          `UPDATE next_student_signups
           SET password_hash = ?
           WHERE LOWER(email) = ?`,
          [hashed, email],
        );
      } else if (record.role === "college") {
        await conn.query(
          `UPDATE next_college_signups
           SET password_hash = ?
           WHERE LOWER(email) = ?`,
          [hashed, email],
        );
      } else if (record.role === "admin") {
        await conn.query(
          `UPDATE next_admin_users
           SET password_hash = ?
           WHERE LOWER(email) = ?`,
          [hashed, email],
        );
      }

      // ── Mark the token as used ───────────────────────────────────────────
      await conn.query(
        `UPDATE password_reset_tokens SET used = 1 WHERE id = ?`,
        [record.id],
      );

      return NextResponse.json({
        success: true,
        role: record.role,
        message: "Password updated successfully.",
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
