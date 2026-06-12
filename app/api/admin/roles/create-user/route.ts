import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendMail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, mobile, password,
      roleLabel, roleDesc, badgeColor, accessMode,
      allowedPaths, blockedPaths,
    } = await req.json();

    if (!name || !email || !password || !roleLabel) {
      return NextResponse.json({ error: "Name, email, password and role name are required." }, { status: 400 });
    }

    const db = await getDb();

    // Check email not already used
    const existing = await db.collection("next_admin_users").findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An admin with this email already exists." }, { status: 409 });
    }

    // Create a unique role value from the label
    const roleValue = `custom_${roleLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now()}`;

    // Save the custom role
    await db.collection("admin_roles").insertOne({
      value: roleValue,
      label: roleLabel,
      desc: roleDesc || "",
      badgeColor: badgeColor || "bg-slate-100 text-slate-600",
      accessMode: accessMode || "whitelist",
      allowedPaths: allowedPaths || [],
      blockedPaths: blockedPaths || [],
      is_system: false,
      created_at: new Date(),
    });

    // Create the admin user
    const password_hash = await bcrypt.hash(password, 10);
    await db.collection("next_admin_users").insertOne({
      name,
      email: email.toLowerCase(),
      mobile: mobile || "",
      password_hash,
      admin_role: roleValue,
      is_active: true,
      created_at: new Date(),
    });

    // Send login credentials email
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://admissionx.com"}/login/admin`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#c0392b;padding:28px 36px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">AdmissionX Admin</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Your admin account is ready</p>
    </div>
    <div style="padding:36px;color:#1e293b;">
      <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;">Welcome, ${name}!</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;">
        Your admin account has been created on AdmissionX with the role <strong>${roleLabel}</strong>.
        Here are your login credentials:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color:#c0392b;">${loginUrl}</a></p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;font-size:14px;"><strong>Password:</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:4px;font-size:13px;">${password}</code></p>
      </div>
      <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#c0392b;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
        Login to Admin Panel
      </a>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
      <p style="font-size:12px;color:#94a3b8;">Please change your password after your first login. If you did not expect this email, contact your super admin.</p>
    </div>
    <div style="padding:20px 36px;background:#f8fafc;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} AdmissionX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await sendMail({
        to: email,
        subject: "AdmissionX — Your admin account credentials",
        html,
      });
    } catch (emailErr) {
      console.error("[create-user] Email failed:", emailErr);
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[create-user]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
