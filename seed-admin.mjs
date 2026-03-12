import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { createInterface } from "readline";

// ── DB config (reads from .env.local if present) ───────────────────────────
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on actual env vars
  }
}

loadEnv();

const DB_CONFIG = {
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "admissionx",
};

// ── CLI helpers ────────────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.openStdin();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let password = "";
    process.stdin.on("data", function handler(ch) {
      const char = ch.toString();
      if (char === "\n" || char === "\r" || char === "\u0004") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", handler);
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        process.stdout.write("\n");
        process.exit(1);
      } else if (char === "\u007f" || char === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(prompt + "*".repeat(password.length));
        }
      } else {
        password += char;
        process.stdout.write("*");
      }
    });
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   AdmissionX — Create Admin User         ║");
  console.log("╚══════════════════════════════════════════╝\n");

  console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...\n`);

  const conn = await mysql.createConnection(DB_CONFIG);

  // Ensure the table exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS next_admin_users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      is_active     TINYINT(1)  NOT NULL DEFAULT 1,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // List existing admins
  const [existing] = await conn.execute(
    "SELECT id, name, email, is_active, created_at FROM next_admin_users ORDER BY id ASC"
  );

  if (existing.length > 0) {
    console.log("Existing admin accounts:\n");
    console.log(
      existing
        .map(
          (a) =>
            `  [${a.id}] ${a.name} <${a.email}>  status: ${a.is_active ? "✅ active" : "❌ disabled"}  created: ${String(a.created_at).slice(0, 10)}`
        )
        .join("\n")
    );
    console.log("");
  } else {
    console.log("No admin users found yet. Creating the first one.\n");
  }

  // Gather input
  const name  = (await ask("Admin name    : ")).trim();
  const email = (await ask("Admin email   : ")).trim().toLowerCase();

  if (!name || !email) {
    console.error("\n❌  Name and email are required.");
    await conn.end();
    rl.close();
    process.exit(1);
  }

  // Check for duplicate
  const [dup] = await conn.execute(
    "SELECT id FROM next_admin_users WHERE LOWER(email) = ? LIMIT 1",
    [email]
  );
  if (dup.length > 0) {
    console.error(`\n❌  An admin with email "${email}" already exists (id=${dup[0].id}).`);
    console.log("    To reset their password, use the /forgot-password page.\n");
    await conn.end();
    rl.close();
    process.exit(1);
  }

  // Password
  let password = "";
  let confirm  = "";
  while (true) {
    password = await askHidden("Password      : ");
    if (password.length < 8) {
      console.log("  ⚠  Password must be at least 8 characters. Try again.");
      continue;
    }
    confirm = await askHidden("Confirm passwd: ");
    if (password !== confirm) {
      console.log("  ⚠  Passwords do not match. Try again.");
      continue;
    }
    break;
  }

  rl.close();

  const hash = await bcrypt.hash(password, 12);

  const [result] = await conn.execute(
    "INSERT INTO next_admin_users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, hash]
  );

  await conn.end();

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✅  Admin user created successfully!    ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\n  ID    : ${result.insertId}`);
  console.log(`  Name  : ${name}`);
  console.log(`  Email : ${email}`);
  console.log(`\n  Login at: http://localhost:3000/login\n`);
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message);
  rl.close();
  process.exit(1);
});
