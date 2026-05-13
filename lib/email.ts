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
  // Embed logo as base64 to avoid broken images in emails
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
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  
  let body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Welcome to AdmissionX! Your student account has been successfully created.</p>
    <div class="panel">
      <p class="row"><span class="label">Name:</span> <span class="value">${escapeHtml(name)}</span></p>
      <p class="row"><span class="label">Email:</span> <span class="value">${escapeHtml(email)}</span></p>
      <p class="row"><span class="label">Phone:</span> <span class="value">${escapeHtml(phone)}</span></p>
    </div>
  `;
  
  if (activationLink) {
    body += `
    <p><strong>Important:</strong> Please activate your account by clicking the button below to access your dashboard:</p>
    <a href="${activationLink}" class="btn">Activate Your Account</a>
    <p>This activation link will expire in 24 hours.</p>
    `;
  } else {
    body += `
    <a href="${dashboardUrl}" class="btn">Access Your Dashboard</a>
    `;
  }
  
  body += `
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  
  await sendMail({
    to,
    subject: "Welcome to AdmissionX - Registration Successful",
    html: renderTemplate("Registration Successful", "Your AdmissionX account is ready", body),
  });
}

export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string,
  expiryMinutes: number
): Promise<void> {
  const body = `
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p>Your OTP for verification is:</p>
    <div class="panel" style="text-align: center;">
      <h2 style="margin: 0; font-size: 32px; color: #0f766e; letter-spacing: 8px;">${escapeHtml(otp)}</h2>
    </div>
    <p>This OTP will expire in <strong>${expiryMinutes} minutes</strong>.</p>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Your AdmissionX OTP Verification Code",
    html: renderTemplate("OTP Verification", `Your OTP: ${otp}`, body),
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
