import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
  redirect("/admin/members/roles");
}

const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-[5px] text-sm font-medium bg-white focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all placeholder:text-slate-300 text-slate-700";
const labelCls = "block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5";

export default async function CreateAdminUserPage() {
  const db = await getDb();
  const roleDocs = await db.collection("admin_roles").find({}).sort({ created_at: 1 }).toArray();
  const roles = roleDocs
    .filter((d: any) => d.value !== "super_admin")
    .map((d: any) => ({
      id:         d._id.toString(),
      value:      d.value ?? "",
      label:      d.label ?? "",
      desc:       d.desc ?? "",
      badgeColor: d.badgeColor ?? "bg-slate-100 text-slate-600",
    }));

  return (
    <div className="p-6 max-w-[600px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/members/roles"
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-[5px] text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none">Create Admin User</h1>
          <p className="text-sm text-slate-500 mt-1">Add a new admin account with a specific role.</p>
        </div>
      </div>

      {/* Form */}
      <form action={createAdminUser} className="bg-white rounded-[5px] border border-slate-200 shadow-sm p-6 space-y-5">

        {/* Full Name */}
        <div>
          <label className={labelCls}>Full Name</label>
          <input
            name="name"
            required
            placeholder="e.g. John Doe"
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="e.g. admin@admissionx.in"
            className={inputCls}
          />
        </div>

        {/* Password */}
        <div>
          <label className={labelCls}>Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className={inputCls}
          />
        </div>

        {/* Assign Role */}
        <div>
          <label className={labelCls}>Assign Role</label>
          {roles.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-[5px]">
              No roles defined yet. Go to <Link href="/admin/members/roles" className="font-bold underline">Role Definitions</Link> to create roles first.
            </p>
          ) : (
            <div className="space-y-2">
              {roles.map((r, i) => (
                <label key={r.id} className="flex items-start gap-3 p-3 rounded-[5px] border cursor-pointer transition-all border-slate-200 bg-slate-50 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="admin_role"
                    value={r.value}
                    defaultChecked={i === 0}
                    required
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${r.badgeColor}`}>
                      {r.label}
                    </span>
                    {r.desc && <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/members/roles"
            className="flex-1 h-11 flex items-center justify-center border border-slate-200 text-slate-600 text-sm font-bold rounded-[5px] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={roles.length === 0}
            className="flex-1 h-11 bg-emerald-600 text-white text-sm font-bold rounded-[5px] hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Create Admin
          </button>
        </div>
      </form>
    </div>
  );
}
