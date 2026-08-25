import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  const rateLimitError = enforceRateLimit(req, "verify-login-otp", 10, 15 * 60 * 1000);
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

    if (student.is_active !== 1 && student.is_active !== true) {
      return NextResponse.json({ error: "Please verify and activate your email address before logging in." }, { status: 403 });
    }

    if (!student.otp_code || !student.otp_expiry) {
      return NextResponse.json({ error: "No OTP found. Please login again." }, { status: 400 });
    }

    if (new Date() > new Date(student.otp_expiry)) {
      return NextResponse.json({ error: "OTP has expired. Please login again." }, { status: 400 });
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
      return NextResponse.json({ error: "Too many failed attempts. Please login again to receive a new OTP." }, { status: 429 });
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

    if (student.otp_purpose !== "login") {
      return NextResponse.json({ error: "Invalid OTP purpose." }, { status: 400 });
    }

    // Clear OTP and attempts
    await db.collection("next_student_signups").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
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

    // Create session
    const token = await signStudentToken({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: "student",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: { id: student._id.toString(), name: student.name, email: student.email },
    });
    
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error("[Verify Login OTP Error]:", err);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
