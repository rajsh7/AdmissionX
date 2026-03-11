import { NextRequest, NextResponse } from "next/server";
import { verifyStudentToken, STUDENT_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(STUDENT_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifyStudentToken(token);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
  });
}
