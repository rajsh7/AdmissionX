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

  const emailMatch = cp.email?.toLowerCase().trim() === payload.email.toLowerCase().trim();
  if (!emailMatch) {
    const user = await db.collection("users").findOne(
      { id: cp.users_id },
      { projection: { email: 1 } }
    );
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) return null;
  }

  return { payload, slug, cpId: cp._id };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const rows = await db.collection("college_recruiters")
    .find({ college_slug: slug })
    .sort({ created_at: -1 })
    .toArray();

  const recruiters = rows.map((r: any) => ({
    id: r.id,
    name: r.name ?? "",
    logo: r.logo ?? "",
    website: r.website ?? "",
    created_at: r.created_at ?? "",
  }));

  return NextResponse.json({ recruiters });
}

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
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (!file || typeof file === "string") return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Company name is required." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP, SVG, or GIF allowed." }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 400 });

  const logoUrl = await saveUpload(file, `college/${slug}/recruiters`, "recruiter");

  const db = await getDb();
  const last = await db.collection("college_recruiters").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  const doc = {
    id: newId,
    college_slug: slug,
    name,
    logo: logoUrl,
    website: website || null,
    created_at: new Date().toISOString(),
  };

  await db.collection("college_recruiters").insertOne(doc);

  return NextResponse.json({
    success: true,
    recruiter: { id: newId, name, logo: logoUrl, website: website || "", created_at: doc.created_at },
  }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recruiterId = Number(req.nextUrl.searchParams.get("recruiterId"));
  if (!recruiterId) return NextResponse.json({ error: "recruiterId is required." }, { status: 400 });

  const db = await getDb();
  const rec = await db.collection("college_recruiters").findOne({ id: recruiterId, college_slug: slug });
  if (!rec) return NextResponse.json({ error: "Recruiter not found." }, { status: 404 });

  await db.collection("college_recruiters").deleteOne({ id: recruiterId, college_slug: slug });

  // Delete physical file
  if (rec.logo?.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public", rec.logo));
    } catch {}
  }

  return NextResponse.json({ success: true });
}
