import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE     = 5 * 1024 * 1024; // 5 MB

// -- GET /api/college/dashboard/[slug]/gallery ---------------------------------
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
      `SELECT id, name, fullimage, caption, created_at
       FROM gallery
       WHERE users_id = ?
         AND fullimage IS NOT NULL
         AND fullimage != ''
       ORDER BY id DESC
       LIMIT 100`,
      [auth.users_id],
    );

    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

    const gallery = (rows as Record<string, unknown>[]).map((row) => {
      const rawPath = String(row.fullimage ?? "");
      const imageUrl = rawPath.startsWith("http") || rawPath.startsWith("/")
        ? rawPath
        : `${IMAGE_BASE}${rawPath}`;
      return {
        id:         row.id,
        name:       row.name,
        fullimage:  imageUrl,
        rawPath,
        caption:    row.caption ?? "",
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ gallery, total: gallery.length });
  } finally {
    conn.release();
  }
}

// -- POST /api/college/dashboard/[slug]/gallery --------------------------------
// Accepts multipart/form-data: file (required), name? (string), caption? (string)
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

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be under 5 MB." },
      { status: 400 },
    );
  }

  const caption = String(formData.get("caption") ?? "").trim();
  const name    = String(formData.get("name")    ?? "").trim() || file.name;

  // -- Save file to disk -----------------------------------------------------
  const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "gallery");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const ext      = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `gallery_${Date.now()}${ext}`;
  const fullPath = path.join(uploadDir, filename);
  const publicUrl = `/uploads/college/${slug}/gallery/${filename}`;

  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  // -- Insert gallery record -------------------------------------------------
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO gallery (name, fullimage, caption, users_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, publicUrl, caption || null, auth.users_id],
    );

    const insertId = (result as { insertId: number }).insertId;

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        image: {
          id:        insertId,
          name,
          fullimage: publicUrl,
          rawPath:   publicUrl,
          caption:   caption || "",
        },
      },
      { status: 201 },
    );
  } finally {
    conn.release();
  }
}

// -- DELETE /api/college/dashboard/[slug]/gallery?imageId=X -------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const imageId = req.nextUrl.searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json({ error: "imageId query param is required." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Fetch the record first to get the file path and verify ownership
    const [rows] = await conn.query(
      `SELECT id, fullimage FROM gallery WHERE id = ? AND users_id = ? LIMIT 1`,
      [imageId, auth.users_id],
    );
    const list = rows as { id: number; fullimage: string }[];

    if (!list.length) {
      return NextResponse.json(
        { error: "Image not found or does not belong to your college." },
        { status: 404 },
      );
    }

    const { fullimage } = list[0];

    // Remove DB record
    await conn.query(`DELETE FROM gallery WHERE id = ? AND users_id = ?`, [imageId, auth.users_id]);

    // Attempt to remove the physical file (only for locally uploaded files)
    if (fullimage && fullimage.startsWith("/uploads/")) {
      try {
        const { unlink } = await import("fs/promises");
        const physicalPath = path.join(process.cwd(), "public", fullimage);
        await unlink(physicalPath);
      } catch {
        // File already gone — silently continue
      }
    }

    return NextResponse.json({ success: true, message: "Image deleted successfully." });
  } finally {
    conn.release();
  }
}
