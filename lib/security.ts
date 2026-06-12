import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function cleanupExpiredRateLimits(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function enforceRateLimit(
  req: NextRequest,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = Date.now();
  cleanupExpiredRateLimits(now);

  const key = `${keyPrefix}:${getClientIp(req)}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return null;
}

export function rejectUntrustedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const host = req.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) return null;
  } catch {
    // fall through
  }

  return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
}
