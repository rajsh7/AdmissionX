import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendStudentRegistrationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const db = await getDb();
    const student = await db.collection("next_student_signups").findOne({ 
      email: email.toLowerCase() 
    });

    if (!student) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (!student.otp_code || !student.otp_expiry) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (new Date() > new Date(student.otp_expiry)) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Convert both to strings and trim for comparison
    const storedOTP = String(student.otp_code).trim();
    const providedOTP = String(otp).trim();

    console.log("[OTP Verify] Stored:", storedOTP, "Provided:", providedOTP, "Match:", storedOTP === providedOTP);

    if (storedOTP !== providedOTP) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Verify OTP purpose is for signup
    if (student.otp_purpose !== "signup") {
      return NextResponse.json({ error: "Invalid OTP. Please use the signup OTP." }, { status: 400 });
    }

    // Generate activation token
    const crypto = require("crypto");
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const activationLink = `${baseUrl}/api/auth/activate?token=${activationToken}`;

    // Mark OTP as verified and set activation token
    await db.collection("next_student_signups").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          otp_verified: true,
          activation_token: activationToken,
          activation_token_exp: activationExpiry,
          updated_at: new Date(),
        },
        $unset: {
          otp_code: "",
          otp_expiry: "",
          otp_purpose: "",
        },
      }
    );

    // Send registration success email with activation link
    setImmediate(async () => {
      try {
        await sendStudentRegistrationEmail(
          student.email,
          student.name || "Student",
          student.email,
          student.phone || "",
          activationLink
        );
      } catch (emailErr) {
        console.error("[Verify OTP] Registration email failed:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: "OTP verified! Please check your email and click the activation link to access your dashboard.",
    });
  } catch (err) {
    console.error("[Verify OTP Error]:", err);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
