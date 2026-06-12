import pool, { getDb } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

interface BookmarkRow {
  id: number;
  student_id: number | string;
  college_id: number;
  course_id: number;
  blog_id: number;
  student_name: string | null;
  student_email: string | null;
  title: string | null;
  url: string | null;
  bookmarktypeinfo_id: string;
  type_name: string | null;
  created_at: string | null;
}

interface UserRow {
  id: number | string;
  name: string;
  email: string;
}

interface TypeRow {
  id: number;
  name: string;
}

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students/bookmarks/[id] safeQuery]", err);
    return [];
  }
}

async function updateBookmark(formData: FormData) {
  "use server";

  const id = parseInt(formData.get("id") as string, 10);
  const rawId = formData.get("student_id") as string;
  const student_id = isNaN(Number(rawId)) ? rawId : parseInt(rawId, 10);
  const bookmarktypeinfo_id = String(formData.get("bookmarktypeinfo_id") ?? "");
  const title = String(formData.get("title") ?? "");
  const url = String(formData.get("url") ?? "");
  const college_id = parseInt(formData.get("college_id") as string, 10) || 0;
  const course_id = parseInt(formData.get("course_id") as string, 10) || 0;
  const blog_id = parseInt(formData.get("blog_id") as string, 10) || 0;

  if (isNaN(id) || !student_id || !bookmarktypeinfo_id || !title || !url) return;

  try {
    await pool.query(
      `UPDATE bookmarks SET
        student_id = ?, college_id = ?, course_id = ?, blog_id = ?, url = ?,
        bookmarktypeinfo_id = ?, title = ?, updated_at = NOW()
       WHERE id = ?`,
      [student_id, college_id, course_id, blog_id, url, bookmarktypeinfo_id, title, id],
    );
  } catch (e) {
    console.error("[admin/students/bookmarks/[id] updateBookmark]", e);
  }

  revalidatePath("/admin/students/bookmarks");
  revalidatePath("/student/dashboard/bookmarks");
  redirect("/admin/students/bookmarks");
}

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const selectCls = `${inputCls} appearance-none pr-10`;

const labelCls =
  "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#008080] rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[18px] text-[#008080]"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
      >
        {icon}
      </span>
      <h2 className="text-sm font-black text-slate-700">{title}</h2>
    </div>
  );
}

export default async function EditBookmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const db = await getDb();
  // Fetch bookmark
  const rawBookmarks = await db.collection("bookmarks").find({ id: idNum }).limit(1).toArray();
  const rawBookmark = rawBookmarks[0];
  if (!rawBookmark) notFound();

  // Fetch student info for this bookmark
  const studentIdVal = rawBookmark.student_id;
  let studentName = "Unknown";
  let studentEmail = "-";

  if (studentIdVal) {
    const isNumeric = !isNaN(Number(studentIdVal));
    if (isNumeric) {
      const u = await db.collection("users").findOne({ id: Number(studentIdVal) });
      if (u) {
        studentName = u.firstname || "Unknown";
        studentEmail = u.email || "-";
      }
    } else {
      const s = await db.collection("next_student_signups").findOne({ _id: ObjectId.isValid(String(studentIdVal)) ? new ObjectId(String(studentIdVal)) : String(studentIdVal) as any });
      if (s) {
        studentName = s.name || "Unknown";
        studentEmail = s.email || "-";
      }
    }
  }

  const bookmark = {
    id: Number(rawBookmark.id),
    student_id: rawBookmark.student_id,
    college_id: Number(rawBookmark.college_id ?? 0),
    course_id: Number(rawBookmark.course_id ?? 0),
    blog_id: Number(rawBookmark.blog_id ?? 0),
    title: String(rawBookmark.title ?? ""),
    url: String(rawBookmark.url ?? ""),
    bookmarktypeinfo_id: String(rawBookmark.bookmarktypeinfo_id ?? ""),
    created_at: rawBookmark.created_at instanceof Date ? rawBookmark.created_at.toISOString() : String(rawBookmark.created_at ?? ""),
    student_name: studentName,
    student_email: studentEmail,
    type_name: "",
  };

  // Fetch dropdown lists: users and next_student_signups
  const [oldUserRows, nextStudentRows, types] = await Promise.all([
    db.collection("users").find({}, { projection: { id: 1, firstname: 1, email: 1 } }).sort({ firstname: 1 }).limit(1000).toArray(),
    db.collection("next_student_signups").find({}, { projection: { _id: 1, name: 1, email: 1 } }).sort({ name: 1 }).limit(1000).toArray(),
    db.collection("bookmarktypeinfos").find({}).sort({ name: 1 }).toArray(),
  ]);

  const usersList = [
    ...oldUserRows.map((u: any) => ({ id: String(u.id), name: (u.firstname || "").trim(), email: (u.email || "").trim() })),
    ...nextStudentRows.map((s: any) => ({ id: String(s._id), name: (s.name || "").trim(), email: (s.email || "").trim() }))
  ];

  const typesList = types.map((t: any) => ({
    id: Number(t.id),
    name: String(t.name ?? "")
  }));

  const currentType = typesList.find((t) => String(t.id) === String(bookmark.bookmarktypeinfo_id));
  bookmark.type_name = currentType?.name || "";

  const createdAt = bookmark.created_at
    ? new Date(bookmark.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  const currentUserMissing = usersList && !usersList.find((u) => String(u.id) === String(bookmark.student_id));
  const currentTypeMissing = typesList && !typesList.find((t) => String(t.id) === String(bookmark.bookmarktypeinfo_id));

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateBookmark} className="w-full">
        <input type="hidden" name="id" value={bookmark.id} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/students/bookmarks"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-700 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              chevron_left
            </span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              Edit Bookmark
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {bookmark.title || "Bookmark"}
            </p>
          </div>

          <button
            type="submit"
            className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[17px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
            >
              save
            </span>
            Save Changes
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <SectionHeading icon="bookmark" title="Bookmark Details" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Linked Student</label>
                    <div className="relative">
                      <select
                        name="student_id"
                        defaultValue={bookmark.student_id}
                        className={selectCls}
                        required
                      >
                        <option value="">Select a student</option>
                        {usersList.map((u, idx) => (
                          <option key={`${u.id}-${u.email}-${idx}`} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                        {currentUserMissing && (
                          <option value={bookmark.student_id}>
                            {bookmark.student_name} ({bookmark.student_email})
                          </option>
                        )}
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Bookmark Type</label>
                    <div className="relative">
                      <select
                        name="bookmarktypeinfo_id"
                        defaultValue={bookmark.bookmarktypeinfo_id}
                        className={selectCls}
                        required
                      >
                        <option value="">Select type</option>
                        {typesList.map((t, idx) => (
                          <option key={`${t.id}-${t.name}-${idx}`} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                        {currentTypeMissing && (
                          <option value={bookmark.bookmarktypeinfo_id}>
                            {bookmark.type_name || "Current Type"}
                          </option>
                        )}
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-2.5 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    name="title"
                    defaultValue={bookmark.title ?? ""}
                    placeholder="e.g. Indian Institute of Technology Bombay"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>URL / Link</label>
                  <input
                    type="url"
                    name="url"
                    defaultValue={bookmark.url ?? ""}
                    placeholder="https://..."
                    className={inputCls}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading icon="link" title="Context IDs" />
              <p className="text-xs text-slate-400 -mt-2 mb-3">
                Optional. Leave blank if not applicable.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>College ID</label>
                  <input
                    type="number"
                    name="college_id"
                    defaultValue={bookmark.college_id || ""}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Course ID</label>
                  <input
                    type="number"
                    name="course_id"
                    defaultValue={bookmark.course_id || ""}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Blog ID</label>
                  <input
                    type="number"
                    name="blog_id"
                    defaultValue={bookmark.blog_id || ""}
                    className={inputCls}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="w-full space-y-6">
            <Card>
              <SectionHeading icon="tune" title="Bookmark Summary" />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {bookmark.student_name || "Unknown"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {bookmark.student_email || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {bookmark.type_name || "-"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      #{bookmark.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {createdAt}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Link</p>
                  <p className="text-[12px] text-slate-600 mt-1 truncate">
                    {bookmark.url || "-"}
                  </p>
                </div>
                {bookmark.url ? (
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open Link
                  </a>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-100 text-slate-300 text-sm font-bold">
                    <span className="material-symbols-outlined text-[16px]">link_off</span>
                    No Link
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
