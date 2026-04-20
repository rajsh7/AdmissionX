import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, sessionId } = body;

    // Get visitor info from headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const country   = req.headers.get("x-vercel-ip-country") || null;
    const city      = req.headers.get("x-vercel-ip-city") || null;

    // Skip bots
    const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduck/i.test(userAgent);
    if (isBot) return NextResponse.json({ ok: true });

    // Detect device type
    const isMobile  = /mobile|android|iphone|ipad/i.test(userAgent);
    const isTablet  = /ipad|tablet/i.test(userAgent);
    const device    = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    // Detect browser
    const browser =
      /edg\//i.test(userAgent)     ? "Edge"    :
      /chrome/i.test(userAgent)    ? "Chrome"  :
      /firefox/i.test(userAgent)   ? "Firefox" :
      /safari/i.test(userAgent)    ? "Safari"  :
      /opera|opr/i.test(userAgent) ? "Opera"   : "Other";

    const db = await getDb();
    await db.collection("page_views").insertOne({
      path:      path || "/",
      referrer:  referrer || null,
      sessionId: sessionId || null,
      ip,
      country,
      city,
      device,
      browser,
      userAgent,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Silently fail — never break the user experience
    return NextResponse.json({ ok: true });
  }
}
