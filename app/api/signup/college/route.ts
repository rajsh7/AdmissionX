import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collegeName, email, contactName, phone, captchaOk } = body;

    if (!collegeName || !email || !contactName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!captchaOk) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS next_college_signups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          college_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          contact_name VARCHAR(255) NOT NULL,
          phone VARCHAR(32) NOT NULL,
          password_hash VARCHAR(255) DEFAULT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(
        `INSERT INTO next_college_signups (college_name, email, contact_name, phone) VALUES (?, ?, ?, ?)`,
        [collegeName, email, contactName, phone]
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("College signup error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

