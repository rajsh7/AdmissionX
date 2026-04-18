// ── Role definitions ──────────────────────────────────────────────────────────
// super_admin   → full access to everything
// role_admin    → 70-80% access, blocked from sensitive system/finance/config pages
// role_counsellor → only students, colleges, payments

export type AdminRole = "super_admin" | "role_admin" | "role_counsellor";

// Nav paths blocked for role_admin (they see everything EXCEPT these)
const ROLE_ADMIN_BLOCKED: string[] = [
  "/admin/members/roles",
  "/admin/members/status",
  "/admin/members/privilege",
  "/admin/members/groups",
  "/admin/users",
  "/admin/analytics",
  "/admin/ads",
  "/admin/seo",
  "/admin/pages",
  "/admin/website-content",
  "/admin/other-info",
  "/admin/reports",
  "/admin/reports_new",
  "/admin/subscribe",
];

// Nav paths allowed for role_counsellor (whitelist — only these)
const COUNSELLOR_ALLOWED: string[] = [
  "/admin/dashboard",
  "/admin/students",
  "/admin/colleges",
  "/admin/applications",
  "/admin/payment",
  "/admin/queries/college-student",
  "/admin/profile",
];

// ── Permission checks ─────────────────────────────────────────────────────────

export function canAccess(role: AdminRole | undefined, path: string): boolean {
  const r = role ?? "super_admin";
  if (r === "super_admin") return true;

  if (r === "role_counsellor") {
    return COUNSELLOR_ALLOWED.some((allowed) => path === allowed || path.startsWith(allowed + "/"));
  }

  // role_admin — blocked list
  if (r === "role_admin") {
    return !ROLE_ADMIN_BLOCKED.some((blocked) => path === blocked || path.startsWith(blocked + "/"));
  }

  return false;
}

// Read-only paths for role_admin (can view but not create/update/delete)
const ROLE_ADMIN_READONLY: string[] = [
  "/admin/payment",
  "/admin/members/registrations",
  "/admin/members/users",
];

export function isReadOnly(role: AdminRole | undefined, path: string): boolean {
  if (!role || role === "super_admin") return false;
  if (role === "role_counsellor") return false; // counsellor has full CRUD on their allowed paths
  if (role === "role_admin") {
    return ROLE_ADMIN_READONLY.some((p) => path === p || path.startsWith(p + "/"));
  }
  return false;
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:      "Super Admin",
  role_admin:       "Admin",
  role_counsellor:  "Counsellor",
};

export const ROLE_BADGE_COLORS: Record<AdminRole, string> = {
  super_admin:     "bg-purple-100 text-purple-700",
  role_admin:      "bg-blue-100 text-blue-700",
  role_counsellor: "bg-emerald-100 text-emerald-700",
};
