import { NextResponse } from "next/server";
import { sendCollegeSignupConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, college_name, contact_name } = await req.json();

    if (!email || !college_name || !contact_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendCollegeSignupConfirmationEmail(email, college_name, contact_name);

    return NextResponse.json({ success: true, message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("[welcome-email API error]", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
