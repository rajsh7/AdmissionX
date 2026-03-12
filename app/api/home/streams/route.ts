import { NextResponse } from "next/server";
import pool from "@/lib/db";

export interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  college_count: number;
}

async function safeQuery<T>(sql: string): Promise<T[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = (await conn.query(sql)) as [T[], unknown];
    return rows;
  } catch {
    return [];
  } finally {
    conn?.release();
  }
}

export async function GET() {
  const rows = await safeQuery<StreamRow>(`
    SELECT
      f.id,
      f.name,
      f.pageslug,
      COUNT(DISTINCT cm.collegeprofile_id) AS college_count
    FROM functionalarea f
    LEFT JOIN collegemaster cm ON cm.functionalarea_id = f.id
    WHERE f.name IS NOT NULL AND f.name != ''
    GROUP BY f.id, f.name, f.pageslug
    ORDER BY college_count DESC
    LIMIT 10
  `);

  if (!rows.length) {
    // Graceful fallback — static stream names with zero counts
    return NextResponse.json({
      success: true,
      source: "fallback",
      data: [
        { id: 1, name: "Engineering",  pageslug: "engineering",  college_count: 0 },
        { id: 2, name: "Management",   pageslug: "management",   college_count: 0 },
        { id: 3, name: "Medical",      pageslug: "medical",      college_count: 0 },
        { id: 4, name: "Law",          pageslug: "law",          college_count: 0 },
        { id: 5, name: "Science",      pageslug: "science",      college_count: 0 },
        { id: 6, name: "Commerce",     pageslug: "commerce",     college_count: 0 },
        { id: 7, name: "Arts",         pageslug: "arts",         college_count: 0 },
        { id: 8, name: "Design",       pageslug: "design",       college_count: 0 },
      ] as StreamRow[],
    });
  }

  return NextResponse.json({ success: true, source: "db", data: rows });
}
