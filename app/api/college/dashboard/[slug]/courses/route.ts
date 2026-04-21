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

  const [courseRows, courseOptions, degreeOptions, streamOptions] = await Promise.all([
    db.collection("collegemaster")
      .find({ collegeprofile_id: auth.collegeprofile_id })
      .sort({ functionalarea_id: 1, degree_id: 1, course_id: 1 })
      .toArray(),
    db.collection("course").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(500).toArray(),
    db.collection("degree").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(200).toArray(),
    db.collection("functionalarea").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(100).toArray(),
  ]);

  const courseMap = new Map(courseOptions.map((c: any) => [Number(c.id), c.name]));
  const degreeMap = new Map(degreeOptions.map((d: any) => [Number(d.id), d.name]));
  const streamMap = new Map(streamOptions.map((s: any) => [Number(s.id), s.name]));

  const courses = courseRows.map((cm: any) => ({
    id: cm.id,
    course_id: cm.course_id ?? null,
    degree_id: cm.degree_id ?? null,
    functionalarea_id: cm.functionalarea_id ?? null,
    course_name: cm.course_id ? courseMap.get(Number(cm.course_id)) ?? null : null,
    degree_name: cm.degree_id ? degreeMap.get(Number(cm.degree_id)) ?? null : null,
    stream_name: cm.functionalarea_id ? streamMap.get(Number(cm.functionalarea_id)) ?? null : null,
    fees: cm.fees ?? null,
    seats: cm.seats ?? null,
    courseduration: cm.courseduration ?? null,
    twelvemarks: cm.twelvemarks ?? null,
    description: cm.description ?? null,
  }));

  return NextResponse.json({
    courses,
    options: { courses: courseOptions, degrees: degreeOptions, streams: streamOptions },
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

  const { course_id, degree_id, functionalarea_id, fees, seats, courseduration, twelvemarks, description } = body;
  if (!course_id || !degree_id || !functionalarea_id)
    return NextResponse.json({ error: "course_id, degree_id, and functionalarea_id are required." }, { status: 400 });

  const db = await getDb();

  const existing = await db.collection("collegemaster").findOne({
    collegeprofile_id: auth.collegeprofile_id,
    course_id: Number(course_id),
    degree_id: Number(degree_id),
    functionalarea_id: Number(functionalarea_id),
  });
  if (existing) return NextResponse.json({ error: "This course/degree/stream combination already exists." }, { status: 409 });

  const last = await db.collection("collegemaster").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const newId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("collegemaster").insertOne({
    id: newId,
    collegeprofile_id: auth.collegeprofile_id,
    course_id: Number(course_id),
    degree_id: Number(degree_id),
    functionalarea_id: Number(functionalarea_id),
    fees: fees ? Number(fees) : null,
    seats: seats ? Number(seats) : null,
    courseduration: courseduration?.trim() || null,
    twelvemarks: twelvemarks ? Number(twelvemarks) : null,
    description: description?.trim() || null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, message: "Course added successfully." }, { status: 201 });
}

// PUT
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = Number(req.nextUrl.searchParams.get("courseId"));
  if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const db = await getDb();
  const $set: Record<string, unknown> = { updated_at: new Date() };
  if (body.fees !== undefined) $set.fees = body.fees ? Number(body.fees) : null;
  if (body.seats !== undefined) $set.seats = body.seats ? Number(body.seats) : null;
  if (body.courseduration !== undefined) $set.courseduration = body.courseduration?.trim() || null;
  if (body.twelvemarks !== undefined) $set.twelvemarks = body.twelvemarks ? Number(body.twelvemarks) : null;
  if (body.description !== undefined) $set.description = body.description?.trim() || null;

  const result = await db.collection("collegemaster").updateOne(
    { id: courseId, collegeprofile_id: auth.collegeprofile_id },
    { $set }
  );

  if (!result.matchedCount)
    return NextResponse.json({ error: "Course not found." }, { status: 404 });

  return NextResponse.json({ success: true, message: "Course updated successfully." });
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = Number(req.nextUrl.searchParams.get("courseId"));
  if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("collegemaster").deleteOne({
    id: courseId,
    collegeprofile_id: auth.collegeprofile_id,
  });

  if (!result.deletedCount)
    return NextResponse.json({ error: "Course not found or does not belong to your college." }, { status: 404 });

  return NextResponse.json({ success: true, message: "Course deleted successfully." });
}
