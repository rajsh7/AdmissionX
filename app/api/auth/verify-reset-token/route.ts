import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get("token") ?? "").trim();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT id, role, expires_at, used
         FROM password_reset_tokens
         WHERE token = ?
         LIMIT 1`,
        [token],
      );

      const list = rows as {
        id: number;
        role: "student" | "college" | "admin";
        expires_at: Date;
        used: number;
      }[];

      if (!list.length) {
        return NextResponse.json(
          { valid: false, error: "This reset link is invalid." },
          { status: 400 },
        );
      }

      const record = list[0];

      if (record.used) {
        return NextResponse.json(
          { valid: false, error: "This reset link has already been used." },
          { status: 400 },
        );
      }

      if (new Date() > new Date(record.expires_at)) {
        return NextResponse.json(
          {
            valid: false,
            error: "This reset link has expired. Please request a new one.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({ valid: true, role: record.role });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[verify-reset-token]", err);
    return NextResponse.json(
      { valid: false, error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
