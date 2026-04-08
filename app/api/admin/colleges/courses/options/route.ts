import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db";

interface OptionRow {
  id: number;
  name: string;
}

function normalizeOptions(rows: Array<Record<string, unknown>>): OptionRow[] {
  return rows
    .map((row) => ({
      id: Number(row.id),
      name: String(row.name ?? "").trim(),
    }))
    .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.name.length > 0);
}

const getCourseFormOptions = unstable_cache(
  async () => {
    const db = await getDb();

    const [collegeRows, courseRows, degreeRows, streamRows] = await Promise.all([
      db
        .collection("collegeprofile")
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "users_id",
              foreignField: "id",
              as: "userDoc",
            },
          },
          { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              id: 1,
              name: { $ifNull: ["$userDoc.firstname", "Unnamed College"] },
            },
          },
          { $sort: { name: 1, id: 1 } },
        ])
        .toArray(),
      db
        .collection("course")
        .find({}, { projection: { _id: 0, id: 1, name: 1 } })
        .sort({ name: 1, id: 1 })
        .toArray(),
      db
        .collection("degree")
        .find({}, { projection: { _id: 0, id: 1, name: 1 } })
        .sort({ name: 1, id: 1 })
        .toArray(),
      db
        .collection("functionalarea")
        .find({}, { projection: { _id: 0, id: 1, name: 1 } })
        .sort({ name: 1, id: 1 })
        .toArray(),
    ]);

    return {
      colleges: normalizeOptions(collegeRows as Array<Record<string, unknown>>),
      courseOptions: normalizeOptions(courseRows as Array<Record<string, unknown>>),
      degrees: normalizeOptions(degreeRows as Array<Record<string, unknown>>),
      streams: normalizeOptions(streamRows as Array<Record<string, unknown>>),
    };
  },
  ["admin-colleges-course-options"],
  { revalidate: 300 },
);

export async function GET() {
  try {
    const options = await getCourseFormOptions();
    return NextResponse.json({ success: true, ...options });
  } catch (error) {
    console.error("[api/admin/colleges/courses/options]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load course options." },
      { status: 500 },
    );
  }
}
