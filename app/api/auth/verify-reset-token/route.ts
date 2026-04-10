import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = (req.nextUrl.searchParams.get("token") ?? "").trim();

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token is required." }, { status: 400 });
    }

    const db = await getDb();
    const record = await db.collection("password_reset_tokens").findOne({ token });

    if (!record) {
      return NextResponse.json({ valid: false, error: "This reset link is invalid." }, { status: 400 });
    }
    if (record.used) {
      return NextResponse.json({ valid: false, error: "This reset link has already been used." }, { status: 400 });
    }
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ valid: false, error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    return NextResponse.json({ valid: true, role: record.role });
  } catch (err) {
    console.error("[verify-reset-token]", err);
    return NextResponse.json({ valid: false, error: "Internal server error. Please try again." }, { status: 500 });
  }
}
