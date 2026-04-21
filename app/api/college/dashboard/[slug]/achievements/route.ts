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

// GET — list all achievements for this college
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const achievements = await db.collection("college_achievements")
    .find({ college_slug: slug })
    .sort({ year: -1, _id: -1 })
    .toArray();

  return NextResponse.json({
    achievements: achievements.map((a: any) => ({
      id: a._id.toString(),
      title: a.title ?? "",
      description: a.description ?? "",
      year: a.year ?? "",
      category: a.category ?? "Other",
    })),
  });
}

// POST — add new achievement
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, year, category } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("college_achievements").insertOne({
    college_slug: slug,
    title: title.trim(),
    description: description?.trim() || "",
    year: year?.trim() || "",
    category: category || "Other",
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
}

// DELETE — remove achievement by id
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
  await db.collection("college_achievements").deleteOne({
    _id: new ObjectId(id),
    college_slug: slug,
  });

  return NextResponse.json({ success: true });
}

// PUT — update achievement
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, description, year, category } = body;
  if (!id || !title?.trim()) return NextResponse.json({ error: "id and title are required." }, { status: 400 });

  const { ObjectId } = await import("mongodb");
  const db = await getDb();
  await db.collection("college_achievements").updateOne(
    { _id: new ObjectId(id), college_slug: slug },
    { $set: { title: title.trim(), description: description?.trim() || "", year: year?.trim() || "", category: category || "Other", updated_at: new Date() } }
  );

  return NextResponse.json({ success: true });
}
