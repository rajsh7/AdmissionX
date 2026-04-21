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

  const [rows, degreeOptions, courseOptions, streamOptions] = await Promise.all([
    db.collection("college_cut_offs")
      .find({ collegeprofile_id: auth.collegeprofile_id })
      .sort({ id: 1 })
      .toArray(),
    db.collection("degree").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(200).toArray(),
    db.collection("course").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(500).toArray(),
    db.collection("functionalarea").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(100).toArray(),
  ]);

  const degreeMap = new Map(degreeOptions.map((d: any) => [Number(d.id), d.name]));
  const courseMap = new Map(courseOptions.map((c: any) => [Number(c.id), c.name]));
  const streamMap = new Map(streamOptions.map((s: any) => [Number(s.id), s.name]));

  const cutoffs = rows.map((r: any) => ({
    id: r.id,
    title: r.title ?? "",
    description: r.description ?? null,
    degree_id: r.degree_id ?? null,
    course_id: r.course_id ?? null,
    functionalarea_id: r.functionalarea_id ?? null,
    degree_name: r.degree_id ? degreeMap.get(Number(r.degree_id)) ?? null : null,
    course_name: r.course_id ? courseMap.get(Number(r.course_id)) ?? null : null,
    stream_name: r.functionalarea_id ? streamMap.get(Number(r.functionalarea_id)) ?? null : null,
  }));

  return NextResponse.json({
    cutoffs,
    total: cutoffs.length,
    options: { degrees: degreeOptions, courses: courseOptions, streams: streamOptions },
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
  const last = await db.collection("college_cut_offs").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("college_cut_offs").insertOne({
    id: newId,
    collegeprofile_id: auth.collegeprofile_id,
    title,
    description: body.description?.trim() || null,
    degree_id: body.degree_id ? Number(body.degree_id) : null,
    course_id: body.course_id ? Number(body.course_id) : null,
    functionalarea_id: body.functionalarea_id ? Number(body.functionalarea_id) : null,
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

  const { id, title, description, degree_id, course_id, functionalarea_id } = body;
  if (!id || !title?.trim()) return NextResponse.json({ error: "id and title are required." }, { status: 400 });

  const db = await getDb();
  await db.collection("college_cut_offs").updateOne(
    { id: Number(id), collegeprofile_id: auth.collegeprofile_id },
    { $set: {
      title: title.trim(),
      description: description?.trim() || null,
      degree_id: degree_id ? Number(degree_id) : null,
      course_id: course_id ? Number(course_id) : null,
      functionalarea_id: functionalarea_id ? Number(functionalarea_id) : null,
      updated_at: new Date(),
    }}
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

  const cutoffId = Number(req.nextUrl.searchParams.get("cutoffId"));
  if (!cutoffId) return NextResponse.json({ error: "cutoffId is required." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("college_cut_offs").deleteOne({
    id: cutoffId, collegeprofile_id: auth.collegeprofile_id,
  });

  if (!result.deletedCount) return NextResponse.json({ error: "Cut-off not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
