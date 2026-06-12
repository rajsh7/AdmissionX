import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = await getDb();
    const student = await db.collection("next_student_signups").findOne({ 
      email: email.toLowerCase() 
    });

    if (!student) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("next_student_signups").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          otp_code: otp,
          otp_expiry: otpExpiry,
          updated_at: new Date(),
        },
      }
    );

    await sendOTPEmail(student.email, student.name || "Student", otp, 10);

    return NextResponse.json({
      success: true,
      message: "New OTP sent to your email.",
    });
  } catch (err) {
    console.error("[Resend OTP Error]:", err);
    return NextResponse.json({ error: "Failed to resend OTP." }, { status: 500 });
  }
}
