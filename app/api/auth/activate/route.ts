import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signStudentToken, STUDENT_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/signup/student?error=invalid_token`);
  }

  const db = await getDb();
  const student = await db.collection("next_student_signups").findOne(
    { activation_token: token },
    { projection: { _id: 1, name: 1, email: 1, is_active: 1, activation_token_exp: 1 } }
  );

  if (!student) {
    return NextResponse.redirect(`${baseUrl}/signup/student?error=invalid_token`);
  }

  if (student.is_active === 1 || student.is_active === true) {
    // Already active — just log them in and redirect
    const jwtToken = await signStudentToken({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: "student",
    });
    const response = NextResponse.redirect(`${baseUrl}/dashboard/student/${student._id.toString()}`);
    response.cookies.set(STUDENT_COOKIE, jwtToken, COOKIE_OPTIONS);
    return response;
  }

  if (new Date() > new Date(student.activation_token_exp)) {
    return NextResponse.redirect(`${baseUrl}/signup/student?error=token_expired`);
  }

  await db.collection("next_student_signups").updateOne(
    { _id: student._id },
    { $set: { is_active: 1, activation_token: null, activation_token_exp: null } }
  );

  const jwtToken = await signStudentToken({
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    role: "student",
  });

  const response = NextResponse.redirect(`${baseUrl}/dashboard/student/${student._id.toString()}?activated=1`);
  response.cookies.set(STUDENT_COOKIE, jwtToken, COOKIE_OPTIONS);
  return response;
}
