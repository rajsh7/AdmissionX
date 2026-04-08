import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import StudentProfileClient from "./StudentProfileClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

async function deleteStudent(id: string) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("next_student_signups").deleteOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error("[admin/students/profile delete]", e);
  }
  revalidatePath("/admin/students/profile");
}

async function toggleActive(id: string, current: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_active: current ? 0 : 1, updated_at: new Date() } }
    );
  } catch (e) {
    console.error("[admin/students/profile toggleActive]", e);
  }
  revalidatePath("/admin/students/profile");
}

async function updateStudent(id: string, data: {
  name: string; email: string; phone: string; dob: string; marks12: number | null;
}) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updated_at: new Date() } }
    );
  } catch (e) {
    console.error("[admin/students/profile update]", e);
  }
  revalidatePath("/admin/students/profile");
}

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }
  if (statusFilter === "active") filter.is_active = 1;
  if (statusFilter === "pending") filter.is_active = 0;

  const [total, students] = await Promise.all([
    db.collection("next_student_signups").countDocuments(filter),
    db.collection("next_student_signups")
      .find(filter, {
        projection: { _id: 1, name: 1, email: 1, phone: 1, dob: 1, marks12: 1, is_active: 1, created_at: 1 },
      })
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const rows = students.map((s) => ({
    id: s._id.toString(),
    name: s.name ?? "—",
    email: s.email ?? "—",
    phone: s.phone ?? "—",
    dob: s.dob ?? null,
    marks12: s.marks12 ?? null,
    is_active: s.is_active ?? 0,
    created_at: s.created_at ? new Date(s.created_at).toISOString() : null,
  }));

  return (
    <StudentProfileClient
      students={rows}
      total={total}
      page={page}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      q={q}
      statusFilter={statusFilter}
      deleteStudent={deleteStudent}
      toggleActive={toggleActive}
      updateStudent={updateStudent}
    />
  );
}
