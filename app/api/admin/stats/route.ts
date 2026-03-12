import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface CountRow extends RowDataPacket {
  cnt: number;
}

async function safeCount(sql: string, params: (string | number)[] = []): Promise<number> {
  try {
    const [rows] = (await pool.query(sql, params)) as [CountRow[], unknown];
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  const [
    colleges,
    pendingColleges,
    students,
    applications,
    blogsTotal,
    blogsActive,
    newsTotal,
    newsActive,
    exams,
    degrees,
    courses,
    streams,
    cities,
    ads,
    adminUsers,
  ] = await Promise.all([
    safeCount("SELECT COUNT(*) AS cnt FROM next_college_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_college_signups WHERE status = 'pending'"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
    safeCount("SELECT COUNT(*) AS cnt FROM application"),
    safeCount("SELECT COUNT(*) AS cnt FROM blogs"),
    safeCount("SELECT COUNT(*) AS cnt FROM blogs WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM news"),
    safeCount("SELECT COUNT(*) AS cnt FROM news WHERE isactive = 1"),
    safeCount("SELECT COUNT(*) AS cnt FROM examination_details"),
    safeCount("SELECT COUNT(*) AS cnt FROM degree"),
    safeCount("SELECT COUNT(*) AS cnt FROM course"),
    safeCount("SELECT COUNT(*) AS cnt FROM functionalarea"),
    safeCount("SELECT COUNT(*) AS cnt FROM city"),
    safeCount("SELECT COUNT(*) AS cnt FROM ads_managements"),
    safeCount("SELECT COUNT(*) AS cnt FROM next_admin_users WHERE is_active = 1"),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      colleges,
      pendingColleges,
      students,
      applications,
      blogsTotal,
      blogsActive,
      newsTotal,
      newsActive,
      exams,
      degrees,
      courses,
      streams,
      cities,
      ads,
      adminUsers,
    },
  });
}
