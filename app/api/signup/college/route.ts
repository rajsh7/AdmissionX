import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { sendCollegeSignupConfirmationEmail } from "@/lib/email";

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
        { error: "An account with this email already exists. Please login or use a different email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.collection("next_college_signups").insertOne({
      college_name: collegeName.trim(),
      email: emailLower,
      contact_name: contactName.trim(),
      phone: phone.trim(),
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
  } catch (err: any) {
    // SELF-HEALING: If "not primary" error, force reconnect
    if (err.code === 10107 || err.message?.includes("not primary")) {
      console.warn("♻️ [College Signup] Detected 'not primary' error. Attempting self-healing reconnection...");
      const { forceReconnect } = await import("@/lib/db");
      await forceReconnect();
      
      return NextResponse.json(
        { error: "Database was out of sync. Connection has been refreshed. Please try again." }, 
        { status: 503 }
      );
    }

    console.error("[College Signup Internal Error]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error. Please try again." }, 
      { status: 500 }
    );
  }
}
