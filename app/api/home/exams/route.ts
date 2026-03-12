import { NextResponse } from "next/server";
import pool from "@/lib/db";

export interface DbExam {
  id: number;
  title: string;
  slug: string;
  exminationDate: string | null;
  image: string | null;
  functionalarea_id: number | null;
  courses_id: number | null;
  totalViews: number;
}

export async function GET() {
  try {
    const conn = await pool.getConnection();

    const [rows] = (await conn.query(`
      SELECT
        id,
        title,
        slug,
        exminationDate,
        image,
        functionalarea_id,
        courses_id,
        totalViews
      FROM examination_details
      ORDER BY totalViews DESC, created_at DESC
      LIMIT 6
    `)) as [DbExam[], unknown];

    conn.release();

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[home/exams]", err);
    return NextResponse.json({ success: false, data: [] });
  }
}
