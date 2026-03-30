import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterCollegeResult {
  name: string;
  location: string;
  image: string;
  rating: number;
  abbr: string;
  abbrBg: string;
  tags: string[];
  tuition: string;
  href: string;
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
        },
      },
    ])
    .toArray();

  return dataRows.map((row) => {
    const name = row.name || "University";
    const words = name.split(" ");
    const abbr =
      words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const rawImage = row.image ?? "";
    const image = rawImage
      ? rawImage.startsWith("http") || rawImage.startsWith("/")
        ? rawImage
        : `/uploads/${rawImage}`
      : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

    return {
      name,
      location: row.location || "India",
      image,
      rating: Math.round((Number(row.rating) || 4.5) * 10) / 10,
      abbr,
      abbrBg: "bg-primary",
      tags: ["Featured", "Top Ranked"],
      tuition: "View Fees",
      href: `/university/${row.slug || ""}`,
    };
  });
}

// ─── Cached wrapper ───────────────────────────────────────────────────────────
export const getCachedCollegesForSlug = unstable_cache(
  fetchCollegesForSlug,
  ["home-filter-colleges-v1"],
  { revalidate: 300 },
);
