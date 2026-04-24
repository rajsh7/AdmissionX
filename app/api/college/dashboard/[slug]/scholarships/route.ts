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
  const rows = await db.collection("college_scholarships")
    .find({ collegeprofile_id: auth.collegeprofile_id })
    .sort({ id: 1 })
    .toArray();

  return NextResponse.json({
    scholarships: rows.map((r: any) => ({
      id: r.id,
      title: r.title ?? "",
      description: r.description ?? "",
    })),
    total: rows.length,
  });
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

  const title = body.title?.trim();
  if (!title) return NextResponse.json({ error: "title is required." }, { status: 400 });

  const db = await getDb();
  const last = await db.collection("college_scholarships").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("college_scholarships").insertOne({
    id: newId,
    collegeprofile_id: auth.collegeprofile_id,
    title,
    description: body.description?.trim() || null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, id: newId }, { status: 201 });
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

  const { id, title, description } = body;
  if (!id || !title?.trim()) return NextResponse.json({ error: "id and title are required." }, { status: 400 });

  const db = await getDb();
  await db.collection("college_scholarships").updateOne(
    { id: Number(id), collegeprofile_id: auth.collegeprofile_id },
    { $set: { title: title.trim(), description: description?.trim() || null, updated_at: new Date() } }
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

  const scholarshipId = Number(req.nextUrl.searchParams.get("scholarshipId"));
  if (!scholarshipId) return NextResponse.json({ error: "scholarshipId is required." }, { status: 400 });

  const db = await getDb();
  await db.collection("college_scholarships").deleteOne({
    id: scholarshipId,
    collegeprofile_id: auth.collegeprofile_id,
  });

  return NextResponse.json({ success: true });
}
