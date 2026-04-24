import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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

  const emailMatch = cp.email?.toLowerCase().trim() === payload.email.toLowerCase().trim();
  if (!emailMatch) {
    const user = await db.collection("users").findOne(
      { id: cp.users_id },
      { projection: { email: 1 } }
    );
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) return null;
  }

  return { payload, slug, users_id: Number(cp.users_id) };
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

// GET
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const rows = await db.collection("gallery")
    .find({
      $or: [
        { college_slug: auth.slug },
        { users_id: auth.users_id, fullimage: { $exists: true, $ne: "" } },
      ],
      fullimage: { $exists: true, $ne: "" },
    })
    .sort({ id: -1 })
    .limit(100)
    .toArray();

  const gallery = rows.map((row: any) => {
    const rawPath = String(row.fullimage ?? "");
    const imageUrl = rawPath.startsWith("http") || rawPath.startsWith("/")
      ? rawPath
      : `https://admin.admissionx.in/uploads/${rawPath}`;
    return {
      id: row.id,
      name: row.name ?? "",
      fullimage: imageUrl,
      rawPath,
      caption: row.caption ?? "",
      created_at: row.created_at ?? "",
    };
  });

  return NextResponse.json({ gallery, total: gallery.length });
}

// POST
export async function POST(
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
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF allowed." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });

  const caption = String(formData.get("caption") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || file.name;

  // Save file to disk
  const uploadDir = path.join(process.cwd(), "public", "uploads", "college", slug, "gallery");
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `gallery_${Date.now()}${ext}`;
  const fullPath = path.join(uploadDir, filename);
  const publicUrl = `/uploads/college/${slug}/gallery/${filename}`;

  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  // Insert into MongoDB gallery collection
  const db = await getDb();
  const last = await db.collection("gallery").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("gallery").insertOne({
    id: newId,
    name,
    fullimage: publicUrl,
    caption: caption || null,
    users_id: auth.users_id || null,
    college_slug: auth.slug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: "Image uploaded successfully.",
    image: { id: newId, name, fullimage: publicUrl, rawPath: publicUrl, caption: caption || "" },
  }, { status: 201 });
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const imageId = Number(req.nextUrl.searchParams.get("imageId"));
  if (!imageId) return NextResponse.json({ error: "imageId is required." }, { status: 400 });

  const db = await getDb();
  const img = await db.collection("gallery").findOne({
    id: imageId,
    $or: [{ college_slug: auth.slug }, { users_id: auth.users_id }],
  });
  if (!img) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  await db.collection("gallery").deleteOne({
    id: imageId,
    $or: [{ college_slug: auth.slug }, { users_id: auth.users_id }],
  });

  // Delete physical file
  if (img.fullimage?.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      await unlink(path.join(process.cwd(), "public", img.fullimage));
    } catch {}
  }

  return NextResponse.json({ success: true });
}
