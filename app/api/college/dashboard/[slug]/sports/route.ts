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

// GET
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const rows = await db.collection("college_sports_activities")
    .find({ collegeprofile_id: auth.collegeprofile_id })
    .sort({ typeOfActivity: 1, name: 1 })
    .toArray();

  const activities = rows.map((r: any) => ({
    id: r.id,
    typeOfActivity: r.typeOfActivity ?? "Sports",
    name: r.name ?? "",
  }));

  return NextResponse.json({ activities, total: activities.length });
}

// POST
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const name = body.name?.trim();
  const typeOfActivity = body.typeOfActivity?.trim() || "Sports";
  if (!name) return NextResponse.json({ error: "name is required." }, { status: 400 });

  const db = await getDb();

  const existing = await db.collection("college_sports_activities").findOne({
    collegeprofile_id: auth.collegeprofile_id, name, typeOfActivity,
  });
  if (existing) return NextResponse.json({ error: `"${name}" already exists under ${typeOfActivity}.` }, { status: 409 });

  const last = await db.collection("college_sports_activities").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("college_sports_activities").insertOne({
    id: newId,
    collegeprofile_id: auth.collegeprofile_id,
    name,
    typeOfActivity,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, id: newId }, { status: 201 });
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activityId = Number(req.nextUrl.searchParams.get("activityId"));
  if (!activityId) return NextResponse.json({ error: "activityId is required." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("college_sports_activities").deleteOne({
    id: activityId, collegeprofile_id: auth.collegeprofile_id,
  });

  if (!result.deletedCount) return NextResponse.json({ error: "Activity not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
