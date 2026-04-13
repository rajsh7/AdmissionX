import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;
  // Verify the slug belongs to this college via MongoDB
  const db = await getDb();
  const profile = await db.collection("collegeprofile").findOne(
    { email: payload.email.toLowerCase(), slug },
    { projection: { _id: 1 } }
  );
  if (!profile) return null;
  return { payload, slug };
}

// ── PUT /api/college/dashboard/[slug]/settings ────────────────────────────────
// Body: { action: "change_password", currentPassword: string, newPassword: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, currentPassword, newPassword } = body;

  // ── Action: change_password ───────────────────────────────────────────────
  if (action === "change_password") {
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "currentPassword and newPassword are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "New password must differ from the current password." }, { status: 400 });
    }

    const db = await getDb();
    const signup = await db.collection("next_college_signups").findOne(
      { email: auth.payload.email.toLowerCase() },
      { projection: { _id: 1, password_hash: 1 } }
    );

    if (!signup?.password_hash) {
      return NextResponse.json({ error: "College account not found or no password set." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, signup.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.collection("next_college_signups").updateOne(
      { _id: signup._id },
      { $set: { password_hash: newHash, updated_at: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Password changed successfully." });
  }

  // ── Action: update_account ───────────────────────────────────────────────
  if (action === "update_account") {
    const { name, email, phone } = body as any;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const db = await getDb();
    const oldEmail = auth.payload.email.toLowerCase();
    const newEmail = email.toLowerCase();

    // 1. Update next_college_signups
    await db.collection("next_college_signups").updateOne(
      { email: oldEmail },
      { $set: { college_name: name, email: newEmail, updated_at: new Date() } }
    );

    // 2. Update collegeprofile
    await db.collection("collegeprofile").updateOne(
      { slug: auth.slug },
      { $set: { college_name: name, email: newEmail, contactPhone: phone, updated_at: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Account details updated successfully." });
  }

  // ── Unknown action ────────────────────────────────────────────────────────
  return NextResponse.json(
    { error: `Unknown action: "${action}". Supported: change_password, update_account` },
    { status: 400 },
  );
}
