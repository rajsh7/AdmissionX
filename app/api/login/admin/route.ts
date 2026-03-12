import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signAdminToken, ADMIN_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

interface AdminRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    let user: AdminRow | null = null;

    try {
      // Ensure the admin users table exists
      await conn.query(`
        CREATE TABLE IF NOT EXISTS next_admin_users (
          id          INT AUTO_INCREMENT PRIMARY KEY,
          name        VARCHAR(255) NOT NULL,
          email       VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          is_active   TINYINT(1) NOT NULL DEFAULT 1,
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [rows] = await conn.query(
        `SELECT id, name, email, password_hash, is_active
         FROM next_admin_users
         WHERE email = ?
         LIMIT 1`,
        [email],
      );

      const list = rows as unknown as AdminRow[];
      if (list.length) user = list[0];
    } finally {
      conn.release();
    }

    // Account not found
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Account disabled
    if (!user.is_active) {
      return NextResponse.json(
        {
          error:
            "This admin account has been disabled. Contact the super admin.",
        },
        { status: 403 },
      );
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Sign a 1-day JWT (shorter session for admin security)
    const token = await signAdminToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "admin",
      },
    });

    response.cookies.set(ADMIN_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    console.error("[admin login]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
