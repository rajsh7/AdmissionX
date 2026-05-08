import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { sendCollegeSignupConfirmationEmail } from "@/lib/email";
import { enforceRateLimit, rejectUntrustedOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = rejectUntrustedOrigin(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, "signup-college", 5, 15 * 60 * 1000);
  if (rateLimitError) return rateLimitError;

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
    const phoneTrimmed = phone.trim().replace(/[\s\-+]/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(phoneTrimmed)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number starting with 6-9." }, { status: 400 });
    }
    const db = await getDb();

    // Check email uniqueness across ALL collections
    const [existingCollege, existingStudent, existingLegacy, existingAdmin] = await Promise.all([
      db.collection("next_college_signups").findOne({ email: emailLower }, { projection: { _id: 1 } }),
      db.collection("next_student_signups").findOne({ email: emailLower }, { projection: { _id: 1 } }),
      db.collection("users").findOne({ email: { $regex: `^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }, { projection: { _id: 1 } }),
      db.collection("next_admin_users").findOne({ email: emailLower }, { projection: { _id: 1 } }),
    ]);

    if (existingCollege) {
      return NextResponse.json({ error: "A college account with this email already exists. Please login or use a different email." }, { status: 409 });
    }
    if (existingStudent) {
      return NextResponse.json({ error: "This email is already registered as a student account. Please use a different email." }, { status: 409 });
    }
    if (existingLegacy || existingAdmin) {
      return NextResponse.json({ error: "An account with this email already exists. Please login or use a different email." }, { status: 409 });
    }

    if (phoneTrimmed) {
      const existingPhone = await db.collection("next_college_signups").findOne({ phone: phoneTrimmed });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this mobile number already exists. Please use a different number." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.collection("next_college_signups").insertOne({
      college_name: collegeName.trim(),
      email: emailLower,
      contact_name: contactName.trim(),
      phone: phoneTrimmed,
      address: address.trim(),
      courses: courses.trim(),
      password_hash: passwordHash,
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    try {
      await sendCollegeSignupConfirmationEmail(emailLower, collegeName.trim(), contactName.trim());
    } catch { /* ignore */ }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown college signup error");
    const errorCode = typeof err === "object" && err !== null && "code" in err ? (err as { code?: number }).code : undefined;
    const keyPattern = typeof err === "object" && err !== null && "keyPattern" in err
      ? (err as { keyPattern?: { email?: unknown } }).keyPattern
      : undefined;

    // SELF-HEALING: If "not primary" error, force reconnect
    if (errorCode === 10107 || error.message?.includes("not primary")) {
      console.warn("♻️ [College Signup] Detected 'not primary' error. Attempting self-healing reconnection...");
      const { forceReconnect } = await import("@/lib/db");
      await forceReconnect();
      
      return NextResponse.json(
        { error: "Database was out of sync. Connection has been refreshed. Please try again." }, 
        { status: 503 }
      );
    }

    console.error("[College Signup Internal Error]:", error);
    if (errorCode === 11000) {
      const field = keyPattern?.email ? "email" : "mobile number";
      return NextResponse.json({ error: `An account with this ${field} already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: error.message || "Internal server error. Please try again." }, 
      { status: 500 }
    );
  }
}
