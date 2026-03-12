import { NextResponse } from "next/server";
import pool from "@/lib/db";

export interface DbBlog {
  id: number;
  topic: string;
  featimage: string | null;
  description: string;
  slug: string;
  created_at: string;
}

export async function GET() {
  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT id, topic, featimage, description, slug, created_at
      FROM blogs
      WHERE isactive = 1
      ORDER BY created_at DESC
      LIMIT 4
    `) as [DbBlog[], unknown];

    conn.release();

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[home/latest-blogs]", err);
    return NextResponse.json({ success: false, data: [] });
  }
}
