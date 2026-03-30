import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  return await verifyStudentToken(token);
}

function generateRef(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ADX-${year}${month}${rand}`;
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = payload.id;

  let body: {
    collegeprofile_id?: unknown;
    collegemaster_id?: unknown;
    college_name?: string;
    course_name?: string;
    degree_name?: string;
    stream_name?: string;
    fees?: number;
    notes?: string;
    documents?: { type: string; url: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { collegeprofile_id, collegemaster_id, college_name, course_name, degree_name, stream_name, fees, notes, documents } = body;

  const REQUIRED_DOC_TYPES = ["10th Marksheet", "12th Marksheet", "ID Proof"];
  if (!documents || !Array.isArray(documents)) {
    return NextResponse.json({ error: "documents field is required and must be an array." }, { status: 400 });
  }
  const missingDocs = REQUIRED_DOC_TYPES.filter((t) => !documents.map((d) => d.type).includes(t));
  if (missingDocs.length > 0) {
    return NextResponse.json({ error: `Missing required documents: ${missingDocs.join(", ")}` }, { status: 400 });
  }
  if (!collegeprofile_id) {
    return NextResponse.json({ error: "collegeprofile_id is required." }, { status: 400 });
  }

  const db = await getDb();

  // Guard: one active application per college per student
  const existing = await db.collection("applications").findOne({
    studentId,
    collegeId: collegeprofile_id,
    status: { $ne: "rejected" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have an active application for this college.", application_ref: existing.applicationRef },
      { status: 409 }
    );
  }

  // Enrich college name
  let resolvedCollegeName = college_name?.trim() || null;
  if (!resolvedCollegeName) {
    const cp = await db.collection("collegeprofile").aggregate([
      { $match: { _id: collegeprofile_id } },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $project: { cname: { $ifNull: [{ $trim: { input: "$u.firstname" } }, "$slug"] } } },
      { $limit: 1 },
    ]).toArray();
    if (cp.length) resolvedCollegeName = cp[0].cname;
  }

  let resolvedCourseName = course_name?.trim() || null;
  let resolvedDegreeName = degree_name?.trim() || null;
  let resolvedStreamName = stream_name?.trim() || null;
  let resolvedFees = typeof fees === "number" ? fees : 0;

  if (collegemaster_id && (!resolvedCourseName || !resolvedDegreeName)) {
    const cm = await db.collection("collegemaster").aggregate([
      { $match: { _id: collegemaster_id } },
      { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "co" } },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$co", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      { $project: { course_name: "$co.name", degree_name: "$d.name", stream_name: "$fa.name", fees: 1 } },
      { $limit: 1 },
    ]).toArray();
    if (cm.length) {
      resolvedCourseName = resolvedCourseName || cm[0].course_name || null;
      resolvedDegreeName = resolvedDegreeName || cm[0].degree_name || null;
      resolvedStreamName = resolvedStreamName || cm[0].stream_name || null;
      if (!fees && cm[0].fees) resolvedFees = Number(cm[0].fees);
    }
  }

  // Generate unique ref
  let applicationRef = generateRef();
  for (let i = 0; i < 5; i++) {
    const check = await db.collection("applications").findOne({ applicationRef });
    if (!check) break;
    applicationRef = generateRef();
  }

  const result = await db.collection("applications").insertOne({
    applicationRef,
    studentId,
    collegeId: collegeprofile_id,
    courseId: collegemaster_id ?? null,
    status: "submitted",
    createdAt: new Date(),
  });

  if (documents.length > 0) {
    await db.collection("documents").insertMany(
      documents.map((d) => ({ applicationId: result.insertedId, type: d.type, fileUrl: d.url }))
    );
  }

  return NextResponse.json({
    success: true,
    message: "Application submitted successfully.",
    application: {
      id: result.insertedId,
      application_ref: applicationRef,
      student_id: studentId,
      college_name: resolvedCollegeName,
      course_name: resolvedCourseName,
      degree_name: resolvedDegreeName,
      stream_name: resolvedStreamName,
      fees: resolvedFees,
      status: "submitted",
      payment_status: "pending",
    },
  }, { status: 201 });
}
