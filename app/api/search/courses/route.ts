import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export interface CourseResult {
  id: string | number;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  level_name: string | null;
  level_slug: string | null;
  stream_name: string | null;
  stream_slug: string | null;
  bestChoiceOfCourse: string | null;
  jobsCareerOpportunityDesc: string | null;
}

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toUpperCase() === "NULL") return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  return `/uploads/courses/${trimmed}`;
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") ?? "").trim();
  const level = (sp.get("level") ?? "").trim();
  const stream = (sp.get("stream") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(6, parseInt(sp.get("limit") ?? "12")));
  const offset = (page - 1) * limit;

  try {
    const db = await getDb();

    // Resolve level/stream slugs
    let degreeId: unknown = null;
    if (level) {
      const d = await db.collection("degree").findOne({ pageslug: level }, { projection: { id: 1 } });
      degreeId = d?.id ?? null;
    }
    let faId: unknown = null;
    if (stream) {
      const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } });
      faId = fa?.id ?? null;
    }

    const filter: Record<string, unknown> = { pageslug: { $exists: true, $ne: "" } };
    if (q.length >= 2) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { pagedescription: { $regex: q, $options: "i" } }];
    }
    if (degreeId) filter.degree_id = degreeId;
    if (faId) filter.functionalarea_id = faId;

    const [rows, total] = await Promise.all([
      db.collection("course").aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "deg" } },
        { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
        { $unwind: { path: "$deg", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1, name: 1, pageslug: 1, image: 1, pagedescription: 1,
            level_name: "$deg.name", level_slug: "$deg.pageslug",
            stream_name: "$fa.name", stream_slug: "$fa.pageslug",
          },
        },
      ]).toArray(),
      db.collection("course").countDocuments(filter),
    ]);

    const courses = rows.map((row) => ({
      id: row.id,
      title: row.name,
      slug: row.pageslug,
      image: buildImageUrl(row.image),
      description: row.pagedescription,
      level_name: row.level_name,
      level_slug: row.level_slug,
      stream_name: row.stream_name,
      stream_slug: row.stream_slug,
      bestChoiceOfCourse: null,
      jobsCareerOpportunityDesc: null,
    }));

    return NextResponse.json({ success: true, courses, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error("[/api/search/courses]", err);
    return NextResponse.json({ success: false, courses: [], total: 0, page: 1, totalPages: 0, limit }, { status: 500 });
  }
}
