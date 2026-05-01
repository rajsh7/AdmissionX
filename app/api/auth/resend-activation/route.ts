import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendStudentActivationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const emailLower = email.trim().toLowerCase();
    const db = await getDb();

    const student = await db.collection("next_student_signups").findOne(
      { email: emailLower },
      { projection: { _id: 1, name: 1, is_active: 1 } }
    );

    // Always return success to prevent email enumeration
    const isAlreadyActive = student.is_active === 1 || student.is_active === true || student.is_active === "1";
    if (!student || isAlreadyActive) {
      return NextResponse.json({ success: true });
    }

    const activationToken = crypto.randomBytes(32).toString("hex");
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.collection("next_student_signups").updateOne(
      { _id: student._id },
      { $set: { activation_token: activationToken, activation_token_exp: tokenExp } }
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";
    await sendStudentActivationEmail(
      emailLower,
      student.name,
      `${baseUrl}/api/auth/activate?token=${activationToken}`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ResendActivation]", err);
    return NextResponse.json({ error: "Failed to resend. Please try again." }, { status: 500 });
  }
}
