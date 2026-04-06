import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import { saveUpload } from "@/lib/upload-utils";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteProfileRow(id: string) {
  "use server";
  try {
    const db = await getDb();
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection("collegeprofile").deleteOne(filter);
  } catch (e) {
    console.error("[admin/colleges/profile deleteAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/", "layout");
}

async function addProfileRow(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("bannerimage_file") as File;
    let bannerimage = "";
    if (bannerFile && bannerFile.size > 0) {
      const slug = (formData.get("slug") as string) || "college";
      bannerimage = await saveUpload(bannerFile, `college/${slug}`, "banner");
    }
    const data = Object.fromEntries(formData.entries());
    const db = await getDb();
    await db.collection("collegeprofile").insertOne({
      users_id:               data.users_id ? parseInt(data.users_id as string, 10) : null,
      slug:                   data.slug,
      bannerimage,
      rating:                 data.rating ? parseFloat(data.rating as string) : 0,
      ranking:                data.ranking ? parseInt(data.ranking as string, 10) : null,
      verified:               data.verified === "on" ? 1 : 0,
      isTopUniversity:        data.isTopUniversity === "on" ? 1 : 0,
      topUniversityRank:      data.topUniversityRank ? parseInt(data.topUniversityRank as string, 10) : null,
      universityType:         data.universityType,
      registeredAddressCityId: data.registeredAddressCityId ? parseInt(data.registeredAddressCityId as string, 10) : null,
      created_at:             new Date(),
    });
  } catch (e) {
    console.error("[admin/colleges/profile addAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/", "layout");
}

async function updateProfileRow(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("bannerimage_file") as File;
    let bannerimage = formData.get("bannerimage_existing") as string;
    const data = Object.fromEntries(formData.entries());
    if (bannerFile && bannerFile.size > 0) {
      const slug = (data.slug as string) || "college";
      bannerimage = await saveUpload(bannerFile, `college/${slug}`, "banner");
    }
    const id = data.id as string;
    const db = await getDb();
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection("collegeprofile").updateOne(filter, { $set: {
      users_id:               data.users_id ? parseInt(data.users_id as string, 10) : null,
      slug:                   data.slug,
      bannerimage,
      rating:                 data.rating ? parseFloat(data.rating as string) : 0,
      ranking:                data.ranking ? parseInt(data.ranking as string, 10) : null,
      verified:               data.verified === "on" ? 1 : 0,
      isTopUniversity:        data.isTopUniversity === "on" ? 1 : 0,
      topUniversityRank:      data.topUniversityRank ? parseInt(data.topUniversityRank as string, 10) : null,
      universityType:         data.universityType,
      registeredAddressCityId: data.registeredAddressCityId ? parseInt(data.registeredAddressCityId as string, 10) : null,
      updated_at:             new Date(),
    }});
  } catch (e) {
    console.error("[admin/colleges/profile updateAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id: string;
  users_id: number;
  slug: string;
  name: string;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  registeredAddressCityId: number | null;
  city_name: string | null;
  count_courses: number;
  count_facilities: number;
  count_faculty: number;
  count_placements: number;
  count_admissions: number;
  count_events: number;
  count_faqs: number;
  count_management: number;
  count_reviews: number;
  count_scholarships: number;
  count_sports: number;
  created_at: Date | string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db  = await getDb();
  const col = db.collection("collegeprofile");

  const mongoFilter: Record<string, unknown> = {};
  if (q) {
    mongoFilter.$or = [
      { slug:                    { $regex: q, $options: "i" } },
      { registeredSortAddress:   { $regex: q, $options: "i" } },
      { contactpersonname:       { $regex: q, $options: "i" } },
    ];
  }

  const [total, rawProfiles] = await Promise.all([
    col.countDocuments(mongoFilter),
    col.find(mongoFilter).sort({ created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
  ]);

  // Fetch city names for the profiles that have a city id
  const cityIds = [...new Set(rawProfiles.map(p => p.registeredAddressCityId).filter(Boolean))];
  const cities = cityIds.length
    ? await db.collection("city").find({ id: { $in: cityIds } }).toArray()
    : [];
  const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name ?? c.city_name ?? ""]));

  // Count related docs per profile
  const profileIds = rawProfiles.map(p => p.id).filter(Boolean);
  const countCol = async (name: string) => {
    if (!profileIds.length) return {} as Record<number, number>;
    const docs = await db.collection(name).aggregate([
      { $match: { collegeprofile_id: { $in: profileIds } } },
      { $group: { _id: "$collegeprofile_id", n: { $sum: 1 } } },
    ]).toArray();
    return Object.fromEntries(docs.map(d => [d._id, d.n]));
  };

  const [cCourses, cFaculty, cPlacements, cEvents, cScholarships, cFaqs, cReviews] = await Promise.all([
    countCol("collegemaster"),
    countCol("faculty"),
    countCol("placement"),
    countCol("event"),
    countCol("college_scholarships"),
    countCol("college_faqs"),
    countCol("college_reviews"),
  ]);

  // ─── Data Mapping ──────────────────────────────────────────────────────────
  const parseNum = (val: any) => {
    if (val === null || val === undefined || String(val).trim() === "" || String(val).toUpperCase() === "NULL") return null;
    const n = parseInt(String(val), 10);
    return isNaN(n) ? null : n;
  };

  const profiles: ProfileRow[] = rawProfiles.map(p => ({
    id:                      String(p._id),
    users_id:                parseNum(p.users_id) ?? 0,
    slug:                    String(p.slug ?? "").trim(),
    name:                    String(p.contactpersonname ?? p.slug ?? "Unnamed College").trim(),
    bannerimage:             p.bannerimage && String(p.bannerimage).trim() !== "NULL" ? String(p.bannerimage).trim() : null,
    rating:                  parseFloat(String(p.rating ?? 0)) || 0,
    ranking:                 parseNum(p.ranking),
    verified:                p.verified ? 1 : 0,
    isTopUniversity:         p.isTopUniversity ? 1 : 0,
    topUniversityRank:       parseNum(p.topUniversityRank),
    universityType:          p.universityType && String(p.universityType).trim() !== "NULL" ? String(p.universityType).trim() : null,
    registeredAddressCityId: parseNum(p.registeredAddressCityId),
    city_name:               cityMap[p.registeredAddressCityId] ?? null,
    count_courses:           cCourses[p.id]     ?? 0,
    count_facilities:        0,
    count_faculty:           cFaculty[p.id]     ?? 0,
    count_placements:        cPlacements[p.id]  ?? 0,
    count_admissions:        0,
    count_events:            cEvents[p.id]      ?? 0,
    count_faqs:              cFaqs[p.id]        ?? 0,
    count_management:        0,
    count_reviews:           cReviews[p.id]     ?? 0,
    count_scholarships:      cScholarships[p.id] ?? 0,
    count_sports:            0,
    created_at:              p.created_at || null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Suspense fallback={<div className="p-6">Loading profiles...</div>}>
      <ProfileClient 
        profiles={profiles as any}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        onAdd={addProfileRow}
        onUpdate={updateProfileRow}
        onDelete={deleteProfileRow}
      />
    </Suspense>
  );
}




