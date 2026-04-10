import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const stream = sp.get("stream")?.trim() ?? "";
  const degree = sp.get("degree")?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "12", 10)));
  const offset = (page - 1) * limit;

  const db = await getDb();

  // Resolve stream/degree to IDs
  let faId: unknown = null;
  if (stream) {
    const fa = await db.collection("functionalarea").findOne({ name: stream }, { projection: { id: 1 } });
    faId = fa?.id ?? null;
  }
  let degreeId: unknown = null;
  if (degree) {
    const d = await db.collection("degree").findOne({ name: degree }, { projection: { id: 1 } });
    degreeId = d?.id ?? null;
  }

  // Get college IDs matching stream/degree filters
  let filteredCpIds: unknown[] | null = null;
  if (faId || degreeId) {
    const cmFilter: Record<string, unknown> = {};
    if (faId) cmFilter.functionalarea_id = faId;
    if (degreeId) cmFilter.degree_id = degreeId;
    const cms = await db.collection("collegemaster").find(cmFilter).project({ collegeprofile_id: 1 }).toArray();
    filteredCpIds = [...new Set(cms.map((c) => c.collegeprofile_id))];
  }

  const matchFilter: Record<string, unknown> = { verified: 1 };
  if (filteredCpIds) matchFilter.id = { $in: filteredCpIds };

  const pipeline: object[] = [
    { $match: matchFilter },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "collegetype", localField: "collegetype_id", foreignField: "id", as: "ct" } },
    { $unwind: { path: "$ct", preserveNullAndEmptyArrays: true } },
  ];

  if (q) {
    pipeline.push({
      $match: {
        $or: [
          { "u.firstname": { $regex: q, $options: "i" } },
          { slug: { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { rating: -1, id: 1 } });

  const [countResult, collegeRows] = await Promise.all([
    db.collection("collegeprofile").aggregate([...pipeline, { $count: "total" }]).toArray(),
    db.collection("collegeprofile").aggregate([
      ...pipeline,
      { $skip: offset },
      { $limit: limit },
      {
        $project: {
          slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, universityType: 1,
          admissionStart: 1, admissionEnd: 1, id: 1,
          college_name: { $ifNull: [{ $trim: { input: "$u.firstname" } }, "$slug"] },
          address: "$registeredSortAddress",
          college_type: "$ct.name",
        },
      },
    ]).toArray(),
  ]);

  const total = countResult[0]?.total ?? 0;
  const cpIds = collegeRows.map((c) => c.id);

  // Fetch courses for these colleges
  const courseRows = await db.collection("collegemaster").aggregate([
    { $match: { collegeprofile_id: { $in: cpIds } } },
    { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "co" } },
    { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
    { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
    { $unwind: { path: "$co", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
    { $project: { collegeprofile_id: 1, course_name: "$co.name", degree_name: "$d.name", stream_name: "$fa.name", fees: 1, seats: 1, courseduration: 1, min_percent: "$twelvemarks" } },
  ]).toArray();

  const coursesByCollege: Record<string, typeof courseRows> = {};
  for (const row of courseRows) {
    const key = String(row.collegeprofile_id);
    if (!coursesByCollege[key]) coursesByCollege[key] = [];
    coursesByCollege[key].push(row);
  }

  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";
  const result = collegeRows.map((c) => {
    const courses = coursesByCollege[String(c.id)] ?? [];
    const feesValues = courses.map((x) => x.fees).filter((f): f is number => f !== null && f > 0);
    const minFees = feesValues.length ? Math.min(...feesValues) : null;
    const now = new Date();
    const admissionOpen = c.admissionStart && c.admissionEnd ? now >= new Date(c.admissionStart) && now <= new Date(c.admissionEnd) : null;

    return {
      collegeprofile_id: c.id,
      college_name: c.college_name,
      slug: c.slug,
      image: c.bannerimage ? `${IMAGE_BASE}${c.bannerimage}` : null,
      address: c.address ?? "",
      rating: c.rating ? Number(c.rating).toFixed(1) : null,
      totalRatingUser: c.totalRatingUser ?? 0,
      college_type: c.college_type ?? "College",
      university_type: c.universityType ?? "",
      admission_open: admissionOpen,
      admission_start: c.admissionStart ?? null,
      admission_end: c.admissionEnd ?? null,
      total_courses: courses.length,
      min_fees: minFees,
      courses,
    };
  });

  return NextResponse.json(
    { colleges: result, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, filters: { streams: [], degrees: [] } },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
