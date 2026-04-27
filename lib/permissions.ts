// ── Role types ────────────────────────────────────────────────────────────────
// AdminRole is now a loose string so DB-created roles work without code changes.
// "super_admin" is the only hardcoded special case — it always has full access.

export type AdminRole = string;

export interface RoleConfig {
  value: string;
  label: string;
  desc: string;
  badgeColor: string;
  accessMode: "blacklist" | "whitelist";
  blockedPaths: string[];
  allowedPaths: string[];
  is_system: boolean;
}

// ── Static fallback for system roles (used when DB is unavailable) ─────────────
// These are also seeded into the `admin_roles` collection on first load.

export const SYSTEM_ROLES: RoleConfig[] = [
  {
    value:        "super_admin",
    label:        "Super Admin",
    desc:         "Full access to everything",
    badgeColor:   "bg-purple-100 text-purple-700",
    accessMode:   "blacklist",
    blockedPaths: [],
    allowedPaths: [],
    is_system:    true,
  },
  {
    value:        "role_admin",
    label:        "Admin",
    desc:         "Most access, blocked from system / finance / config pages",
    badgeColor:   "bg-blue-100 text-blue-700",
    accessMode:   "blacklist",
    blockedPaths: [
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
    ],
    allowedPaths: [],
    is_system:    true,
  },
  {
    value:        "role_counsellor",
    label:        "Counsellor",
    desc:         "Students, colleges, applications & payments only",
    badgeColor:   "bg-emerald-100 text-emerald-700",
    accessMode:   "whitelist",
    blockedPaths: [],
    allowedPaths: [
      "/admin/dashboard",
      "/admin/students",
      "/admin/colleges",
      "/admin/applications",
      "/admin/payment",
      "/admin/queries/college-student",
      "/admin/profile",
    ],
    is_system:    true,
  },
];

// ── Derived static maps (for sidebar badges etc. — covers system roles) ────────
export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  SYSTEM_ROLES.map(r => [r.value, r.label])
);

export const ROLE_BADGE_COLORS: Record<string, string> = Object.fromEntries(
  SYSTEM_ROLES.map(r => [r.value, r.badgeColor])
);

// ── canAccess: works with both static and DB-loaded role configs ───────────────

export function canAccessWithConfig(roleCfg: RoleConfig | undefined, path: string): boolean {
  if (!roleCfg || roleCfg.value === "super_admin") return true;

  if (roleCfg.accessMode === "whitelist") {
    return roleCfg.allowedPaths.some(p => path === p || path.startsWith(p + "/"));
  }

  // blacklist mode
  return !roleCfg.blockedPaths.some(p => path === p || path.startsWith(p + "/"));
}

/** Static canAccess — uses SYSTEM_ROLES fallback. Used in layout/middleware. */
export function canAccess(role: AdminRole | undefined, path: string): boolean {
  const r = role ?? "super_admin";
  if (r === "super_admin") return true;
  const cfg = SYSTEM_ROLES.find(s => s.value === r);
  if (cfg) return canAccessWithConfig(cfg, path);
  // Unknown role — deny by default
  return false;
}

// ── isReadOnly (kept for backward compat) ─────────────────────────────────────
export function isReadOnly(role: AdminRole | undefined, path: string): boolean {
  if (!role || role === "super_admin") return false;
  const READONLY = ["/admin/payment", "/admin/members/registrations", "/admin/members/users"];
  if (role === "role_admin") return READONLY.some(p => path === p || path.startsWith(p + "/"));
  return false;
}
