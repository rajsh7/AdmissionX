import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth";
import { canAccessWithConfig, SYSTEM_ROLES } from "@/lib/permissions";
import type { AdminRole, RoleConfig } from "@/lib/permissions";
import AdminShell from "./_components/AdminShell";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | AdmissionX",
  description: "AdmissionX administration panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_admin")?.value;

  if (!token) redirect("/login?redirect=/admin/dashboard");

  const payload = await verifyAdminToken(token);
  if (!payload) redirect("/login?redirect=/admin/dashboard");

  const adminRole: AdminRole = (payload.adminRole as AdminRole) ?? "super_admin";

  // Load role config from DB for accurate access checks
  let roleCfg: RoleConfig | undefined;
  try {
    const db = await getDb();
    const doc = await db.collection("admin_roles").findOne({ value: adminRole });
    if (doc) {
      roleCfg = {
        value:        doc.value,
        label:        doc.label,
        desc:         doc.desc ?? "",
        badgeColor:   doc.badgeColor ?? "bg-slate-100 text-slate-600",
        accessMode:   doc.accessMode ?? "blacklist",
        blockedPaths: doc.blockedPaths ?? [],
        allowedPaths: doc.allowedPaths ?? [],
        is_system:    doc.is_system === true,
      };
    }
  } catch {
    // fallback to static
  }
  if (!roleCfg) roleCfg = SYSTEM_ROLES.find(s => s.value === adminRole);

  return (
    <AdminShell
      admin={{
        id: payload.id,
        name: payload.name,
        email: payload.email,
        adminRole,
        roleCfg,
      }}
    >
      {children}
    </AdminShell>
  );
}
