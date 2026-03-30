import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Filter, Document } from "mongodb";

export interface CollegeResult {
  id: string | number;
  slug: string;
  name: string;
  location: string;
  city_name: string | null;
  state_id: string | number | null;
  image: string | null;
  rating: number;
  totalRatingUser: number;
  ranking: number | null;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  estyear: string | null;
  verified: number;
  totalStudent: number | null;
  streams: string[];
  min_fees: number | null;
  max_fees: number | null;
}

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;

  const q = (sp.get("q") ?? "").trim();
  const stream = (sp.get("stream") ?? "").trim();
  const degree = (sp.get("degree") ?? "").trim();
  const cityId = sp.get("city_id") || null;
  const feesMax = sp.get("fees_max") ? parseInt(sp.get("fees_max")!) : null;
  const sort = sp.get("sort") ?? "rating";
  const type = (sp.get("type") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(6, parseInt(sp.get("limit") ?? "12")));
  const offset = (page - 1) * limit;

  try {
    const db = await getDb();

    // Resolve stream/degree slugs to integer ids
    let faId: unknown = null;
    if (stream) {
      const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } });
      faId = fa?.id ?? null;
    }
    let degreeId: unknown = null;
    if (degree) {
      const d = await db.collection("degree").findOne({ pageslug: degree }, { projection: { id: 1 } });
      degreeId = d?.id ?? null;
    }
    let cityIntId: unknown = null;
    if (cityId) {
      const parsed = parseInt(cityId);
      cityIntId = isNaN(parsed) ? null : parsed;
    }

    // Collect collegeprofile_ids matching stream/degree filters via collegemaster
    let streamCollegeIds: unknown[] | null = null;
    if (faId) {
      const cms = await db.collection("collegemaster").find({ functionalarea_id: faId }).project({ collegeprofile_id: 1 }).toArray();
      streamCollegeIds = [...new Set(cms.map((c) => c.collegeprofile_id))];
    }
    let degreeCollegeIds: unknown[] | null = null;
    if (degreeId) {
      const cms = await db.collection("collegemaster").find({ degree_id: degreeId }).project({ collegeprofile_id: 1 }).toArray();
      degreeCollegeIds = [...new Set(cms.map((c) => c.collegeprofile_id))];
    }
    let feesCollegeIds: unknown[] | null = null;
    if (feesMax != null && !isNaN(feesMax)) {
      const cms = await db.collection("collegemaster").find({ fees: { $gt: 0, $lte: feesMax } }).project({ collegeprofile_id: 1 }).toArray();
      feesCollegeIds = [...new Set(cms.map((c) => c.collegeprofile_id))];
    }

    // Build match filter — collegemaster stores integer collegeprofile_id matching collegeprofile.id
    const match: Record<string, unknown> = {};
    if (streamCollegeIds) match.id = { $in: streamCollegeIds };
    if (degreeCollegeIds) {
      match.id = match.id ? { $in: (match.id as { $in: unknown[] }).$in.filter((id) => (degreeCollegeIds as unknown[]).some((d) => String(d) === String(id))) } : { $in: degreeCollegeIds };
    }
    if (feesCollegeIds) {
      const existing = (match.id as { $in: unknown[] } | undefined)?.$in;
      match.id = { $in: existing ? existing.filter((id) => (feesCollegeIds as unknown[]).some((f) => String(f) === String(id))) : feesCollegeIds };
    }
    if (cityIntId) match.registeredAddressCityId = cityIntId;
    if (type === "top") match.isShowOnTop = 1;
    else if (type === "university") match.isTopUniversity = 1;
    else if (type === "abroad") match.registeredAddressCountryId = { $ne: 1 };

    // Text search needs user join — do it via aggregation
    const pipeline: object[] = [
      { $match: match },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (q.length >= 2) {
      pipeline.push({
        $match: {
          $or: [
            { "user.firstname": { $regex: q, $options: "i" } },
            { registeredSortAddress: { $regex: q, $options: "i" } },
            { slug: { $regex: q, $options: "i" } },
          ],
        },
      });
    }

    // Sort
    const sortStage: Record<string, 1 | -1> =
      sort === "ranking" ? { ranking: 1 } :
      sort === "newest" ? { created_at: -1 } :
      { rating: -1, totalRatingUser: -1 };

    pipeline.push({ $sort: sortStage });

    // Count + paginate
    const countPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [
      ...pipeline,
      { $skip: offset },
      { $limit: limit },
      { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
      { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
          isTopUniversity: 1, topUniversityRank: 1, universityType: 1, estyear: 1,
          verified: 1, totalStudent: 1, registeredSortAddress: 1, id: 1,
          name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
          city_name: "$city.name",
        },
      },
    ];

    const [countResult, dataRows] = await Promise.all([
      db.collection("collegeprofile").aggregate(countPipeline).toArray(),
      db.collection("collegeprofile").aggregate(dataPipeline).toArray(),
    ]);

    const total = countResult[0]?.total ?? 0;

    // Enrich with streams — join via integer id field
    const cpIntIds = dataRows.map((r) => r.id);
    const cmRows = await db.collection("collegemaster").aggregate([
      { $match: { collegeprofile_id: { $in: cpIntIds } } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$collegeprofile_id", streams: { $addToSet: "$fa.name" }, min_fees: { $min: "$fees" }, max_fees: { $max: "$fees" } } },
    ]).toArray();

    const cmMap: Record<string, { streams: string[]; min_fees: number; max_fees: number }> = {};
    cmRows.forEach((r) => { cmMap[String(r._id)] = { streams: (r.streams as string[]) ?? [], min_fees: Number(r.min_fees ?? 0), max_fees: Number(r.max_fees ?? 0) }; });

    const colleges = dataRows.map((row) => {
      const cm = cmMap[String(row.id)];
      const name = row.name && row.name !== row.slug ? row.name : slugToName(row.slug || "college");
      return {
        id: row.id ?? row._id,
        slug: row.slug,
        name,
        location: row.registeredSortAddress || row.city_name || "India",
        city_name: row.city_name,
        image: buildImageUrl(row.bannerimage),
        rating: parseFloat(String(row.rating)) || 0,
        totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
        ranking: row.ranking ? parseInt(String(row.ranking)) : null,
        isTopUniversity: row.isTopUniversity ?? 0,
        topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
        universityType: row.universityType || null,
        estyear: row.estyear || null,
        verified: row.verified ?? 0,
        totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
        streams: cm?.streams?.filter(Boolean) ?? [],
        min_fees: cm?.min_fees ? parseInt(String(cm.min_fees)) : null,
        max_fees: cm?.max_fees ? parseInt(String(cm.max_fees)) : null,
      };
    });

    return NextResponse.json({ success: true, colleges, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error("[/api/search/colleges]", err);
    return NextResponse.json({ success: false, colleges: [], total: 0, page: 1, totalPages: 0, limit }, { status: 500 });
  }
}
