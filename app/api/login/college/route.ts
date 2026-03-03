import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT id, password_hash FROM next_college_signups WHERE email = ? LIMIT 1`,
        [email]
      );

      const list = rows as { id: number; password_hash: string }[];
      if (!list.length) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const user = list[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("College login error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

