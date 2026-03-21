import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// ── Transporter ───────────────────────────────────────────────────────────────
// Reads from environment variables. In development, if no SMTP is configured
// it falls back to Ethereal (a fake SMTP service for testing).
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  // Support both SMTP_* (Next.js style) and MAIL_* (Laravel style) env vars
  const smtpHost = process.env.SMTP_HOST ?? process.env.MAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? process.env.MAIL_PORT ?? 587);
  const smtpUser = process.env.SMTP_USER ?? process.env.MAIL_USERNAME;
  const smtpPass = process.env.SMTP_PASS ?? process.env.MAIL_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (smtpHost) {
    // Production / real SMTP (e.g. Gmail, SendGrid, Mailgun, etc.)
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    // Development fallback — Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(
      "[email] No SMTP_HOST set — using Ethereal test account:",
      testAccount.user,
    );
  }

  return transporter;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ── Core send function ────────────────────────────────────────────────────────
export async function sendMail(opts: SendMailOptions): Promise<void> {
  const t = await getTransporter();

  const from =
    process.env.SMTP_FROM ??
    (process.env.MAIL_USERNAME ? `"AdmissionX" <${process.env.MAIL_USERNAME}>` : '"AdmissionX" <no-reply@admissionx.com>');

  const info = await t.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
  });

  // In dev, log the Ethereal preview URL so you can see the email in a browser
  const smtpConfigured = !!(process.env.SMTP_HOST ?? process.env.MAIL_HOST);
  if (!smtpConfigured) {
    console.log(
      "[email] Preview URL:",
      nodemailer.getTestMessageUrl(info),
    );
  }
}

// ── Branded email wrapper ─────────────────────────────────────────────────────
function wrapInTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #c0392b; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; }
    .body { padding: 40px; color: #1e293b; line-height: 1.6; }
    .body h2 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #0f172a; }
    .body p { margin: 0 0 16px; font-size: 15px; color: #475569; }
    .btn { display: inline-block; margin: 8px 0 24px; padding: 14px 32px; background: #c0392b; color: #ffffff !important; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { padding: 24px 40px; background: #f8fafc; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
    .footer a { color: #c0392b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>AdmissionX</h1>
      <p>India's Trusted College Admissions Platform</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>
        &copy; ${new Date().getFullYear()} AdmissionX. All rights reserved.<br />
        <a href="https://admissionx.com">admissionx.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ── Pre-built email senders ───────────────────────────────────────────────────

/**
 * Sends a password reset link to any user (student / college / admin).
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string,
  role: "student" | "college" | "admin",
): Promise<void> {
  const roleLabel =
    role === "college" ? "College" : role === "admin" ? "Admin" : "Student";

  const body = `
    <h2>Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      We received a request to reset the password for your <strong>${roleLabel}</strong> account on AdmissionX.
      Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
    </p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#94a3b8;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not change.
    </p>
    <p style="font-size:13px; color:#94a3b8;">
      Or copy this link into your browser:<br />
      <a href="${resetLink}" style="color:#c0392b; word-break:break-all;">${resetLink}</a>
    </p>
  `;

  await sendMail({
    to,
    subject: "Reset your AdmissionX password",
    html: wrapInTemplate("Reset Your Password — AdmissionX", body),
  });
}

/**
 * Sends a welcome email after student registration.
 */
export async function sendStudentWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  const body = `
    <h2>Welcome to AdmissionX! 🎓</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      Your student account has been created successfully. You can now browse colleges,
      save your favourites, and apply for courses — all in one place.
    </p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com"}/login/student" class="btn">
      Go to Student Dashboard
    </a>
    <hr class="divider" />
    <p style="font-size:13px; color:#94a3b8;">
      Need help? Reach us at <a href="mailto:support@admissionx.com">support@admissionx.com</a>
    </p>
  `;

  await sendMail({
    to,
    subject: "Welcome to AdmissionX — Your account is ready",
    html: wrapInTemplate("Welcome to AdmissionX", body),
  });
}

/**
 * Sends the branded activation email to a newly registered student.
 * Uses the HTML template at lib/emails/student-activation.html.
 */
export async function sendStudentActivationEmail(
  to: string,
  name: string,
  activationLink: string,
): Promise<void> {
  const templatePath = path.join(process.cwd(), "lib", "emails", "student-activation.html");
  let html = fs.readFileSync(templatePath, "utf-8");
  html = html
    .replace(/{{STUDENT_NAME}}/g, name)
    .replace(/{{ACTIVATION_LINK}}/g, activationLink);

  await sendMail({
    to,
    subject: "Activate your AdmissionX account",
    html,
  });
}

/**
 * Sends a confirmation email to a college after signup request.
 */
export async function sendCollegeSignupConfirmationEmail(
  to: string,
  collegeName: string,
  contactName: string,
): Promise<void> {
  const body = `
    <h2>College Registration Received 🏫</h2>
    <p>Hi <strong>${contactName}</strong>,</p>
    <p>
      Thank you for registering <strong>${collegeName}</strong> on AdmissionX.
      Our team will review your request and approve your account within <strong>1–2 business days</strong>.
    </p>
    <p>
      Once approved, you will receive your login credentials via email and can start
      managing your college profile, courses, and student applications.
    </p>
    <hr class="divider" />
    <p style="font-size:13px; color:#94a3b8;">
      Questions? Contact us at <a href="mailto:colleges@admissionx.com">colleges@admissionx.com</a>
    </p>
  `;

  await sendMail({
    to,
    subject: "AdmissionX — College registration received",
    html: wrapInTemplate("College Registration — AdmissionX", body),
  });
}

/**
 * Sends college approval email with temporary password set by admin.
 */
export async function sendCollegeApprovalEmail(
  to: string,
  collegeName: string,
  contactName: string,
  temporaryPassword: string,
): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com"}/login/college`;

  const body = `
    <h2>Your College Account is Approved! ✅</h2>
    <p>Hi <strong>${contactName}</strong>,</p>
    <p>
      Great news! <strong>${collegeName}</strong> has been approved on AdmissionX.
      You can now log in and start building your college profile.
    </p>
    <p><strong>Your login credentials:</strong></p>
    <p>
      <strong>Email:</strong> ${to}<br />
      <strong>Temporary Password:</strong> <code style="background:#f1f5f9; padding:2px 8px; border-radius:4px;">${temporaryPassword}</code>
    </p>
    <a href="${loginUrl}" class="btn">Login to College Dashboard</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#94a3b8;">
      Please change your password after your first login for security.
    </p>
  `;

  await sendMail({
    to,
    subject: "AdmissionX — Your college account is approved",
    html: wrapInTemplate("College Account Approved — AdmissionX", body),
  });
}
