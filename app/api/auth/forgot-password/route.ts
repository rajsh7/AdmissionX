import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const EXPIRES_IN_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const db = await getDb();
    let found: { name: string; role: "student" | "college" | "admin" } | null = null;

    // 1. Check new student signups
    const student = await db.collection("next_student_signups").findOne(
      { email },
      { projection: { name: 1 } }
    );
    if (student) found = { name: student.name, role: "student" };

    // 2. Check new college signups
    if (!found) {
      const college = await db.collection("next_college_signups").findOne(
        { email },
        { projection: { college_name: 1 } }
      );
      if (college) found = { name: college.college_name, role: "college" };
    }

    // 3. Check legacy users table (old college/student accounts from MySQL migration)
    if (!found) {
      const legacyUser = await db.collection("users").findOne(
        { email: { $regex: `^${email}$`, $options: "i" } },
        { projection: { firstname: 1, lastname: 1, type_of_user: 1 } }
      );
      if (legacyUser) {
        const name = [legacyUser.firstname, legacyUser.lastname].filter(Boolean).join(" ") || email;
        const role = legacyUser.type_of_user === "COLLEGE" ? "college" : "student";
        found = { name, role };
      }
    }

    // 4. Check admin users
    if (!found) {
      const admin = await db.collection("next_admin_users").findOne(
        { email, is_active: true },
        { projection: { name: 1 } }
      );
      if (admin) found = { name: admin.name, role: "admin" };
    }

    // Always return success to prevent email enumeration
    if (!found) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Invalidate existing unused tokens for this email
    await db.collection("password_reset_tokens").updateMany(
      { email, used: false },
      { $set: { used: true } }
    );

    // Generate secure token
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MS);

    await db.collection("password_reset_tokens").insertOne({
      email,
      role: found.role,
      token,
      expires_at: expiresAt,
      used: false,
      created_at: new Date(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${token}`;

    await sendPasswordResetEmail(email, found.name, resetLink, found.role);

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
