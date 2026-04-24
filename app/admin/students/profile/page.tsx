import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import StudentProfileClient from "./StudentProfileClient";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;
const FETCH_SIZE = 100; // fetch 100 so Show More works 3 times client-side

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const studentName = (sp.studentName ?? "").trim();
  const email = (sp.email ?? "").trim();
  const gender = (sp.gender ?? "").trim();
  const phoneNumber = (sp.phoneNumber ?? "").trim();
  const parentsName = (sp.parentsname ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * FETCH_SIZE;

  const db = await getDb();

  // Build filter on studentprofile
  const filter: Record<string, unknown> = {};
  if (gender) filter.gender = { $regex: gender, $options: "i" };
  if (phoneNumber) filter.parentsnumber = { $regex: phoneNumber, $options: "i" };
  if (parentsName) filter.parentsname = { $regex: parentsName, $options: "i" };

  // Fetch from old studentprofile collection
  const [profileRows, totalCount] = await Promise.all([
    db.collection("studentprofile")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(FETCH_SIZE)
      .toArray(),
    db.collection("studentprofile").countDocuments(filter),
  ]);

  // Get user ids to look up names/emails
  const userIds = profileRows.map((p: any) => Number(p.users_id)).filter(Boolean);
  const userRows = userIds.length > 0
    ? await db.collection("users").find({ id: { $in: userIds } }, { projection: { id: 1, firstname: 1, email: 1, phone: 1 } }).toArray()
    : [];
  const userMap = new Map(userRows.map((u: any) => [Number(u.id), u]));

  // Also check next_student_signups for newer students
  const newSignupFilter: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];
  if (studentName) andConditions.push({ $or: [
    { name: { $regex: studentName, $options: "i" } },
    { email: { $regex: studentName, $options: "i" } },
  ]});
  if (email) andConditions.push({ email: { $regex: email, $options: "i" } });
  if (phoneNumber) andConditions.push({ phone: { $regex: phoneNumber, $options: "i" } });
  if (andConditions.length > 0) newSignupFilter.$and = andConditions;

  const newStudents = await db.collection("next_student_signups")
    .find(newSignupFilter)
    .sort({ created_at: -1 })
    .limit(FETCH_SIZE)
    .project({ _id: 1, name: 1, email: 1, phone: 1, created_at: 1, is_active: 1 })
    .toArray();

  const newStudentIds = newStudents.map((s: any) => s._id.toString());
  const newProfileRows = newStudentIds.length > 0
    ? await db.collection("next_student_profiles").find({ student_id: { $in: newStudentIds } }).toArray()
    : [];
  const newProfileMap = new Map(newProfileRows.map((p: any) => [p.student_id, p]));

  // Build merged profiles — new students first, then old
  const newProfiles = newStudents.map((s: any) => {
    const prof = newProfileMap.get(s._id.toString()) ?? {};
    return {
      id: s._id.toString(),
      users_id: s._id.toString(),
      student_name: s.name || "Unknown",
      student_email: s.email || "-",
      phone: s.phone || "",
      gender: (prof as any).gender || "",
      dateofbirth: (prof as any).dob || "",
      parentsname: (prof as any).parentsname || "",
      parentsnumber: (prof as any).parentsnumber || "",
      hobbies: (prof as any).hobbies || "",
      interests: (prof as any).interest || "",
      projects: "",
      is_active: s.is_active ? 1 : 0,
      created_at: s.created_at ? new Date(s.created_at).toISOString() : "",
    };
  });

  // Filter old profiles by name/email if search provided
  let filteredOldRows = profileRows;
  if (studentName || email || phoneNumber) {
    filteredOldRows = profileRows.filter((p: any) => {
      const u = userMap.get(Number(p.users_id));
      const nameMatch = !studentName || (u?.firstname || "").toLowerCase().includes(studentName.toLowerCase());
      const emailMatch = !email || (u?.email || "").toLowerCase().includes(email.toLowerCase());
      const phoneMatch = !phoneNumber || (u?.phone || "").toLowerCase().includes(phoneNumber.toLowerCase());
      return nameMatch && emailMatch && phoneMatch;
    });
  }

  const oldProfiles = filteredOldRows.map((p: any) => {
    const u = userMap.get(Number(p.users_id));
    return {
      id: String(p.id || p._id),
      users_id: String(p.users_id),
      student_name: u?.firstname?.trim() || "Unknown",
      student_email: u?.email?.trim() || "-",
      phone: u?.phone?.trim() || "",
      gender: (p.gender || "").trim(),
      dateofbirth: (p.dateofbirth || "").trim(),
      parentsname: (p.parentsname || "").trim(),
      parentsnumber: (p.parentsnumber || "").trim(),
      hobbies: (p.hobbies || "").trim(),
      interests: (p.interests || "").trim(),
      projects: (p.projects || "").trim(),
      is_active: 1,
      created_at: String((p.created_at || "").trim()),
    };
  });

  const profiles = [...newProfiles, ...oldProfiles].map(p => ({
    id: String(p.id),
    users_id: String(p.users_id),
    student_name: String(p.student_name || "Unknown"),
    student_email: String(p.student_email || "-"),
    phone: String(p.phone || ""),
    gender: String(p.gender || ""),
    dateofbirth: String(p.dateofbirth || ""),
    parentsname: String(p.parentsname || ""),
    parentsnumber: String(p.parentsnumber || ""),
    hobbies: String(p.hobbies || ""),
    interests: String(p.interests || ""),
    projects: String(p.projects || ""),
    is_active: Number(p.is_active || 0),
    created_at: String(p.created_at || ""),
  }));
  const total = newStudents.length + totalCount;
  const totalPages = Math.max(1, Math.ceil(total / FETCH_SIZE));

  const users = newStudents.map((s: any) => ({
    id: String(s._id),
    name: String(s.name || "Unknown"),
    email: String(s.email || ""),
  }));

  async function createProfile(formData: FormData) { "use server"; }
  async function deleteProfile(id: number) { "use server"; }

  return (
    <div className="p-6 space-y-6 w-full">
      <StudentProfileClient
        profiles={JSON.parse(JSON.stringify(profiles))}
        users={JSON.parse(JSON.stringify(users))}
        total={total}
        page={page}
        totalPages={totalPages}
        selectedStudentName={studentName}
        selectedEmail={email}
        selectedPhoneNumber={phoneNumber}
        selectedGender={gender}
        selectedParentsName={parentsName}
        createProfile={createProfile}
        deleteProfile={deleteProfile}
      />
    </div>
  );
}
