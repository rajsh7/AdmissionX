import { NextResponse } from "next/server";
import { STUDENT_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(STUDENT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
