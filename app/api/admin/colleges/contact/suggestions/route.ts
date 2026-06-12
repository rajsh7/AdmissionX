import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function cleanName(value: unknown): string {
  if (value == null) return "";
  const text = String(value).replace(/^null$/i, "").trim();
  if (!text || text.toUpperCase() === "NULL" || /^unknown college$/i.test(text)) return "";
  return text;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const db = await getDb();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [profileRows, newRows, oldRows] = await Promise.all([
      db.collection("collegeprofile").aggregate([
        {
          $lookup: {
            from: "users",
            let: { uid: "$users_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$uid"] },
                      { $eq: ["$id", "$$uid"] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "_user",
          },
        },
        {
          $project: {
            name: {
              $ifNull: [
                "$college_name",
                { $arrayElemAt: ["$_user.firstname", 0] },
                "$slug",
                "",
              ],
            },
          },
        },
        { $limit: 500 },
      ]).toArray(),
      db.collection("next_college_signups")
        .find(
          { college_name: { $regex: escaped, $options: "i" } },
          { projection: { college_name: 1 } },
        )
        .limit(20)
        .toArray(),
      db.collection("request_for_create_college_accounts")
        .find(
          {
            $or: [
              { collegeName: { $regex: escaped, $options: "i" } },
              { college_name: { $regex: escaped, $options: "i" } },
            ],
          },
          { projection: { collegeName: 1, college_name: 1 } },
        )
        .limit(20)
        .toArray(),
    ]);

    const names = [
      ...profileRows.map((row: Record<string, unknown>) => cleanName(row.name)),
      ...newRows.map((row: Record<string, unknown>) => cleanName(row.college_name)),
      ...oldRows.map((row: Record<string, unknown>) => cleanName(row.collegeName ?? row.college_name)),
    ]
      .filter((name) => name && regex.test(name));

    const uniqueNames = Array.from(new Set(names)).sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q.toLowerCase()) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q.toLowerCase()) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.localeCompare(b);
    });

    return NextResponse.json({
      suggestions: uniqueNames.slice(0, 8).map((name) => ({ name })),
    });
  } catch (error) {
    console.error("[admin/colleges/contact/suggestions]", error);
    return NextResponse.json({ suggestions: [] });
  }
}
