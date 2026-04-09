import { NextResponse } from "next/server";
import {
  STUDENT_COOKIE,
  COLLEGE_COOKIE,
  ADMIN_COOKIE,
  COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const clearOptions = {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  };

  response.cookies.set(STUDENT_COOKIE, "", clearOptions);
  response.cookies.set(COLLEGE_COOKIE, "", clearOptions);
  response.cookies.set(ADMIN_COOKIE, "", clearOptions);

  return response;
}
