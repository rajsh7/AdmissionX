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

    if (!result || !result.insertedId) {
      throw new Error("Failed to insert student record into database. The database may be in mock mode or connection failed.");
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";
      const activationLink = `${baseUrl}/api/auth/activate?token=${activationToken}`;
      await sendStudentActivationEmail(emailLower, name.trim(), activationLink);
    } catch (emailErr) { 
      console.error("[Signup] Email sending failed:", emailErr);
    }

    const token = await signStudentToken({
      id: result.insertedId.toString(),
      name: name.trim(),
      email: emailLower,
      role: "student",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);
    return response;
  } catch (err: any) {
    // SELF-HEALING: If "not primary" error, force reconnect and retry once
    if (err.code === 10107 || err.message?.includes("not primary")) {
      console.warn("♻️ [Signup] Detected 'not primary' error. Attempting self-healing reconnection...");
      const { forceReconnect } = await import("@/lib/db");
      await forceReconnect();
      
      // Optional: Small delay to allow replica set to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recursively call for one retry attempt (using a flag or just one-off)
      // For safety, we just throw a custom message asking to try once more 
      // OR we can actually re-run the logic. Let's do a clean error for now
      // that explains the reconnection happened.
      return NextResponse.json(
        { error: "Database was out of sync. Connection has been refreshed. Please click 'Create Account' again." }, 
        { status: 503 }
      );
    }

    console.error("[Signup Internal Error]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error. Please try again." }, 
      { status: 500 }
    );
  }
}
