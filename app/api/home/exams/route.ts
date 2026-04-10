import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export interface DbExam {
  id: string | number;
  title: string;
  slug: string;
  exminationDate: string | null;
  image: string | null;
  functionalarea_id: string | number | null;
  courses_id: string | number | null;
  totalViews: number;
}

export async function GET() {
  try {
    const db = await getDb();

    const rows = await db.collection("examination_details")
      .find({})
      .sort({ totalViews: -1, created_at: -1 })
      .limit(6)
      .project({
        _id: 1, title: 1, slug: 1, exminationDate: 1,
        image: 1, functionalarea_id: 1, courses_id: 1, totalViews: 1,
      })
      .toArray();

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[home/exams]", err);
    return NextResponse.json({ success: false, data: [] });
  }
}
