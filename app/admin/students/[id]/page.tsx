import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function saveStudent(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const dob = (formData.get("dob") as string)?.trim();
  const marks12Raw = formData.get("marks12") as string;
  const marks12 = marks12Raw ? parseFloat(marks12Raw) : null;
  const is_active = formData.get("is_active") === "1" ? 1 : 0;

  if (!name || !email || !id) return;

  try {
    const db = await getDb();
    await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email, phone, dob, marks12, is_active, updated_at: new Date() } }
    );
  } catch (e) {
    console.error("[admin/students/[id]] save error:", e);
  }

  revalidatePath("/admin/students/profile");
  revalidatePath("/admin/students/bookmarks");
  redirect("/admin/students/profile");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let student: Record<string, unknown> | null = null;
  try {
    const db = await getDb();
    student = await db.collection("next_student_signups").findOne(
      { _id: new ObjectId(id) },
      { projection: { password_hash: 0, activation_token: 0, activation_token_exp: 0 } }
    );
  } catch {
    notFound();
  }

  if (!student) notFound();

  const s = {
    id,
    name: (student.name as string) ?? "",
    email: (student.email as string) ?? "",
    phone: (student.phone as string) ?? "",
    dob: (student.dob as string) ?? "",
    marks12: student.marks12 != null ? String(student.marks12) : "",
    is_active: student.is_active ? "1" : "0",
    created_at: student.created_at
      ? new Date(student.created_at as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form action={saveStudent}>
        <input type="hidden" name="id" value={s.id} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/students/profile"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">Edit Student</h1>
            <p className="text-sm text-slate-400 mt-0.5">Registered on {s.created_at}</p>
          </div>
          <button
            type="submit"
            className="h-10 px-6 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] transition-colors shadow-md shadow-[#008080]/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Save Changes
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

          {/* Avatar row */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-[#008080]/10 flex items-center justify-center text-[#008080] font-black text-xl flex-shrink-0">
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-black text-slate-800">{s.name}</p>
              <p className="text-sm text-slate-400">{s.email}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Full Name</label>
            <input name="name" type="text" defaultValue={s.name} required className={inputCls} placeholder="Student full name" />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email Address</label>
            <input name="email" type="email" defaultValue={s.email} required className={inputCls} placeholder="email@example.com" />
          </div>

          {/* Phone + DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input name="phone" type="tel" defaultValue={s.phone} className={inputCls} placeholder="10-digit number" maxLength={10} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input name="dob" type="date" defaultValue={s.dob} className={inputCls} />
            </div>
          </div>

          {/* Marks + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>12th Marks (%)</label>
              <input name="marks12" type="number" min="0" max="100" step="0.01" defaultValue={s.marks12} className={inputCls} placeholder="e.g. 85.5" />
            </div>
            <div>
              <label className={labelCls}>Account Status</label>
              <div className="relative">
                <select name="is_active" defaultValue={s.is_active}
                  className="w-full h-10 pl-4 pr-8 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all appearance-none text-slate-700">
                  <option value="1">Active</option>
                  <option value="0">Pending</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom save */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="h-11 px-8 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] transition-colors shadow-md shadow-[#008080]/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
