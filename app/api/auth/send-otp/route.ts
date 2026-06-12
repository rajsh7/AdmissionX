import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = await getDb();
    const student = await db.collection("next_student_signups").findOne({ email: email.toLowerCase() });

    if (!student) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryMinutes = 10;
    const otpExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await db.collection("next_student_signups").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          otp_code: otp,
          otp_expiry: otpExpiry,
          otp_purpose: purpose || "verification",
          updated_at: new Date(),
        },
      }
    );

    await sendOTPEmail(student.email, student.name || "Student", otp, expiryMinutes);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (err) {
    console.error("[Send OTP Error]:", err);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
