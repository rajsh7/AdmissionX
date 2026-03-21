import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/signup/student?error=invalid_token`);
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT id, name, email, is_active, activation_token_exp
       FROM next_student_signups
       WHERE activation_token = ? LIMIT 1`,
      [token],
    );
    const list = rows as { id: number; name: string; email: string; is_active: number; activation_token_exp: Date }[];

    if (!list.length) {
      return NextResponse.redirect(`${baseUrl}/signup/student?error=invalid_token`);
    }

    const student = list[0];

    if (student.is_active) {
      // Already activated — just redirect to dashboard
      return NextResponse.redirect(`${baseUrl}/dashboard/student`);
    }

    if (new Date() > new Date(student.activation_token_exp)) {
      return NextResponse.redirect(`${baseUrl}/signup/student?error=token_expired`);
    }

    await conn.query(
      `UPDATE next_student_signups
       SET is_active = 1, activation_token = NULL, activation_token_exp = NULL
       WHERE id = ?`,
      [student.id],
    );

    const jwtToken = await signStudentToken({
      id: student.id,
      name: student.name,
      email: student.email,
      role: "student",
    });

    const response = NextResponse.redirect(`${baseUrl}/dashboard/student?activated=1`);
    response.cookies.set(STUDENT_COOKIE, jwtToken, COOKIE_OPTIONS);
    return response;
  } finally {
    conn.release();
  }
}
