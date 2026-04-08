import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `https://admin.admissionx.in/uploads/${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!slugs.length) return NextResponse.json({ colleges: [] });

  const db = await getDb();

  const profiles = await db.collection("collegeprofile").aggregate([
    { $match: { slug: { $in: slugs } } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1,
        ranking: 1, universityType: 1, estyear: 1, totalStudent: 1,
        registeredSortAddress: 1, website: 1, id: 1,
        name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
        city_name: "$city.name",
      },
    },
  ]).toArray();

  // For each college get placement + courses
  const results = await Promise.all(profiles.map(async (p) => {
    const cpId = p.id ?? p._id;

    const [placement, courseStats] = await Promise.all([
      db.collection("placement").findOne({ collegeprofile_id: cpId }),
      db.collection("collegemaster").aggregate([
        { $match: { collegeprofile_id: cpId } },
        {
          $group: {
            _id: null,
            total_courses: { $sum: 1 },
            min_fees: { $min: { $cond: [{ $gt: ["$fees", 0] }, "$fees", null] } },
            max_fees: { $max: "$fees" },
            streams: { $addToSet: "$functionalarea_id" },
          },
        },
      ]).toArray(),
    ]);

    const cs = courseStats[0] ?? {};

    return {
      slug: p.slug,
      name: p.name && p.name !== p.slug ? p.name : slugToName(p.slug),
      image: buildImageUrl(p.bannerimage),
      location: p.registeredSortAddress || p.city_name || "India",
      ranking: p.ranking && p.ranking !== 999 ? p.ranking : null,
      rating: parseFloat(String(p.rating)) || 0,
      totalRatingUser: parseInt(String(p.totalRatingUser)) || 0,
      universityType: p.universityType && p.universityType !== "NULL" ? p.universityType : null,
      estyear: p.estyear ?? null,
      totalStudent: p.totalStudent ?? null,
      website: p.website ?? null,
      // Fees
      min_fees: cs.min_fees ?? null,
      max_fees: cs.max_fees ?? null,
      total_courses: cs.total_courses ?? 0,
      total_streams: (cs.streams ?? []).length,
      // Placement
      placement_companies: placement?.numberofrecruitingcompany?.trim() || null,
      placement_last_year: placement?.numberofplacementlastyear?.trim() || null,
      ctc_highest: placement?.ctchighest?.trim() || null,
      ctc_lowest: placement?.ctclowest?.trim() || null,
      ctc_average: placement?.ctcaverage?.trim() || null,
    };
  }));

  // Return in same order as requested slugs
  const ordered = slugs.map((s) => results.find((r) => r.slug === s)).filter(Boolean);

  return NextResponse.json({ colleges: ordered });
}
