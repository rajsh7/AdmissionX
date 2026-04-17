import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ syllabus: null }, { status: 400 });
  }

  const db = await getDb();
  const exam = await db.collection("examination_details").findOne(
    { slug },
    { projection: { syllabus: 1, title: 1 } }
  );

  if (!exam) {
    return NextResponse.json({ syllabus: null }, { status: 404 });
  }

  return NextResponse.json({ syllabus: exam.syllabus || null });
}