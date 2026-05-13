import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { enforceRateLimit, rejectUntrustedOrigin } from "@/lib/security";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const originError = rejectUntrustedOrigin(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, "login-student", 8, 10 * 60 * 1000);
  if (rateLimitError) return rateLimitError;

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection("next_student_signups").findOne(
      { email: email.trim().toLowerCase() },
      { projection: { _id: 1, name: 1, email: 1, password_hash: 1, is_active: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isActive = user.is_active === 1 || user.is_active === true || user.is_active === "1";
    const isDev = process.env.NODE_ENV === "development" || process.env.APP_ENV === "local";
    if (!isActive && !isDev) {
      return NextResponse.json(
        { error: "Please verify your email address before logging in. Check your inbox for the OTP." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate OTP for login
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("next_student_signups").updateOne(
      { _id: user._id },
      {
        $set: {
          otp_code: otp,
          otp_expiry: otpExpiry,
          otp_purpose: "login",
          updated_at: new Date(),
        },
      }
    );

    try {
      await sendOTPEmail(user.email, user.name || "Student", otp, 10);
    } catch (emailErr) {
      console.error("[Login] OTP email sending failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      pending_otp: true,
      message: "OTP sent to your email. Please verify to complete login.",
      user: { id: user._id.toString(), email: user.email },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
