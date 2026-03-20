import { NextRequest, NextResponse } from "next/server";
import {
  STUDENT_COOKIE,
  COLLEGE_COOKIE,
  ADMIN_COOKIE,
  verifyStudentToken,
  verifyCollegeToken,
  verifyAdminToken,
} from "./lib/auth";

function redirectToLogin(
  request: NextRequest,
  loginPath: string,
  from: string,
) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("redirect", from);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect /dashboard/student/* ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard/student")) {
    const token = request.cookies.get(STUDENT_COOKIE)?.value;

    if (!token) {
      return redirectToLogin(request, "/login/student", pathname);
    }

    const valid = await verifyStudentToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login/student", pathname);
      res.cookies.delete(STUDENT_COOKIE);
      return res;
    }

    return NextResponse.next();
  }

  // ── Protect /dashboard/college/* ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard/college")) {
    const token = request.cookies.get(COLLEGE_COOKIE)?.value;

    if (!token) {
      return redirectToLogin(request, "/login/college", pathname);
    }

    const valid = await verifyCollegeToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login/college", pathname);
      res.cookies.delete(COLLEGE_COOKIE);
      return res;
    }

    return NextResponse.next();
  }

  // ── Protect /admin/* ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;

    if (!token) {
      return redirectToLogin(request, "/admin/login", pathname); 
    }

    const valid = await verifyAdminToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login", pathname);
      res.cookies.delete(ADMIN_COOKIE);
      return res;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/student/:path*",
    "/dashboard/college/:path*",
    "/admin/:path*",
  ],
};
