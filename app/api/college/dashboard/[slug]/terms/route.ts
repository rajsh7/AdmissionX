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

// GET — fetch terms acceptance status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const record = await db.collection("college_terms_acceptance").findOne({
    collegeprofile_id: auth.collegeprofile_id,
  });

  if (!record) return NextResponse.json({ accepted: false, accepted_at: null });

  return NextResponse.json({
    accepted: true,
    accepted_at: record.accepted_at
      ? new Date(record.accepted_at).toLocaleDateString("en-IN", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : null,
    version: String(record.version ?? "1.0"),
  });
}

// POST — college accepts the terms
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.accepted) return NextResponse.json({ error: "accepted must be true" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const db = await getDb();
  await db.collection("college_terms_acceptance").updateOne(
    { collegeprofile_id: auth.collegeprofile_id },
    {
      $set: {
        collegeprofile_id: auth.collegeprofile_id,
        college_slug:      auth.slug,
        college_name:      auth.college_name,
        accepted_by_email: auth.email,
        accepted_at:       new Date(),
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
