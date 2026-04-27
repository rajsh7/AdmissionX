// node scripts/seed-admin-roles.js
const { MongoClient } = require("mongodb");
const path = require("path");
const fs   = require("fs");

[".env.local", ".env"].forEach(f => {
  const p = path.join(__dirname, "..", f);
  if (fs.existsSync(p)) {
    fs.readFileSync(p, "utf8").split("\n").forEach(line => {
      const [k, ...v] = line.split("=");
      if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
    });
  }
});

const SYSTEM_ROLES = [
  {
    value: "super_admin", label: "Super Admin",
    desc: "Full access to everything",
    badgeColor: "bg-purple-100 text-purple-700",
    accessMode: "blacklist", blockedPaths: [], allowedPaths: [], is_system: true,
  },
  {
    value: "role_admin", label: "Admin",
    desc: "Most access, blocked from system / finance / config pages",
    badgeColor: "bg-blue-100 text-blue-700",
    accessMode: "blacklist",
    blockedPaths: [
      "/admin/members/roles", "/admin/members/status", "/admin/members/privilege",
      "/admin/members/groups", "/admin/users", "/admin/analytics", "/admin/ads",
      "/admin/seo", "/admin/pages", "/admin/website-content", "/admin/other-info",
      "/admin/reports", "/admin/reports_new", "/admin/subscribe",
    ],
    allowedPaths: [], is_system: true,
  },
  {
    value: "role_counsellor", label: "Counsellor",
    desc: "Students, colleges, applications & payments only",
    badgeColor: "bg-emerald-100 text-emerald-700",
    accessMode: "whitelist", blockedPaths: [],
    allowedPaths: [
      "/admin/dashboard", "/admin/students", "/admin/colleges",
      "/admin/applications", "/admin/payment", "/admin/queries/college-student", "/admin/profile",
    ],
    is_system: true,
  },
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "admissionx");

  for (const role of SYSTEM_ROLES) {
    const existing = await db.collection("admin_roles").findOne({ value: role.value });
    if (existing) {
      console.log(`  ⚠️  already exists: ${role.value}`);
    } else {
      await db.collection("admin_roles").insertOne({ ...role, created_at: new Date() });
      console.log(`  ✅ inserted: ${role.value}`);
    }
  }

  const all = await db.collection("admin_roles").find({}).toArray();
  console.log(`\n📋 admin_roles collection now has ${all.length} role(s):`);
  all.forEach(r => console.log(`   - ${r.value} (${r.label}) | system: ${r.is_system}`));

  await client.close();
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
