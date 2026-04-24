import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { saveUpload } from "@/lib/upload-utils";
import { Filter, Document } from "mongodb";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  if (!file || !file.size) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const photoUrl = await saveUpload(file, "student", "photo");

  const db = await getDb();
  await db.collection("next_student_profiles").updateOne(
    { student_id: id } as Filter<Document>,
    { $set: { student_id: id, photo: photoUrl, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );

  try {
    const { ObjectId } = require("mongodb");
    await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { avatar: photoUrl } }
    );
  } catch (e) {
    console.error("Error updating avatar in signups collection:", e);
  }

  return NextResponse.json({ success: true, photo: photoUrl });
}
