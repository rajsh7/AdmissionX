import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string = (body.token ?? "").trim();
    const password: string = body.password ?? "";

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const db = await getDb();
    const record = await db.collection("password_reset_tokens").findOne({ token });

    if (!record) {
      return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
    }
    if (record.used) {
      return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 });
    }
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const email = record.email.toLowerCase();

    const collectionMap: Record<string, string> = {
      student: "next_student_signups",
      college: "next_college_signups",
      admin: "next_admin_users",
    };

    await db.collection(collectionMap[record.role]).updateOne(
      { email },
      { $set: { password_hash: hashed } }
    );

    await db.collection("password_reset_tokens").updateOne(
      { _id: record._id },
      { $set: { used: true } }
    );

    return NextResponse.json({ success: true, role: record.role, message: "Password updated successfully." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
