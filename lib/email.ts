import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAaCAYAAADyrhO6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkMyMkY0RTU1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkMyMkY0RTY1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCQzIyRjRFMzVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCQzIyRjRFNDVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvmIsQoAACQtSURBVHja7Fx3fFTV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";
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
  const template = `<!DOCTYPE html>
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
    background: #FFFFFF;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #F0EFEB;
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
    display: block;
  }
  .brand-tagline {
    font-size: 10px;
    color: #666666;
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
</style>
</head>
<body>

<div class="email-outer">

  <!-- BRAND STRIP / HEADER -->
  <div class="brand-strip">
    <div class="brand-strip-red"></div>
    <div class="brand-strip-inner">
      <img src="${logoBase64}" alt="AdmissionX Logo">
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
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <div class="feature-text">Explore courses &amp; universities</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="feature-text">Complete your profile</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="feature-text">Upload required documents</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
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
            <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
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
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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

      <!-- Facebook -->
      <a href="https://facebook.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        Facebook
      </a>

      <!-- Instagram -->
      <a href="https://instagram.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        Instagram
      </a>

      <!-- X / Twitter -->
      <a href="https://twitter.com/admissionx" class="social-btn">
        <svg viewBox="0 0 24 24"><path d="M4 4l16 16M4 20L20 4"/></svg>
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
</html>`;

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
    background: #FFFFFF;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #F0EFEB;
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
    display: block;
  }
  .brand-tagline {
    font-size: 10px;
    color: #666666;
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
      <img src="${logoBase64}" alt="AdmissionX Logo">
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
  date: string,
  collegeName: string,
  courseName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your payment has been processed successfully. You are now successfully enrolled.</p>
    <div class="panel">
      <p class="row"><span class="label">College:</span> <span class="value">${escapeHtml(collegeName)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">Amount Paid:</span> <span class="value">₹${escapeHtml(amount)}</span></p>
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

export async function sendCollegeStudentEnrolledEmail(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string,
  amountPaid: string,
  transactionId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>We are pleased to inform you that a student has successfully completed their payment and enrolled in your institution.</p>
    <div class="panel">
      <p class="row"><span class="label">Student Name:</span> <span class="value">${escapeHtml(studentName)}</span></p>
      <p class="row"><span class="label">Course Enrolled:</span> <span class="value">${escapeHtml(courseName)}</span></p>
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(appId)}</span></p>
      <p class="row"><span class="label">Amount Paid:</span> <span class="value">₹${escapeHtml(amountPaid)}</span></p>
      <p class="row"><span class="label">Transaction ID:</span> <span class="value">${escapeHtml(transactionId)}</span></p>
    </div>
    <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: `Student Enrolled Successfully: ${escapeHtml(studentName)} - AdmissionX`,
    html: renderTemplate("Student Enrolled", "New student enrollment confirmed", body),
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
