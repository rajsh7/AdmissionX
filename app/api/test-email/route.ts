import { NextRequest, NextResponse } from "next/server";
import { sendProfileCompletionReminder } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    await sendProfileCompletionReminder(
      email,
      name || "Test User",
      50,
      {
        personalDetails: "completed",
        coursePreferences: "completed",
        academicInfo: "urgent",
        documentUpload: "pending",
      }
    );

    return NextResponse.json({ success: true, message: `Profile completion reminder sent to ${email}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Test Email Error]:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
