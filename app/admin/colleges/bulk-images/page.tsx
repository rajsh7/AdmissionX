import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import BulkImagesClient from "./BulkImagesClient";

export const dynamic = "force-dynamic";

async function deleteCollege(slug: string) {
  "use server";
  try {
    const db = await getDb();
    const college = await db.collection("collegeprofile").findOne({ slug }, { projection: { users_id: 1, email: 1 } });
    await db.collection("collegeprofile").deleteOne({ slug });
    if (college?.email)
      await db.collection("next_college_signups").deleteOne({ email: college.email });
    if (college?.users_id)
      await db.collection("users").deleteOne({ $or: [{ id: college.users_id }, { _id: college.users_id }] });
  } catch (e) {
    console.error("[bulk-images delete]", e);
  }
  revalidatePath("/admin/colleges/bulk-images");
  revalidatePath("/admin/colleges/profile");
}

const PAGE_SIZE = 50;
const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

// Keywords that indicate a real educational institution
const EDU_KEYWORDS = [
  "college", "university", "institute", "school", "academy", "polytechnic",
  "faculty", "department", "centre", "center", "foundation", "management",
  "engineering", "medical", "law", "arts", "science", "commerce", "technology",
  "vidyalaya", "mahavidyalaya", "vishwavidyalaya", "shala", "gurukul",
  "education", "learning", "studies", "research", "campus", "iit", "nit",
  "iim", "bits", "iisc", "aiims", "dental", "pharmacy", "nursing", "b.ed",
  "d.ed", "polytechnic", "iti", "training", "vocational",
];

function isSuspiciousName(name: string): boolean {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  // Has any education keyword → real
  if (EDU_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  // Very short name
  if (lower.length < 6) return true;
  // Looks like a person name: 1-3 words, no numbers, no special chars
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length <= 3 && !/\d/.test(lower) && !/[&,\-\/]/.test(lower)) return true;
  return false;
}

function buildUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

export default async function BulkImagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const showSuspicious = sp.suspicious === "1";
  const hasImage = sp.hasImage ?? ""; // "1" = with image, "0" = without image
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const col = db.collection("collegeprofile");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filter: Record<string, any> = {};

  if (q) {
    // Also search users by firstname to catch colleges whose name lives in users collection
    const matchedUsers = await db
      .collection("users")
      .find({ firstname: { $regex: q, $options: "i" } }, { projection: { id: 1, _id: 1 } })
      .limit(500)
      .toArray();
    const matchedUserIds = matchedUsers.map((u) => u.id ?? u._id);

    filter = {
      $or: [
        { name:         { $regex: q, $options: "i" } },
        { college_name: { $regex: q, $options: "i" } },
        { collegeName:  { $regex: q, $options: "i" } },
        { slug:         { $regex: q, $options: "i" } },
        ...(matchedUserIds.length > 0 ? [{ users_id: { $in: matchedUserIds } }] : []),
      ],
    };
  }

  // hasImage filter
  if (hasImage === "1") {
    filter.bannerimage = { $exists: true, $ne: null, $not: { $eq: "" } };
  } else if (hasImage === "0") {
    filter = { ...filter, $and: [...(filter.$and ?? []), { $or: [{ bannerimage: { $exists: false } }, { bannerimage: null }, { bannerimage: "" }] }] };
  }

  const [total, raw] = await Promise.all([
    col.countDocuments(filter),
    col
      .find(filter, { projection: { slug: 1, name: 1, college_name: 1, collegeName: 1, bannerimage: 1, logoimage: 1, mosaic1: 1, users_id: 1, website: 1, description: 1 } })
      .sort({ name: 1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
  ]);

  const userIds = [...new Set(raw.map((p) => p.users_id).filter(Boolean))];
  const usersMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const users = await db
      .collection("users")
      .find({ $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] }, { projection: { id: 1, _id: 1, firstname: 1 } })
      .toArray();
    for (const u of users) {
      usersMap[String(u.id ?? u._id)] = String(u.firstname ?? "");
    }
  }

  const allColleges = raw
    .map((p) => {
      const uid = String(p.users_id ?? "");
      const name =
        (p.name && String(p.name).trim()) ||
        (p.college_name && String(p.college_name).trim()) ||
        (p.collegeName && String(p.collegeName).trim()) ||
        usersMap[uid] ||
        String(p.slug ?? "");
      const hasContent = !!(p.website || p.description);
      const suspicious = isSuspiciousName(name) && !hasContent && !p.bannerimage;
      return {
        slug: String(p.slug ?? ""),
        name,
        bannerimage: buildUrl(p.bannerimage ? String(p.bannerimage) : null),
        logoimage: buildUrl(p.logoimage ? String(p.logoimage) : null),
        hasMosaic: !!(p.mosaic1 && String(p.mosaic1).trim()),
        suspicious,
      };
    })
    .filter((c) => c.slug);

  const colleges = showSuspicious ? allColleges.filter((c) => c.suspicious) : allColleges;
  const suspiciousCount = allColleges.filter((c) => c.suspicious).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <BulkImagesClient
      colleges={colleges}
      total={total}
      page={page}
      totalPages={totalPages}
      q={q}
      showSuspicious={showSuspicious}
      suspiciousCount={suspiciousCount}
      hasImage={hasImage}
      onDelete={deleteCollege}
    />
  );
}
