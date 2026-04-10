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

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
    }

    // Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
    }

    const db = await getDb();
    const emailLower = googleUser.email.toLowerCase();

    // Upsert student
    let student = await db.collection("next_student_signups").findOne({ email: emailLower });

    if (!student) {
      const result = await db.collection("next_student_signups").insertOne({
        name: googleUser.name || emailLower.split("@")[0],
        email: emailLower,
        phone: "",
        password_hash: "",
        is_active: 1,
        google_id: googleUser.id,
        avatar: googleUser.picture || "",
        created_at: new Date(),
        updated_at: new Date(),
      });
      student = await db.collection("next_student_signups").findOne({ _id: result.insertedId });
    } else if (!student.is_active) {
      // Activate if signed in via Google
      await db.collection("next_student_signups").updateOne(
        { _id: student._id },
        { $set: { is_active: 1, google_id: googleUser.id, updated_at: new Date() } }
      );
    }

    const jwtToken = await signStudentToken({
      id: student!._id.toString(),
      name: student!.name,
      email: student!.email,
      role: "student",
    });

    const response = NextResponse.redirect(`${baseUrl}/dashboard/student/${student!._id.toString()}`);
    response.cookies.set(STUDENT_COOKIE, jwtToken, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    console.error("[Google OAuth] Error:", err);
    return NextResponse.redirect(`${baseUrl}/login/student?error=google_failed`);
  }
}
