import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return `https://admin.admissionx.in${raw}`;
  return `${IMAGE_BASE}${raw}`;
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  try {
    const db = await getDb();

    const matchStage: object = q
      ? {
          $or: [
            { "user.firstname": { $regex: q, $options: "i" } },
            { slug: { $regex: q, $options: "i" } },
            { registeredSortAddress: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const pipeline = [
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
      { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
      ...(q ? [{ $match: matchStage }] : []),
      { $sort: { created_at: -1 } },
    ];

    const [countResult, rows] = await Promise.all([
      db.collection("collegeprofile").aggregate([...pipeline, { $count: "total" }]).toArray(),
      db.collection("collegeprofile").aggregate([
        ...pipeline,
        { $skip: offset },
        { $limit: limit },
        {
          $project: {
            slug: 1, bannerimage: 1, rating: 1, ranking: 1, verified: 1,
            isTopUniversity: 1, topUniversityRank: 1, universityType: 1, id: 1,
            name: { $ifNull: ["$user.firstname", "Unnamed College"] },
            city_name: "$city.name",
          },
        },
      ]).toArray(),
    ]);

    const total = countResult[0]?.total ?? 0;
    const cpIds = rows.map((r) => r.id);

    // Count sub-items per college
    const subCounts = await Promise.all([
      db.collection("collegemaster").aggregate([{ $match: { collegeprofile_id: { $in: cpIds } } }, { $group: { _id: "$collegeprofile_id", count: { $sum: 1 } } }]).toArray(),
      db.collection("collegefacilities").aggregate([{ $match: { collegeprofile_id: { $in: cpIds } } }, { $group: { _id: "$collegeprofile_id", count: { $sum: 1 } } }]).toArray(),
      db.collection("faculty").aggregate([{ $match: { collegeprofile_id: { $in: cpIds } } }, { $group: { _id: "$collegeprofile_id", count: { $sum: 1 } } }]).toArray(),
    ]);

    const toMap = (arr: unknown[]) => Object.fromEntries((arr as { _id: unknown; count: number }[]).map((r) => [String(r._id), r.count]));
    const [coursesMap, facilitiesMap, facultyMap] = subCounts.map(toMap);

    const colleges = rows.map((r) => ({
      ...r,
      image: buildImageUrl(r.bannerimage),
      rating: parseFloat(String(r.rating)) || 0,
      ranking: r.ranking ? parseInt(String(r.ranking)) : null,
      count_courses: coursesMap[String(r.id)] ?? 0,
      count_facilities: facilitiesMap[String(r.id)] ?? 0,
      count_faculty: facultyMap[String(r.id)] ?? 0,
    }));

    return NextResponse.json({ success: true, colleges, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[api/admin/colleges/stats]", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
