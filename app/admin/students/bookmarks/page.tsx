import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import BookmarkClient from "./BookmarkClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

async function deleteBookmark(id: string) {
  "use server";
  const { getDb: db } = await import("@/lib/db");
  try {
    const d = await db();
    await d.collection("bookmarks").deleteOne({ id: parseInt(id) });
  } catch (e) {
    console.error("[admin/students/bookmarks delete]", e);
  }
  revalidatePath("/admin/students/bookmarks");
}

export default async function StudentBookmarksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const typeFilter = sp.type ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Resolve type filter
  let typeId: number | null = null;
  if (typeFilter) {
    const t = await db.collection("bookmarktypeinfos").findOne({ name: { $regex: typeFilter, $options: "i" } });
    typeId = t?.id ?? null;
  }

  const filter: Record<string, unknown> = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (typeId) filter.bookmarktypeinfo_id = typeId;

  const [total, bookmarkDocs, typeDocs] = await Promise.all([
    db.collection("bookmarks").countDocuments(filter),
    db.collection("bookmarks")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection("bookmarktypeinfos").find({}).toArray(),
  ]);

  // Resolve student names from users collection
  const studentIds = [...new Set(bookmarkDocs.map((b) => b.student_id).filter(Boolean))];
  const userDocs = studentIds.length
    ? await db.collection("users").find({ id: { $in: studentIds } }, { projection: { id: 1, firstname: 1, email: 1 } }).toArray()
    : [];
  const userMap: Record<number, { name: string; email: string }> = {};
  for (const u of userDocs) userMap[u.id] = { name: u.firstname ?? "—", email: u.email ?? "—" };

  const typeMap: Record<number, string> = {};
  for (const t of typeDocs) typeMap[t.id] = (t.name ?? "").trim();

  const rows = bookmarkDocs.map((b) => ({
    id: String(b.id ?? b._id),
    student_id: b.student_id,
    student_name: userMap[b.student_id]?.name ?? "—",
    student_email: userMap[b.student_id]?.email ?? "—",
    title: (b.title ?? "").trim(),
    url: (b.url ?? "").trim(),
    type: typeMap[b.bookmarktypeinfo_id] ?? "—",
    college_id: b.college_id ?? 0,
    course_id: b.course_id ?? 0,
    blog_id: b.blog_id ?? 0,
    created_at: b.created_at ? String(b.created_at).trim() : null,
  }));

  const types = typeDocs.map((t) => ({ id: t.id, name: (t.name ?? "").trim() }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <BookmarkClient
      bookmarks={rows}
      types={types}
      total={total}
      page={page}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      q={q}
      typeFilter={typeFilter}
      deleteBookmark={deleteBookmark}
    />
  );
}
