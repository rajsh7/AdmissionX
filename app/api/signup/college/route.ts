import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signCollegeToken, COLLEGE_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collegeName, email, contactName, phone, address, courses, password, captchaOk } = body;

    if (!collegeName || !email || !contactName || !phone || !address || !courses || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!captchaOk) {
      return NextResponse.json({ error: "Please verify that you are not a robot." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    const db = await getDb();

    const existing = await db.collection("next_college_signups").findOne({ email: emailLower });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.collection("next_college_signups").insertOne({
      college_name: collegeName.trim(),
      email: emailLower,
      contact_name: contactName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      courses: courses.trim(),
      password_hash: passwordHash,
      status: "approved",  // Direct access — no approval gate
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Auto-login after signup
    const token = await signCollegeToken({
      id: result.insertedId.toString(),
      name: collegeName.trim(),
      email: emailLower,
      role: "college",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COLLEGE_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (err: any) {
    if (err.code === 10107 || err.message?.includes("not primary")) {
      const { forceReconnect } = await import("@/lib/db");
      await forceReconnect();
      return NextResponse.json({ error: "Database error. Please try again." }, { status: 503 });
    }
    console.error("[College Signup]:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
