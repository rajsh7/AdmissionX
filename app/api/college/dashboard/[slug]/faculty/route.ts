import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth + ownership helper ───────────────────────────────────────────────────
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

// ── GET /api/college/dashboard/[slug]/faculty ─────────────────────────────────
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
         f.id,
         f.name,
         f.suffix,
         f.designation,
         f.description,
         f.email,
         f.phone,
         f.gender,
         f.languageKnown,
         f.imagename,
         f.dob,
         f.address1,
         f.address2,
         f.landmark,
         f.pincode,
         f.country,
         f.state,
         f.city,
         f.qualifications,
         f.experience,
         f.contact_file,
         f.session,
         f.image_original,
         f.sortorder,
         f.created_at,
         dept.stream_name
       FROM faculty f
       LEFT JOIN (
         SELECT fd.faculty_id, MAX(fa.name) AS stream_name
         FROM faculty_departments fd
         JOIN functionalarea fa ON fa.id = fd.functionalarea_id
         GROUP BY fd.faculty_id
       ) dept ON dept.faculty_id = f.id
       WHERE f.collegeprofile_id = ?
       ORDER BY f.sortorder ASC, f.name ASC`,
      [auth.collegeprofile_id],
    );

    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

    const faculty = (rows as Record<string, unknown>[]).map((row) => ({
      ...row,
      image_url: row.imagename
        ? row.imagename.toString().startsWith("/uploads/") ? row.imagename : `${IMAGE_BASE}${row.imagename}`
        : row.image_original
          ? `${IMAGE_BASE}${row.image_original}`
          : null,
    }));

    // Also return stream options for the form
    const [streamOptions] = await conn.query(
      `SELECT id, name FROM functionalarea ORDER BY name ASC LIMIT 100`,
    );

    return NextResponse.json({ faculty, options: { streams: streamOptions } });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/faculty ────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 }); }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return NextResponse.json({ error: "Faculty name is required." }, { status: 400 });

  const suffix = String(formData.get("suffix") ?? "").trim() || null;
  const designation = String(formData.get("designation") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const gender = String(formData.get("gender") ?? "").trim() || null;
  const languageKnown = String(formData.get("languageKnown") ?? "").trim() || null;
  const session = String(formData.get("session") ?? "2024-25").trim() || null;
  const sortorder = Number(formData.get("sortorder") ?? 0);
  const functionalarea_id = Number(formData.get("functionalarea_id") ?? 0) || null;

  const dob = String(formData.get("dob") ?? "").trim() || null;
  const address1 = String(formData.get("address1") ?? "").trim() || null;
  const address2 = String(formData.get("address2") ?? "").trim() || null;
  const landmark = String(formData.get("landmark") ?? "").trim() || null;
  const pincode = String(formData.get("pincode") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const qualifications = formData.get("qualifications") ? String(formData.get("qualifications")) : null;
  const experience = formData.get("experience") ? String(formData.get("experience")) : null;

  // Photo upload
  let imagePath: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && typeof file !== "string" && file.size > 0) {
    const { writeFile, mkdir } = await import("fs/promises");
    const { existsSync } = await import("fs");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "faculty");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = `faculty_${Date.now()}${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    imagePath = `/uploads/college/${slug}/faculty/${filename}`;
  }

  // CV/Doc upload
  let contactFilePath: string | null = null;
  const cFile = formData.get("contact_file") as File | null;
  if (cFile && typeof cFile !== "string" && cFile.size > 0) {
    const { writeFile, mkdir } = await import("fs/promises");
    const { existsSync } = await import("fs");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "faculty", "docs");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
    const ext = path.extname(cFile.name).toLowerCase() || ".pdf";
    const filename = `doc_${Date.now()}${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await cFile.arrayBuffer()));
    contactFilePath = `/uploads/college/${slug}/faculty/docs/${filename}`;
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO faculty
         (name, suffix, designation, description, email, phone, gender, languageKnown, imagename, session, sortorder, 
          collegeprofile_id, users_id, dob, address1, address2, landmark, pincode, country, state, city, qualifications, experience, contact_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, suffix, designation, description, email, phone, gender, languageKnown, imagePath, session, sortorder, 
       auth.collegeprofile_id, auth.users_id, dob, address1, address2, landmark, pincode, country, state, city, qualifications, experience, contactFilePath]
    );

    const insertId = (result as { insertId: number }).insertId;
    if (functionalarea_id) {
      await conn.query(`INSERT INTO faculty_departments (faculty_id, functionalarea_id, collegeprofile_id, users_id) VALUES (?, ?, ?, ?)`,
        [insertId, functionalarea_id, auth.collegeprofile_id, auth.users_id]);
    }

    const [newRows] = await conn.query(
      `SELECT f.*, dept.stream_name FROM faculty f
       LEFT JOIN (SELECT fd.faculty_id, MAX(fa.name) AS stream_name FROM faculty_departments fd JOIN functionalarea fa ON fa.id = fd.functionalarea_id GROUP BY fd.faculty_id) dept ON dept.faculty_id = f.id
       WHERE f.id = ?`, [insertId]);

    const row = (newRows as Record<string, unknown>[])[0];
    return NextResponse.json({ success: true, faculty: { ...row, image_url: imagePath } }, { status: 201 });
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/faculty?facultyId=X ─────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const facultyId = req.nextUrl.searchParams.get("facultyId");
  if (!facultyId) return NextResponse.json({ error: "facultyId required." }, { status: 400 });

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 }); }

  const conn = await pool.getConnection();
  try {
    const [check] = await conn.query(`SELECT id, imagename, contact_file FROM faculty WHERE id = ? AND collegeprofile_id = ? LIMIT 1`, [facultyId, auth.collegeprofile_id]);
    const checkList = check as { id: number; imagename: string | null; contact_file: string | null }[];
    if (!checkList.length) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const setClauses: string[] = [];
    const values: unknown[] = [];
    const textFields = ["name", "suffix", "designation", "description", "email", "phone", "gender", "languageKnown", "session", "dob", "address1", "address2", "landmark", "pincode", "country", "state", "city", "qualifications", "experience"];
    for (const field of textFields) {
      const val = formData.get(field);
      if (val !== null) { setClauses.push(`${field} = ?`); values.push(String(val).trim() || null); }
    }

    const sortorderRaw = formData.get("sortorder");
    if (sortorderRaw !== null) { setClauses.push("sortorder = ?"); values.push(Number(sortorderRaw)); }

    // Photo replacement
    const file = formData.get("file") as File | null;
    if (file && typeof file !== "string" && file.size > 0) {
      const { writeFile, mkdir, unlink } = await import("fs/promises");
      const { existsSync } = await import("fs");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "faculty");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const filename = `faculty_${Date.now()}${ext}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      const newPath = `/uploads/college/${slug}/faculty/${filename}`;
      setClauses.push("imagename = ?"); values.push(newPath);
      const oldImg = checkList[0].imagename;
      if (oldImg?.startsWith("/uploads/")) { try { await unlink(path.join(process.cwd(), "public", oldImg)); } catch { } }
    }

    // CV replacement
    const cFile = formData.get("contact_file") as File | null;
    if (cFile && typeof cFile !== "string" && cFile.size > 0) {
      const { writeFile, mkdir, unlink } = await import("fs/promises");
      const { existsSync } = await import("fs");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "faculty", "docs");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
      const ext = path.extname(cFile.name).toLowerCase() || ".pdf";
      const filename = `doc_${Date.now()}${ext}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(await cFile.arrayBuffer()));
      const newPath = `/uploads/college/${slug}/faculty/docs/${filename}`;
      setClauses.push("contact_file = ?"); values.push(newPath);
      const oldDoc = checkList[0].contact_file;
      if (oldDoc?.startsWith("/uploads/")) { try { await unlink(path.join(process.cwd(), "public", oldDoc)); } catch { } }
    }

    if (setClauses.length > 0) {
      setClauses.push("updated_at = CURRENT_TIMESTAMP");
      await conn.query(`UPDATE faculty SET ${setClauses.join(", ")} WHERE id = ?`, [...values, facultyId]);
    }

    const faIdRaw = formData.get("functionalarea_id");
    if (faIdRaw !== null) {
      const faId = Number(faIdRaw);
      await conn.query(`DELETE FROM faculty_departments WHERE faculty_id = ?`, [facultyId]);
      if (faId) await conn.query(`INSERT INTO faculty_departments (faculty_id, functionalarea_id, collegeprofile_id, users_id) VALUES (?, ?, ?, ?)`, [facultyId, faId, auth.collegeprofile_id, auth.users_id]);
    }

    const [updated] = await conn.query(`SELECT f.*, dept.stream_name FROM faculty f LEFT JOIN (SELECT fd.faculty_id, MAX(fa.name) AS stream_name FROM faculty_departments fd JOIN functionalarea fa ON fa.id = fd.functionalarea_id GROUP BY fd.faculty_id) dept ON dept.faculty_id = f.id WHERE f.id = ?`, [facultyId]);
    const row = (updated as Record<string, unknown>[])[0];
    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";
    return NextResponse.json({ success: true, faculty: { ...row, image_url: row.imagename ? (row.imagename.toString().startsWith("/uploads/") ? row.imagename : `${IMAGE_BASE}${row.imagename}`) : null } });
  } finally { conn.release(); }
}

// ── DELETE /api/college/dashboard/[slug]/faculty?facultyId=X ─────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const facultyId = req.nextUrl.searchParams.get("facultyId");
  if (!facultyId) return NextResponse.json({ error: "facultyId required." }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`SELECT id, imagename, contact_file FROM faculty WHERE id = ? AND collegeprofile_id = ? LIMIT 1`, [facultyId, auth.collegeprofile_id]);
    const list = rows as { id: number; imagename: string | null; contact_file: string | null }[];
    if (!list.length) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await conn.query(`DELETE FROM faculty_departments WHERE faculty_id = ?`, [facultyId]);
    await conn.query(`DELETE FROM faculty WHERE id = ? AND collegeprofile_id = ?`, [facultyId, auth.collegeprofile_id]);

    const cleanup = async (filePath: string | null) => {
      if (filePath?.startsWith("/uploads/")) {
        try { const path = await import("path"); const { unlink } = await import("fs/promises"); await unlink(path.join(process.cwd(), "public", filePath)); } catch { }
      }
    };
    await cleanup(list[0].imagename);
    await cleanup(list[0].contact_file);

    return NextResponse.json({ success: true });
  } finally { conn.release(); }
}
