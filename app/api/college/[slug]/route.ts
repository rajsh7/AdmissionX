import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface CollegeBase {
  id: number;
  slug: string;
  college_name: string;
  description: string | null;
  estyear: string | null;
  website: string | null;
  collegecode: string | null;
  contactpersonname: string | null;
  contactpersonemail: string | null;
  contactpersonnumber: string | null;
  rating: number;
  totalRatingUser: number;
  verified: number;
  image: string;
  bannerimage: string | null;
  registeredSortAddress: string | null;
  registeredFullAddress: string | null;
  campusSortAddress: string | null;
  campusFullAddress: string | null;
  mediumOfInstruction: string | null;
  studyForm: string | null;
  admissionStart: string | null;
  admissionEnd: string | null;
  totalStudent: string | null;
  universityType: string | null;
  college_type_name: string | null;
  ranking: string | null;
  isTopUniversity: number;
  topUniversityRank: string | null;
  facebookurl: string | null;
  twitterurl: string | null;
  CCTVSurveillance: number;
  ACCampus: number;
  users_id: number;
  city_name: string | null;
}

export interface CourseData {
  id: number;
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
  id: number;
  numberofrecruitingcompany: string | null;
  numberofplacementlastyear: string | null;
  ctchighest: string | null;
  ctclowest: string | null;
  ctcaverage: string | null;
  placementinfo: string | null;
}

export interface FacultyData {
  id: number;
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
  id: number;
  name: string | null;
  image: string;
  caption: string | null;
}

export interface ReviewData {
  id: number;
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
  id: number;
  title: string | null;
  description: string | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
}

export interface ScholarshipData {
  id: number;
  title: string | null;
  description: string | null;
}

export interface AdmissionProcedureData {
  id: number;
  title: string | null;
  description: string | null;
  degree_name: string | null;
  course_name: string | null;
  stream_name: string | null;
  important_dates: ImportantDateData[];
}

export interface ImportantDateData {
  id: number;
  eventName: string | null;
  fromdate: string | null;
  todate: string | null;
  procedure_title: string | null;
  collegeAdmissionProcedure_id: number;
}

export interface FAQData {
  id: number;
  question: string | null;
  answer: string | null;
  refLinks: string | null;
}

export interface SocialLinkData {
  id: number;
  title: string | null;
  url: string | null;
}

export interface ManagementData {
  id: number;
  suffix: string | null;
  name: string | null;
  designation: string | null;
  gender: string | null;
  image: string | null;
  about: string | null;
  emailaddress: string | null;
  phoneno: string | null;
}

export interface CollegeAPIResponse {
  college: CollegeBase;
  courses: CourseData[];
  placement: PlacementData | null;
  faculty: FacultyData[];
  gallery: GalleryData[];
  reviews: ReviewData[];
  cutoffs: CutoffData[];
  scholarships: ScholarshipData[];
  admissionProcedures: AdmissionProcedureData[];
  faqs: FAQData[];
  socialLinks: SocialLinkData[];
  managementDetails: ManagementData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function formatFees(fees: string | null | number): string {
  if (!fees) return "—";
  const n = typeof fees === "number" ? fees : parseInt(String(fees));
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L / yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K / yr`;
  return `₹${n} / yr`;
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[api/college/[slug]/route.ts]", err);
    return [];
  }
}

// ─── GET /api/college/[slug] ──────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  // Run all queries in parallel for maximum performance
  const [
    collegeRows,
    courseRows,
    placementRows,
    facultyRows,
    galleryRows,
    reviewRows,
    cutoffRows,
    scholarshipRows,
    admissionProcRows,
    faqRows,
    socialRows,
    managementRows,
    importantDateRows,
  ] = await Promise.all([
    // ── 1. Base college profile ───────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.description,
         cp.estyear,
         cp.website,
         cp.collegecode,
         cp.contactpersonname,
         cp.contactpersonemail,
         cp.contactpersonnumber,
         cp.rating,
         cp.totalRatingUser,
         cp.verified,
         cp.bannerimage,
         cp.registeredSortAddress,
         cp.registeredFullAddress,
         cp.campusSortAddress,
         cp.campusFullAddress,
         cp.mediumOfInstruction,
         cp.studyForm,
         cp.admissionStart,
         cp.admissionEnd,
         cp.totalStudent,
         cp.universityType,
         cp.ranking,
         cp.isTopUniversity,
         cp.topUniversityRank,
         cp.facebookurl,
         cp.twitterurl,
         cp.CCTVSurveillance,
         cp.ACCampus,
         cp.users_id,
         c.name  AS city_name,
         ct.name AS college_type_name
       FROM collegeprofile cp
       JOIN users u         ON u.id  = cp.users_id
       LEFT JOIN city        c  ON c.id  = cp.registeredAddressCityId
       LEFT JOIN collegetype ct ON ct.id = cp.collegetype_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    // ── 2. Courses (collegemaster) ────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cm.id,
         co.name  AS course_name,
         d.name   AS degree_name,
         fa.name  AS stream_name,
         cm.fees,
         cm.seats,
         cm.courseduration,
         cm.twelvemarks,
         cm.description AS course_description
       FROM collegemaster cm
       JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id AND cp.slug = ?
       LEFT JOIN course       co ON co.id = cm.course_id
       LEFT JOIN degree       d  ON d.id  = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       ORDER BY fa.name ASC, d.name ASC, co.name ASC
       LIMIT 100`,
      [slug],
    ),

    // ── 3. Placement ──────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         p.id,
         p.numberofrecruitingcompany,
         p.numberofplacementlastyear,
         p.ctchighest,
         p.ctclowest,
         p.ctcaverage,
         p.placementinfo
       FROM placement p
       JOIN collegeprofile cp ON cp.id = p.collegeprofile_id AND cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    // ── 4. Faculty ────────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         f.id,
         f.name,
         f.designation,
         f.description,
         f.imagename,
         f.image_original,
         f.email,
         f.phone,
         f.gender,
         f.suffix,
         f.languageKnown,
         dept.stream_name
       FROM faculty f
       JOIN collegeprofile cp ON cp.id = f.collegeprofile_id AND cp.slug = ?
       LEFT JOIN (
         SELECT fd.faculty_id, MAX(fa.name) AS stream_name
         FROM faculty_departments fd
         JOIN functionalarea fa ON fa.id = fd.functionalarea_id
         GROUP BY fd.faculty_id
       ) dept ON dept.faculty_id = f.id
       ORDER BY f.sortorder ASC, f.name ASC
       LIMIT 60`,
      [slug],
    ),

    // ── 5. Gallery ────────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT g.id, g.name, g.fullimage, g.caption
       FROM gallery g
       JOIN collegeprofile cp ON cp.users_id = g.users_id AND cp.slug = ?
       WHERE g.fullimage IS NOT NULL AND g.fullimage != ''
       ORDER BY g.id DESC
       LIMIT 24`,
      [slug],
    ),

    // ── 6. Reviews ────────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cr.id,
         cr.title,
         cr.description        AS review,
         cr.academic,
         cr.accommodation,
         cr.faculty            AS faculty_rating,
         cr.infrastructure,
         cr.placement          AS placement_rating,
         cr.social,
         cr.votes,
         cr.created_at,
         COALESCE(NULLIF(TRIM(u.firstname), ''), 'Anonymous Student') AS reviewer_name
       FROM college_reviews cr
       JOIN collegeprofile cp ON cp.id = cr.collegeprofile_id AND cp.slug = ?
       LEFT JOIN users u ON u.id = cr.users_id
       WHERE cr.description IS NOT NULL AND cr.description != ''
       ORDER BY cr.created_at DESC
       LIMIT 50`,
      [slug],
    ),

    // ── 7. Cut-offs ───────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cc.id,
         cc.title,
         cc.description,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name
       FROM college_cut_offs cc
       JOIN collegeprofile cp ON cp.id = cc.collegeprofile_id AND cp.slug = ?
       LEFT JOIN degree        d  ON d.id  = cc.degree_id
       LEFT JOIN course        co ON co.id = cc.course_id
       LEFT JOIN functionalarea fa ON fa.id = cc.functionalarea_id
       ORDER BY cc.id ASC
       LIMIT 30`,
      [slug],
    ),

    // ── 8. Scholarships ───────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT cs.id, cs.title, cs.description
       FROM college_scholarships cs
       JOIN collegeprofile cp ON cp.id = cs.collegeprofile_id AND cp.slug = ?
       ORDER BY cs.id ASC
       LIMIT 20`,
      [slug],
    ),

    // ── 9. Admission procedures ───────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cap.id,
         cap.title,
         cap.description,
         d.name  AS degree_name,
         co.name AS course_name,
         fa.name AS stream_name
       FROM college_admission_procedures cap
       JOIN collegeprofile cp ON cp.id = cap.collegeprofile_id AND cp.slug = ?
       LEFT JOIN degree        d  ON d.id  = cap.degree_id
       LEFT JOIN course        co ON co.id = cap.course_id
       LEFT JOIN functionalarea fa ON fa.id = cap.functionalarea_id
       ORDER BY cap.id ASC
       LIMIT 30`,
      [slug],
    ),

    // ── 10. FAQs ──────────────────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT cf.id, cf.question, cf.answer, cf.refLinks
       FROM college_faqs cf
       JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id AND cp.slug = ?
       ORDER BY cf.id ASC
       LIMIT 30`,
      [slug],
    ),

    // ── 11. Social media links ────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT csl.id, csl.title, csl.url
       FROM college_social_media_links csl
       JOIN collegeprofile cp ON cp.id = csl.collegeprofile_id AND cp.slug = ?
       WHERE csl.isActive = 1
       ORDER BY csl.id ASC`,
      [slug],
    ),

    // ── 12. Management details ────────────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         cmd.id,
         cmd.suffix,
         cmd.name,
         cmd.designation,
         cmd.gender,
         cmd.picture,
         cmd.about,
         cmd.emailaddress,
         cmd.phoneno
       FROM college_management_details cmd
       JOIN collegeprofile cp ON cp.id = cmd.collegeprofile_id AND cp.slug = ?
       ORDER BY cmd.id ASC
       LIMIT 10`,
      [slug],
    ),

    // ── 13. Important admission dates ─────────────────────────────────────────
    safeQuery<RowDataPacket>(
      `SELECT
         caid.id,
         caid.eventName,
         caid.fromdate,
         caid.todate,
         caid.collegeAdmissionProcedure_id,
         cap.title AS procedure_title
       FROM college_admission_important_dateds caid
       JOIN college_admission_procedures cap
         ON cap.id = caid.collegeAdmissionProcedure_id
       JOIN collegeprofile cp ON cp.id = caid.collegeprofile_id AND cp.slug = ?
       ORDER BY caid.fromdate ASC
       LIMIT 30`,
      [slug],
    ),
  ]);

  // ── 404 guard ─────────────────────────────────────────────────────────────
  const raw = collegeRows[0];
  if (!raw) {
    return NextResponse.json({ error: "College not found" }, { status: 404 });
  }

  // ── Normalise college ─────────────────────────────────────────────────────
  const collegeName =
    raw.college_name && raw.college_name !== slug
      ? (raw.college_name as string)
      : slugToName(slug);

  const college: CollegeBase = {
    ...(raw as object),
    college_name: collegeName,
    image: buildImageUrl(raw.bannerimage as string | null),
    rating: parseFloat(String(raw.rating)) || 0,
    totalRatingUser: parseInt(String(raw.totalRatingUser)) || 0,
  } as CollegeBase;

  // ── Normalise admission procedures (attach important dates) ───────────────
  const admissionProcedures: AdmissionProcedureData[] = admissionProcRows.map(
    (proc) => ({
      id: proc.id as number,
      title: proc.title as string | null,
      description: proc.description as string | null,
      degree_name: proc.degree_name as string | null,
      course_name: proc.course_name as string | null,
      stream_name: proc.stream_name as string | null,
      important_dates: (importantDateRows as RowDataPacket[])
        .filter(
          (d) =>
            (d.collegeAdmissionProcedure_id as number) === (proc.id as number),
        )
        .map((d) => ({
          id: d.id as number,
          eventName: d.eventName as string | null,
          fromdate: d.fromdate as string | null,
          todate: d.todate as string | null,
          procedure_title: d.procedure_title as string | null,
          collegeAdmissionProcedure_id:
            d.collegeAdmissionProcedure_id as number,
        })),
    }),
  );

  // ── Build response ────────────────────────────────────────────────────────
  const response: CollegeAPIResponse = {
    college,
    courses: courseRows as CourseData[],
    placement: (placementRows[0] as PlacementData) ?? null,
    faculty: facultyRows.map((f) => ({
      id: f.id as number,
      name: f.name as string | null,
      designation: f.designation as string | null,
      description: f.description as string | null,
      image:
        buildFacultyImageUrl(f.imagename as string | null) ??
        buildFacultyImageUrl(f.image_original as string | null),
      email: f.email as string | null,
      phone: f.phone as string | null,
      gender: f.gender as string | null,
      suffix: f.suffix as string | null,
      languageKnown: f.languageKnown as string | null,
      stream_name: f.stream_name as string | null,
    })),
    gallery: galleryRows.map((g) => ({
      id: g.id as number,
      name: g.name as string | null,
      image: buildImageUrl(g.fullimage as string | null),
      caption: g.caption as string | null,
    })),
    reviews: reviewRows as ReviewData[],
    cutoffs: cutoffRows as CutoffData[],
    scholarships: scholarshipRows as ScholarshipData[],
    admissionProcedures,
    faqs: faqRows as FAQData[],
    socialLinks: socialRows as SocialLinkData[],
    managementDetails: managementRows.map((m) => ({
      id: m.id as number,
      suffix: m.suffix as string | null,
      name: m.name as string | null,
      designation: m.designation as string | null,
      gender: m.gender as string | null,
      image: buildFacultyImageUrl(m.picture as string | null),
      about: m.about as string | null,
      emailaddress: m.emailaddress as string | null,
      phoneno: m.phoneno as string | null,
    })),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
