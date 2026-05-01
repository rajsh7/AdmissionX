import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
  collegetype_id: number | null;
  estyear: string | null;
  verified: number;
  totalStudent: number | null;
  streams: string[];
  min_fees: number | null;
  max_fees: number | null;
  avg_package: string | null;
}

// collegetype_id: 1=Private College, 2=Government College, 3=Government University, 4=Private University
const OWNERSHIP_MAP: Record<string, number[]> = {
  "Private College":       [1],
  "Government College":    [2],
  "Government University": [3],
  "Private University":    [4],
};

const ALIASES: Record<string, string> = {
  "btech": "b.tech|be/b.tech|b tech", "b.tech": "b.tech|be/b.tech",
  "mtech": "m.tech|me/m.tech|m tech", "mba": "mba", "bba": "bba",
  "mbbs": "mbbs", "bca": "bca", "mca": "mca",
  "bcom": "b.com|bachelor of commerce", "mcom": "m.com|master of commerce",
  "engineering": "engineering|be/b.tech|b.tech",
  "medical": "mbbs|medical|bds|bams",
  "management": "mba|bba|management|pgdm",
};

function buildImageUrl(raw: string | null): string | null {
  if (!raw || String(raw).trim().toLowerCase() === "null") return null;
  const s = String(raw).trim();
  if (s.startsWith("http")) return s;
  return s.startsWith("/") ? s : `https://admin.admissionx.in/uploads/${s}`;
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
  const feesRanges = sp.get("fees_ranges") ? sp.get("fees_ranges")!.split(",") : [];
  const ratingRanges = sp.get("rating_ranges") ? sp.get("rating_ranges")!.split(",") : [];
  const ownerships = sp.get("ownerships") ? sp.get("ownerships")!.split(",") : [];
  const sort = sp.get("sort") ?? "rating";
  const type = (sp.get("type") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(6, parseInt(sp.get("limit") ?? "12")));
  const offset = (page - 1) * limit;

  let queryDegreeIds: number[] = [];
  let queryStreamIds: number[] = [];

  try {
    const db = await getDb();
    const cityIntId = cityId ? (isNaN(parseInt(cityId)) ? null : parseInt(cityId)) : null;

    const [faDoc, degDoc] = await Promise.all([
      stream ? db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } }) : null,
      degree ? db.collection("degree").findOne({ pageslug: degree }, { projection: { id: 1 } }) : null,
    ]);

    // Resolve collegemaster IDs for stream/degree/fees filters
    const cmFilters: Promise<unknown[]>[] = [];
    if (faDoc?.id != null) cmFilters.push(
      db.collection("collegemaster").find({ functionalarea_id: faDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
        .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
    );
    if (degDoc?.id != null) cmFilters.push(
      db.collection("collegemaster").find({ degree_id: degDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
        .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
    );
    const feeConditions: object[] = [];
    if (feesMax != null && !isNaN(feesMax)) feeConditions.push({ fees: { $gt: 0, $lte: feesMax } });
    if (feesRanges.length > 0) {
      for (const rangeStr of feesRanges) {
        const [minStr, maxStr] = rangeStr.split("-");
        feeConditions.push({ fees: { $gt: parseInt(minStr) || 0, $lte: parseInt(maxStr) || 999999999 } });
      }
    }
    if (feeConditions.length > 0) {
      cmFilters.push(
        db.collection("collegemaster").find({ $or: feeConditions }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
          .then((r) => [...new Set(r.map((c) => c.collegeprofile_id))])
      );
    }

    const resolvedIds = await Promise.all(cmFilters);
    let filteredIds: unknown[] | null = null;
    for (const ids of resolvedIds) {
      filteredIds = filteredIds
        ? filteredIds.filter((id) => (ids as unknown[]).some((x) => String(x) === String(id)))
        : ids;
    }

    // Resolve q → degree/stream IDs for course-specific fees
    if (q.length >= 2) {
      const qLower = q.toLowerCase().replace(/\s+/g, "");
      const aliasPattern = ALIASES[qLower] ?? q;
      const courseRegex = { $regex: aliasPattern, $options: "i" };
      const [qDegrees, qStreams] = await Promise.all([
        db.collection("degree").find({ name: courseRegex }).project({ id: 1 }).toArray(),
        db.collection("functionalarea").find({ name: courseRegex }).project({ id: 1 }).toArray(),
      ]);
      queryDegreeIds = qDegrees.map((d: any) => d.id).filter(Boolean);
      queryStreamIds = qStreams.map((s: any) => s.id).filter(Boolean);

      if (queryDegreeIds.length > 0 || queryStreamIds.length > 0) {
        const cmFilter: Record<string, unknown>[] = [];
        if (queryDegreeIds.length > 0) cmFilter.push({ degree_id: { $in: queryDegreeIds } });
        if (queryStreamIds.length > 0) cmFilter.push({ functionalarea_id: { $in: queryStreamIds } });
        const qCpIds = await db.collection("collegemaster")
          .find(cmFilter.length === 1 ? cmFilter[0] : { $or: cmFilter }, { projection: { collegeprofile_id: 1 } })
          .limit(10000).toArray()
          .then((r) => [...new Set(r.map((x: any) => Number(x.collegeprofile_id)))]);
        // Intersect with existing filteredIds if any
        filteredIds = filteredIds
          ? filteredIds.filter((id) => qCpIds.includes(Number(id)))
          : qCpIds;
      }
    }
    if (queryDegreeIds.length === 0 && degDoc?.id != null) queryDegreeIds = [degDoc.id];
    if (queryStreamIds.length === 0 && faDoc?.id != null) queryStreamIds = [faDoc.id];

    // Build match
    const match: Record<string, unknown> = {};
    if (filteredIds && (filteredIds as unknown[]).length > 0) match.id = { $in: filteredIds };
    if (cityIntId) {
      const cityDoc = await db.collection("city").findOne({ id: cityIntId }, { projection: { name: 1 } });
      const cityName = String(cityDoc?.name ?? "").trim();
      const cityOr: Record<string, unknown>[] = [{ registeredAddressCityId: cityIntId }];
      if (cityName) {
        cityOr.push({ registeredSortAddress: { $regex: cityName, $options: "i" } });
        cityOr.push({ registeredFullAddress: { $regex: cityName, $options: "i" } });
        cityOr.push({ campusSortAddress: { $regex: cityName, $options: "i" } });
      }
      match.$and = [{ $or: cityOr }];
    }
    if (type === "top") match.isShowOnTop = 1;
    else if (type === "university") match.isTopUniversity = 1;
    else if (type === "abroad") match.registeredAddressCountryId = { $ne: 1 };

    if (ownerships.length > 0) {
      const typeIds = ownerships.flatMap((o) => OWNERSHIP_MAP[o] ?? []);
      if (typeIds.length > 0) match.collegetype_id = { $in: typeIds };
    }
    if (ratingRanges.length > 0) {
      match.$or = ratingRanges.map((r) => {
        const [min, max] = r.split("-");
        return { rating: { $gt: parseFloat(min), $lte: parseFloat(max) } };
      });
    }

    // When searching a course with no explicit sort, default to fees
    const effectiveSort = (q.length >= 2 && (queryDegreeIds.length > 0 || queryStreamIds.length > 0) && sort === "rating") ? "fees" : sort;
    const isFeeSort = effectiveSort === "fees";

    const basePipeline: object[] = [
      { $match: match },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    // Note: course-based q (e.g. "Btech") is already resolved to filteredIds above.
    // Only apply text match for non-course queries (no degree/stream match found).
    if (q.length >= 2 && queryDegreeIds.length === 0 && queryStreamIds.length === 0) {
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

    const preSortStage: Record<string, 1 | -1> =
      effectiveSort === "ranking" ? { ranking: 1 } :
      effectiveSort === "newest" ? { created_at: -1 } :
      { rating: -1, totalRatingUser: -1 };

    basePipeline.push({ $sort: preSortStage });

    // For fees sort: fetch large pool so aggregation can sort by computed min_fees
    const fetchLimit = isFeeSort ? Math.max(limit * 20, 240) : limit;
    const fetchOffset = isFeeSort ? 0 : offset;

    const filteredCmExpr = (queryDegreeIds.length > 0 || queryStreamIds.length > 0)
      ? {
          $filter: {
            input: "$cm", as: "c",
            cond: {
              $and: [
                { $gt: ["$$c.fees", 0] },
                { $or: [
                  ...(queryDegreeIds.length > 0 ? [{ $in: ["$$c.degree_id", queryDegreeIds] }] : []),
                  ...(queryStreamIds.length > 0 ? [{ $in: ["$$c.functionalarea_id", queryStreamIds] }] : []),
                ]},
              ],
            },
          },
        }
      : { $filter: { input: "$cm", as: "c", cond: { $gt: ["$$c.fees", 0] } } };

    const [countResult, dataRows] = await Promise.all([
      db.collection("collegeprofile").aggregate([...basePipeline, { $count: "total" }]).toArray(),
      db.collection("collegeprofile").aggregate([
        ...basePipeline,
        { $skip: fetchOffset },
        { $limit: fetchLimit },
        { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
        { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "placement", localField: "id", foreignField: "collegeprofile_id", as: "placement" } },
        { $unwind: { path: "$placement", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
        { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
        { $addFields: { filtered_cm: filteredCmExpr } },
        {
          $project: {
            slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
            isTopUniversity: 1, topUniversityRank: 1, universityType: 1, collegetype_id: 1, estyear: 1,
            verified: 1, totalStudent: 1, registeredSortAddress: 1, id: 1,
            name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
            city_name: "$city.name",
            streams: { $setUnion: ["$fa.name", []] },
            min_fees: { $min: "$filtered_cm.fees" },
            max_fees: { $max: "$filtered_cm.fees" },
            avg_package: "$placement.ctcaverage",
          },
        },
        // Only filter to colleges with fees when sorting by fees
        ...(isFeeSort ? [{ $match: { min_fees: { $gt: 0 } } }] : []),
        ...(isFeeSort ? [
          { $sort: { min_fees: 1 as const } },
          { $skip: offset },
          { $limit: limit },
        ] : []),
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
        collegetype_id: row.collegetype_id ? parseInt(String(row.collegetype_id)) : null,
        estyear: row.estyear || null,
        verified: row.verified ?? 0,
        totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
        streams: Array.isArray(row.streams) ? row.streams.filter(Boolean) : [],
        min_fees: row.min_fees ?? null,
        max_fees: row.max_fees ?? null,
        avg_package: row.avg_package ? `₹ ${row.avg_package} LPA` : "₹ 4.5 LPA",
      };
    });

    return NextResponse.json({ success: true, colleges, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error("[/api/search/colleges]", err);
    return NextResponse.json({ success: false, colleges: [], total: 0, page: 1, totalPages: 0, limit }, { status: 500 });
  }
}

