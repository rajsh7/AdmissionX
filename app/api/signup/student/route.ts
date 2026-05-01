import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendStudentActivationEmail } from "@/lib/email";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, captchaOk } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!captchaOk) {
      return NextResponse.json({ error: "Please verify that you are not a robot." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    const phoneTrimmed = phone.trim();
    const db = await getDb();

    // Check email uniqueness across ALL collections
    const [existingStudent, existingCollege, existingLegacy, existingAdmin] = await Promise.all([
      db.collection("next_student_signups").findOne({ email: emailLower }, { projection: { _id: 1 } }),
      db.collection("next_college_signups").findOne({ email: emailLower }, { projection: { _id: 1 } }),
      db.collection("users").findOne({ email: { $regex: `^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }, { projection: { _id: 1 } }),
      db.collection("next_admin_users").findOne({ email: emailLower }, { projection: { _id: 1 } }),
    ]);

    if (existingStudent) {
      return NextResponse.json({ error: "A student account with this email already exists. Please login or use a different email." }, { status: 409 });
    }
    if (existingCollege) {
      return NextResponse.json({ error: "This email is already registered as a college account. Please use a different email." }, { status: 409 });
    }
    if (existingLegacy || existingAdmin) {
      return NextResponse.json({ error: "An account with this email already exists. Please login or use a different email." }, { status: 409 });
    }

    if (phoneTrimmed) {
      const existingPhone = await db.collection("next_student_signups").findOne({ phone: phoneTrimmed });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this mobile number already exists. Please use a different number." },
          { status: 409 }
        );
      }
    }

    const hashed = await bcrypt.hash(password, 12);
    const activationToken = crypto.randomBytes(32).toString("hex");
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await db.collection("next_student_signups").insertOne({
      name: name.trim(),
      email: emailLower,
      phone: phoneTrimmed,
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
    // MongoDB duplicate key error
    if (err.code === 11000) {
      const field = err.keyPattern?.email ? "email" : "mobile number";
      return NextResponse.json({ error: `An account with this ${field} already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: err.message || "Internal server error. Please try again." }, 
      { status: 500 }
    );
  }
}
