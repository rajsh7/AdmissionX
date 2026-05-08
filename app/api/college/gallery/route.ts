import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ images: [] });

  try {
    const db = await getDb();

    const cp = await db.collection("collegeprofile").findOne(
      { slug },
      { projection: { _id: 1, users_id: 1 } }
    );
    if (!cp) return NextResponse.json({ images: [] });

    const usersId = cp.users_id;

    const rows = await db.collection("gallery")
      .find({
        $or: [
          { college_slug: slug },
          { users_id: usersId, fullimage: { $exists: true, $ne: "" } },
        ],
        fullimage: { $exists: true, $ne: "" },
      })
      .sort({ _id: -1 })
      .limit(50)
      .project({ fullimage: 1 })
      .toArray();

    const images = rows.map((row: any) => {
      const raw = String(row.fullimage ?? "");
      if (raw.startsWith("http") || raw.startsWith("/")) return raw;
      return `https://admin.admissionx.in/uploads/${raw}`;
    });

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[gallery]", err);
    return NextResponse.json({ images: [] });
  }
}
