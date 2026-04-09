import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const type = (searchParams.get("type") ?? "").trim().toLowerCase();
  const tag = (searchParams.get("tag") ?? "").trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 1), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  try {
    const db = await getDb();

    // Resolve type/tag slugs to ids
    let typeId: unknown = null;
    if (type) {
      const t = await db.collection("news_types").findOne({ slug: type }, { projection: { _id: 1 } });
      typeId = t?._id ?? null;
    }
    let tagId: unknown = null;
    if (tag) {
      const tg = await db.collection("news_tags").findOne({ slug: tag }, { projection: { _id: 1 } });
      tagId = tg?._id ?? null;
    }

    const filter: Record<string, unknown> = {
      isactive: 1,
      slug: { $exists: true, $ne: "" },
    };
    if (q) filter.$or = [{ topic: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    if (typeId) filter.newstypeids = typeId;
    if (tagId) filter.newstagsids = tagId;

    const [rows, total, types, tags] = await Promise.all([
      db.collection("news").find(filter).sort({ created_at: -1 }).skip(offset).limit(limit)
        .project({ _id: 1, topic: 1, featimage: 1, description: 1, slug: 1, newstypeids: 1, newstagsids: 1, created_at: 1, updated_at: 1 })
        .toArray(),
      db.collection("news").countDocuments(filter),
      db.collection("news_types").find({}).sort({ name: 1 }).project({ _id: 1, name: 1, slug: 1 }).toArray(),
      db.collection("news_tags").find({}).sort({ name: 1 }).project({ _id: 1, name: 1, slug: 1 }).toArray(),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      types,
      tags,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (err) {
    console.error("[api/news GET]", err);
    return NextResponse.json(
      { success: false, data: [], types: [], tags: [], pagination: { total: 0, limit, offset, hasMore: false }, error: "Failed to fetch news." },
      { status: 500 }
    );
  }
}
