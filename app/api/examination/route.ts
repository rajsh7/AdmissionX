import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stream = (searchParams.get("stream") ?? "").trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 1), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  try {
    const db = await getDb();

    // Resolve stream slug to functionalarea _id
    let faId: unknown = null;
    if (stream) {
      const fa = await db.collection("functionalarea").findOne(
        { $or: [{ pageslug: stream }, { name: { $regex: stream, $options: "i" } }] },
        { projection: { _id: 1 } }
      );
      faId = fa?._id ?? null;
    }

    const filter: Record<string, unknown> = {
      status: 1,
      slug: { $exists: true, $ne: "" },
    };
    if (faId) filter.functionalarea_id = faId;

    const [rows, total] = await Promise.all([
      db.collection("examination_details")
        .find(filter)
        .sort({ totalViews: -1, created_at: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection("examination_details").countDocuments(filter),
    ]);

    // Enrich with stream name
    const faIds = [...new Set(rows.map((r) => r.functionalarea_id).filter(Boolean))];
    const faMap: Record<string, { name: string; pageslug: string }> = {};
    if (faIds.length) {
      const fas = await db.collection("functionalarea")
        .find({ _id: { $in: faIds } })
        .project({ _id: 1, name: 1, pageslug: 1 })
        .toArray();
      fas.forEach((f) => { faMap[f._id.toString()] = { name: f.name, pageslug: f.pageslug }; });
    }

    const data = rows.map((r) => {
      const fa = r.functionalarea_id ? faMap[r.functionalarea_id.toString()] : null;
      return { ...r, stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (err) {
    console.error("[api/examination GET]", err);
    return NextResponse.json(
      { success: false, data: [], pagination: { total: 0, limit, offset, hasMore: false }, error: "Failed to fetch examination data." },
      { status: 500 }
    );
  }
}
