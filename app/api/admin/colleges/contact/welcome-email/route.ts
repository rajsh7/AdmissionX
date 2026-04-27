import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendMail } from "@/lib/email";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  try {
    const { email, college_name, contact_name } = await req.json();

    if (!email || !college_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    // Invalidate any existing unused tokens for this email
    await db.collection("password_reset_tokens").updateMany(
      { email, used: false },
      { $set: { used: true } }
    );

    // Generate a secure reset token
    const token     = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MS);

    await db.collection("password_reset_tokens").insertOne({
      email,
      role:       "college",
      token,
      expires_at: expiresAt,
      used:       false,
      created_at: new Date(),
    });

    const baseUrl     = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.info").replace(/\/+$/, "");
    const resetLink   = `${baseUrl}/reset-password/${token}`;

    // Load the branded HTML template
    const templatePath = path.join(process.cwd(), "lib", "emails", "college-welcome.html");
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace(/%forgetPasswordUrlLink%/g, resetLink);

    await sendMail({
      to:      email,
      subject: `Welcome to AdmissionX — ${college_name}`,
      html,
    });

    return NextResponse.json({ success: true, message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("[welcome-email API error]", error);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}
