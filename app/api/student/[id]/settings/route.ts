import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action?: string; currentPassword?: string; newPassword?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { action, currentPassword, newPassword } = body;

  if (action === "change_password") {
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "currentPassword and newPassword are required." }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    if (currentPassword === newPassword) return NextResponse.json({ error: "New password must differ from the current password." }, { status: 400 });

    const db = await getDb();
    const student = await db.collection("next_student_signups").findOne(
      { email: payload.email } as Filter<Document>,
      { projection: { password_hash: 1 } }
    );
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, student.password_hash);
    if (!isMatch) return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.collection("next_student_signups").updateOne(
      { email: payload.email } as Filter<Document>,
      { $set: { password_hash: newHash, updated_at: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Password changed successfully." });
  }

  return NextResponse.json({ error: `Unknown action: "${action}". Supported: change_password` }, { status: 400 });
}
