import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!email || !phone) {
      return NextResponse.json({ error: "Email and phone are required." }, { status: 400 });
    }

    const db = await getDb();
    const sessionId = crypto.randomBytes(16).toString("hex");

    await db.collection("chatbot_sessions").insertOne({
      sessionId,
      name: name?.trim() || "",
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      messages: [],
      status: "open",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("[chatbot/session]", err);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}
