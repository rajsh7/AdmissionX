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
    { projection: { _id: 1, id: 1, email: 1, users_id: 1 } }
  );
  if (!cp) return null;

  const emailMatch = cp.email?.toLowerCase().trim() === payload.email.toLowerCase().trim();
  if (!emailMatch) {
    const user = await db.collection("users").findOne({ id: cp.users_id }, { projection: { email: 1 } });
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) return null;
  }

  return { payload, collegeprofile_id: cp.id ? Number(cp.id) : cp._id.toString(), slug };
}

// GET — list all letters
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const rows = await db.collection("college_letters")
    .find({ college_slug: slug })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json({
    letters: rows.map((r: any) => ({
      id: r._id.toString(),
      title: r.title ?? "",
      file_url: r.file_url ?? "",
      file_type: r.file_type ?? "",
      created_at: r.created_at ?? "",
    })),
  });
}

// POST — upload a new letter (multipart/form-data: title + file)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 }); }

  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!file || !file.size) return NextResponse.json({ error: "File is required." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only PDF, JPG, PNG, WebP allowed." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File must be under 5MB." }, { status: 400 });

  const fileUrl = await saveUpload(file, `college/${slug}/letters`, "letter");

  const db = await getDb();
  const result = await db.collection("college_letters").insertOne({
    college_slug: slug,
    collegeprofile_id: auth.collegeprofile_id,
    title,
    file_url: fileUrl,
    file_type: file.type,
    created_at: new Date(),
  });

  return NextResponse.json({
    success: true,
    letter: { id: result.insertedId.toString(), title, file_url: fileUrl, file_type: file.type },
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

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const { ObjectId } = await import("mongodb");
  const db = await getDb();
  const doc = await db.collection("college_letters").findOne({ _id: new ObjectId(id), college_slug: slug });

  if (doc?.file_url?.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public", doc.file_url));
    } catch {}
  }

  await db.collection("college_letters").deleteOne({ _id: new ObjectId(id), college_slug: slug });
  return NextResponse.json({ success: true });
}
