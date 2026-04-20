import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = [
  "college_view",
  "college_apply_click",
  "search_performed",
  "signup_start",
  "signup_complete",
  "login",
  "application_submit",
  "bookmark_add",
  "counselling_form",
  "contact_us",
] as const;

type EventName = typeof ALLOWED_EVENTS[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, properties, sessionId } = body as {
      event: EventName;
      properties?: Record<string, unknown>;
      sessionId?: string;
    };

    if (!event || !ALLOWED_EVENTS.includes(event)) {
      return NextResponse.json({ ok: true });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    if (/bot|crawler|spider|googlebot|bingbot/i.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    const db = await getDb();
    await db.collection("events").insertOne({
      event,
      properties: properties ?? {},
      sessionId:  sessionId ?? null,
      ip,
      createdAt:  new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
