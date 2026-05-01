import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

const STREAM_MAP: Record<string, string[]> = {
  "Science (PCM)": ["Engineering", "Architecture", "Computer Applications"],
  "Science (PCB)": ["Medical", "Pharmacy", "Nursing", "Dental"],
  "Commerce":      ["Management", "Commerce", "Finance"],
  "Arts":          ["Arts", "Law", "Journalism", "Social Work"],
  "Vocational":    ["Engineering", "Management", "Computer Applications"],
};

function percentScore(pct: number): number {
  if (pct >= 90) return 100;
  if (pct >= 80) return 85;
  if (pct >= 70) return 70;
  if (pct >= 60) return 55;
  if (pct >= 50) return 40;
  return 20;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
function buildImageUrl(raw: string | null): string | null {
  if (!raw || String(raw).toLowerCase() === "null") return null;
  const s = String(raw).trim();
  if (s.startsWith("http") || s.startsWith("/")) return s;
  return `${IMAGE_BASE}${s}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional search context from the search page
  const searchCityId = req.nextUrl.searchParams.get("city_id") ?? "";
  const searchQ = req.nextUrl.searchParams.get("q") ?? "";

  const db = await getDb();

  const [marksDoc, profileDoc] = await Promise.all([
    db.collection("next_student_marks").findOne({ $or: [{ student_id: id }, { student_id: payload.id }] }),
    db.collection("next_student_profiles").findOne({ student_id: id }),
  ]);

  const marks = (marksDoc ?? {}) as Record<string, unknown>;
  const profile = (profileDoc ?? {}) as Record<string, unknown>;

  const pct12 = parseFloat(String(marks.class12_percent || marks.class10_percent || "0")) || 0;
  const stream12 = String(marks.class12_stream || "").trim();
  const city = String(profile.city || "").trim();
  const state = String(profile.state || "").trim();

  const relevantStreams = STREAM_MAP[stream12] ?? ["Engineering", "Management", "Medical", "Arts", "Commerce"];

  const faRows = await db.collection("functionalarea")
    .find({ name: { $in: relevantStreams.map(s => new RegExp(`^${s}`, "i")) } })
    .project({ id: 1, name: 1 })
    .toArray();
  const faIds = faRows.map((f: any) => f.id);

  if (!faIds.length) {
    return NextResponse.json({ recommendations: [], profileSummary: { pct12, stream: stream12 || "Not specified", city: city || null, hasMarks: pct12 > 0 } });
  }

  const cmRows = await db.collection("collegemaster")
    .find({ functionalarea_id: { $in: faIds }, fees: { $gte: 500 } })
    .project({ collegeprofile_id: 1, fees: 1, functionalarea_id: 1, twelvemarks: 1 })
    .limit(5000)
    .toArray();

  const collegeMap: Record<string, { minFees: number; maxFees: number; minPctReq: number; faIds: number[] }> = {};
  for (const cm of cmRows) {
    const key = String(cm.collegeprofile_id);
    if (!collegeMap[key]) collegeMap[key] = { minFees: Infinity, maxFees: 0, minPctReq: 0, faIds: [] };
    if (cm.fees && cm.fees < collegeMap[key].minFees) collegeMap[key].minFees = cm.fees;
    if (cm.fees && cm.fees > collegeMap[key].maxFees) collegeMap[key].maxFees = cm.fees;
    const req = parseFloat(String(cm.twelvemarks || "0")) || 0;
    if (req > collegeMap[key].minPctReq) collegeMap[key].minPctReq = req;
    if (!collegeMap[key].faIds.includes(cm.functionalarea_id)) collegeMap[key].faIds.push(cm.functionalarea_id);
  }

  const eligibleIds = Object.keys(collegeMap).map(Number).filter(Boolean);
  if (!eligibleIds.length) {
    return NextResponse.json({ recommendations: [], profileSummary: { pct12, stream: stream12 || "Not specified", city: city || null, hasMarks: pct12 > 0 } });
  }

  const colleges = await db.collection("collegeprofile").aggregate([
    { $match: { id: { $in: eligibleIds } } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1, slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1,
        ranking: 1, isTopUniversity: 1, verified: 1, registeredSortAddress: 1, collegetype_id: 1,
        registeredAddressCityId: 1,
        name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
        city_name: "$city.name",
      },
    },
  ]).toArray();

  // Resolve search city to all sibling IDs (e.g. Delhi → New Delhi, Central Delhi…)
  let allSearchCityIds: number[] = [];
  if (searchCityId) {
    const searchCityDoc = await db.collection("city").findOne({ id: Number(searchCityId) }, { projection: { name: 1 } });
    const searchCityName = String(searchCityDoc?.name ?? "").trim();
    if (searchCityName) {
      const siblings = await db.collection("city")
        .find({ name: { $regex: searchCityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } })
        .project({ id: 1 }).toArray();
      allSearchCityIds = [...new Set([Number(searchCityId), ...siblings.map((c: any) => Number(c.id))])];
    } else {
      allSearchCityIds = [Number(searchCityId)];
    }
  }

  const scored = colleges.map((col: any) => {
    const key = String(col.id);
    const cm = collegeMap[key] ?? { minFees: 0, maxFees: 0, minPctReq: 0, faIds: [] };
    let score = 0;

    const pctReq = cm.minPctReq || 45;
    if (pct12 >= pctReq) score += 30;
    else if (pct12 >= pctReq - 5) score += 15;

    score += percentScore(pct12) * 0.2;

    const rating = parseFloat(String(col.rating)) || 0;
    score += Math.min(rating * 4, 20);

    const rank = parseInt(String(col.ranking)) || 999;
    if (rank <= 10) score += 15;
    else if (rank <= 50) score += 10;
    else if (rank <= 100) score += 5;
    else if (rank < 999) score += 2;

    if (col.isTopUniversity) score += 8;
    if (col.verified) score += 5;

    const colAddr = String(col.registeredSortAddress || col.city_name || "").toLowerCase();
    if (city && colAddr.includes(city.toLowerCase())) score += 10;
    else if (state && colAddr.includes(state.toLowerCase())) score += 5;
    // Strong boost if college is in the currently searched city
    if (searchCityId && allSearchCityIds.includes(Number(col.registeredAddressCityId ?? 0))) score += 20;

    const fees = cm.minFees === Infinity ? 0 : cm.minFees;
    const maxFees = cm.maxFees === Infinity ? 0 : (cm.maxFees ?? 0);
    if (fees > 0 && fees <= 50000) score += 5;
    else if (fees <= 100000) score += 3;
    else if (fees <= 200000) score += 1;

    const matchedFas = cm.faIds.filter((fid: number) => faIds.includes(fid));
    score += Math.min(matchedFas.length * 3, 9);

    const name = col.name && col.name !== col.slug ? col.name : slugToName(col.slug || "college");

    return {
      score: Math.round(score),
      college: {
        id: String(col.id),
        slug: col.slug,
        name,
        location: col.registeredSortAddress || col.city_name || "India",
        image: buildImageUrl(col.bannerimage),
        rating,
        totalRatingUser: parseInt(String(col.totalRatingUser)) || 0,
        ranking: rank < 999 ? rank : null,
        isTopUniversity: !!col.isTopUniversity,
        verified: !!col.verified,
        min_fees: fees || null,
        max_fees: maxFees || null,
        streams: faRows.filter((f: any) => cm.faIds.includes(f.id)).map((f: any) => f.name),
        pct_required: pctReq || null,
      },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const top2 = scored.slice(0, 2);

  const recommendations = top2.map(({ score, college }) => {
    const reasons: string[] = [];
    // City-specific reason
    const colCityId = colleges.find((c: any) => String(c.id) === college.id)?.registeredAddressCityId;
    if (searchCityId && allSearchCityIds.includes(Number(colCityId ?? 0))) {
      reasons.push("Located in your searched city");
    }
    if (pct12 >= 85) reasons.push(`Your ${pct12}% marks make you a strong candidate`);
    else if (pct12 >= 60) reasons.push(`Your ${pct12}% marks meet the eligibility criteria`);
    else if (pct12 > 0) reasons.push("Your academic profile is considered for admission");
    if (college.isTopUniversity) reasons.push("Ranked among India's top universities");
    if (college.ranking && college.ranking <= 50) reasons.push(`Nationally ranked #${college.ranking}`);
    if (college.verified) reasons.push("Verified institution on AdmissionX");
    if (college.streams.length > 0) reasons.push(`Offers ${college.streams.slice(0, 2).join(" & ")} programs`);
    if (college.min_fees && college.min_fees <= 100000) reasons.push(`Affordable fees from ₹${college.min_fees.toLocaleString("en-IN")}/yr`);
    return { college, score, matchPercent: Math.min(Math.round((score / 100) * 100), 98), reasons };
  });

  return NextResponse.json({
    recommendations,
    profileSummary: { pct12, stream: stream12 || "Not specified", city: city || null, hasMarks: pct12 > 0 },
  });
}
