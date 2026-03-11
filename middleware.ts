import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "adx-dev-secret-change-me-in-production"
);

function redirectToLogin(request: NextRequest, from: string) {
  const url = new URL("/login/student", request.url);
  url.searchParams.set("redirect", from);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect all /dashboard/student/* routes ───────────────────────────────
  if (pathname.startsWith("/dashboard/student")) {
    const token = request.cookies.get("adx_student")?.value;

    if (!token) {
      return redirectToLogin(request, pathname);
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      // Token expired or tampered — clear it and send to login
      const res = redirectToLogin(request, pathname);
      res.cookies.delete("adx_student");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/student/:path*"],
};
