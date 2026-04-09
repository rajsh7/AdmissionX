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
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
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
    let elId: unknown = null;
    if (level) {
      const el = await db.collection("educationlevel").findOne({ pageslug: level }, { projection: { id: 1 } });
      elId = el?.id ?? null;
    }
    let faId: unknown = null;
    if (stream) {
      const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } });
      faId = fa?.id ?? null;
    }

    const filter: Record<string, unknown> = { slug: { $exists: true, $ne: "" } };
    if (q.length >= 2) {
      filter.$or = [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    }
    if (elId) filter.educationlevel_id = elId;
    if (faId) filter.functionalarea_id = faId;

    const [rows, total] = await Promise.all([
      db.collection("counseling_courses_details").aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $lookup: { from: "educationlevel", localField: "educationlevel_id", foreignField: "id", as: "el" } },
        { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
        { $unwind: { path: "$el", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1, slug: 1, image: 1, description: 1,
            bestChoiceOfCourse: 1, jobsCareerOpportunityDesc: 1,
            level_name: "$el.name", level_slug: "$el.pageslug",
            stream_name: "$fa.name", stream_slug: "$fa.pageslug",
          },
        },
      ]).toArray(),
      db.collection("counseling_courses_details").countDocuments(filter),
    ]);

    const courses = rows.map((row) => ({
      id: row._id,
      title: row.title,
      slug: row.slug,
      image: buildImageUrl(row.image),
      description: row.description,
      level_name: row.level_name,
      level_slug: row.level_slug,
      stream_name: row.stream_name,
      stream_slug: row.stream_slug,
      bestChoiceOfCourse: row.bestChoiceOfCourse,
      jobsCareerOpportunityDesc: row.jobsCareerOpportunityDesc,
    }));

    return NextResponse.json({ success: true, courses, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error("[/api/search/courses]", err);
    return NextResponse.json({ success: false, courses: [], total: 0, page: 1, totalPages: 0, limit }, { status: 500 });
  }
}
