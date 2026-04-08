import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteProfileRow(id: string) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("collegeprofile").deleteOne({ slug: id });
  } catch (e) {
    console.error("[admin/colleges/profile deleteAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/", "layout");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id: number | string;
  slug: string;
  name: string;
  email: string | null;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  isShowOnHome: number;
  isShowOnTop: number;
  city_name: string | null;
  state_name: string | null;
  count_courses: number;
  count_faculty: number;
  count_reviews: number;
  count_placements: number;
  count_scholarships: number;
  created_at: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toBool(v: unknown, trueVal = 1): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return trueVal === 1 ? v : !v;
  const n = Number(v);
  return !isNaN(n) ? n === trueVal : false;
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "" || s.toUpperCase() === "NULL") return null;
  return s;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q             = (sp.q ?? "").trim();
  const verified      = sp.verified ?? "";
  const isTopUniversity = sp.isTopUniversity ?? "";
  const universityType  = sp.universityType ?? "";
  const showOnHome    = sp.showOnHome ?? "";
  const showOnTop     = sp.showOnTop ?? "";
  const page          = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset        = (page - 1) * PAGE_SIZE;

  // ── Build MongoDB filter ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mongoFilter: Record<string, any> = {};

  if (q) {
    const db0 = await getDb();
    // Find users whose firstname matches the query — these are the college names
    const matchedUsers = await db0
      .collection("users")
      .find(
        { firstname: { $regex: q, $options: "i" } },
        { projection: { id: 1, _id: 1 } },
      )
      .limit(200)
      .toArray();
    const matchedUserIds = matchedUsers.map((u) => u.id ?? u._id);

    mongoFilter.$or = [
      { slug:              { $regex: q, $options: "i" } },
      { contactpersonname: { $regex: q, $options: "i" } },
      ...(matchedUserIds.length > 0 ? [{ users_id: { $in: matchedUserIds } }] : []),
    ];
  }

  if (verified === "1") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      { $or: [{ verified: 1 }, { verified: true }, { verified: "1" }] },
    ];
  } else if (verified === "0") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      {
        $or: [
          { verified: 0 },
          { verified: false },
          { verified: "0" },
          { verified: null },
          { verified: { $exists: false } },
        ],
      },
    ];
  }

  if (isTopUniversity === "1") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      { $or: [{ isTopUniversity: 1 }, { isTopUniversity: true }] },
    ];
  } else if (isTopUniversity === "0") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      {
        $or: [
          { isTopUniversity: 0 },
          { isTopUniversity: false },
          { isTopUniversity: null },
          { isTopUniversity: { $exists: false } },
        ],
      },
    ];
  }

  if (universityType) {
    mongoFilter.universityType = { $regex: universityType, $options: "i" };
  }

  if (showOnHome === "1") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      { $or: [{ isShowOnHome: 1 }, { isShowOnHome: true }] },
    ];
  } else if (showOnHome === "0") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      {
        $or: [
          { isShowOnHome: 0 },
          { isShowOnHome: false },
          { isShowOnHome: null },
          { isShowOnHome: { $exists: false } },
        ],
      },
    ];
  }

  if (showOnTop === "1") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      { $or: [{ isShowOnTop: 1 }, { isShowOnTop: true }] },
    ];
  } else if (showOnTop === "0") {
    mongoFilter.$and = [
      ...(mongoFilter.$and ?? []),
      {
        $or: [
          { isShowOnTop: 0 },
          { isShowOnTop: false },
          { isShowOnTop: null },
          { isShowOnTop: { $exists: false } },
        ],
      },
    ];
  }

  // ── Query MongoDB ─────────────────────────────────────────────────────────
  const db  = await getDb();
  const col = db.collection("collegeprofile");

  const [total, rawProfiles] = await Promise.all([
    col.countDocuments(mongoFilter),
    col
      .find(mongoFilter, {
        projection: {
          id: 1,
          slug: 1,
          bannerimage: 1,
          rating: 1,
          ranking: 1,
          verified: 1,
          isTopUniversity: 1,
          topUniversityRank: 1,
          universityType: 1,
          isShowOnHome: 1,
          isShowOnTop: 1,
          registeredAddressCityId: 1,
          contactpersonname: 1,
          email: 1,
          users_id: 1,
          created_at: 1,
        },
      })
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
  ]);

  // ── Batch-fetch users for names/emails ────────────────────────────────────
  const userIds = [
    ...new Set(
      rawProfiles
        .map((p) => p.users_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];
  const usersMap: Record<string, { firstname?: string; email?: string }> = {};
  if (userIds.length > 0) {
    const userDocs = await db
      .collection("users")
      .find(
        { $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] },
        { projection: { _id: 1, id: 1, firstname: 1, email: 1 } },
      )
      .toArray();
    for (const u of userDocs) {
      const key = String(u.id ?? u._id);
      usersMap[key] = { firstname: u.firstname, email: u.email };
    }
  }

  // ── Batch-fetch city names ────────────────────────────────────────────────
  const cityIds = [
    ...new Set(
      rawProfiles
        .map((p) => p.registeredAddressCityId)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];
  const cityMap: Record<string, string> = {};
  if (cityIds.length > 0) {
    const cityDocs = await db
      .collection("city")
      .find(
        { $or: [{ _id: { $in: cityIds } }, { id: { $in: cityIds } }] },
        { projection: { _id: 1, id: 1, name: 1 } },
      )
      .toArray();
    for (const c of cityDocs) {
      const key = String(c.id ?? c._id);
      cityMap[key] = String(c.name ?? "");
    }
  }

  // ── Batch-count related collections ──────────────────────────────────────
  const profileIds = rawProfiles
    .map((p) => p.id ?? p._id)
    .filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countCol = async (name: string): Promise<Record<string, number>> => {
    if (!profileIds.length) return {};
    try {
      const docs = await db
        .collection(name)
        .aggregate([
          { $match: { collegeprofile_id: { $in: profileIds } } },
          { $group: { _id: "$collegeprofile_id", n: { $sum: 1 } } },
        ])
        .toArray();
      return Object.fromEntries(docs.map((d) => [String(d._id), d.n as number]));
    } catch {
      return {};
    }
  };

  const [cCourses, cFaculty, cReviews, cPlacements, cScholarships] =
    await Promise.all([
      countCol("collegemaster"),
      countCol("faculty"),
      countCol("college_reviews"),
      countCol("placement"),
      countCol("college_scholarships"),
    ]);

  // ── Shape ProfileRow[] ────────────────────────────────────────────────────
  const profiles: ProfileRow[] = rawProfiles.map((p) => {
    const uid     = String(p.users_id ?? "");
    const cityId  = String(p.registeredAddressCityId ?? "");
    const docId   = String(p.id ?? p._id ?? "");
    const user    = usersMap[uid] ?? {};
    const name    =
      (user.firstname?.trim() || toStr(p.contactpersonname) || toStr(p.slug)) ?? "";

    return {
      id:               p.id ?? String(p._id),
      slug:             toStr(p.slug) ?? "",
      name,
      email:            toStr(user.email ?? p.email) ?? null,
      bannerimage:      toStr(p.bannerimage) ?? null,
      rating:           parseFloat(String(p.rating ?? 0)) || 0,
      ranking:          toNum(p.ranking),
      verified:         toBool(p.verified) ? 1 : 0,
      isTopUniversity:  toBool(p.isTopUniversity) ? 1 : 0,
      topUniversityRank: toNum(p.topUniversityRank),
      universityType:   toStr(p.universityType) ?? null,
      isShowOnHome:     toBool(p.isShowOnHome) ? 1 : 0,
      isShowOnTop:      toBool(p.isShowOnTop) ? 1 : 0,
      city_name:        cityMap[cityId] || null,
      state_name:       null,
      count_courses:    cCourses[docId]     ?? 0,
      count_faculty:    cFaculty[docId]     ?? 0,
      count_reviews:    cReviews[docId]     ?? 0,
      count_placements: cPlacements[docId]  ?? 0,
      count_scholarships: cScholarships[docId] ?? 0,
      created_at:       p.created_at ? String(p.created_at) : null,
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── University type options (distinct, clean) ─────────────────────────────
  const rawTypes = await col
    .distinct("universityType", {
      universityType: { $nin: [null, "", "NULL"] },
    });
  const universityTypeOptions = (rawTypes as string[])
    .map((t) => String(t).trim())
    .filter((t) => t && t.toUpperCase() !== "NULL")
    .sort();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileClient
        profiles={profiles}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        q={q}
        filters={{
          verified,
          isTopUniversity,
          universityType,
          showOnHome,
          showOnTop,
        }}
        universityTypeOptions={universityTypeOptions}
        onDelete={deleteProfileRow}
      />
    </Suspense>
  );
}
