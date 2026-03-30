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

    const profiles = await db.collection("collegeprofile").aggregate([
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
            { "user.firstname": { $regex: q, $options: "i" } },
            { slug: { $regex: q, $options: "i" } },
          ],
        },
      },
      { $limit: 8 },
      { $project: { slug: 1, "user.firstname": 1, registeredSortAddress: 1 } },
    ]).toArray();

    const suggestions = profiles.map((r) => {
      const rawName = r.user?.firstname?.trim() || r.slug || "";
      return {
        name: rawName
          ? rawName.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          : "College",
        location: (r.registeredSortAddress ?? "India").replace(/<[^>]+>/g, "").trim().slice(0, 60) || "India",
        slug: r.slug ?? "",
      };
    });

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
