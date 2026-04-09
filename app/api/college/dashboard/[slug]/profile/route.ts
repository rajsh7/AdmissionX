import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// -- Auth + ownership helper ---------------------------------------------------
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT cp.id AS collegeprofile_id, cp.users_id
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { collegeprofile_id: number; users_id: number }[];
    if (!list.length) return null;
    return { payload, collegeprofile_id: list[0].collegeprofile_id, users_id: list[0].users_id };
  } finally {
    conn.release();
  }
}

// -- GET /api/college/dashboard/[slug]/profile ---------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
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
         cp.facebookurl,
         cp.twitterurl,
         cp.bannerimage,
         cp.rating,
         cp.totalRatingUser,
         cp.verified,
         cp.CCTVSurveillance,
         cp.ACCampus,
         ct.name AS college_type_name,
         c.name  AS city_name
       FROM collegeprofile cp
       JOIN users u         ON u.id  = cp.users_id
       LEFT JOIN collegetype ct ON ct.id = cp.collegetype_id
       LEFT JOIN city        c  ON c.id  = cp.registeredAddressCityId
       WHERE cp.id = ?
       LIMIT 1`,
      [auth.collegeprofile_id],
    );

    const list = rows as Record<string, unknown>[];
    if (!list.length) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const row = list[0];

    // Profile completeness score
    const fields = [
      row.college_name, row.description, row.estyear, row.website,
      row.contactpersonname, row.contactpersonemail, row.contactpersonnumber,
      row.registeredSortAddress, row.campusSortAddress, row.bannerimage,
      row.mediumOfInstruction, row.studyForm, row.admissionStart,
    ];
    const filled = fields.filter((f) => f !== null && f !== "" && f !== undefined).length;
    const profileComplete = Math.round((filled / fields.length) * 100);

    return NextResponse.json({ profile: { ...row, profileComplete } });
  } finally {
    conn.release();
  }
}

// -- PUT /api/college/dashboard/[slug]/profile ---------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
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

  // Whitelist of editable fields in collegeprofile
  const allowed: Record<string, "string" | "number" | "date"> = {
    description:          "string",
    estyear:              "number",
    website:              "string",
    collegecode:          "string",
    contactpersonname:    "string",
    contactpersonemail:   "string",
    contactpersonnumber:  "string",
    registeredSortAddress:"string",
    registeredFullAddress:"string",
    campusSortAddress:    "string",
    campusFullAddress:    "string",
    mediumOfInstruction:  "string",
    studyForm:            "string",
    admissionStart:       "date",
    admissionEnd:         "date",
    totalStudent:         "number",
    universityType:       "string",
    ranking:              "number",
    facebookurl:          "string",
    twitterurl:           "string",
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, type] of Object.entries(allowed)) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const raw = body[key];
    let val: unknown;
    if (raw === "" || raw === null || raw === undefined) {
      val = null;
    } else if (type === "number") {
      const n = Number(raw);
      val = isNaN(n) ? null : n;
    } else {
      val = String(raw).trim() || null;
    }
    setClauses.push(`${key} = ?`);
    values.push(val);
  }

  // Also allow updating college_name via users.firstname
  const collegeName = typeof body.college_name === "string" ? body.college_name.trim() : null;

  if (setClauses.length === 0 && !collegeName) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    if (setClauses.length > 0) {
      setClauses.push("updated_at = CURRENT_TIMESTAMP");
      await conn.query(
        `UPDATE collegeprofile SET ${setClauses.join(", ")} WHERE id = ?`,
        [...values, auth.collegeprofile_id],
      );
    }

    if (collegeName) {
      await conn.query(
        `UPDATE users SET firstname = ? WHERE id = ?`,
        [collegeName, auth.users_id],
      );
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } finally {
    conn.release();
  }
}

// -- PATCH /api/college/dashboard/[slug]/profile  (banner image upload) --------
// Accepts multipart/form-data with field: file
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
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

  const { writeFile, mkdir } = await import("fs/promises");
  const { existsSync } = await import("fs");
  const path = await import("path");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug);
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `banner_${Date.now()}${ext}`;
  const fullPath = path.join(uploadDir, filename);
  const publicUrl = `/uploads/college/${slug}/${filename}`;

  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  const conn = await pool.getConnection();
  try {
    await conn.query(
      `UPDATE collegeprofile SET bannerimage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [publicUrl, auth.collegeprofile_id],
    );
    return NextResponse.json({ success: true, url: publicUrl });
  } finally {
    conn.release();
  }
}
