import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signCollegeToken, COLLEGE_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const emailLower = email.trim().toLowerCase();

    const user = await db.collection("next_college_signups").findOne(
      { email: emailLower },
      { projection: { _id: 1, college_name: 1, email: 1, password_hash: 1, status: 1, slug: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "rejected" || user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support@admissionx.com." },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Get slug from collegeprofile if not stored on signup record
    let slug: string | null = user.slug ?? null;
    if (!slug) {
      try {
        const profile = await db.collection("collegeprofile").findOne(
          { $or: [{ email: emailLower }, { users_id: user._id }] },
          { projection: { slug: 1 } }
        );
        slug = profile?.slug ?? null;
      } catch { /* non-fatal */ }
    }

    const token = await signCollegeToken({
      id: user._id.toString(),
      name: user.college_name,
      email: user.email,
      role: "college",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id.toString(), name: user.college_name, email: user.email, role: "college", slug },
    });
    response.cookies.set(COLLEGE_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
