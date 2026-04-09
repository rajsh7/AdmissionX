import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 1), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  try {
    const db = await getDb();

    const filter: object = q
      ? {
          isactive: 1,
          slug: { $exists: true, $ne: "" },
          $or: [
            { topic: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : { isactive: 1, slug: { $exists: true, $ne: "" } };

    const [rows, total] = await Promise.all([
      db.collection("blogs")
        .find(filter)
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .project({ _id: 1, topic: 1, featimage: 1, fullimage: 1, description: 1, slug: 1, created_at: 1, updated_at: 1 })
        .toArray(),
      db.collection("blogs").countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (err) {
    console.error("[api/blogs GET]", err);
    return NextResponse.json(
      { success: false, data: [], pagination: { total: 0, limit, offset, hasMore: false }, error: "Failed to fetch blog data." },
      { status: 500 }
    );
  }
}
