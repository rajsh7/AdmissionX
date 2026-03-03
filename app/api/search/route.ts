import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const conn = await pool.getConnection();

    // Search college names from users table joined with collegeprofile
    const [rows] = await conn.query(
      `SELECT DISTINCT
         u.firstname AS name,
         cp.registeredSortAddress AS location,
         cp.slug AS slug
       FROM collegeprofile cp
       JOIN users u ON cp.users_id = u.id
       WHERE u.firstname LIKE ?
       LIMIT 8`,
      [`%${q}%`]
    ) as [{ name: string; location: string; slug: string }[], unknown];

    conn.release();

    const suggestions = (rows as { name: string; location: string; slug: string }[]).map((r) => ({
      name: r.name,
      location: r.location ?? "India",
      slug: r.slug ?? "",
    }));

    return NextResponse.json({ suggestions });
  } catch {
    // Fallback: empty suggestions on DB error
    return NextResponse.json({ suggestions: [] });
  }
}
