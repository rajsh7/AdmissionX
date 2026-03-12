import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendStudentWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, captchaOk } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!captchaOk) {
      return NextResponse.json(
        { error: "Please verify that you are not a robot." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const emailLower = email.trim().toLowerCase();

    const conn = await pool.getConnection();
    try {
      // ── Ensure table exists ───────────────────────────────────────────────
      await conn.query(`
        CREATE TABLE IF NOT EXISTS next_student_signups (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          name          VARCHAR(255) NOT NULL,
          email         VARCHAR(255) NOT NULL UNIQUE,
          phone         VARCHAR(32)  NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // ── Check for duplicate email ─────────────────────────────────────────
      const [existing] = await conn.query(
        `SELECT id FROM next_student_signups WHERE LOWER(email) = ? LIMIT 1`,
        [emailLower],
      );
      const existingList = existing as { id: number }[];
      if (existingList.length) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please login or use a different email.",
          },
          { status: 409 },
        );
      }

      // ── Hash password ─────────────────────────────────────────────────────
      const hashed = await bcrypt.hash(password, 12);

      // ── Insert record ─────────────────────────────────────────────────────
      await conn.query(
        `INSERT INTO next_student_signups (name, email, phone, password_hash)
         VALUES (?, ?, ?, ?)`,
        [name.trim(), emailLower, phone.trim(), hashed],
      );
    } finally {
      conn.release();
    }

    // ── Send welcome email (non-blocking) ────────────────────────────────────
    try {
      await sendStudentWelcomeEmail(emailLower, name.trim());
    } catch (emailErr) {
      console.error("[student signup] welcome email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[student signup]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
