import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "adx-dev-secret-change-me-in-production",
);

function redirectToLogin(
  request: NextRequest,
  loginPath: string,
  from: string,
) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("redirect", from);
  return NextResponse.redirect(url);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect /dashboard/student/* ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard/student")) {
    const token = request.cookies.get("adx_student")?.value;

    if (!token) {
      return redirectToLogin(request, "/login/student", pathname);
    }

    const valid = await verifyToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login/student", pathname);
      res.cookies.delete("adx_student");
      return res;
    }

    return NextResponse.next();
  }

  // ── Protect /dashboard/college/* ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard/college")) {
    const token = request.cookies.get("adx_college")?.value;

    if (!token) {
      return redirectToLogin(request, "/login/college", pathname);
    }

    const valid = await verifyToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login/college", pathname);
      res.cookies.delete("adx_college");
      return res;
    }

    return NextResponse.next();
  }

  // ── Protect /admin/* ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("adx_admin")?.value;

    if (!token) {
      return redirectToLogin(request, "/login", pathname);
    }

    const valid = await verifyToken(token);
    if (!valid) {
      const res = redirectToLogin(request, "/login", pathname);
      res.cookies.delete("adx_admin");
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
