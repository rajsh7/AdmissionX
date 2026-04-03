import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const db = await getDb();
    const regex = { $regex: q, $options: "i" };

    // Parallel queries for all entities
    const [profiles, courses, streams, cities] = await Promise.all([
      db.collection("collegeprofile").aggregate([
        {
          $lookup: {
            from: "users",
            localField: "users_id",
            foreignField: "id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { "user.firstname": regex },
              { slug: regex },
            ],
          },
        },
        { $limit: 5 },
        { $project: { _id: 0, slug: 1, "user.firstname": 1, registeredSortAddress: 1 } },
      ]).toArray(),

      db.collection("course").find({ name: regex }).limit(5).project({ _id: 0, name: 1, pageslug: 1 }).toArray(),
      db.collection("functionalarea").find({ name: regex }).limit(3).project({ _id: 0, name: 1, pageslug: 1 }).toArray(),
      db.collection("city").find({ name: regex }).limit(3).project({ _id: 0, id: 1, name: 1 }).toArray(),
    ]);

    const suggestions: any[] = [];

    // 1. Colleges
    profiles.forEach((r) => {
      const rawName = r.user?.firstname?.trim() || r.slug || "";
      suggestions.push({
        type: "college",
        name: rawName.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        location: (r.registeredSortAddress ?? "India").replace(/<[^>]+>/g, "").trim().slice(0, 60) || "India",
        slug: r.slug,
      });
    });

    // 2. Courses
    courses.forEach((c) => {
      suggestions.push({
        type: "course",
        name: c.name,
        location: "Course",
        slug: c.pageslug,
      });
    });

    // 3. Streams
    streams.forEach((s) => {
      suggestions.push({
        type: "stream",
        name: s.name,
        location: "Stream",
        slug: s.pageslug,
      });
    });

    // 4. Cities
    cities.forEach((city) => {
      suggestions.push({
        type: "city",
        name: city.name,
        location: "Location",
        id: city.id,
      });
    });

    return NextResponse.json({ suggestions: suggestions.slice(0, 12) });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
