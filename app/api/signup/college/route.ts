import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendCollegeSignupConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collegeName, email, contactName, phone, password, captchaOk } =
      body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!collegeName || !email || !contactName || !phone || !password) {
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
      // ── Ensure table exists with password_hash column ─────────────────────
      await conn.query(`
        CREATE TABLE IF NOT EXISTS next_college_signups (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          college_name  VARCHAR(255) NOT NULL,
          email         VARCHAR(255) NOT NULL UNIQUE,
          contact_name  VARCHAR(255) NOT NULL,
          phone         VARCHAR(32)  NOT NULL,
          password_hash VARCHAR(255) DEFAULT NULL,
          status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
          created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // ── Check for duplicate email ─────────────────────────────────────────
      const [existing] = await conn.query(
        `SELECT id FROM next_college_signups WHERE LOWER(email) = ? LIMIT 1`,
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
      const passwordHash = await bcrypt.hash(password, 12);

      // ── Insert record ─────────────────────────────────────────────────────
      await conn.query(
        `INSERT INTO next_college_signups
           (college_name, email, contact_name, phone, password_hash, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [
          collegeName.trim(),
          emailLower,
          contactName.trim(),
          phone.trim(),
          passwordHash,
        ],
      );
    } finally {
      conn.release();
    }

    // ── Send confirmation email (non-blocking — don't fail signup if email errors) ──
    try {
      await sendCollegeSignupConfirmationEmail(
        emailLower,
        collegeName.trim(),
        contactName.trim(),
      );
    } catch (emailErr) {
      console.error("[college signup] confirmation email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[college signup]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
