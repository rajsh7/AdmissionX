import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendStudentRegistrationEmail } from "@/lib/email";
import crypto from "crypto";
import { enforceRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  const rateLimitError = enforceRateLimit(req, "verify-otp", 10, 15 * 60 * 1000);
  if (rateLimitError) return rateLimitError;

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

    // Check failed attempt count (max 5)
    const attempts = (student.otp_attempts ?? 0) + 1;
    if (attempts > 5) {
      await db.collection("next_student_signups").updateOne(
        { email: email.toLowerCase() },
        {
          $unset: {
            otp_code: "",
            otp_expiry: "",
            otp_purpose: "",
            otp_attempts: "",
          },
        }
      );
      return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP." }, { status: 429 });
    }

    // Convert both to strings and trim for comparison
    const storedOTP = String(student.otp_code).trim();
    const providedOTP = String(otp).trim();

    if (storedOTP !== providedOTP) {
      await db.collection("next_student_signups").updateOne(
        { email: email.toLowerCase() },
        { $set: { otp_attempts: attempts } }
      );
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Verify OTP purpose is for signup
    if (student.otp_purpose !== "signup") {
      return NextResponse.json({ error: "Invalid OTP. Please use the signup OTP." }, { status: 400 });
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const activationLink = `${baseUrl.replace(/\/+$/, "")}/api/auth/activate?token=${activationToken}`;

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
          otp_attempts: "",
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

