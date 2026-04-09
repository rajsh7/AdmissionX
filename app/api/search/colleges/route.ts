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

    // -- Resolve all filter IDs in parallel ----------------------------------
    const cityIntId = cityId ? (isNaN(parseInt(cityId)) ? null : parseInt(cityId)) : null;

    const [faDoc, degDoc] = await Promise.all([
      stream ? db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } }) : null,
      degree ? db.collection("degree").findOne({ pageslug: degree }, { projection: { id: 1 } }) : null,
    ]);

    // -- Resolve collegemaster IDs for stream/degree/fees in parallel ---------
    const cmFilters: Promise<unknown[]>[] = [];
    if (faDoc?.id != null) cmFilters.push(
      db.collection("collegemaster").find({ functionalarea_id: faDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
        .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
    );
    if (degDoc?.id != null) cmFilters.push(
      db.collection("collegemaster").find({ degree_id: degDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
        .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
    );
    if (feesMax != null && !isNaN(feesMax)) cmFilters.push(
      db.collection("collegemaster").find({ fees: { $gt: 0, $lte: feesMax } }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
        .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
    );

    const resolvedIds = await Promise.all(cmFilters);

    // Intersect all id sets
    let filteredIds: unknown[] | null = null;
    for (const ids of resolvedIds) {
      filteredIds = filteredIds
        ? filteredIds.filter((id) => (ids as unknown[]).some((x) => String(x) === String(id)))
        : ids;
    }

    // -- Build match ----------------------------------------------------------
    const match: Record<string, unknown> = {};
    if (filteredIds) match.id = { $in: filteredIds };
    if (cityIntId) match.registeredAddressCityId = cityIntId;
    if (type === "top") match.isShowOnTop = 1;
    else if (type === "university") match.isTopUniversity = 1;
    else if (type === "abroad") match.registeredAddressCountryId = { $ne: 1 };

    // -- Build aggregation pipeline -------------------------------------------
    const basePipeline: object[] = [
      { $match: match },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (q.length >= 2) {
      basePipeline.push({
        $match: {
          $or: [
            { "user.firstname": { $regex: q, $options: "i" } },
            { registeredSortAddress: { $regex: q, $options: "i" } },
            { slug: { $regex: q, $options: "i" } },
          ],
        },
      });
    }

    const sortStage: Record<string, 1 | -1> =
      sort === "ranking" ? { ranking: 1 } :
      sort === "newest" ? { created_at: -1 } :
      { rating: -1, totalRatingUser: -1 };

    basePipeline.push({ $sort: sortStage });

    // -- Run count + data fetch in parallel, with enrichment inside pipeline --
    const [countResult, dataRows] = await Promise.all([
      db.collection("collegeprofile").aggregate([...basePipeline, { $count: "total" }]).toArray(),
      db.collection("collegeprofile").aggregate([
        ...basePipeline,
        { $skip: offset },
        { $limit: limit },
        { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
        { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
        // Inline stream/fees enrichment — avoids a separate round trip
        { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
        { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
        {
          $project: {
            slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
            isTopUniversity: 1, topUniversityRank: 1, universityType: 1, estyear: 1,
            verified: 1, totalStudent: 1, registeredSortAddress: 1, id: 1,
            name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
            city_name: "$city.name",
            streams: { $setUnion: ["$fa.name", []] },
            min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
            max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
          },
        },
      ]).toArray(),
    ]);

    const total = countResult[0]?.total ?? 0;

    const colleges = dataRows.map((row) => {
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
        streams: Array.isArray(row.streams) ? row.streams.filter(Boolean) : [],
        min_fees: row.min_fees ?? null,
        max_fees: row.max_fees ?? null,
      };
    });

    return NextResponse.json({ success: true, colleges, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error("[/api/search/colleges]", err);
    return NextResponse.json({ success: false, colleges: [], total: 0, page: 1, totalPages: 0, limit }, { status: 500 });
  }
}
