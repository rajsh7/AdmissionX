import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function getStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload) return null;
  return payload;
}

// GET — student's own tickets
export async function GET(req: NextRequest) {
  const student = await getStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const tickets = await db.collection("college_helpdesk")
    .find({ student_email: student.email })
    .sort({ created_at: -1 })
    .toArray();

  const result = tickets.map((t: any) => ({
    id:           String(t._id),
    subject:      String(t.subject ?? ""),
    message:      String(t.message ?? ""),
    priority:     String(t.priority ?? "medium"),
    status:       String(t.status ?? "open"),
    category:     String(t.category ?? "General"),
    college_name: String(t.college_name ?? ""),
    college_slug: String(t.college_slug ?? ""),
    reply:        t.reply ? String(t.reply) : null,
    replied_at:   t.replied_at
      ? new Date(t.replied_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
    created_at:   t.created_at
      ? new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
  }));

  return NextResponse.json({ tickets: result });
}

// POST — student raises a new ticket
export async function POST(req: NextRequest) {
  const student = await getStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { subject, message, priority, category, college_slug } = body as {
    subject?: string;
    message?: string;
    priority?: string;
    category?: string;
    college_slug?: string;
  };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const db = await getDb();

  // Resolve college info from slug if provided
  let collegeprofile_id: unknown = null;
  let college_name = "";
  if (college_slug?.trim()) {
    const cp = await db.collection("collegeprofile").findOne(
      { slug: college_slug.trim() },
      { projection: { _id: 1, id: 1, users_id: 1 } }
    );
    if (cp) {
      collegeprofile_id = cp.id ? Number(cp.id) : cp._id;
      // Get college name from user
      const u = await db.collection("users").findOne(
        { $or: [{ _id: cp.users_id }, { id: cp.users_id }] },
        { projection: { firstname: 1 } }
      );
      college_name = String(u?.firstname ?? college_slug).trim();
    }
  }

  await db.collection("college_helpdesk").insertOne({
    collegeprofile_id,
    college_slug:   college_slug?.trim() ?? "",
    college_name,
    student_name:   String(student.name ?? student.email ?? "Student"),
    student_email:  String(student.email ?? ""),
    subject:        subject.trim(),
    message:        message.trim(),
    priority:       priority ?? "medium",
    category:       category ?? "General",
    status:         "open",
    reply:          null,
    replied_at:     null,
    created_at:     new Date(),
    updated_at:     new Date(),
  });

  return NextResponse.json({ success: true });
}
