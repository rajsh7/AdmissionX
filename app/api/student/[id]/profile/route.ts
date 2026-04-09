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
    { projection: { _id: 1, name: 1, email: 1, phone: 1, created_at: 1 } }
  );
  if (!base) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const prof = await db.collection("next_student_profiles").findOne(
    { student_id: id } as Filter<Document>,
    { projection: { dob: 1, gender: 1, city: 1, state: 1, country: 1, photo: 1, hobbies: 1, interest: 1, about: 1 } }
  ) ?? {};

  const p = prof as Record<string, unknown>;
  const fields = [base.name, base.email, base.phone, p.dob, p.gender, p.city, p.state, p.photo, p.hobbies, p.interest, p.about];
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
    photo: p.photo ?? "",
    hobbies: p.hobbies ?? "",
    interest: p.interest ?? "",
    about: p.about ?? "",
    member_since: base.created_at,
    profile_complete: profileComplete,
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

  const { name, phone, dob, gender, city, state, country, hobbies, interest, about } = body;
  const db = await getDb();

  const baseUpdate: Record<string, unknown> = { updated_at: new Date() };
  if (name?.trim()) baseUpdate.name = name.trim();
  if (phone !== undefined) baseUpdate.phone = phone.trim() || "";

  await db.collection("next_student_signups").updateOne(
    { email: payload.email } as Filter<Document>,
    { $set: baseUpdate }
  );

  await db.collection("next_student_profiles").updateOne(
    { student_id: id } as Filter<Document>,
    {
      $set: {
        student_id: id,
        dob: dob || null,
        gender: gender || null,
        city: city || null,
        state: state || null,
        country: country || "India",
        hobbies: hobbies || null,
        interest: interest || null,
        about: about || null,
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true, message: "Profile updated successfully" });
}
