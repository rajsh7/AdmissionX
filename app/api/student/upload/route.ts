import { NextRequest, NextResponse } from "next/server";
import { verifyStudentToken, STUDENT_COOKIE } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  // Auth check
  const token = req.cookies.get(STUDENT_COOKIE)?.value;
  const student = token ? await verifyStudentToken(token) : null;
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Build a unique filename
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/documents/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] local save error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
