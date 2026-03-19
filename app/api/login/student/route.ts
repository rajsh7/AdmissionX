import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    let user: {
      id: number;
      name: string;
      email: string;
      password_hash: string;
    } | null = null;

    try {
      const [rows] = await conn.query(
        `SELECT id, name, email, password_hash
         FROM next_student_signups
         WHERE email = ?
         LIMIT 1`,
        [email],
      );
      const list = rows as {
        id: number;
        name: string;
        email: string;
        password_hash: string;
      }[];
      if (list.length) user = list[0];
    } finally {
      conn.release();
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Sign a 7-day JWT
    const token = await signStudentToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "student",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });

    // Set HTTP-only cookie
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
