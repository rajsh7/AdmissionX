import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendStudentActivationEmail } from "@/lib/email";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, dob, marks12, captchaOk } = body;

    if (!name || !email || !phone || !password || !dob || !marks12) {
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

    const existing = await db.collection("next_student_signups").findOne({ email: emailLower });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login or use a different email." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const activationToken = crypto.randomBytes(32).toString("hex");
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await db.collection("next_student_signups").insertOne({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      dob,
      marks12: parseFloat(marks12),
      password_hash: hashed,
      is_active: 0,
      activation_token: activationToken,
      activation_token_exp: tokenExp,
      created_at: new Date(),
      updated_at: new Date(),
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";
      const activationLink = `${baseUrl}/api/auth/activate?token=${activationToken}`;
      await sendStudentActivationEmail(emailLower, name.trim(), activationLink);
    } catch { /* ignore email error */ }

    const token = await signStudentToken({
      id: result.insertedId.toString(),
      name: name.trim(),
      email: emailLower,
      role: "student",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
