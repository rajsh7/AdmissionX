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
    { projection: { _id: 1, email: 1, users_id: 1 } }
  );
  if (!cp) return null;

  const emailMatch = cp.email?.toLowerCase().trim() === payload.email.toLowerCase().trim();
  if (!emailMatch) {
    const user = await db.collection("users").findOne({ id: cp.users_id }, { projection: { email: 1 } });
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) return null;
  }
  return { payload, slug };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;
  if (!file || !file.size) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const logoUrl = await saveUpload(file, `college/${slug}`, "logo");

  const db = await getDb();
  await db.collection("collegeprofile").updateOne(
    { slug },
    { $set: { logoimage: logoUrl, updated_at: new Date() } }
  );

  return NextResponse.json({ success: true, logo: logoUrl });
}
