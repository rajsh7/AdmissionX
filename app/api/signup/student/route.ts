import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, captchaOk } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!captchaOk) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS next_student_signups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(32) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(
        `INSERT INTO next_student_signups (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`,
        [name, email, phone, hashed]
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Student signup error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

