import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

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
  const rows = await db.collection("event")
    .find({ collegeprofile_id: auth.collegeprofile_id })
    .sort({ datetime: -1, _id: -1 })
    .toArray();

  const events = rows.map((e: any) => ({
    id: e._id.toString(),
    name: e.name ?? "",
    datetime: e.datetime ?? "",
    venue: e.venue ?? "",
    description: e.description ?? "",
    link: e.link ?? "",
  }));

  return NextResponse.json({ events });
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

  const { name, datetime, venue, description, link } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Event name is required." }, { status: 400 });

  const db = await getDb();
  const last = await db.collection("event").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  const result = await db.collection("event").insertOne({
    id: newId,
    collegeprofile_id: auth.collegeprofile_id,
    name: name.trim(),
    datetime: datetime?.trim() || null,
    venue: venue?.trim() || null,
    description: description?.trim() || null,
    link: link?.trim() || null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
}

// PUT
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const { id, name, datetime, venue, description, link } = body;
  if (!id || !name?.trim()) return NextResponse.json({ error: "id and name are required." }, { status: 400 });

  const db = await getDb();
  await db.collection("event").updateOne(
    { _id: new ObjectId(id), collegeprofile_id: auth.collegeprofile_id },
    { $set: { name: name.trim(), datetime: datetime?.trim() || null, venue: venue?.trim() || null, description: description?.trim() || null, link: link?.trim() || null, updated_at: new Date() } }
  );

  return NextResponse.json({ success: true });
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

  const db = await getDb();
  await db.collection("event").deleteOne({ _id: new ObjectId(id), collegeprofile_id: auth.collegeprofile_id });

  return NextResponse.json({ success: true });
}
