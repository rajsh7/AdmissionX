import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendStudentWelcomeEmail } from "@/lib/email";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, dob, marks12, captchaOk } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !phone || !password || !dob || !marks12) {
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
          dob           DATE NOT NULL,
          marks12       DECIMAL(5,2) NOT NULL,
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
      const [insertResult] = await conn.query(
        `INSERT INTO next_student_signups (name, email, phone, dob, marks12, password_hash)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name.trim(), emailLower, phone.trim(), dob, parseFloat(marks12), hashed],
      );
      var newUserId = (insertResult as any).insertId;
    } finally {
      conn.release();
    }

    // ── Send welcome email (non-blocking) ────────────────────────────────────
    try {
      await sendStudentWelcomeEmail(emailLower, name.trim());
    } catch (emailErr) {
      // ignore email error quietly
    }

    const token = await signStudentToken({
      id: newUserId,
      name: name.trim(),
      email: emailLower,
      role: "student",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
