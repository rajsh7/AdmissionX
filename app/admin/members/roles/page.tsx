import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import Link from "next/link";
import RolesPageClient from "./RolesPageClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleDefinition {
  id: string;
  value: string;
  label: string;
  desc: string;
  badgeColor: string;
  blockedPaths: string[];
  allowedPaths: string[];
  accessMode: "blacklist" | "whitelist";
  is_system: boolean;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  admin_role: string;
  is_active: boolean;
  created_at: string;
}

// ─── Server Actions: Admin Users ──────────────────────────────────────────────

async function createAdminUser(formData: FormData) {
  "use server";
  const name       = (formData.get("name") as string)?.trim();
  const email      = (formData.get("email") as string)?.trim().toLowerCase();
  const password   = (formData.get("password") as string)?.trim();
  const admin_role = (formData.get("admin_role") as string) || "role_admin";

  if (!name || !email || !password) return;

  const db = await getDb();
  const existing = await db.collection("next_admin_users").findOne({ email });
  if (existing) throw new Error("Email already exists.");

  const password_hash = await bcrypt.hash(password, 10);
  await db.collection("next_admin_users").insertOne({
    name, email, password_hash, admin_role, is_active: true, created_at: new Date(),
  });
  revalidatePath("/admin/members/roles");
}

async function updateAdminUser(formData: FormData) {
  "use server";
  const id         = formData.get("id") as string;
  const name       = (formData.get("name") as string)?.trim();
  const email      = (formData.get("email") as string)?.trim().toLowerCase();
  const admin_role = formData.get("admin_role") as string;
  const password   = (formData.get("password") as string)?.trim();
  const is_active  = formData.get("is_active") !== null;

  if (!id || !name || !email) return;

  const db = await getDb();
  const { ObjectId } = await import("mongodb");

  const $set: Record<string, unknown> = { name, email, admin_role, is_active, updated_at: new Date() };
  if (password) $set.password_hash = await bcrypt.hash(password, 10);

  await db.collection("next_admin_users").updateOne({ _id: new ObjectId(id) }, { $set });
  revalidatePath("/admin/members/roles");
}

async function deleteAdminUser(id: string) {
  "use server";
  if (!id) return;
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  await db.collection("next_admin_users").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/members/roles");
}

// ─── Server Actions: Role Definitions ─────────────────────────────────────────

async function createRole(formData: FormData) {
  "use server";
  const value      = (formData.get("value") as string)?.trim();
  const label      = (formData.get("label") as string)?.trim();
  const desc       = (formData.get("desc") as string)?.trim();
  const badgeColor = (formData.get("badgeColor") as string)?.trim();
  const accessMode = (formData.get("accessMode") as string) || "blacklist";
  const blockedPaths = formData.getAll("blockedPaths").map(p => String(p).trim()).filter(Boolean);
  const allowedPaths = formData.getAll("allowedPaths").map(p => String(p).trim()).filter(Boolean);

  if (!value || !label) throw new Error("Value and label are required.");

  const db = await getDb();
  const existing = await db.collection("admin_roles").findOne({ value });
  if (existing) throw new Error("Role value already exists.");

  await db.collection("admin_roles").insertOne({
    value, label, desc, badgeColor, accessMode, blockedPaths, allowedPaths, is_system: false, created_at: new Date(),
  });
  revalidatePath("/admin/members/roles");
}

async function updateRole(formData: FormData) {
  "use server";
  const id         = formData.get("id") as string;
  const label      = (formData.get("label") as string)?.trim();
  const desc       = (formData.get("desc") as string)?.trim();
  const badgeColor = (formData.get("badgeColor") as string)?.trim();
  const accessMode = (formData.get("accessMode") as string) || "blacklist";
  const blockedPaths = formData.getAll("blockedPaths").map(p => String(p).trim()).filter(Boolean);
  const allowedPaths = formData.getAll("allowedPaths").map(p => String(p).trim()).filter(Boolean);

  if (!id || !label) return;

  const db = await getDb();
  const { ObjectId } = await import("mongodb");

  await db.collection("admin_roles").updateOne(
    { _id: new ObjectId(id) },
    { $set: { label, desc, badgeColor, accessMode, blockedPaths, allowedPaths, updated_at: new Date() } }
  );
  revalidatePath("/admin/members/roles");
}

async function deleteRole(id: string) {
  "use server";
  if (!id) return;
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  
  const role = await db.collection("admin_roles").findOne({ _id: new ObjectId(id) });
  if (role?.is_system) throw new Error("Cannot delete system roles.");

  await db.collection("admin_roles").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/members/roles");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MembersRolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Fetch admin users
  const userFilter: Record<string, unknown> = {};
  if (q) userFilter.$or = [
    { name:  { $regex: q, $options: "i" } },
    { email: { $regex: q, $options: "i" } },
  ];

  const [userDocs, userTotal] = await Promise.all([
    db.collection("next_admin_users").find(userFilter).sort({ created_at: -1 }).skip(skip).limit(PAGE_SIZE).toArray(),
    db.collection("next_admin_users").countDocuments(userFilter),
  ]);

  const users: AdminUserRow[] = userDocs.map(d => ({
    id:         d._id.toString(),
    name:       d.name ?? "",
    email:      d.email ?? "",
    admin_role: (d.admin_role as string) ?? "role_admin",
    is_active:  d.is_active !== false,
    created_at: d.created_at ? new Date(d.created_at).toISOString() : "",
  }));

  // Fetch role definitions
  const roleDocs = await db.collection("admin_roles").find({}).sort({ created_at: 1 }).toArray();
  const roles: RoleDefinition[] = roleDocs.map(d => ({
    id:           d._id.toString(),
    value:        d.value ?? "",
    label:        d.label ?? "",
    desc:         d.desc ?? "",
    badgeColor:   d.badgeColor ?? "bg-slate-100 text-slate-600",
    blockedPaths: d.blockedPaths ?? [],
    allowedPaths: d.allowedPaths ?? [],
    accessMode:   d.accessMode ?? "blacklist",
    is_system:    d.is_system === true,
    created_at:   d.created_at ? new Date(d.created_at).toISOString() : "",
  }));

  const totalPages = Math.ceil(userTotal / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <RolesPageClient
        users={users}
        roles={roles}
        offset={skip}
        page={page}
        totalPages={totalPages}
        searchQuery={q}
        createAdminUser={createAdminUser}
        updateAdminUser={updateAdminUser}
        deleteAdminUser={deleteAdminUser}
        createRole={createRole}
        updateRole={updateRole}
        deleteRole={deleteRole}
      />
    </div>
  );
}
