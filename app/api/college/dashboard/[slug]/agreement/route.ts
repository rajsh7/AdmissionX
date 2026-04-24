import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const db = await getDb();
  const [cp] = await db.collection("collegeprofile").aggregate([
    { $match: { slug } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { "u.email": { $regex: `^${payload.email}$`, $options: "i" } },
          { "email":   { $regex: `^${payload.email}$`, $options: "i" } },
        ],
      },
    },
    { $project: { _id: 1, id: 1, slug: 1, "u.firstname": 1, "u.email": 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  const collegeprofile_id = cp.id ? Number(cp.id) : cp._id;
  return {
    payload,
    collegeprofile_id,
    slug: cp.slug as string,
    college_name: String(cp.u?.firstname ?? slug),
    email: String(cp.u?.email ?? payload.email),
  };
}

// GET — fetch agreement status for this college
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const agreement = await db.collection("college_agreements").findOne({
    collegeprofile_id: auth.collegeprofile_id,
  });

  if (!agreement) {
    return NextResponse.json({ signed: false, agreement: null });
  }

  return NextResponse.json({
    signed: true,
    agreement: {
      signed_at: agreement.signed_at
        ? new Date(agreement.signed_at).toLocaleDateString("en-IN", {
            day: "2-digit", month: "long", year: "numeric",
          })
        : null,
      signed_by_name:  String(agreement.signed_by_name ?? ""),
      signed_by_email: String(agreement.signed_by_email ?? ""),
      ip_address:      String(agreement.ip_address ?? ""),
      version:         String(agreement.version ?? "1.0"),
    },
  });
}

// POST — college accepts/signs the agreement
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { signed_by_name, agreed } = body as { signed_by_name?: string; agreed?: boolean };

  if (!agreed) return NextResponse.json({ error: "You must agree to the terms" }, { status: 400 });
  if (!signed_by_name?.trim()) return NextResponse.json({ error: "Signatory name is required" }, { status: 400 });

  // Get IP from headers
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const db = await getDb();

  // Upsert — allow re-signing
  await db.collection("college_agreements").updateOne(
    { collegeprofile_id: auth.collegeprofile_id },
    {
      $set: {
        collegeprofile_id: auth.collegeprofile_id,
        college_slug:      auth.slug,
        signed_by_name:    signed_by_name.trim(),
        signed_by_email:   auth.email,
        college_name:      auth.college_name,
        signed_at:         new Date(),
        ip_address:        ip,
        version:           "1.0",
        updated_at:        new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
