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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const typeFilter = req.nextUrl.searchParams.get("type");
  const db = await getDb();

  const filter: Record<string, unknown> = { student_id: id };
  if (typeFilter) filter.type = typeFilter;

  const rows = await db.collection("next_student_bookmarks").find(filter).sort({ created_at: -1 }).toArray();

  const bookmarks = rows.map((row) => {
    const type = String(row.type ?? "college");
    return {
      id: row._id,
      type,
      item_id: row.item_id,
      title: row.title ?? "",
      image: row.image ?? "",
      url: row.url ?? (type === "college" ? `/college/${row.college_slug ?? ""}` : type === "blog" ? `/blog/${row.blog_slug ?? ""}` : ""),
      created_at: row.created_at,
    };
  });

  const counts = {
    total: bookmarks.length,
    college: bookmarks.filter((b) => b.type === "college").length,
    course: bookmarks.filter((b) => b.type === "course").length,
    blog: bookmarks.filter((b) => b.type === "blog").length,
  };

  return NextResponse.json({ bookmarks, counts });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { type?: string; item_id?: unknown; title?: string; url?: string; image?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { type, item_id, title, url, image } = body;
  if (!type || !item_id) return NextResponse.json({ error: "type and item_id are required" }, { status: 400 });
  if (!["college", "course", "blog"].includes(type)) return NextResponse.json({ error: "type must be one of: college, course, blog" }, { status: 400 });

  const db = await getDb();
  await db.collection("next_student_bookmarks").updateOne(
    { student_id: id, type, item_id },
    { $set: { student_id: id, type, item_id, title: title?.trim() || null, url: url?.trim() || null, image: image?.trim() || null }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true, message: "Bookmark saved" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarkId = req.nextUrl.searchParams.get("bookmarkId");
  if (!bookmarkId) return NextResponse.json({ error: "bookmarkId query param is required" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("next_student_bookmarks").deleteOne({ _id: bookmarkId as unknown, student_id: id } as object);

  if (!result.deletedCount) return NextResponse.json({ error: "Bookmark not found or does not belong to this student" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Bookmark removed" });
}
