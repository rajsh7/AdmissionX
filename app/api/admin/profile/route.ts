import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_admin")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET() {
  const payload = await getAdmin();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const admin = await db.collection("next_admin_users").findOne(
    { _id: new ObjectId(payload.id) },
    { projection: { password_hash: 0 } }
  );

  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { _id, ...rest } = admin as any;
  return NextResponse.json({ ...rest, id: _id.toString() });
}

export async function PUT(req: NextRequest) {
  const payload = await getAdmin();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, currentPassword, newPassword } = await req.json();

  const db = await getDb();
  const admin = await db.collection("next_admin_users").findOne({ _id: new ObjectId(payload.id) });
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const $set: Record<string, unknown> = { updated_at: new Date() };

  if (name?.trim()) $set.name = name.trim();
  if (email?.trim()) $set.email = email.trim();

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, admin.password_hash as string);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    $set.password_hash = await bcrypt.hash(newPassword, 10);
  }

  await db.collection("next_admin_users").updateOne({ _id: new ObjectId(payload.id) }, { $set });

  return NextResponse.json({ success: true });
}
