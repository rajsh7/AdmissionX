import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

// Token expiry: 15 minutes
const EXPIRES_IN_MS = 15 * 60 * 1000;

async function ensureResetTable(conn: Awaited<ReturnType<typeof pool.getConnection>>) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      email      VARCHAR(255) NOT NULL,
      role       ENUM('student','college','admin') NOT NULL,
      token      VARCHAR(128) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used       TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      await ensureResetTable(conn);

      // ── Look up user across all three tables ──────────────────────────────
      let found: { name: string; role: "student" | "college" | "admin" } | null = null;

      // 1. Check student table
      {
        const [rows] = await conn.query(
          `SELECT name FROM next_student_signups WHERE LOWER(email) = ? LIMIT 1`,
          [email],
        );
        const list = rows as { name: string }[];
        if (list.length) {
          found = { name: list[0].name, role: "student" };
        }
      }

      // 2. Check college table
      if (!found) {
        const [rows] = await conn.query(
          `SELECT college_name AS name FROM next_college_signups WHERE LOWER(email) = ? LIMIT 1`,
          [email],
        );
        const list = rows as { name: string }[];
        if (list.length) {
          found = { name: list[0].name, role: "college" };
        }
      }

      // 3. Check admin table (only if it exists)
      if (!found) {
        try {
          const [rows] = await conn.query(
            `SELECT name FROM next_admin_users WHERE LOWER(email) = ? AND is_active = 1 LIMIT 1`,
            [email],
          );
          const list = rows as { name: string }[];
          if (list.length) {
            found = { name: list[0].name, role: "admin" };
          }
        } catch {
          // Table may not exist yet — silently ignore
        }
      }

      // ── Always respond with success to prevent email enumeration ─────────
      // If not found, we still return 200 but skip sending the email.
      if (!found) {
        return NextResponse.json({
          success: true,
          message:
            "If an account with that email exists, a reset link has been sent.",
        });
      }

      // ── Invalidate any existing unused tokens for this email ─────────────
      await conn.query(
        `UPDATE password_reset_tokens SET used = 1 WHERE email = ? AND used = 0`,
        [email],
      );

      // ── Generate secure token ─────────────────────────────────────────────
      const token = crypto.randomBytes(48).toString("hex");
      const expiresAt = new Date(Date.now() + EXPIRES_IN_MS);

      await conn.query(
        `INSERT INTO password_reset_tokens (email, role, token, expires_at)
         VALUES (?, ?, ?, ?)`,
        [email, found.role, token, expiresAt],
      );

      // ── Send email ────────────────────────────────────────────────────────
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password/${token}`;

      await sendPasswordResetEmail(email, found.name, resetLink, found.role);
    } finally {
      conn.release();
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
