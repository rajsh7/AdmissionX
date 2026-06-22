import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import { sendSMSLoginOTP } from "@/lib/sms";

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

    try {
      await sendOTPEmail(student.email, student.name || "Student", otp, 10);
    } catch (emailErr) {
      console.error("[Resend OTP] Email sending failed:", emailErr);
    }

    if (student.phone) {
      try {
        await sendSMSLoginOTP(student.phone, otp);
      } catch (smsErr) {
        console.error("[Resend OTP] SMS sending failed:", smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "New OTP sent to your email and mobile.",
    });
  } catch (err) {
    console.error("[Resend OTP Error]:", err);
    return NextResponse.json({ error: "Failed to resend OTP." }, { status: 500 });
  }
}
