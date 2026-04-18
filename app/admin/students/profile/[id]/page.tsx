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

  const name   = String(formData.get("name")   ?? "").trim();
  const phone  = String(formData.get("phone")  ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dob    = String(formData.get("dob")    ?? "");
  const about  = String(formData.get("about")  ?? "");
  const hobbies   = String(formData.get("hobbies")   ?? "");
  const interests = String(formData.get("interests") ?? "");
  const city    = String(formData.get("city")    ?? "");
  const state   = String(formData.get("state")   ?? "");
  const country = String(formData.get("country") ?? "");
  const pincode = String(formData.get("pincode") ?? "");
  const address = String(formData.get("address") ?? "");
  const parentsname   = String(formData.get("parentsname")   ?? "");
  const parentsnumber = String(formData.get("parentsnumber") ?? "");

  // Academic marks
  const MARKS_FIELDS = [
    "class10_board","class10_school","class10_year","class10_percent","class10_total","class10_obtained",
    "class12_board","class12_school","class12_year","class12_percent","class12_total","class12_obtained","class12_stream",
    "grad_university","grad_college","grad_program","grad_year","grad_percent","grad_cgpa",
  ];
  const marksUpdate: Record<string, unknown> = { updated_at: new Date() };
  for (const key of MARKS_FIELDS) {
    const val = String(formData.get(key) ?? "").trim();
    marksUpdate[key] = val || null;
  }

  try {
    if (isObjectId) {
      const baseSet: Record<string, unknown> = { updated_at: new Date() };
      if (name)  baseSet.name  = name;
      if (phone !== undefined) baseSet.phone = phone;
      await db.collection("next_student_signups").updateOne(
        { _id: new ObjectId(studentId) },
        { $set: baseSet }
      );
      await db.collection("next_student_profiles").updateOne(
        { student_id: studentId },
        {
          $set: {
            student_id: studentId,
            gender, dob, about, hobbies, interest: interests,
            city, state, country, pincode, address,
            parentsname, parentsnumber,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
      // Save marks
      marksUpdate.student_id = studentId;
      await db.collection("next_student_marks").updateOne(
        { student_id: studentId },
        { $set: marksUpdate, $setOnInsert: { created_at: new Date() } },
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

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const inputCls  = "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700";
const selectCls = `${inputCls} appearance-none pr-10`;
const labelCls  = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";
const textareaCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all placeholder:text-slate-300 text-slate-700 resize-none";

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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function EditStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isObjectId = /^[a-f\d]{24}$/i.test(id);
  const isNumeric  = /^\d+$/.test(id);
  if (!isObjectId && !isNumeric) notFound();

  const db = await getDb();

  let name = "Unknown", email = "-", phone = "", createdAt = "-", isActive = 1;
  let prof: Record<string, any> = {};
  let marks: Record<string, any> = {};
  let docs: Record<string, any>[] = [];
  let formattedDob = "";

  if (isObjectId) {
    const student = await db.collection("next_student_signups").findOne({ _id: new ObjectId(id) });
    if (!student) notFound();
    name     = student.name  || "Unknown";
    email    = student.email || "-";
    phone    = student.phone || "";
    isActive = student.is_active ?? 0;
    createdAt = student.created_at
      ? new Date(student.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    prof  = await db.collection("next_student_profiles").findOne({ student_id: id }) ?? {};
    marks = await db.collection("next_student_marks").findOne({ student_id: id })   ?? {};
    docs  = await db.collection("next_student_documents").find({ student_id: id }).sort({ created_at: -1 }).toArray();
    formattedDob = prof.dob ? (() => { try { return new Date(prof.dob).toISOString().split("T")[0]; } catch { return ""; } })() : "";
  } else {
    const p = await db.collection("studentprofile").findOne({ id: Number(id) });
    if (!p) notFound();
    const u = p.users_id ? await db.collection("users").findOne({ id: Number(p.users_id) }) : null;
    name     = (u?.firstname || "").trim() || "Unknown";
    email    = (u?.email    || "").trim() || "-";
    phone    = (u?.phone    || "").trim() || "";
    createdAt = p.created_at
      ? new Date(String(p.created_at).trim()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    prof = {
      gender: (p.gender || "").trim(), dob: (p.dateofbirth || "").trim(),
      parentsname: (p.parentsname || "").trim(), parentsnumber: (p.parentsnumber || "").trim(),
      hobbies: (p.hobbies || "").trim(), interest: (p.interests || "").trim(),
      city: "", state: "", country: "", pincode: "", address: "", about: "",
    };
    formattedDob = prof.dob ? (() => { try { return new Date(prof.dob).toISOString().split("T")[0]; } catch { return ""; } })() : "";
  }

  const MARKS_FIELDS = [
    "class10_board","class10_school","class10_year","class10_percent","class10_total","class10_obtained",
    "class12_board","class12_school","class12_year","class12_percent","class12_total","class12_obtained","class12_stream",
    "grad_university","grad_college","grad_program","grad_year","grad_percent","grad_cgpa",
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateProfile} className="w-full">
        <input type="hidden" name="student_id" value={id} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/students/profile" className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-500">
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800">Edit Student Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{name} · {email}</p>
          </div>
          <button type="submit" className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Left column */}
          <div className="space-y-6">

            {/* Basic Details */}
            <Card>
              <SectionHeading icon="person" title="Basic Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"><input name="name" defaultValue={name} className={inputCls} /></Field>
                <Field label="Phone"><input name="phone" defaultValue={phone} className={inputCls} /></Field>
                <Field label="Gender">
                  <div className="relative">
                    <select name="gender" defaultValue={prof.gender || ""} className={selectCls}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">expand_more</span>
                  </div>
                </Field>
                <Field label="Date of Birth"><input type="date" name="dob" defaultValue={formattedDob} className={inputCls} /></Field>
              </div>
              <div className="mt-4">
                <Field label="About">
                  <textarea name="about" defaultValue={prof.about || ""} rows={3} placeholder="Student bio / about..." className={textareaCls} />
                </Field>
              </div>
            </Card>

            {/* Address */}
            <Card>
              <SectionHeading icon="location_on" title="Address" />
              <div className="mb-4">
                <Field label="Street Address">
                  <textarea name="address" defaultValue={prof.address || ""} rows={2} placeholder="House No., Building, Street..." className={textareaCls} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City"><input name="city" defaultValue={prof.city || ""} className={inputCls} /></Field>
                <Field label="Pincode"><input name="pincode" defaultValue={prof.pincode || ""} className={inputCls} /></Field>
                <Field label="State"><input name="state" defaultValue={prof.state || ""} className={inputCls} /></Field>
                <Field label="Country"><input name="country" defaultValue={prof.country || "India"} className={inputCls} /></Field>
              </div>
            </Card>

            {/* Interests & Hobbies */}
            <Card>
              <SectionHeading icon="interests" title="Interests & Hobbies" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Hobbies"><input name="hobbies" defaultValue={prof.hobbies || ""} className={inputCls} /></Field>
                <Field label="Interests"><input name="interests" defaultValue={prof.interest || ""} className={inputCls} /></Field>
              </div>
            </Card>

            {/* Parent Details */}
            <Card>
              <SectionHeading icon="call" title="Parent Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Parent Name"><input name="parentsname" defaultValue={prof.parentsname || ""} className={inputCls} /></Field>
                <Field label="Parent Number"><input name="parentsnumber" defaultValue={prof.parentsnumber || ""} className={inputCls} /></Field>
              </div>
            </Card>

            {/* Academic Marks — Class 10 */}
            <Card>
              <SectionHeading icon="school" title="Class 10 Marks" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Board"><input name="class10_board" defaultValue={marks.class10_board || ""} placeholder="e.g. CBSE" className={inputCls} /></Field>
                <Field label="School"><input name="class10_school" defaultValue={marks.class10_school || ""} className={inputCls} /></Field>
                <Field label="Year"><input name="class10_year" defaultValue={marks.class10_year || ""} placeholder="e.g. 2020" className={inputCls} /></Field>
                <Field label="Percentage %"><input name="class10_percent" defaultValue={marks.class10_percent || ""} placeholder="e.g. 85.5" className={inputCls} /></Field>
                <Field label="Total Marks"><input name="class10_total" defaultValue={marks.class10_total || ""} className={inputCls} /></Field>
                <Field label="Marks Obtained"><input name="class10_obtained" defaultValue={marks.class10_obtained || ""} className={inputCls} /></Field>
              </div>
            </Card>

            {/* Academic Marks — Class 12 */}
            <Card>
              <SectionHeading icon="school" title="Class 12 Marks" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Board"><input name="class12_board" defaultValue={marks.class12_board || ""} placeholder="e.g. CBSE" className={inputCls} /></Field>
                <Field label="School"><input name="class12_school" defaultValue={marks.class12_school || ""} className={inputCls} /></Field>
                <Field label="Year"><input name="class12_year" defaultValue={marks.class12_year || ""} placeholder="e.g. 2022" className={inputCls} /></Field>
                <Field label="Percentage %"><input name="class12_percent" defaultValue={marks.class12_percent || ""} placeholder="e.g. 90.0" className={inputCls} /></Field>
                <Field label="Total Marks"><input name="class12_total" defaultValue={marks.class12_total || ""} className={inputCls} /></Field>
                <Field label="Marks Obtained"><input name="class12_obtained" defaultValue={marks.class12_obtained || ""} className={inputCls} /></Field>
                <Field label="Stream"><input name="class12_stream" defaultValue={marks.class12_stream || ""} placeholder="e.g. Science" className={inputCls} /></Field>
              </div>
            </Card>

            {/* Academic Marks — Graduation */}
            <Card>
              <SectionHeading icon="workspace_premium" title="Graduation" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="University"><input name="grad_university" defaultValue={marks.grad_university || ""} className={inputCls} /></Field>
                <Field label="College"><input name="grad_college" defaultValue={marks.grad_college || ""} className={inputCls} /></Field>
                <Field label="Program"><input name="grad_program" defaultValue={marks.grad_program || ""} placeholder="e.g. B.Tech CSE" className={inputCls} /></Field>
                <Field label="Pass Year"><input name="grad_year" defaultValue={marks.grad_year || ""} className={inputCls} /></Field>
                <Field label="Percentage %"><input name="grad_percent" defaultValue={marks.grad_percent || ""} className={inputCls} /></Field>
                <Field label="CGPA"><input name="grad_cgpa" defaultValue={marks.grad_cgpa || ""} className={inputCls} /></Field>
              </div>
            </Card>

            {/* Uploaded Documents */}
            <Card>
              <SectionHeading icon="folder" title={`Uploaded Documents (${docs.length})`} />
              {docs.length === 0 ? (
                <p className="text-sm text-slate-400">No documents uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docs.map((doc) => {
                    const isImage = String(doc.file_type ?? "").startsWith("image/");
                    const cat = String(doc.category ?? "other");
                    const CATEGORY_LABELS: Record<string, string> = {
                      marksheet_10: "10th Marksheet", marksheet_12: "12th Marksheet",
                      marksheet_grad: "Graduation Marksheet", id_proof: "ID Proof",
                      photo: "Passport Photo", caste_cert: "Caste Certificate",
                      income_cert: "Income Certificate", migration: "Migration Certificate",
                      other: "Other Document",
                    };
                    const sizeKb = doc.file_size ? `${(Number(doc.file_size) / 1024).toFixed(1)} KB` : null;
                    const uploadedOn = doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : null;
                    return (
                      <div key={doc._id.toString()} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px] text-slate-400">
                            {isImage ? "image" : "description"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{doc.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{CATEGORY_LABELS[cat] ?? cat}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {sizeKb && <span className="text-[10px] text-slate-400">{sizeKb}</span>}
                            {uploadedOn && <span className="text-[10px] text-slate-400">{uploadedOn}</span>}
                          </div>
                        </div>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-8 h-8 rounded-lg bg-[#008080]/10 text-[#008080] flex items-center justify-center hover:bg-[#008080]/20 transition-colors"
                          title="View document"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right column — summary */}
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
                  <p className="text-xs font-bold text-slate-400 uppercase">Student ID</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono break-all">{id}</p>
                </div>
              </div>
            </Card>

            {/* Quick data preview */}
            <Card>
              <SectionHeading icon="preview" title="Current Data" />
              <div className="space-y-2 text-[12px]">
                {[
                  { label: "Gender",   value: prof.gender   || "-" },
                  { label: "DOB",      value: prof.dob      || "-" },
                  { label: "City",     value: prof.city     || "-" },
                  { label: "State",    value: prof.state    || "-" },
                  { label: "Hobbies",  value: prof.hobbies  || "-" },
                  { label: "Interest", value: prof.interest || "-" },
                  { label: "Class 10", value: marks.class10_percent ? `${marks.class10_percent}%` : "-" },
                  { label: "Class 12", value: marks.class12_percent ? `${marks.class12_percent}%` : "-" },
                  { label: "Grad",     value: marks.grad_percent ? `${marks.grad_percent}%` : marks.grad_cgpa ? `${marks.grad_cgpa} CGPA` : "-" },
                  { label: "Docs",     value: `${docs.length} file${docs.length !== 1 ? "s" : ""}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="font-bold text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
                    <span className="text-slate-600 text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
