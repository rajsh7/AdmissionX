import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

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
      return NextResponse.json({ error: "No OTP found. Please login again." }, { status: 400 });
    }

    if (new Date() > new Date(student.otp_expiry)) {
      return NextResponse.json({ error: "OTP has expired. Please login again." }, { status: 400 });
    }

    // Convert both to strings and trim for comparison
    const storedOTP = String(student.otp_code).trim();
    const providedOTP = String(otp).trim();

    console.log("[Login OTP Verify] Stored:", storedOTP, "Provided:", providedOTP, "Match:", storedOTP === providedOTP);

    if (storedOTP !== providedOTP) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    if (student.otp_purpose !== "login") {
      return NextResponse.json({ error: "Invalid OTP purpose." }, { status: 400 });
    }

    // Clear OTP
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
