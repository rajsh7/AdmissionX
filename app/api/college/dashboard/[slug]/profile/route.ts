import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { saveUpload } from "@/lib/upload-utils";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const db = await getDb();
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, users_id: 1, email: 1 } }
  );
  if (!cp) return null;

  // Check ownership by email
  const emailMatch =
    cp.email && cp.email.toLowerCase().trim() === payload.email.toLowerCase().trim();

  if (!emailMatch) {
    // fallback: check via users collection — users_id can be ObjectId or number
    const user = await db.collection("users").findOne(
      { $or: [{ _id: cp.users_id }, { id: cp.users_id }] },
      { projection: { email: 1 } }
    );
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) {
      return null;
    }
  }

  return { payload, slug };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const cp = await db.collection("collegeprofile").findOne({ slug });
  if (!cp) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const s = (v: unknown) => (v != null && String(v) !== "NULL" ? String(v).trim() : "");

  const profile = {
    id:                    cp._id,
    slug:                  s(cp.slug),
    college_name:          s(cp.college_name) || s(cp.slug),
    description:           s(cp.description),
    estyear:               s(cp.estyear),
    website:               s(cp.website),
    collegecode:           s(cp.collegecode),
    universityType:        s(cp.universityType),
    college_type_name:     s(cp.college_type_name),
    contactpersonname:     s(cp.contactpersonname),
    contactpersonemail:    s(cp.contactpersonemail),
    contactpersonnumber:   s(cp.contactpersonnumber),
    mediumOfInstruction:   s(cp.mediumOfInstruction),
    studyForm:             s(cp.studyForm),
    admissionStart:        s(cp.admissionStart),
    admissionEnd:          s(cp.admissionEnd),
    totalStudent:          s(cp.totalStudent),
    CCTVSurveillance:      cp.CCTVSurveillance ? "Yes" : "No",
    ACCampus:              cp.ACCampus ? "Yes" : "No",
    registeredSortAddress: s(cp.registeredSortAddress),
    registeredFullAddress: s(cp.registeredFullAddress),
    campusSortAddress:     s(cp.campusSortAddress),
    campusFullAddress:     s(cp.campusFullAddress),
    facebookurl:           s(cp.facebookurl),
    twitterurl:            s(cp.twitterurl),
    bannerimage:           s(cp.bannerimage),
    mosaic1:               s(cp.mosaic1),
    mosaic2:               s(cp.mosaic2),
    mosaic3:               s(cp.mosaic3),
    mosaic4:               s(cp.mosaic4),
    ranking:               cp.ranking ?? null,
  };

  return NextResponse.json({ profile });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = await getDb();

  const $set: Record<string, unknown> = { updated_at: new Date() };

  // Map of body key -> DB field name
  const fieldMap: Record<string, string> = {
    estyear:              "estyear",
    website:              "website",
    collegecode:          "collegecode",
    universityType:       "universityType",
    collegeType:          "college_type_name",
    contactEmail:         "contactpersonemail",
    contactPhone:         "contactpersonnumber",
    contactName:          "contactpersonname",
    mediumOfInstruction:  "mediumOfInstruction",
    studyFrom:            "studyForm",
    studyTo:              "studyTo",
    admissionStart:       "admissionStart",
    admissionEnd:         "admissionEnd",
    totalStudent:         "totalStudent",
    description:          "description",
    facebookurl:          "facebookurl",
    twitterurl:           "twitterurl",
    registeredSortAddress: "registeredSortAddress",
    registeredFullAddress: "registeredFullAddress",
    campusSortAddress:    "campusSortAddress",
    campusFullAddress:    "campusFullAddress",
  };

  for (const [bodyKey, dbKey] of Object.entries(fieldMap)) {
    if (bodyKey in body) {
      $set[dbKey] = body[bodyKey] ? String(body[bodyKey]).trim() || null : null;
    }
  }

  // Boolean fields
  if ("cctv" in body)     $set.CCTVSurveillance = body.cctv === "Yes" ? 1 : 0;
  if ("acCampus" in body) $set.ACCampus         = body.acCampus === "Yes" ? 1 : 0;

  await db.collection("collegeprofile").updateOne(
    { slug },
    { $set }
  );

  return NextResponse.json({ success: true, message: "Profile updated successfully." });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const fieldName = (formData.get("field") as string) || "bannerimage";

  // Validate field name
  const allowedFields = ["bannerimage", "mosaic1", "mosaic2", "mosaic3", "mosaic4"];
  if (!allowedFields.includes(fieldName)) {
    return NextResponse.json({ error: "Invalid field name." }, { status: 400 });
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed." }, { status: 400 });
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 3 MB." }, { status: 400 });
  }

  try {
    const prefix = fieldName === "bannerimage" ? "banner" : fieldName;
    const publicUrl = await saveUpload(file, `college/${slug}`, prefix);

    const db = await getDb();
    await db.collection("collegeprofile").updateOne(
      { slug },
      { $set: { [fieldName]: publicUrl, updated_at: new Date() } }
    );

    return NextResponse.json({ success: true, url: publicUrl, field: fieldName });
  } catch (e) {
    console.error("[profile PATCH] upload error:", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
