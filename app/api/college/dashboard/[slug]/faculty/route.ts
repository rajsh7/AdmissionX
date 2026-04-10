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
        ? `${IMAGE_BASE}${row.imagename}`
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
// Accepts multipart/form-data:
//   name, suffix?, designation?, description?, email?, phone?, gender?,
//   languageKnown?, sortorder?, functionalarea_id?, file? (photo)
export async function POST(
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

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Faculty name is required." }, { status: 400 });
  }

  const suffix         = String(formData.get("suffix")          ?? "").trim() || null;
  const designation    = String(formData.get("designation")     ?? "").trim() || null;
  const description    = String(formData.get("description")     ?? "").trim() || null;
  const email          = String(formData.get("email")           ?? "").trim() || null;
  const phone          = String(formData.get("phone")           ?? "").trim() || null;
  const gender         = String(formData.get("gender")          ?? "").trim() || null;
  const languageKnown  = String(formData.get("languageKnown")   ?? "").trim() || null;
  const sortorderRaw   = formData.get("sortorder");
  const sortorder      = sortorderRaw ? Number(sortorderRaw) : 0;
  const faIdRaw        = formData.get("functionalarea_id");
  const functionalarea_id = faIdRaw ? Number(faIdRaw) : null;

  // Handle optional photo upload
  let imagePath: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && typeof file !== "string" && file.size > 0) {
    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        { error: "Photo must be JPEG, PNG, or WebP." },
        { status: 400 },
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo must be under 2 MB." }, { status: 400 });
    }

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

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO faculty
         (name, suffix, designation, description, email, phone, gender,
          languageKnown, imagename, sortorder, collegeprofile_id, users_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, suffix, designation, description, email, phone, gender,
        languageKnown, imagePath, sortorder,
        auth.collegeprofile_id, auth.users_id,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    // Link to stream (faculty_departments)
    if (functionalarea_id) {
      await conn.query(
        `INSERT INTO faculty_departments
           (faculty_id, functionalarea_id, collegeprofile_id, users_id)
         VALUES (?, ?, ?, ?)`,
        [insertId, functionalarea_id, auth.collegeprofile_id, auth.users_id],
      );
    }

    // Return the newly created row
    const [newRows] = await conn.query(
      `SELECT
         f.id, f.name, f.suffix, f.designation, f.description,
         f.email, f.phone, f.gender, f.languageKnown, f.imagename,
         f.sortorder, f.created_at,
         dept.stream_name
       FROM faculty f
       LEFT JOIN (
         SELECT fd.faculty_id, MAX(fa.name) AS stream_name
         FROM faculty_departments fd
         JOIN functionalarea fa ON fa.id = fd.functionalarea_id
         GROUP BY fd.faculty_id
       ) dept ON dept.faculty_id = f.id
       WHERE f.id = ?`,
      [insertId],
    );

    const row = (newRows as Record<string, unknown>[])[0];
    return NextResponse.json(
      {
        success: true,
        message: "Faculty member added successfully.",
        faculty: { ...row, image_url: imagePath },
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/faculty?facultyId=X ─────────────────────
// Accepts multipart/form-data (same fields as POST, all optional)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const facultyId = req.nextUrl.searchParams.get("facultyId");
  if (!facultyId) {
    return NextResponse.json({ error: "facultyId query param is required." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify ownership
    const [check] = await conn.query(
      `SELECT id, imagename FROM faculty WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [facultyId, auth.collegeprofile_id],
    );
    const checkList = check as { id: number; imagename: string | null }[];
    if (!checkList.length) {
      return NextResponse.json(
        { error: "Faculty member not found or does not belong to your college." },
        { status: 404 },
      );
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];

    const textFields = [
      "name", "suffix", "designation", "description",
      "email", "phone", "gender", "languageKnown",
    ];
    for (const field of textFields) {
      const val = formData.get(field);
      if (val !== null) {
        setClauses.push(`${field} = ?`);
        values.push(String(val).trim() || null);
      }
    }

    const sortorderRaw = formData.get("sortorder");
    if (sortorderRaw !== null) {
      setClauses.push("sortorder = ?");
      values.push(Number(sortorderRaw));
    }

    // Handle photo replacement
    const file = formData.get("file") as File | null;
    if (file && typeof file !== "string" && file.size > 0) {
      const allowedMime = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMime.includes(file.type)) {
        return NextResponse.json(
          { error: "Photo must be JPEG, PNG, or WebP." },
          { status: 400 },
        );
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Photo must be under 2 MB." }, { status: 400 });
      }

      const { writeFile, mkdir, unlink } = await import("fs/promises");
      const { existsSync } = await import("fs");
      const path = await import("path");

      const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "faculty");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const filename = `faculty_${Date.now()}${ext}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      const newPath = `/uploads/college/${slug}/faculty/${filename}`;

      setClauses.push("imagename = ?");
      values.push(newPath);

      // Delete old local upload (ignore if external/legacy path)
      const oldImg = checkList[0].imagename;
      if (oldImg?.startsWith("/uploads/")) {
        try {
          await unlink(path.join(process.cwd(), "public", oldImg));
        } catch {
          // File already gone — ignore
        }
      }
    }

    if (setClauses.length > 0) {
      setClauses.push("updated_at = CURRENT_TIMESTAMP");
      await conn.query(
        `UPDATE faculty SET ${setClauses.join(", ")} WHERE id = ?`,
        [...values, facultyId],
      );
    }

    // Update stream link if provided
    const faIdRaw = formData.get("functionalarea_id");
    if (faIdRaw !== null) {
      const faId = Number(faIdRaw);
      await conn.query(
        `DELETE FROM faculty_departments WHERE faculty_id = ?`,
        [facultyId],
      );
      if (faId) {
        await conn.query(
          `INSERT INTO faculty_departments
             (faculty_id, functionalarea_id, collegeprofile_id, users_id)
           VALUES (?, ?, ?, ?)`,
          [facultyId, faId, auth.collegeprofile_id, auth.users_id],
        );
      }
    }

    // Return updated row
    const [updated] = await conn.query(
      `SELECT
         f.id, f.name, f.suffix, f.designation, f.description,
         f.email, f.phone, f.gender, f.languageKnown, f.imagename,
         f.sortorder, f.created_at, dept.stream_name
       FROM faculty f
       LEFT JOIN (
         SELECT fd.faculty_id, MAX(fa.name) AS stream_name
         FROM faculty_departments fd
         JOIN functionalarea fa ON fa.id = fd.functionalarea_id
         GROUP BY fd.faculty_id
       ) dept ON dept.faculty_id = f.id
       WHERE f.id = ?`,
      [facultyId],
    );

    const row = (updated as Record<string, unknown>[])[0];
    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";
    return NextResponse.json({
      success: true,
      message: "Faculty member updated successfully.",
      faculty: {
        ...row,
        image_url: row.imagename
          ? row.imagename.toString().startsWith("/uploads/")
            ? row.imagename
            : `${IMAGE_BASE}${row.imagename}`
          : null,
      },
    });
  } finally {
    conn.release();
  }
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
  if (!facultyId) {
    return NextResponse.json({ error: "facultyId query param is required." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Fetch row first to clean up the photo
    const [rows] = await conn.query(
      `SELECT id, imagename FROM faculty WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [facultyId, auth.collegeprofile_id],
    );
    const list = rows as { id: number; imagename: string | null }[];
    if (!list.length) {
      return NextResponse.json(
        { error: "Faculty member not found or does not belong to your college." },
        { status: 404 },
      );
    }

    // Delete linked department rows
    await conn.query(`DELETE FROM faculty_departments WHERE faculty_id = ?`, [facultyId]);

    // Delete the faculty row
    await conn.query(
      `DELETE FROM faculty WHERE id = ? AND collegeprofile_id = ?`,
      [facultyId, auth.collegeprofile_id],
    );

    // Remove local photo if it was uploaded through this system
    const img = list[0].imagename;
    if (img?.startsWith("/uploads/")) {
      try {
        const path = await import("path");
        const { unlink } = await import("fs/promises");
        await unlink(path.join(process.cwd(), "public", img));
      } catch {
        // File already gone — ignore
      }
    }

    return NextResponse.json({ success: true, message: "Faculty member deleted successfully." });
  } finally {
    conn.release();
  }
}
