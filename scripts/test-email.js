/**
 * Run: node scripts/test-email.js your@email.com
 * Tests the SMTP config from .env.local
 */
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

const to = process.argv[2];
if (!to) { console.error("Usage: node scripts/test-email.js <to@email.com>"); process.exit(1); }

const host = process.env.MAIL_HOST;
const port = Number(process.env.MAIL_PORT || 587);
const user = process.env.MAIL_USERNAME;
const pass = process.env.MAIL_PASSWORD;
const secure = port === 465;

console.log(`\nSMTP Config:`);
console.log(`  Host : ${host}`);
console.log(`  Port : ${port}`);
console.log(`  User : ${user}`);
console.log(`  Pass : ${pass ? "***" + pass.slice(-4) : "(not set)"}`);
console.log(`  TLS  : ${secure ? "SSL (465)" : "STARTTLS (587)"}\n`);

const transporter = nodemailer.createTransport({
  host, port, secure,
  requireTLS: !secure,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection FAILED:", err.message);
    process.exit(1);
  }
  console.log("✅ SMTP connection OK — sending test email...");

  transporter.sendMail({
    from: `"AdmissionX Test" <${user}>`,
    to,
    subject: "AdmissionX SMTP Test",
    html: "<p>This is a test email from AdmissionX. If you see this, SMTP is working correctly.</p>",
  }, (err2, info) => {
    if (err2) {
      console.error("❌ Send FAILED:", err2.message);
    } else {
      console.log("✅ Email sent! Message ID:", info.messageId);
    }
  });
});
