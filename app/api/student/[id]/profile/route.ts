import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Filter, Document } from "mongodb";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();

  const base = await db.collection("next_student_signups").findOne(
    { email: payload.email } as Filter<Document>,
    { projection: { _id: 1, name: 1, email: 1, phone: 1, created_at: 1, avatar: 1, google_id: 1, auth_provider: 1 } }
  );
  if (!base) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const prof = await db.collection("next_student_profiles").findOne(
    { student_id: id } as Filter<Document>,
    { projection: { dob: 1, gender: 1, city: 1, state: 1, country: 1, pincode: 1, address: 1, photo: 1, hobbies: 1, interest: 1, about: 1, avatar: 1, parentsname: 1, parentsnumber: 1, project_title: 1, projects: 1 } }
    { $or: [{ student_id: id }, { student_id: base._id.toString() }] } as Filter<Document>,
    { projection: { dob: 1, gender: 1, city: 1, state: 1, country: 1, pincode: 1, address: 1, photo: 1, hobbies: 1, interest: 1, about: 1, parentsname: 1, parentsnumber: 1, project_title: 1, projects: 1 } }
  ) ?? {};

  const p = prof as Record<string, unknown>;
  const photo = p.photo || p.avatar || base.avatar || "";
  const fields = [base.name, base.email, base.phone, p.dob, p.gender, p.city, p.state, photo, p.hobbies, p.interest, p.about];
  const profileComplete = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return NextResponse.json({
    id: base._id,
    name: base.name,
    email: base.email,
    phone: base.phone ?? "",
    dob: p.dob ?? "",
    gender: p.gender ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    country: p.country ?? "India",
    photo: photo,
    pincode: p.pincode ?? "",
    address: p.address ?? "",
    hobbies: p.hobbies ?? "",
    interest: p.interest ?? "",
    about: p.about ?? "",
    parentsname: p.parentsname ?? "",
    parentsnumber: p.parentsnumber ?? "",
    project_title: p.project_title ?? "",
    projects: p.projects ?? "",
    member_since: base.created_at,
    profile_complete: profileComplete,
    auth_provider: base.auth_provider ?? "email",
    has_password: !!base.password_hash,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, phone, dob, gender, city, state, country, pincode, address, hobbies, interest, about, parentsname, parentsnumber, project_title, projects } = body;
  const db = await getDb();

  // Get the actual student document to ensure we use the correct _id
  const base = await db.collection("next_student_signups").findOne(
    { email: payload.email } as Filter<Document>,
    { projection: { _id: 1, name: 1, phone: 1 } }
  );
  if (!base) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const canonicalId = base._id.toString();

  const baseUpdate: Record<string, unknown> = { updated_at: new Date() };
  if (name?.trim()) baseUpdate.name = name.trim();
  if (phone !== undefined) baseUpdate.phone = phone.trim() || "";

  await db.collection("next_student_signups").updateOne(
    { email: payload.email } as Filter<Document>,
    { $set: baseUpdate }
  );

  // Only update fields that were actually sent in the request body
  const profileSet: Record<string, unknown> = { student_id: canonicalId, updated_at: new Date() };
  if (dob !== undefined)           profileSet.dob           = dob || null;
  if (gender !== undefined)        profileSet.gender        = gender || null;
  if (city !== undefined)          profileSet.city          = city || null;
  if (state !== undefined)         profileSet.state         = state || null;
  if (country !== undefined)       profileSet.country       = country || "India";
  if (pincode !== undefined)       profileSet.pincode       = pincode || null;
  if (address !== undefined)       profileSet.address       = address || null;
  if (hobbies !== undefined)       profileSet.hobbies       = hobbies || null;
  if (interest !== undefined)      profileSet.interest      = interest || null;
  if (about !== undefined)         profileSet.about         = about || null;
  if (parentsname !== undefined)    profileSet.parentsname    = parentsname || null;
  if (parentsnumber !== undefined)  profileSet.parentsnumber  = parentsnumber || null;
  if (project_title !== undefined)  profileSet.project_title  = project_title || null;
  if (projects !== undefined)       profileSet.projects       = projects || null;

  await db.collection("next_student_profiles").updateOne(
    { $or: [{ student_id: canonicalId }, { student_id: id }] } as Filter<Document>,
    {
      $set: profileSet,
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true, message: "Profile updated successfully" });
}
