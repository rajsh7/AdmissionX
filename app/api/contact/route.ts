import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("contact_queries").insertOne({
      name,
      email,
      subject: subject || "",
      message,
      status: "new",
      created_at: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
