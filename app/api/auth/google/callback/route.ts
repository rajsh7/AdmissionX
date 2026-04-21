import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
    }

    // 2. Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const g = await userRes.json();
    // g = { id, email, name, given_name, family_name, picture, locale, verified_email }

    if (!g.email) {
      return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
    }

    const db         = await getDb();
    const emailLower = g.email.toLowerCase();
    const now        = new Date();

    // 3. Find existing student by email OR google_id
    let student = await db.collection("next_student_signups").findOne({
      $or: [{ email: emailLower }, { google_id: g.id }],
    });

    if (!student) {
      // ── NEW USER ────────────────────────────────────────────────────────────
      const result = await db.collection("next_student_signups").insertOne({
        name:          g.name || emailLower.split("@")[0],
        email:         emailLower,
        phone:         "",
        password_hash: "",           // no password for Google users
        is_active:     1,            // auto-verified via Google
        google_id:     g.id,
        avatar:        g.picture || "",
        auth_provider: "google",
        created_at:    now,
        updated_at:    now,
      });

      // Create profile entry with data from Google
      await db.collection("next_student_profiles").updateOne(
        { student_id: result.insertedId.toString() },
        {
          $set: {
            student_id: result.insertedId.toString(),
            avatar:     g.picture || "",
            updated_at: now,
          },
          $setOnInsert: { created_at: now },
        },
        { upsert: true }
      );

      student = await db.collection("next_student_signups").findOne({ _id: result.insertedId });

    } else {
      // ── EXISTING USER — update Google info ──────────────────────────────────
      await db.collection("next_student_signups").updateOne(
        { _id: student._id },
        {
          $set: {
            is_active:  1,
            google_id:  g.id,
            avatar:     g.picture || student.avatar || "",
            updated_at: now,
            // Update name only if not already set by user
            ...((!student.name || student.name === student.email.split("@")[0]) && g.name
              ? { name: g.name }
              : {}),
          },
        }
      );

      // Update profile avatar if not set
      await db.collection("next_student_profiles").updateOne(
        { student_id: student._id.toString() },
        {
          $set: {
            student_id: student._id.toString(),
            updated_at: now,
            ...(!student.avatar && g.picture ? { avatar: g.picture } : {}),
          },
          $setOnInsert: { created_at: now },
        },
        { upsert: true }
      );
    }

    // 4. Sign JWT and redirect to dashboard
    const jwtToken = await signStudentToken({
      id:    student!._id.toString(),
      name:  student!.name,
      email: student!.email,
      role:  "student",
    });

    const response = NextResponse.redirect(
      `${baseUrl}/dashboard/student/${student!._id.toString()}`
    );
    response.cookies.set(STUDENT_COOKIE, jwtToken, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    console.error("[Google OAuth] Error:", err);
    return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
  }
}
