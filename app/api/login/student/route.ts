import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

    // is_active can be stored as 1, true, or "1" in MongoDB
    const isActive = user.is_active === 1 || user.is_active === true || user.is_active === "1";
    const isDev = process.env.NODE_ENV === "development" || process.env.APP_ENV === "local";
    if (!isActive && !isDev) {
      return NextResponse.json(
        { error: "Please verify your email address before logging in. Check your inbox for the activation link." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signStudentToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: "student",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
    response.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTIONS);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
