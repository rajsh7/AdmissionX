import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

// GET /api/student/[id]/queries
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const rows = await db.collection("student_queries")
    .find({ student_id: id })
    .sort({ created_at: -1 })
    .toArray();

  const queries = rows.map((r) => ({
    id: r._id.toString(),
    college_slug: r.college_slug ?? "",
    college_name: r.college_name ?? "",
    subject: r.subject ?? "",
    message: r.message ?? "",
    status: r.status ?? "pending",
    response: r.response ?? null,
    responded_at: r.responded_at ?? null,
    created_at: r.created_at
      ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
  }));

  return NextResponse.json({ queries });
}

// POST /api/student/[id]/queries
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { college_slug?: string; college_name?: string; subject?: string; message?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { college_slug, college_name, subject, message } = body;
  if (!college_slug || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "college_slug, subject, and message are required." }, { status: 400 });
  }

  const db = await getDb();

  // Resolve college name if not provided
  let resolvedCollegeName = college_name?.trim() || "";
  if (!resolvedCollegeName) {
    const cp = await db.collection("collegeprofile").findOne(
      { slug: college_slug },
      { projection: { college_name: 1 } }
    );
    resolvedCollegeName = cp?.college_name ?? college_slug;
  }

  const result = await db.collection("student_queries").insertOne({
    student_id: id,
    student_name: payload.name,
    student_email: payload.email,
    college_slug,
    college_name: resolvedCollegeName,
    subject: subject.trim(),
    message: message.trim(),
    status: "pending",
    response: null,
    responded_at: null,
    created_at: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: "Query sent successfully.",
    query_id: result.insertedId.toString(),
  }, { status: 201 });
}
