import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export interface StreamRow {
  id: number;
  name: string;
  pageslug: string | null;
  college_count: number;
}

export async function GET() {
  try {
    const db = await getDb();

    const rows = await db.collection("functionalarea").aggregate([
      { $match: { name: { $exists: true, $ne: "" } } },
      {
        $lookup: {
          from: "collegemaster",
          localField: "_id",
          foreignField: "functionalarea_id",
          as: "colleges",
        },
      },
      {
        $project: {
          name: 1,
          pageslug: 1,
          college_count: { $size: { $setUnion: ["$colleges.collegeprofile_id", []] } },
        },
      },
      { $sort: { college_count: -1 } },
      { $limit: 10 },
    ]).toArray();

    if (!rows.length) {
      return NextResponse.json({
        success: true,
        source: "fallback",
        data: [
          { id: 1, name: "Engineering", pageslug: "engineering", college_count: 0 },
          { id: 2, name: "Management", pageslug: "management", college_count: 0 },
          { id: 3, name: "Medical", pageslug: "medical", college_count: 0 },
          { id: 4, name: "Law", pageslug: "law", college_count: 0 },
          { id: 5, name: "Science", pageslug: "science", college_count: 0 },
          { id: 6, name: "Commerce", pageslug: "commerce", college_count: 0 },
          { id: 7, name: "Arts", pageslug: "arts", college_count: 0 },
          { id: 8, name: "Design", pageslug: "design", college_count: 0 },
        ] as StreamRow[],
      });
    }

    return NextResponse.json({ success: true, source: "db", data: rows });
  } catch {
    return NextResponse.json({ success: true, source: "fallback", data: [] });
  }
}
