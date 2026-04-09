import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

const MARKS_FIELDS = [
  "class10_board", "class10_school", "class10_year", "class10_percent", "class10_total", "class10_obtained",
  "class11_board", "class11_school", "class11_year", "class11_percent",
  "class12_board", "class12_school", "class12_year", "class12_percent", "class12_total", "class12_obtained", "class12_stream",
  "grad_university", "grad_college", "grad_program", "grad_year", "grad_percent", "grad_cgpa",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const row = await db.collection("next_student_marks").findOne({ student_id: id }) ?? {};

  const marks: Record<string, string> = {};
  for (const key of MARKS_FIELDS) {
    const val = (row as Record<string, unknown>)[key];
    marks[key] = val === null || val === undefined ? "" : String(val);
  }

  const coreFields = ["class10_board", "class10_school", "class10_year", "class10_percent", "class12_board", "class12_school", "class12_year", "class12_percent"];
  const marksComplete = Math.round((coreFields.filter((k) => marks[k] !== "").length / coreFields.length) * 100);

  return NextResponse.json({ marks, marksComplete });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string | number | null>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const update: Record<string, unknown> = { student_id: id, updated_at: new Date() };
  for (const key of MARKS_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const raw = body[key];
      update[key] = raw === "" || raw === null || raw === undefined ? null : typeof raw === "number" ? raw : String(raw).trim() || null;
    }
  }

  if (Object.keys(update).length <= 2) return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });

  const db = await getDb();
  await db.collection("next_student_marks").updateOne(
    { student_id: id },
    { $set: update, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true, message: "Academic marks saved successfully." });
}
