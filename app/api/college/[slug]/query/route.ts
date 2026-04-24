import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, subject and message are required." },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const db = await getDb();

  // Verify college exists
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, slug: 1 } }
  );
  if (!cp) return NextResponse.json({ error: "College not found." }, { status: 404 });

  await db.collection("student_queries").insertOne({
    college_slug:   slug,
    student_name:   name.trim(),
    student_email:  email.trim().toLowerCase(),
    student_phone:  phone?.trim() || "",
    subject:        subject.trim(),
    message:        message.trim(),
    status:         "pending",
    response:       null,
    responded_at:   null,
    source:         "public_page",
    created_at:     new Date(),
    updated_at:     new Date(),
  });

  return NextResponse.json({ success: true, message: "Query submitted successfully!" });
}
