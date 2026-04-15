import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

async function updateProfile(formData: FormData) {
  "use server";
  const studentId = String(formData.get("student_id") ?? "");
  const isObjectId = /^[a-f\d]{24}$/i.test(studentId);
  const db = await getDb();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dob = String(formData.get("dob") ?? "");
  const parentsname = String(formData.get("parentsname") ?? "");
  const parentsnumber = String(formData.get("parentsnumber") ?? "");
  const hobbies = String(formData.get("hobbies") ?? "");
  const interests = String(formData.get("interests") ?? "");
  const city = String(formData.get("city") ?? "");
  const state = String(formData.get("state") ?? "");

  try {
    if (isObjectId) {
      if (name || phone) {
        await db.collection("next_student_signups").updateOne(
          { _id: new ObjectId(studentId) },
          { $set: { ...(name && { name }), ...(phone !== undefined && { phone }), updated_at: new Date() } }
        );
      }
      await db.collection("next_student_profiles").updateOne(
        { student_id: studentId },
        { $set: { student_id: studentId, gender, dob, parentsname, parentsnumber, hobbies, interest: interests, city, state, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
        { upsert: true }
      );
    } else {
      await db.collection("studentprofile").updateOne(
        { id: Number(studentId) },
        { $set: { gender, dateofbirth: dob, parentsname, parentsnumber, hobbies, interests, updated_at: new Date() } }
      );
    }
  } catch (e) {
    console.error("[updateProfile]", e);
  }

  revalidatePath("/admin/students/profile");
  redirect("/admin/students/profile");
}

const inputCls = "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700";
const selectCls = `${inputCls} appearance-none pr-10`;
const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

function Card({ children }: { children: ReactNode }) {
  return <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">{children}</div>;
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#008080] rounded-full block" />
      <span className="material-symbols-outlined text-[18px] text-[#008080]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <h2 className="text-sm font-black text-slate-700">{title}</h2>
    </div>
  );
}

export default async function EditStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isObjectId = /^[a-f\d]{24}$/i.test(id);
  const isNumeric = /^\d+$/.test(id);
  if (!isObjectId && !isNumeric) notFound();

  const db = await getDb();

  let name = "Unknown", email = "-", phone = "", createdAt = "-", isActive = 1;
  let prof: Record<string, any> = {};
  let formattedDob = "";

  if (isObjectId) {
    const student = await db.collection("next_student_signups").findOne({ _id: new ObjectId(id) });
    if (!student) notFound();
    name = student.name || "Unknown";
    email = student.email || "-";
    phone = student.phone || "";
    isActive = student.is_active ?? 0;
    createdAt = student.created_at ? new Date(student.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
    prof = await db.collection("next_student_profiles").findOne({ student_id: id }) ?? {};
    formattedDob = prof.dob ? (() => { try { return new Date(prof.dob).toISOString().split("T")[0]; } catch { return ""; } })() : "";
  } else {
    const p = await db.collection("studentprofile").findOne({ id: Number(id) });
    if (!p) notFound();
    const u = p.users_id ? await db.collection("users").findOne({ id: Number(p.users_id) }) : null;
    name = (u?.firstname || "").trim() || "Unknown";
    email = (u?.email || "").trim() || "-";
    phone = (u?.phone || "").trim() || "";
    createdAt = p.created_at ? new Date((p.created_at || "").trim()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
    prof = { gender: (p.gender || "").trim(), dob: (p.dateofbirth || "").trim(), parentsname: (p.parentsname || "").trim(), parentsnumber: (p.parentsnumber || "").trim(), hobbies: (p.hobbies || "").trim(), interest: (p.interests || "").trim(), city: "", state: "" };
    formattedDob = prof.dob ? (() => { try { return new Date(prof.dob).toISOString().split("T")[0]; } catch { return ""; } })() : "";
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateProfile} className="w-full">
        <input type="hidden" name="student_id" value={id} />

        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/students/profile" className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-500">
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800">Edit Student Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{name}</p>
          </div>
          <button type="submit" className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-6">
            <Card>
              <SectionHeading icon="person" title="Basic Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Full Name</label><input name="name" defaultValue={name} className={inputCls} /></div>
                <div><label className={labelCls}>Phone</label><input name="phone" defaultValue={phone} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <div className="relative">
                    <select name="gender" defaultValue={prof.gender || ""} className={selectCls}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div><label className={labelCls}>Date of Birth</label><input type="date" name="dob" defaultValue={formattedDob} className={inputCls} /></div>
                <div><label className={labelCls}>City</label><input name="city" defaultValue={prof.city || ""} className={inputCls} /></div>
                <div><label className={labelCls}>State</label><input name="state" defaultValue={prof.state || ""} className={inputCls} /></div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="call" title="Parent Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Parent Name</label><input name="parentsname" defaultValue={prof.parentsname || ""} className={inputCls} /></div>
                <div><label className={labelCls}>Parent Number</label><input name="parentsnumber" defaultValue={prof.parentsnumber || ""} className={inputCls} /></div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="interests" title="Interests & Hobbies" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Hobbies</label><input name="hobbies" defaultValue={prof.hobbies || ""} className={inputCls} /></div>
                <div><label className={labelCls}>Interests</label><input name="interests" defaultValue={prof.interest || ""} className={inputCls} /></div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Student</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                    <p className={`text-sm font-semibold mt-1 ${isActive ? "text-green-600" : "text-amber-500"}`}>{isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Joined</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{createdAt}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">ID</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono break-all">{id}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
