import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import { sendStudentActivationEmail } from "@/lib/email";
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
          id                   INT AUTO_INCREMENT PRIMARY KEY,
          name                 VARCHAR(255) NOT NULL,
          email                VARCHAR(255) NOT NULL UNIQUE,
          phone                VARCHAR(32)  NOT NULL,
          dob                  DATE NOT NULL,
          marks12              DECIMAL(5,2) NOT NULL,
          is_active            TINYINT(1) DEFAULT 0,
          password_hash        VARCHAR(255) NOT NULL,
          activation_token     VARCHAR(64)  DEFAULT NULL,
          activation_token_exp DATETIME    DEFAULT NULL,
          created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // ── Add activation columns if table already exists without them ───────
      await conn.query(`
        ALTER TABLE next_student_signups
          ADD COLUMN IF NOT EXISTS activation_token     VARCHAR(64)  DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS activation_token_exp DATETIME    DEFAULT NULL
      `).catch(() => {/* ignore if columns already exist */});

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

      // ── Generate activation token ─────────────────────────────────────────
      const activationToken = crypto.randomBytes(32).toString("hex");
      const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

      // ── Insert record ─────────────────────────────────────────────────────
      const [insertResult] = await conn.query(
        `INSERT INTO next_student_signups (name, email, phone, dob, marks12, password_hash, is_active, activation_token, activation_token_exp)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [name.trim(), emailLower, phone.trim(), dob, parseFloat(marks12), hashed, activationToken, tokenExp],
      );
      var newUserId = (insertResult as any).insertId;
      var activationTokenForEmail = activationToken;
    } finally {
      conn.release();
    }

    // ── Send activation email (non-blocking) ─────────────────────────────────
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";
      const activationLink = `${baseUrl}/api/auth/activate?token=${activationTokenForEmail}`;
      await sendStudentActivationEmail(emailLower, name.trim(), activationLink);
    } catch (emailErr) {
      // ignore email error — account still created
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
