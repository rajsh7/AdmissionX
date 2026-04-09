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

// ── GET /api/college/dashboard/[slug]/management ──────────────────────────────
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
         id,
         suffix,
         name,
         designation,
         gender,
         picture,
         about,
         emailaddress,
         phoneno,
         landlineNo,
         created_at
       FROM college_management_details
       WHERE collegeprofile_id = ?
       ORDER BY id ASC`,
      [auth.collegeprofile_id],
    );

    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

    const management = (rows as Record<string, unknown>[]).map((row) => {
      const pic = String(row.picture ?? "");
      return {
        ...row,
        picture_url: pic
          ? pic.startsWith("/uploads/") || pic.startsWith("http")
            ? pic
            : `${IMAGE_BASE}${pic}`
          : null,
      };
    });

    return NextResponse.json({ management });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/management ─────────────────────────────
// Accepts multipart/form-data:
//   name (required), suffix?, designation?, gender?, about?,
//   emailaddress?, phoneno?, landlineNo?, file? (photo)
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
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const suffix      = String(formData.get("suffix")      ?? "").trim() || null;
  const designation = String(formData.get("designation") ?? "").trim() || null;
  const gender      = String(formData.get("gender")      ?? "").trim() || null;
  const about       = String(formData.get("about")       ?? "").trim() || null;
  const emailaddress = String(formData.get("emailaddress") ?? "").trim() || null;
  const phoneno     = String(formData.get("phoneno")     ?? "").trim() || null;
  const landlineNo  = String(formData.get("landlineNo")  ?? "").trim() || null;

  // Handle optional photo upload
  let picturePath: string | null = null;
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

    const uploadDir = path.join(
      process.cwd(), "public", "uploads", "college", slug, "management",
    );
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = `mgmt_${Date.now()}${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    picturePath = `/uploads/college/${slug}/management/${filename}`;
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO college_management_details
         (name, suffix, designation, gender, about, emailaddress, phoneno,
          landlineNo, picture, collegeprofile_id, users_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, suffix, designation, gender, about,
        emailaddress, phoneno, landlineNo,
        picturePath,
        auth.collegeprofile_id, auth.users_id,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    const [newRows] = await conn.query(
      `SELECT id, suffix, name, designation, gender, picture,
              about, emailaddress, phoneno, landlineNo, created_at
       FROM college_management_details WHERE id = ?`,
      [insertId],
    );

    const row = (newRows as Record<string, unknown>[])[0];
    return NextResponse.json(
      {
        success: true,
        message: "Management member added successfully.",
        member: { ...row, picture_url: picturePath },
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/management?memberId=X ──────────────────
// Accepts multipart/form-data (same fields as POST, all optional)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId query param is required." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Verify ownership
    const [check] = await conn.query(
      `SELECT id, picture FROM college_management_details
       WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [memberId, auth.collegeprofile_id],
    );
    const checkList = check as { id: number; picture: string | null }[];
    if (!checkList.length) {
      return NextResponse.json(
        { error: "Member not found or does not belong to your college." },
        { status: 404 },
      );
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];

    const textFields = [
      "name", "suffix", "designation", "gender",
      "about", "emailaddress", "phoneno", "landlineNo",
    ];
    for (const field of textFields) {
      const val = formData.get(field);
      if (val !== null) {
        setClauses.push(`${field} = ?`);
        values.push(String(val).trim() || null);
      }
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

      const uploadDir = path.join(
        process.cwd(), "public", "uploads", "college", slug, "management",
      );
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const filename = `mgmt_${Date.now()}${ext}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      const newPath = `/uploads/college/${slug}/management/${filename}`;

      setClauses.push("picture = ?");
      values.push(newPath);

      // Delete old local photo if applicable
      const oldPic = checkList[0].picture;
      if (oldPic?.startsWith("/uploads/")) {
        try {
          await unlink(path.join(process.cwd(), "public", oldPic));
        } catch {
          // File already gone — ignore
        }
      }
    }

    if (setClauses.length > 0) {
      setClauses.push("updated_at = CURRENT_TIMESTAMP");
      await conn.query(
        `UPDATE college_management_details SET ${setClauses.join(", ")} WHERE id = ?`,
        [...values, memberId],
      );
    }

    const [updated] = await conn.query(
      `SELECT id, suffix, name, designation, gender, picture,
              about, emailaddress, phoneno, landlineNo, created_at
       FROM college_management_details WHERE id = ?`,
      [memberId],
    );
    const row = (updated as Record<string, unknown>[])[0];
    const pic = String(row.picture ?? "");
    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

    return NextResponse.json({
      success: true,
      message: "Management member updated successfully.",
      member: {
        ...row,
        picture_url: pic
          ? pic.startsWith("/uploads/") || pic.startsWith("http")
            ? pic
            : `${IMAGE_BASE}${pic}`
          : null,
      },
    });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/college/dashboard/[slug]/management?memberId=X ───────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId query param is required." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT id, picture FROM college_management_details
       WHERE id = ? AND collegeprofile_id = ? LIMIT 1`,
      [memberId, auth.collegeprofile_id],
    );
    const list = rows as { id: number; picture: string | null }[];
    if (!list.length) {
      return NextResponse.json(
        { error: "Member not found or does not belong to your college." },
        { status: 404 },
      );
    }

    await conn.query(
      `DELETE FROM college_management_details WHERE id = ? AND collegeprofile_id = ?`,
      [memberId, auth.collegeprofile_id],
    );

    // Remove local photo if applicable
    const pic = list[0].picture;
    if (pic?.startsWith("/uploads/")) {
      try {
        const path = await import("path");
        const { unlink } = await import("fs/promises");
        await unlink(path.join(process.cwd(), "public", pic));
      } catch {
        // File already gone — ignore
      }
    }

    return NextResponse.json({ success: true, message: "Management member deleted successfully." });
  } finally {
    conn.release();
  }
}
