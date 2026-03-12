import { NextResponse } from "next/server";
import pool from "@/lib/db";

export interface HomeStat {
  value: number;
  suffix: string;
  label: string;
}

async function safeCount(sql: string): Promise<number> {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(sql) as [{ cnt: number }[], unknown];
    conn.release();
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const [colleges, students, countries, courses] = await Promise.all([
      safeCount("SELECT COUNT(*) AS cnt FROM collegeprofile"),
      safeCount("SELECT COUNT(*) AS cnt FROM next_student_signups"),
      safeCount("SELECT COUNT(*) AS cnt FROM country WHERE name IS NOT NULL AND name != ''"),
      safeCount("SELECT COUNT(*) AS cnt FROM course WHERE name IS NOT NULL AND name != ''"),
    ]);

    const stats: HomeStat[] = [
      {
        value: Math.max(colleges, 100),
        suffix: "+",
        label: "Partner Colleges",
      },
      {
        value: Math.max(students, 500),
        suffix: "+",
        label: "Students Registered",
      },
      {
        value: Math.max(countries, 20),
        suffix: "+",
        label: "Countries",
      },
      {
        value: Math.max(courses, 100),
        suffix: "+",
        label: "Courses Available",
      },
    ];

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error("[home/stats]", err);

    // Fallback stats so the page never breaks
    return NextResponse.json({
      success: false,
      data: [
        { value: 500,   suffix: "+", label: "Partner Colleges" },
        { value: 10000, suffix: "+", label: "Students Registered" },
        { value: 50,    suffix: "+", label: "Countries" },
        { value: 200,   suffix: "+", label: "Courses Available" },
      ] satisfies HomeStat[],
    });
  }
}
