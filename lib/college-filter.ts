import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db";

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterCollegeResult {
  name: string;
  location: string;
  image: string;
  rating: number;
  totalRatingUser: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
  avgPackage?: string;
  offeredCourses?: string[];
}

// ─── UI-label → DB pageslug map ───────────────────────────────────────────────
export const CATEGORY_SLUG: Record<string, string> = {
  MBA: "management",
  Engineering: "engineering",
  MBBS: "medicine",
  "B.Com": "commerce",
  Design: "design",
  Fashion: "design",
  Pharmacy: "pharmacy",
  Humanities: "arts",
};

// ─── Core fetcher ─────────────────────────────────────────────────────────────

export async function fetchCollegesForSlug(
  slug: string,
): Promise<FilterCollegeResult[]> {
  try {
    const db = await getDb();

    // Step 1: resolve pageslug → functionalarea id
    const fa = await db
      .collection("functionalarea")
      .findOne({ pageslug: slug }, { projection: { id: 1 } });
    if (!fa) return [];

    const faId = fa.id;

    // Step 2: collect up to 300 distinct college ids for this stream
    const cmRows = await db
      .collection("collegemaster")
      .find({ functionalarea_id: faId }, { projection: { collegeprofile_id: 1 } })
      .limit(300)
      .toArray();
    if (!cmRows.length) return [];

    const candidateIds = [...new Set(cmRows.map((r) => r.collegeprofile_id))];

    // Step 3: rank by rating, keep top 8
    const topRows = await db
      .collection("collegeprofile")
      .find({ id: { $in: candidateIds } })
      .sort({ rating: -1, totalRatingUser: -1 })
      .limit(8)
      .project({ id: 1 })
      .toArray();
    if (!topRows.length) return [];

    const topIds = topRows.map((r) => r.id);

    // Step 4: enrich with user name
    const dataRows = await db
      .collection("collegeprofile")
      .aggregate([
        { $match: { id: { $in: topIds } } },
        {
          $lookup: {
            from: "users",
            localField: "users_id",
            foreignField: "id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "placement",
            localField: "id",
            foreignField: "collegeprofile_id",
            as: "placement",
          },
        },
        { $unwind: { path: "$placement", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "collegemaster",
            localField: "id",
            foreignField: "collegeprofile_id",
            as: "cm",
          },
        },
        {
          $lookup: {
            from: "functionalarea",
            localField: "cm.functionalarea_id",
            foreignField: "id",
            as: "fa",
          },
        },
        {
          $project: {
            slug: 1,
            name: {
              $cond: [
                { $and: [{ $ne: ["$user.firstname", null] }, { $ne: [{ $trim: { input: "$user.firstname" } }, ""] }] },
                { $trim: { input: "$user.firstname" } },
                "$slug",
              ],
            },
            location: "$registeredSortAddress",
            image: "$bannerimage",
            rating: 1,
            totalRatingUser: 1,
            avgPackage: "$placement.ctcaverage",
            streams: { $setUnion: ["$fa.name", []] },
            min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
          },
        },
      ])
      .toArray();

    return dataRows.map((row) => {
      const rawName = (row.name || "").trim();
      const name = rawName && rawName !== row.slug ? rawName : slugToName(row.slug || "university");
      const words = name.split(" ");
      const abbr =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

      const FALLBACK = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";
      const rawImage = (row.image ?? "").trim();
      const isValid = rawImage && rawImage.toUpperCase() !== "NULL" && !rawImage.toUpperCase().includes("NULL");
      const image = isValid
        ? rawImage.startsWith("http") || rawImage.startsWith("/")
          ? rawImage
          : `https://admin.admissionx.in/uploads/${rawImage}`
        : FALLBACK;

      const fees = row.min_fees && Number(row.min_fees) > 0
        ? `₹${Number(row.min_fees).toLocaleString('en-IN')}`
        : "Contact for fees";

      return {
        name,
        location: (row.location || "India").trim(),
        image,
        rating: Math.round((Number(row.rating) || 4.5) * 10) / 10,
        totalRatingUser: Number(row.totalRatingUser) || 20,
        abbr,
        abbrBg: "bg-primary",
        tags: ["Featured", "Top Ranked"],
        tuition: fees,
        href: `/college/${row.slug || ""}`,
        avgPackage: row.avgPackage ? `₹ ${row.avgPackage} LPA` : "₹ 4.5 LPA",
        offeredCourses: Array.isArray(row.streams) ? row.streams.filter(Boolean).slice(0, 4) : [],
      };
    });
  } catch (error) {
    console.error("[fetchCollegesForSlug] Error fetching colleges:", error);
    return [];
  }
}

// ─── Cached wrapper ───────────────────────────────────────────────────────────
export const getCachedCollegesForSlug = unstable_cache(
  fetchCollegesForSlug,
  ["home-filter-colleges-v4"],
  { revalidate: 300 },
);
