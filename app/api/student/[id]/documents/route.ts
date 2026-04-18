import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ObjectId } from "mongodb";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

const CATEGORY_LABELS: Record<string, string> = {
  marksheet_10:   "10th Marksheet",
  marksheet_12:   "12th Marksheet",
  marksheet_grad: "Graduation Marksheet",
  id_proof:       "ID Proof",
  photo:          "Passport Photo",
  caste_cert:     "Caste Certificate",
  income_cert:    "Income Certificate",
  migration:      "Migration Certificate",
  other:          "Other Document",
};

const ALLOWED_CATEGORIES = Object.keys(CATEGORY_LABELS);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME  = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categoryFilter = req.nextUrl.searchParams.get("category");
  const db = await getDb();

  const filter: Record<string, unknown> = { student_id: id };
  if (categoryFilter) filter.category = categoryFilter;

  const rows = await db.collection("next_student_documents")
    .find(filter)
    .sort({ created_at: -1 })
    .toArray();

  const documents = rows.map((row) => {
    const cat = String(row.category ?? "other");
    return {
      id:             row._id.toString(),
      name:           row.name,
      file_path:      row.file_path,
      file_type:      row.file_type,
      file_size:      row.file_size,
      file_size_kb:   row.file_size ? `${(Number(row.file_size) / 1024).toFixed(1)} KB` : null,
      category:       cat,
      category_label: CATEGORY_LABELS[cat] ?? "Document",
      is_image:       String(row.file_type ?? "").startsWith("image/"),
      created_at:     row.created_at,
      uploaded_on:    row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : null,
    };
  });

  const grouped: Record<string, typeof documents> = {};
  for (const cat of ALLOWED_CATEGORIES) {
    grouped[cat] = documents.filter((d) => d.category === cat);
  }

  return NextResponse.json({
    documents,
    grouped,
    counts: { total: documents.length },
    categories: CATEGORY_LABELS,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_MIME.includes(file.type))
    return NextResponse.json({ error: "File type not allowed. Accepted: PDF, JPEG, PNG, WebP." }, { status: 400 });

  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: "File size must not exceed 5 MB." }, { status: 400 });

  const category = String(formData.get("category") ?? "other").trim();
  if (!ALLOWED_CATEGORIES.includes(category))
    return NextResponse.json({ error: `Invalid category.` }, { status: 400 });

  const docName = String(formData.get("name") ?? "").trim() || CATEGORY_LABELS[category] || file.name;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "student", id);
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

  const ext       = path.extname(file.name).toLowerCase() || ".bin";
  const safeName  = `${category}_${Date.now()}${ext}`;
  const fullPath  = path.join(uploadDir, safeName);
  const publicUrl = `/uploads/student/${id}/${safeName}`;

  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  const db = await getDb();
  const result = await db.collection("next_student_documents").insertOne({
    student_id: id,
    name:       docName,
    file_path:  publicUrl,
    file_type:  file.type,
    file_size:  file.size,
    category,
    created_at: new Date(),
  });

  return NextResponse.json({
    success:  true,
    message:  "Document uploaded successfully.",
    document: {
      id:             result.insertedId.toString(),
      name:           docName,
      file_path:      publicUrl,
      file_type:      file.type,
      file_size:      file.size,
      file_size_kb:   `${(file.size / 1024).toFixed(1)} KB`,
      category,
      category_label: CATEGORY_LABELS[category],
      is_image:       file.type.startsWith("image/"),
    },
  }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId is required" }, { status: 400 });

  const db = await getDb();

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(docId), student_id: id };
  } catch {
    return NextResponse.json({ error: "Invalid docId" }, { status: 400 });
  }

  const doc = await db.collection("next_student_documents").findOne(filter);
  if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  await db.collection("next_student_documents").deleteOne(filter);

  try {
    await unlink(path.join(process.cwd(), "public", doc.file_path));
  } catch { /* file already gone */ }

  return NextResponse.json({ success: true });
}
