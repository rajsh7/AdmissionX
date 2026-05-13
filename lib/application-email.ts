import { sendMail } from "@/lib/email";

type ApplicationEmailStatus = "pending" | "submitted" | "approved" | "rejected" | "cancelled";

export interface StudentApplicationEmailDetails {
  to: string;
  studentName: string;
  collegeName: string;
  appId: string;
  courseName?: string | null;
  reason?: string | null;
  status: string;
}

export interface CollegeApplicationEmailDetails extends StudentApplicationEmailDetails {
  collegeEmail: string;
  collegeSlug?: string | null;
}

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPublicBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com").replace(/\/$/, "");
}

function applicationStatusLabel(status: string): string {
  const key = status.toLowerCase().trim();
  const labels: Record<ApplicationEmailStatus, string> = {
    pending: "Pending",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };
  return labels[key as ApplicationEmailStatus] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderAdmissionXTemplate(title: string, preheader: string, body: string): string {
  const baseUrl = getPublicBaseUrl();
  const logoUrl = `${baseUrl}/admissionx-logo.png`;

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

function applicationDetailsPanel(
  details: Pick<StudentApplicationEmailDetails, "appId" | "courseName" | "collegeName" | "studentName">,
  audience: "student" | "college",
): string {
  const course = details.courseName || "General Admission";

  return `
    <div class="panel">
      ${audience === "college" ? `<p class="row"><span class="label">Student Name:</span> <span class="value">${escapeHtml(details.studentName)}</span></p>` : ""}
      <p class="row"><span class="label">Application ID:</span> <span class="value">${escapeHtml(details.appId)}</span></p>
      <p class="row"><span class="label">Course:</span> <span class="value">${escapeHtml(course)}</span></p>
      <p class="row"><span class="label">${audience === "student" ? "University:" : "Institution:"}</span> <span class="value">${escapeHtml(details.collegeName)}</span></p>
    </div>
  `;
}

export async function sendStudentApplicationStatusEmail(details: StudentApplicationEmailDetails): Promise<void> {
  const status = details.status.toLowerCase().trim();
  const label = applicationStatusLabel(status);
  const dashboardUrl = `${getPublicBaseUrl()}/dashboard/student`;
  const reason = details.reason || "Please login to your AdmissionX account for the latest details.";

  const copy: Record<string, { title: string; subject: string; message: string }> = {
    submitted: {
      title: "Application Submitted Successfully",
      subject: "Application submitted successfully | AdmissionX",
      message: "Congratulations! Your application has been submitted successfully through AdmissionX. Our admission team will review your application shortly.",
    },
    approved: {
      title: "Final Admission Confirmation",
      subject: "Congratulations - admission confirmed | AdmissionX",
      message: "Congratulations and welcome on board AdmissionX. We are pleased to inform you that your admission has been confirmed successfully. We wish you a successful academic journey and a bright future ahead.",
    },
    rejected: {
      title: "Application Status Update",
      subject: "Application update | AdmissionX",
      message: `Your application requires attention. Reason: ${escapeHtml(reason)}`,
    },
    cancelled: {
      title: "Application Cancelled",
      subject: "Application cancelled | AdmissionX",
      message: "Your application has been marked as cancelled. Please login to AdmissionX or contact support if you need help with the next step.",
    },
    pending: {
      title: "Application Pending Review",
      subject: "Application pending review | AdmissionX",
      message: "Your application is currently pending review. Please complete any required sections and keep your documents ready for verification.",
    },
  };

  const selected = copy[status] ?? {
    title: "Application Status Update",
    subject: `Application update - ${label} | AdmissionX`,
    message: `Your application status has been updated to ${escapeHtml(label)}.`,
  };

  const body = `
    <p>Dear <strong>${escapeHtml(details.studentName || "Student")}</strong>,</p>
    <p>${selected.message}</p>
    <p><span class="status">${escapeHtml(label)}</span></p>
    ${applicationDetailsPanel(details, "student")}
    <a href="${dashboardUrl}" class="btn">Login to AdmissionX</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;

  await sendMail({
    to: details.to,
    subject: selected.subject,
    html: renderAdmissionXTemplate(selected.title, selected.message, body),
  });
}

export async function sendCollegeApplicationStatusEmail(details: CollegeApplicationEmailDetails): Promise<void> {
  const status = details.status.toLowerCase().trim();
  const label = applicationStatusLabel(status);
  const dashboardUrl = details.collegeSlug
    ? `${getPublicBaseUrl()}/dashboard/college/${encodeURIComponent(details.collegeSlug)}`
    : `${getPublicBaseUrl()}/login/college`;
  const reason = details.reason || "Please review the application from your AdmissionX dashboard.";

  const copy: Record<string, { title: string; subject: string; message: string }> = {
    submitted: {
      title: "New Student Application Received",
      subject: "New student application received | AdmissionX",
      message: "A student application has been received through AdmissionX. Please login to your institution dashboard to review the application and take further action.",
    },
    approved: {
      title: "Admission Approved",
      subject: "Admission approved by institution | AdmissionX",
      message: "The admission for the following student has been confirmed successfully. The student has been notified regarding the admission confirmation.",
    },
    rejected: {
      title: "Admission Rejected or On Hold",
      subject: "Application marked rejected or hold | AdmissionX",
      message: `The following student application has been marked as rejected or hold. Reason: ${escapeHtml(reason)}`,
    },
    cancelled: {
      title: "Application Cancelled",
      subject: "Application cancelled | AdmissionX",
      message: "The following student application has been marked as cancelled in AdmissionX.",
    },
    pending: {
      title: "Student Admission Approval Request",
      subject: "Student admission approval request | AdmissionX",
      message: "The following student application is pending your approval. Please review and confirm the admission status through your AdmissionX dashboard.",
    },
  };

  const selected = copy[status] ?? {
    title: "Student Application Update",
    subject: `Student application update - ${label} | AdmissionX`,
    message: `The following student application status has been updated to ${escapeHtml(label)}.`,
  };

  const body = `
    <p>Dear <strong>${escapeHtml(details.collegeName || "Institution")}</strong>,</p>
    <p>${selected.message}</p>
    <p><span class="status">${escapeHtml(label)}</span></p>
    ${applicationDetailsPanel(details, "college")}
    <a href="${dashboardUrl}" class="btn">Open Institution Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;

  await sendMail({
    to: details.collegeEmail,
    subject: selected.subject,
    html: renderAdmissionXTemplate(selected.title, selected.message, body),
  });
}
