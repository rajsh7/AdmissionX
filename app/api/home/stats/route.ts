import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export interface HomeStat {
  value: number;
  suffix: string;
  label: string;
}

async function safeCount(collection: string, filter: object = {}): Promise<number> {
  try {
    const db = await getDb();
    return await db.collection(collection).countDocuments(filter);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const [colleges, students, countries, courses] = await Promise.all([
      safeCount("collegeprofile"),
      safeCount("next_student_signups"),
      safeCount("country", { name: { $exists: true, $ne: "" } }),
      safeCount("course", { name: { $exists: true, $ne: "" } }),
    ]);

    const stats: HomeStat[] = [
      { value: Math.max(colleges, 100), suffix: "+", label: "Partner Colleges" },
      { value: Math.max(students, 500), suffix: "+", label: "Students Registered" },
      { value: Math.max(countries, 20), suffix: "+", label: "Countries" },
      { value: Math.max(courses, 100), suffix: "+", label: "Courses Available" },
    ];

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error("[home/stats]", err);
    return NextResponse.json({
      success: false,
      data: [
        { value: 500, suffix: "+", label: "Partner Colleges" },
        { value: 10000, suffix: "+", label: "Students Registered" },
        { value: 50, suffix: "+", label: "Countries" },
        { value: 200, suffix: "+", label: "Courses Available" },
      ] satisfies HomeStat[],
    });
  }
}
