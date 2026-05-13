import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

// ═══════════════════════════════════════════════════════════════════════
// NODEMAILER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"AdmissionX" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com").replace(/\/$/, "");
}

function loadTemplate(filename: string): string {
  const templatePath = path.join(process.cwd(), "lib", "emails", filename);
  return fs.readFileSync(templatePath, "utf-8");
}

function renderTemplate(title: string, preheader: string, body: string): string {
  const baseUrl = getBaseUrl();
  const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAaCAYAAADyrhO6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkMyMkY0RTU1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkMyMkY0RTY1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCQzIyRjRFMzVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCQzIyRjRFNDVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvmIsQoAACQtSURBVHja7Fx3fFTVtt7TUibJpIeEJBB6BEIHkV4UEAVBUIpcURHQhwreJ1XKBQQVsFxFpSrlggioFEVA4QKCQNBAQgIkQGghJCF9kkymnvd9J3NwjJkJ3ve83D/egfPLlH3OXnvVb629zqhKSkqEwWAQX375pais";
  const logoUrl = logoBase64;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background: #f3f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #102033; }
    .preheader { display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; }
    .wrap { max-width: 640px; margin: 32px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.10); border: 1px solid #e7eef3; }
    .hero { background: linear-gradient(135deg, #fff7f2 0%, #eefcf8 100%); padding: 34px 38px 26px; text-align: center; border-bottom: 1px solid #edf2f5; }
    .logo { width: 150px; height: auto; display: block; margin: 0 auto 18px; }
    .kicker { margin: 0; color: #0f766e; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
    .hero h1 { margin: 8px 0 0; color: #14213d; font-size: 25px; line-height: 1.25; font-weight: 800; }
    .body { padding: 34px 40px 38px; color: #334155; line-height: 1.65; }
    .body p { margin: 0 0 16px; font-size: 15px; }
    .panel { margin: 22px 0; padding: 18px 20px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .row { margin: 8px 0; font-size: 14px; }
    .label { color: #64748b; font-weight: 700; }
    .value { color: #0f172a; font-weight: 800; }
    .status { display: inline-block; padding: 7px 14px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; }
    .btn { display: inline-block; margin-top: 8px; padding: 13px 24px; border-radius: 12px; background: #0f766e; color: #ffffff !important; font-size: 14px; font-weight: 800; text-decoration: none; }
    .sign { margin-top: 24px; color: #475569; }
    .footer { padding: 22px 38px; text-align: center; background: #0f172a; color: #cbd5e1; }
    .footer p { margin: 0; font-size: 12px; line-height: 1.6; }
    .footer a { color: #5eead4; text-decoration: none; }
    @media (max-width: 680px) {
      .wrap { margin: 0; border-radius: 0; }
      .hero, .body, .footer { padding-left: 22px; padding-right: 22px; }
      .hero h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="preheader">${escapeHtml(preheader)}</div>
  <div class="wrap">
    <div class="hero">
      <img class="logo" src="${logoUrl}" alt="AdmissionX" />
      <p class="kicker">World's First Online Admission Portal</p>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>
        AdmissionX - World's First Online Admission Portal<br />
        <a href="${baseUrl}">${baseUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════
// STUDENT EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

export async function sendStudentRegistrationEmail(
  to: string,
  name: string,
  email: string,
  phone: string,
  activationLink?: string
): Promise<void> {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Student Registration Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #F2F2F0;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 16px;
    min-height: 100vh;
  }

  .email-outer {
    max-width: 620px;
    margin: 0 auto;
  }

  /* ── TOP BRAND STRIP ── */
  .brand-strip {
    background: #111111;
    border-radius: 12px 12px 0 0;
    padding: 0;
    overflow: hidden;
  }
  .brand-strip-red {
    height: 5px;
    background: #D91A1A;
  }
  .brand-strip-inner {
    padding: 20px 32px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-strip-inner img {
    height: 26px;
    width: auto;
    filter: invert(1) brightness(10);
    display: block;
  }
  .brand-tagline {
    font-size: 10px;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: right;
    line-height: 1.5;
  }

  /* ── MAIN CARD ── */
  .email-card {
    background: #FFFFFF;
    padding: 40px 40px 36px;
    border-left: 1px solid #E8E8E4;
    border-right: 1px solid #E8E8E4;
  }

  /* ── WELCOME BADGE ── */
  .welcome-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #FFF0F0;
    border: 1px solid #FFDADA;
    border-radius: 100px;
    padding: 5px 14px 5px 8px;
    margin-bottom: 24px;
  }
  .welcome-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #D91A1A;
  }
  .welcome-badge span {
    font-size: 12px;
    color: #D91A1A;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .greeting {
    font-size: 22px;
    font-family: 'DM Serif Display', serif;
    color: #111111;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .greeting strong { color: #D91A1A; }

  .headline {
    font-size: 15px;
    color: #444;
    line-height: 1.7;
    margin-bottom: 6px;
  }
  .subline {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: #F0EFEB;
    margin: 24px 0;
  }

  /* ── YOU CAN NOW ── */
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #AAAAAA;
    margin-bottom: 14px;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 28px;
  }
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FAFAF8;
    border: 1px solid #EEECEA;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .feature-icon {
    width: 28px; height: 28px;
    border-radius: 7px;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .feature-icon svg {
    width: 14px; height: 14px;
    fill: none;
    stroke: #D91A1A;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .feature-text {
    font-size: 12.5px;
    color: #444;
    line-height: 1.4;
    padding-top: 6px;
  }

  /* ── LOGIN DETAILS ── */
  .login-box {
    background: #111111;
    border-radius: 12px;
    padding: 20px 22px;
    margin-bottom: 28px;
  }
  .login-box-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 14px;
  }
  .login-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .login-row:last-child { border-bottom: none; }
  .login-label {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.02em;
  }
  .login-value {
    font-size: 12.5px;
    color: #D91A1A;
    font-family: 'DM Sans', monospace;
    font-weight: 500;
    background: rgba(217,26,26,0.1);
    padding: 3px 10px;
    border-radius: 5px;
    border: 1px solid rgba(217,26,26,0.2);
  }

  .closing {
    font-size: 14px;
    color: #555;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  .signoff {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
  }
  .signoff strong {
    color: #111;
    font-size: 15px;
    display: block;
    margin-bottom: 2px;
  }
  .signoff-sub {
    font-size: 11.5px;
    color: #AAAAAA;
    letter-spacing: 0.02em;
    margin-top: 2px;
    display: block;
  }

  /* ── BENEFITS SECTION ── */
  .benefits-section {
    background: #FAFAF8;
    border-left: 1px solid #E8E8E4;
    border-right: 1px solid #E8E8E4;
    padding: 32px 40px;
  }
  .benefits-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #AAAAAA;
    margin-bottom: 20px;
    text-align: center;
  }
  .benefits-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .benefits-col {
    background: #FFFFFF;
    border: 1px solid #EEECEA;
    border-radius: 12px;
    padding: 18px 16px;
  }
  .benefits-col-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #F0EFEB;
  }
  .benefits-col-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .benefits-col-icon svg {
    width: 15px; height: 15px;
    fill: none;
    stroke: #D91A1A;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .benefits-col-title {
    font-size: 13px;
    font-weight: 600;
    color: #111;
  }
  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .benefit-item:last-child { margin-bottom: 0; }
  .benefit-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #D91A1A;
    flex-shrink: 0;
    margin-top: 6px;
  }
  .benefit-text {
    font-size: 12px;
    color: #555;
    line-height: 1.5;
  }

  /* ── SOCIAL LINKS ── */
  .social-section {
    background: #111111;
    border-left: 1px solid #222;
    border-right: 1px solid #222;
    padding: 24px 40px;
    text-align: center;
  }
  .social-label {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .social-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .social-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    text-decoration: none;
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.2s;
    background: rgba(255,255,255,0.04);
  }
  .social-btn:hover {
    border-color: #D91A1A;
    color: #fff;
    background: rgba(217,26,26,0.1);
  }
  .social-btn svg {
    width: 15px; height: 15px;
    fill: currentColor;
  }

  /* ── FOOTER STRIP ── */
  .footer-strip {
    background: #0D0D0D;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
  }
  .footer-strip-inner {
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .footer-auto {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    line-height: 1.5;
  }
  .footer-copy {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    text-align: right;
    line-height: 1.5;
  }
  .footer-copy span { color: #D91A1A; }
  .footer-strip-red {
    height: 3px;
    background: #D91A1A;
  }
  @media (max-width: 480px) {
    .feature-grid, .benefits-cols { grid-template-columns: 1fr; }
    .brand-strip-inner, .email-card, .benefits-section, .social-section, .footer-strip-inner { padding-left: 20px; padding-right: 20px; }
  }
</style>
</head>
<body>

<div class="email-outer">

  <!-- BRAND STRIP / HEADER -->
  <div class="brand-strip">
    <div class="brand-strip-red"></div>
    <div class="brand-strip-inner">
      <img src="https://admissionx.com/logo-white.png" alt="AdmissionX Logo">
      <div class="brand-tagline">World's First Online<br>Admission Portal</div>
    </div>
  </div>

  <!-- MAIN EMAIL CARD -->
  <div class="email-card">

    <div class="welcome-badge">
      <span class="welcome-dot"></span>
      <span>Account Created Successfully</span>
    </div>

    <div class="greeting">Dear <strong>${escapeHtml(name)}</strong>,</div>
    <p class="headline">Welcome on board <strong style="color:#111">AdmissionX</strong> — the world's first online admission portal.</p>
    <p class="subline">Your account has been successfully created and your admission journey has officially begun.</p>

    <div class="divider"></div>

    <div class="section-label">You can now</div>
    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <div class="feature-text">Explore courses &amp; universities</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="feature-text">Complete your profile</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="feature-text">Upload required documents</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        </div>
        <div class="feature-text">Apply for admissions online</div>
      </div>
    </div>

    ${activationLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 14px; color: #444; margin-bottom: 15px;">Please activate your account to get started:</p>
        <a href="${activationLink}" style="display: inline-block; background: #D91A1A; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Activate Your Account</a>
        <p style="font-size: 12px; color: #888; margin-top: 10px;">This link will expire in 24 hours.</p>
      </div>
    ` : ''}

    <div class="login-box">
      <div class="login-box-title">Login Details</div>
      <div class="login-row">
        <span class="login-label">Email</span>
        <span class="login-value">${escapeHtml(email)}</span>
      </div>
      <div class="login-row">
        <span class="login-label">Mobile</span>
        <span class="login-value">${escapeHtml(phone)}</span>
      </div>
    </div>

    <p class="closing">We are excited to help you shape your future.</p>

    <div class="divider"></div>

    <div class="signoff">
      <strong>Best Regards,</strong>
      Team AdmissionX
      <span class="signoff-sub">World's First Online Admission Portal</span>
    </div>

  </div>

  <!-- BENEFITS SECTION -->
  <div class="benefits-section">
    <div class="benefits-title">Why AdmissionX</div>
    <div class="benefits-cols">

      <!-- For Students -->
      <div class="benefits-col">
        <div class="benefits-col-header">
          <div class="benefits-col-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="benefits-col-title">For Students</div>
        </div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Apply to multiple universities in one place</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Real-time application status tracking</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Secure digital document management</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Expert counselling &amp; guidance support</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">100% paperless admission process</span></div>
      </div>

      <!-- For Colleges -->
      <div class="benefits-col">
        <div class="benefits-col-header">
          <div class="benefits-col-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="benefits-col-title">For Colleges</div>
        </div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Centralized student application dashboard</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Automated document verification system</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Instant communication with applicants</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Real-time seat &amp; enrollment management</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Data-driven admission analytics</span></div>
      </div>

    </div>
  </div>

  <!-- SOCIAL LINKS -->
  <div class="social-section">
    <div class="social-label">Connect with us</div>
    <div class="social-links">

      <a href="https://facebook.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        Facebook
      </a>

      <a href="https://instagram.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        Instagram
      </a>

      <a href="https://twitter.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        X (Twitter)
      </a>

    </div>
  </div>

  <!-- FOOTER BRAND STRIP -->
  <div class="footer-strip">
    <div class="footer-strip-inner">
      <div class="footer-auto">This is an automated email. Please do not reply directly to this message.</div>
      <div class="footer-copy">© 2026 <span>AdmissionX</span>. All rights reserved.</div>
    </div>
    <div class="footer-strip-red"></div>
  </div>

</div>
</body>
</html>
  `;

  await sendMail({
    to,
    subject: "Welcome to AdmissionX - Registration Successful",
    html: template,
  });
}

export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string,
  expiryMinutes: number
): Promise<void> {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – OTP Verification Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #F2F2F0;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 16px;
    min-height: 100vh;
  }

  .email-outer {
    max-width: 620px;
    margin: 0 auto;
  }

  /* ── TOP BRAND STRIP ── */
  .brand-strip {
    background: #111111;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
  }
  .brand-strip-red {
    height: 5px;
    background: #D91A1A;
  }
  .brand-strip-inner {
    padding: 20px 32px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-strip-inner img {
    height: 26px;
    width: auto;
    filter: invert(1) brightness(10);
    display: block;
  }
  .brand-tagline {
    font-size: 10px;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: right;
    line-height: 1.5;
  }

  /* ── MAIN CARD ── */
  .email-card {
    background: #FFFFFF;
    padding: 40px 40px 36px;
    border-left: 1px solid #E8E8E4;
    border-right: 1px solid #E8E8E4;
  }

  /* ── SECURITY BADGE ── */
  .security-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #FFF0F0;
    border: 1px solid #FFDADA;
    border-radius: 100px;
    padding: 5px 14px 5px 8px;
    margin-bottom: 24px;
  }
  .security-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #D91A1A;
  }
  .security-badge span {
    font-size: 12px;
    color: #D91A1A;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .greeting {
    font-size: 22px;
    font-family: 'DM Serif Display', serif;
    color: #111111;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .greeting strong { color: #D91A1A; }

  .subline {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: #F0EFEB;
    margin: 28px 0;
  }

  /* ── OTP BLOCK ── */
  .otp-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #AAAAAA;
    margin-bottom: 14px;
    text-align: center;
  }

  .otp-wrapper {
    background: #111111;
    border-radius: 14px;
    padding: 32px 24px 28px;
    text-align: center;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .otp-wrapper::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: #D91A1A;
  }
  .otp-wrapper::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: #D91A1A;
  }

  .otp-sublabel {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .otp-code {
    font-size: 52px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: #FFFFFF;
    font-family: 'DM Sans', monospace;
    line-height: 1;
    margin-bottom: 18px;
    text-shadow: 0 0 40px rgba(217,26,26,0.4);
  }
  .otp-code span {
    color: #D91A1A;
  }

  .otp-validity {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(217,26,26,0.12);
    border: 1px solid rgba(217,26,26,0.25);
    border-radius: 100px;
    padding: 5px 14px;
  }
  .otp-validity svg {
    width: 13px; height: 13px;
    fill: none;
    stroke: #D91A1A;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }
  .otp-validity span {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
  }
  .otp-validity strong {
    color: #D91A1A;
  }

  /* ── SECURITY WARNING ── */
  .security-warn {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #FFFBF0;
    border: 1px solid #FDEAB0;
    border-left: 3px solid #E5A800;
    border-radius: 0 10px 10px 0;
    padding: 14px 16px;
    margin-bottom: 28px;
  }
  .security-warn-icon {
    width: 30px; height: 30px;
    background: #FFF3CC;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .security-warn-icon svg {
    width: 15px; height: 15px;
    fill: none;
    stroke: #C88800;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .security-warn-text {
    font-size: 13px;
    color: #7A5500;
    line-height: 1.6;
  }
  .security-warn-text strong {
    color: #5C3E00;
    display: block;
    margin-bottom: 2px;
    font-size: 13px;
  }

  /* ── STEPS ── */
  .steps-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #AAAAAA;
    margin-bottom: 14px;
  }
  .steps-list {
    list-style: none;
    margin-bottom: 28px;
  }
  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #F5F5F2;
  }
  .step-item:last-child { border-bottom: none; }
  .step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #111;
    color: #D91A1A;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .step-text {
    font-size: 13.5px;
    color: #555;
    line-height: 1.5;
    padding-top: 2px;
  }

  .signoff {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
  }
  .signoff strong {
    color: #111;
    font-size: 15px;
    display: block;
    margin-bottom: 2px;
  }
  .signoff-sub {
    font-size: 11.5px;
    color: #AAAAAA;
    letter-spacing: 0.02em;
    margin-top: 2px;
    display: block;
  }

  /* ── BENEFITS SECTION ── */
  .benefits-section {
    background: #FAFAF8;
    border-left: 1px solid #E8E8E4;
    border-right: 1px solid #E8E8E4;
    padding: 32px 40px;
  }
  .benefits-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #AAAAAA;
    margin-bottom: 20px;
    text-align: center;
  }
  .benefits-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .benefits-col {
    background: #FFFFFF;
    border: 1px solid #EEECEA;
    border-radius: 12px;
    padding: 18px 16px;
  }
  .benefits-col-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #F0EFEB;
  }
  .benefits-col-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .benefits-col-icon svg {
    width: 15px; height: 15px;
    fill: none;
    stroke: #D91A1A;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .benefits-col-title {
    font-size: 13px;
    font-weight: 600;
    color: #111;
  }
  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .benefit-item:last-child { margin-bottom: 0; }
  .benefit-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #D91A1A;
    flex-shrink: 0;
    margin-top: 6px;
  }
  .benefit-text {
    font-size: 12px;
    color: #555;
    line-height: 1.5;
  }

  /* ── SOCIAL LINKS ── */
  .social-section {
    background: #111111;
    border-left: 1px solid #222;
    border-right: 1px solid #222;
    padding: 24px 40px;
    text-align: center;
  }
  .social-label {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .social-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .social-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    text-decoration: none;
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    background: rgba(255,255,255,0.04);
  }
  .social-btn svg {
    width: 15px; height: 15px;
    fill: currentColor;
  }

  /* ── FOOTER STRIP ── */
  .footer-strip {
    background: #0D0D0D;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
  }
  .footer-strip-inner {
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .footer-auto {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    line-height: 1.5;
  }
  .footer-copy {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    text-align: right;
    line-height: 1.5;
  }
  .footer-copy span { color: #D91A1A; }
  .footer-strip-red {
    height: 3px;
    background: #D91A1A;
  }
  @media (max-width: 480px) {
    .benefits-cols { grid-template-columns: 1fr; }
    .brand-strip-inner, .email-card, .benefits-section, .social-section, .footer-strip-inner { padding-left: 20px; padding-right: 20px; }
    .otp-code { font-size: 38px; letter-spacing: 0.15em; }
  }
</style>
</head>
<body>

<div class="email-outer">

  <!-- BRAND STRIP / HEADER -->
  <div class="brand-strip">
    <div class="brand-strip-red"></div>
    <div class="brand-strip-inner">
      <img src="https://admissionx.com/logo-white.png" alt="AdmissionX Logo">
      <div class="brand-tagline">World's First Online<br>Admission Portal</div>
    </div>
  </div>

  <!-- MAIN EMAIL CARD -->
  <div class="email-card">

    <div class="security-badge">
      <span class="security-dot"></span>
      <span>OTP Verification</span>
    </div>

    <div class="greeting">Dear <strong>${escapeHtml(name)}</strong>,</div>
    <p class="subline">Your AdmissionX verification OTP is ready. Use it below to verify your account securely.</p>

    <div class="divider"></div>

    <!-- OTP DISPLAY -->
    <div class="otp-label">Your One-Time Password</div>
    <div class="otp-wrapper">
      <div class="otp-sublabel">AdmissionX Verification Code</div>
      <div class="otp-code"><span>${escapeHtml(otp)}</span></div>
      <div class="otp-validity">
        <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Valid for <strong>${expiryMinutes} minutes</strong> only</span>
      </div>
    </div>

    <!-- SECURITY WARNING -->
    <div class="security-warn">
      <div class="security-warn-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#C88800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="security-warn-text">
        <strong>Security Notice</strong>
        Please do not share this OTP with anyone for security reasons. AdmissionX will never ask for your OTP over call or email.
      </div>
    </div>

    <div class="divider"></div>

    <!-- STEPS -->
    <div class="steps-label">How to use your OTP</div>
    <ul class="steps-list">
      <li class="step-item">
        <span class="step-num">1</span>
        <span class="step-text">Go to the AdmissionX verification page on your browser or app</span>
      </li>
      <li class="step-item">
        <span class="step-num">2</span>
        <span class="step-text">Enter the OTP code shown above in the verification field</span>
      </li>
      <li class="step-item">
        <span class="step-num">3</span>
        <span class="step-text">Click <strong style="color:#111">Verify</strong> to complete your account verification</span>
      </li>
      <li class="step-item">
        <span class="step-num">4</span>
        <span class="step-text">If the OTP expires, request a new one from the login screen</span>
      </li>
    </ul>

    <div class="signoff">
      <strong>Best Regards,</strong>
      Team AdmissionX
      <span class="signoff-sub">World's First Online Admission Portal</span>
    </div>

  </div>

  <!-- BENEFITS SECTION -->
  <div class="benefits-section">
    <div class="benefits-title">Why AdmissionX</div>
    <div class="benefits-cols">
      <div class="benefits-col">
        <div class="benefits-col-header">
          <div class="benefits-col-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="benefits-col-title">For Students</div>
        </div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Apply to multiple universities in one place</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Real-time application status tracking</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Secure digital document management</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Expert counselling &amp; guidance support</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">100% paperless admission process</span></div>
      </div>
      <div class="benefits-col">
        <div class="benefits-col-header">
          <div class="benefits-col-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D91A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="benefits-col-title">For Colleges</div>
        </div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Centralized student application dashboard</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Automated document verification system</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Instant communication with applicants</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Real-time seat &amp; enrollment management</span></div>
        <div class="benefit-item"><span class="benefit-dot"></span><span class="benefit-text">Data-driven admission analytics</span></div>
      </div>
    </div>
  </div>

  <!-- SOCIAL LINKS -->
  <div class="social-section">
    <div class="social-label">Connect with us</div>
    <div class="social-links">
      <a href="https://facebook.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        Facebook
      </a>
      <a href="https://instagram.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        Instagram
      </a>
      <a href="https://twitter.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        X (Twitter)
      </a>
    </div>
  </div>

  <!-- FOOTER BRAND STRIP -->
  <div class="footer-strip">
    <div class="footer-strip-inner">
      <div class="footer-auto">This is an automated email. Please do not reply directly to this message.</div>
      <div class="footer-copy">© 2026 <span>AdmissionX</span>. All rights reserved.</div>
    </div>
    <div class="footer-strip-red"></div>
  </div>

</div>
</body>
</html>
  `;

  await sendMail({
    to,
    subject: "Your AdmissionX OTP Verification Code",
    html: template,
  });
}

export async function sendProfileCompletionReminder(to: string, name: string): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>We noticed your profile is incomplete. Complete your profile to unlock all features and start applying to colleges.</p>
    <a href="${dashboardUrl}" class="btn">Complete Your Profile</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Complete Your AdmissionX Profile",
    html: renderTemplate("Profile Completion Reminder", "Complete your profile to get started", body),
  });
}

export async function sendApplicationStartedEmail(
  to: string,
  name: string,
  appId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your application has been started successfully.</p>
    <div class="panel">
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">Continue Application</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Application Started - AdmissionX",
    html: renderTemplate("Application Started", "Your application is in progress", body),
  });
}

export async function sendApplicationSubmittedEmail(
  to: string,
  name: string,
  appId: string,
  courseName: string,
  collegeName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Congratulations! Your application has been submitted successfully.</p>
    <div class="panel">
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">College:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Application</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Application Submitted Successfully - AdmissionX",
    html: renderTemplate("Application Submitted", "Your application is under review", body),
  });
}

export async function sendDocumentsVerifiedEmail(to: string, name: string): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Great news! Your documents have been verified successfully.</p>
    <p><span class="status">Verified</span></p>
    <a href="${dashboardUrl}" class="btn">View Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Documents Verified - AdmissionX",
    html: renderTemplate("Documents Verified", "Your documents are approved", body),
  });
}

export async function sendDocumentsRejectedEmail(
  to: string,
  name: string,
  reason: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your documents require attention. Please review and resubmit.</p>
    <div class="panel">
      <p class="row"><span class="label">Reason:</span> <span class="value">${escapeHtml(reason)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">Resubmit Documents</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Document Resubmission Required - AdmissionX",
    html: renderTemplate("Documents Rejected", "Action required on your documents", body),
  });
}

export async function sendPaymentSuccessEmail(
  to: string,
  name: string,
  amount: string,
  transactionId: string,
  date: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your payment has been processed successfully.</p>
    <div class="panel">
      <p class="row"><span class="label">Amount:</span> <span class="value">₹${escapeHtml(amount)}</span></p>
      <p class="row"><span class="label">Transaction ID:</span> <span class="value">${escapeHtml(transactionId)}</span></p>
      <p class="row"><span class="label">Date:</span> <span class="value">${escapeHtml(date)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Receipt</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Payment Successful - AdmissionX",
    html: renderTemplate("Payment Successful", "Your payment has been confirmed", body),
  });
}

export async function sendPaymentFailedEmail(to: string, name: string): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Unfortunately, your payment could not be processed. Please try again.</p>
    <a href="${dashboardUrl}" class="btn">Retry Payment</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Payment Failed - AdmissionX",
    html: renderTemplate("Payment Failed", "Action required for payment", body),
  });
}

export async function sendCounsellingScheduledEmail(
  to: string,
  name: string,
  date: string,
  time: string,
  venue: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your counselling session has been scheduled.</p>
    <div class="panel">
      <p class="row"><span class="label">Date:</span> <span class="value">${escapeHtml(date)}</span></p>
      <p class="row"><span class="label">Time:</span> <span class="value">${escapeHtml(time)}</span></p>
      <p class="row"><span class="label">Venue:</span> <span class="value">${escapeHtml(venue)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Details</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Counselling Session Scheduled - AdmissionX",
    html: renderTemplate("Counselling Scheduled", "Your session details", body),
  });
}

export async function sendSeatReservationEmail(
  to: string,
  name: string,
  courseName: string,
  collegeName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Congratulations! Your seat has been reserved.</p>
    <div class="panel">
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">College:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Details</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Seat Reserved - AdmissionX",
    html: renderTemplate("Seat Reservation Confirmed", "Your seat is reserved", body),
  });
}

export async function sendAdmissionConfirmationEmail(
  to: string,
  name: string,
  courseName: string,
  collegeName: string,
  enrollmentId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Congratulations! Your admission has been confirmed. Welcome aboard!</p>
    <div class="panel">
      <p class="row"><span class="label">Enrollment ID:</span> <span class="value">${escapeHtml(enrollmentId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">College:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Admission Letter</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Admission Confirmed - Welcome to Your Journey!",
    html: renderTemplate("Admission Confirmed", "Your admission is confirmed", body),
  });
}

export async function sendStudentApplicationStatusEmail(params: {
  to: string;
  studentName: string;
  collegeName: string;
  appId: string;
  courseName: string;
  status: string;
  reason: string | null;
}): Promise<void> {
  const { to, studentName, collegeName, appId, courseName, status, reason } = params;
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  
  let title = "Application Status Update";
  let message = "Your application status has been updated.";
  let statusBadge = "";
  
  if (status === "under_review") {
    title = "Application Under Review";
    message = "Your application is currently being reviewed by the college.";
    statusBadge = '<span class="status" style="background: #fef3c7; color: #92400e;">Under Review</span>';
  } else if (status === "verified" || status === "enrolled") {
    title = "Application Approved";
    message = "Congratulations! Your application has been approved.";
    statusBadge = '<span class="status">Approved</span>';
  } else if (status === "rejected") {
    title = "Application Status Update";
    message = "We regret to inform you that your application was not successful this time.";
    statusBadge = '<span class="status" style="background: #fee2e2; color: #991b1b;">Not Approved</span>';
  }
  
  let body = `
    <p>Dear <strong>${escapeHtml(studentName)}</strong>,</p>
    <p>${message}</p>
    <div class="panel">
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">College:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">Status:</span> ${statusBadge}</p>
  `;
  
  if (reason) {
    body += `
      <p class="row"><span class="label">Note:</span> <span class="value">${escapeHtml(reason)}</span></p>
    `;
  }
  
  body += `
    </div>
    <a href="${dashboardUrl}" class="btn">View Application</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  
  await sendMail({
    to,
    subject: `${title} - AdmissionX`,
    html: renderTemplate(title, "Your application status has been updated", body),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// COLLEGE EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

export async function sendCollegeRegistrationEmail(
  to: string,
  collegeName: string,
  contactName: string
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const body = `
    <p>Dear <strong>${escapeHtml(contactName)}</strong>,</p>
    <p>Welcome to AdmissionX! Your institution <strong>${escapeHtml(collegeName)}</strong> has been successfully registered.</p>
    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Registration Successful - AdmissionX",
    html: renderTemplate("Registration Successful", "Your institution is registered", body),
  });
}

export async function sendCollegeVerificationApprovedEmail(
  to: string,
  collegeName: string,
  dashboardUrl: string
): Promise<void> {
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>Congratulations! Your institution has been verified and approved on AdmissionX.</p>
    <p><span class="status">Approved</span></p>
    <a href="${dashboardUrl}" class="btn">Access Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Verification Approved - AdmissionX",
    html: renderTemplate("Verification Approved", "Your institution is verified", body),
  });
}

export async function sendCollegeVerificationPendingEmail(
  to: string,
  collegeName: string,
  requiredDocuments: string
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>Your institution verification is pending. Please submit the following documents:</p>
    <div class="panel">
      <p>${escapeHtml(requiredDocuments)}</p>
    </div>
    <a href="${loginUrl}" class="btn">Submit Documents</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Verification Pending - AdmissionX",
    html: renderTemplate("Verification Pending", "Action required for verification", body),
  });
}

export async function sendNewApplicationNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>A new student application has been received.</p>
    <div class="panel">
      <p class="row"><span class="label">Student:</span> <span class="value">${escapeHtml(studentName)}</span></p>
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">Review Application</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "New Student Application Received - AdmissionX",
    html: renderTemplate("New Application", "A student has applied", body),
  });
}

export async function sendAdmissionApprovalRequestToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>Please review and approve the following admission request.</p>
    <div class="panel">
      <p class="row"><span class="label">Student:</span> <span class="value">${escapeHtml(studentName)}</span></p>
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">Review & Approve</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Admission Approval Request - AdmissionX",
    html: renderTemplate("Approval Request", "Action required for admission", body),
  });
}

export async function sendAdmissionApprovedNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  courseName: string,
  appId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>The admission has been approved successfully.</p>
    <div class="panel">
      <p class="row"><span class="label">Student:</span> <span class="value">${escapeHtml(studentName)}</span></p>
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Details</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Admission Approved - AdmissionX",
    html: renderTemplate("Admission Approved", "Student admission confirmed", body),
  });
}

export async function sendAdmissionRejectedNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  reason: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>The admission has been rejected.</p>
    <div class="panel">
      <p class="row"><span class="label">Student:</span> <span class="value">${escapeHtml(studentName)}</span></p>
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Reason:</span> <span class="value">${escapeHtml(reason)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">View Details</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Admission Rejected - AdmissionX",
    html: renderTemplate("Admission Rejected", "Application status update", body),
  });
}

export async function sendCollegeWelcomePartnerEmail(
  to: string,
  collegeName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>Welcome to the AdmissionX partner network! We're excited to have you on board.</p>
    <p>Together, we'll revolutionize the admission process and help students achieve their dreams.</p>
    <a href="${dashboardUrl}" class="btn">Explore Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Welcome to AdmissionX Partner Network",
    html: renderTemplate("Welcome Partner", "Let's transform admissions together", body),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ACTIVATION & SIGNUP CONFIRMATION EMAILS
// ═══════════════════════════════════════════════════════════════════════

export async function sendStudentActivationEmail(
  to: string,
  name: string,
  activationLink: string
): Promise<void> {
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Thank you for registering with AdmissionX! Please activate your account by clicking the button below:</p>
    <a href="${activationLink}" class="btn">Activate Your Account</a>
    <p>This activation link will expire in 24 hours.</p>
    <p>If you didn't create this account, please ignore this email.</p>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Activate Your AdmissionX Account",
    html: renderTemplate("Account Activation", "Activate your account to get started", body),
  });
}

export async function sendCollegeSignupConfirmationEmail(
  to: string,
  collegeName: string,
  contactName: string
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const body = `
    <p>Dear <strong>${escapeHtml(contactName)}</strong>,</p>
    <p>Thank you for registering <strong>${escapeHtml(collegeName)}</strong> with AdmissionX!</p>
    <p>Your registration has been received and is currently under review by our team. We will notify you once your institution is verified and approved.</p>
    <div class="panel">
      <p class="row"><span class="label">Institution:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
      <p class="row"><span class="label">Contact:</span> <span class="value">${escapeHtml(contactName)}</span></p>
      <p class="row"><span class="label">Status:</span> <span class="value">Pending Verification</span></p>
    </div>
    <p>You will receive an email once your account is approved. After approval, you can login using the button below:</p>
    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Registration Received - AdmissionX",
    html: renderTemplate("Registration Received", "Your institution registration is under review", body),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string,
  role: "student" | "college" | "admin"
): Promise<void> {
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>We received a request to reset your password for your AdmissionX ${role} account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p>This link will expire in 15 minutes for security reasons.</p>
    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Reset Your AdmissionX Password",
    html: renderTemplate("Password Reset Request", "Reset your password securely", body),
  });
}

export async function sendCollegeApprovalEmail(
  to: string,
  collegeName: string,
  contactName: string,
  tempPassword: string
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const body = `
    <p>Dear <strong>${escapeHtml(contactName)}</strong>,</p>
    <p>Congratulations! Your institution <strong>${escapeHtml(collegeName)}</strong> has been verified and approved on AdmissionX.</p>
    <p><span class="status">Approved</span></p>
    <div class="panel">
      <p class="row"><span class="label">Institution:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
      <p class="row"><span class="label">Email:</span> <span class="value">${escapeHtml(to)}</span></p>
      <p class="row"><span class="label">Temporary Password:</span> <span class="value">${escapeHtml(tempPassword)}</span></p>
    </div>
    <p><strong>Important:</strong> Please change your password after first login for security.</p>
    <p>You can now:</p>
    <ul>
      <li>Accept student applications</li>
      <li>Manage admission workflows</li>
      <li>Communicate with applicants</li>
      <li>Update courses and seat availability</li>
    </ul>
    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Partnership Team<br />AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Verification Approved - AdmissionX",
    html: renderTemplate("Verification Approved", "Your institution is now live on AdmissionX", body),
  });
}
