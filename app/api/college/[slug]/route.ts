import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export interface CourseData {
  id: string | number;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
  twelvemarks: string | null;
  course_description: string | null;
}

export interface PlacementData {
  id: string | number;
  numberofrecruitingcompany: string | null;
  numberofplacementlastyear: string | null;
  ctchighest: string | null;
  ctclowest: string | null;
  ctcaverage: string | null;
  placementinfo: string | null;
}

export interface FacultyData {
  id: string | number;
  name: string | null;
  designation: string | null;
  description: string | null;
  image: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  suffix: string | null;
  languageKnown: string | null;
  stream_name: string | null;
}

export interface GalleryData {
  id: string | number;
  name: string | null;
  image: string;
  caption: string | null;
}

export interface ReviewData {
  id: string | number;
  title: string | null;
  review: string | null;
  academic: number | null;
  accommodation: number | null;
  faculty_rating: number | null;
  infrastructure: number | null;
  placement_rating: number | null;
  social: number | null;
  votes: number | null;
  created_at: string;
  reviewer_name: string;
}

export interface CutoffData {
  id: string | number;
  title: string | null;
  description: string | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
}

export interface ScholarshipData {
  id: string | number;
  title: string | null;
  description: string | null;
}

export interface FAQData {
  id: string | number;
  question: string | null;
  answer: string | null;
  refLinks: string | null;
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

export function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_BANNER;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

export function buildFacultyImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

export function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function formatFees(fees: string | null | number): string {
  if (!fees) return "—";
  const n = typeof fees === "number" ? fees : parseInt(String(fees));
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L / yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K / yr`;
  return `₹${n} / yr`;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const db = await getDb();

  // 1. Base college profile with user name, city, college type
  const collegeRows = await db.collection("collegeprofile").aggregate([
    { $match: { slug } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "collegetype", localField: "collegetype_id", foreignField: "id", as: "ctype" } },
    { $unwind: { path: "$ctype", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        slug: 1, description: 1, estyear: 1, website: 1, collegecode: 1,
        contactpersonname: 1, contactpersonemail: 1, contactpersonnumber: 1,
        rating: 1, totalRatingUser: 1, verified: 1, bannerimage: 1,
        registeredSortAddress: 1, registeredFullAddress: 1, campusSortAddress: 1,
        campusFullAddress: 1, mediumOfInstruction: 1, studyForm: 1,
        admissionStart: 1, admissionEnd: 1, totalStudent: 1, universityType: 1,
        ranking: 1, isTopUniversity: 1, topUniversityRank: 1,
        facebookurl: 1, twitterurl: 1, CCTVSurveillance: 1, ACCampus: 1, users_id: 1,
        college_name: {
          $cond: [
            { $and: [{ $ne: ["$user.firstname", null] }, { $ne: [{ $trim: { input: "$user.firstname" } }, ""] }] },
            { $trim: { input: "$user.firstname" } },
            "$slug",
          ],
        },
        city_name: "$city.name",
        college_type_name: "$ctype.name",
      },
    },
    { $limit: 1 },
  ]).toArray();

  const raw = collegeRows[0];
  if (!raw) {
    return NextResponse.json({ error: "College not found" }, { status: 404 });
  }

  const cpId = raw.id;

  // Run all sub-queries in parallel
  const [
    courseRows, placementRows, facultyRows, galleryRows, reviewRows,
    cutoffRows, scholarshipRows, admissionProcRows, faqRows, socialRows,
    managementRows, importantDateRows,
  ] = await Promise.all([
    // 2. Courses
    db.collection("collegemaster").aggregate([
      { $match: { collegeprofile_id: cpId } },
      { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "co" } },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$co", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      { $project: { course_name: "$co.name", degree_name: "$d.name", stream_name: "$fa.name", fees: 1, seats: 1, courseduration: 1, twelvemarks: 1, course_description: "$description" } },
      { $limit: 100 },
    ]).toArray(),

    // 3. Placement
    db.collection("placement").findOne({ collegeprofile_id: cpId }),

    // 4. Faculty
    db.collection("faculty").find({ collegeprofile_id: cpId }).sort({ sortorder: 1, name: 1 }).limit(60).toArray(),

    // 5. Gallery
    db.collection("gallery").find({ users_id: raw.users_id, fullimage: { $exists: true, $ne: "" } }).sort({ _id: -1 }).limit(24).toArray(),

    // 6. Reviews
    db.collection("college_reviews").aggregate([
      { $match: { collegeprofile_id: cpId, description: { $exists: true, $ne: "" } } },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, review: "$description", academic: 1, accommodation: 1, faculty_rating: "$faculty", infrastructure: 1, placement_rating: "$placement", social: 1, votes: 1, created_at: 1, reviewer_name: { $ifNull: [{ $trim: { input: "$u.firstname" } }, "Anonymous Student"] } } },
      { $sort: { created_at: -1 } },
      { $limit: 50 },
    ]).toArray(),

    // 7. Cut-offs
    db.collection("college_cut_offs").aggregate([
      { $match: { collegeprofile_id: cpId } },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
      { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "co" } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$co", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, description: 1, degree_name: "$d.name", course_name: "$co.name", stream_name: "$fa.name" } },
      { $limit: 30 },
    ]).toArray(),

    // 8. Scholarships
    db.collection("college_scholarships").find({ collegeprofile_id: cpId }).limit(20).toArray(),

    // 9. Admission procedures
    db.collection("college_admission_procedures").aggregate([
      { $match: { collegeprofile_id: cpId } },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
      { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "co" } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$co", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, description: 1, degree_name: "$d.name", course_name: "$co.name", stream_name: "$fa.name" } },
      { $limit: 30 },
    ]).toArray(),

    // 10. FAQs
    db.collection("college_faqs").find({ collegeprofile_id: cpId }).limit(30).toArray(),

    // 11. Social links
    db.collection("college_social_media_links").find({ collegeprofile_id: cpId, isActive: 1 }).toArray(),

    // 12. Management
    db.collection("college_management_details").find({ collegeprofile_id: cpId }).limit(10).toArray(),

    // 13. Important dates
    db.collection("college_admission_important_dateds").find({ collegeprofile_id: cpId }).sort({ fromdate: 1 }).limit(30).toArray(),
  ]);

  const collegeName = raw.college_name && raw.college_name !== slug ? raw.college_name : slugToName(slug);

  // Attach important dates to admission procedures
  const admissionProcedures = admissionProcRows.map((proc) => ({
    ...proc,
    important_dates: importantDateRows.filter(
      (d) => String(d.collegeAdmissionProcedure_id) === String(proc._id)
    ),
  }));

  return NextResponse.json({
    college: {
      ...raw,
      college_name: collegeName,
      image: buildImageUrl(raw.bannerimage),
      rating: parseFloat(String(raw.rating)) || 0,
      totalRatingUser: parseInt(String(raw.totalRatingUser)) || 0,
    },
    courses: courseRows,
    placement: placementRows ?? null,
    faculty: facultyRows.map((f) => ({
      ...f,
      image: buildFacultyImageUrl(f.imagename) ?? buildFacultyImageUrl(f.image_original),
    })),
    gallery: galleryRows.map((g) => ({ ...g, image: buildImageUrl(g.fullimage) })),
    reviews: reviewRows,
    cutoffs: cutoffRows,
    scholarships: scholarshipRows,
    admissionProcedures,
    faqs: faqRows,
    socialLinks: socialRows,
    managementDetails: managementRows.map((m) => ({ ...m, image: buildFacultyImageUrl(m.picture) })),
  }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
