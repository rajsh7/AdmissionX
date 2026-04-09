import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signAdminToken, ADMIN_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection("next_admin_users").findOne(
      { email: email.trim().toLowerCase() },
      { projection: { _id: 1, name: 1, email: 1, password_hash: 1, is_active: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "This admin account has been disabled. Contact the super admin." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signAdminToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: "admin" },
    });
    response.cookies.set(ADMIN_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 });
    return response;
  } catch (err) {
    console.error("[admin login]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
