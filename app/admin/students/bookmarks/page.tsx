import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/students/bookmarks safeQuery]", err);
    return [];
  }
}

interface BookmarkRow extends RowDataPacket {
  id: number;
  student_name: string;
  student_email: string;
  title: string;
  url: string;
  type_name: string;
  created_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export default async function StudentBookmarksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(s.name LIKE ? OR s.email LIKE ? OR b.title LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [bookmarks, countRows] = await Promise.all([
    safeQuery<BookmarkRow>(
      `SELECT b.*, s.name as student_name, s.email as student_email, bt.name as type_name
       FROM bookmarks b
       LEFT JOIN next_student_signups s ON b.student_id = s.id
       LEFT JOIN bookmarktypeinfos bt ON b.bookmarktypeinfo_id = bt.id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM bookmarks b
       LEFT JOIN next_student_signups s ON b.student_id = s.id
       ${where}`,
      params
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>
              bookmarks
            </span>
            Student Bookmarks
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            List of colleges, courses, and blogs bookmarked by students.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by student or bookmark title..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bookmark Title</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saved On</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookmarks.map((bookmark) => (
                <tr key={bookmark.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-slate-800">{bookmark.student_name || "Unknown Student"}</p>
                      <p className="text-xs text-slate-400">{bookmark.student_email || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-md">
                    <p className="text-slate-700 font-medium truncate" title={bookmark.title}>
                      {bookmark.title || "—"}
                    </p>
                    <a href={bookmark.url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1">
                      View Page
                      <span className="material-symbols-rounded text-[12px]">open_in_new</span>
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      bookmark.type_name === 'College' ? 'bg-blue-100 text-blue-600' :
                      bookmark.type_name === 'Courses' ? 'bg-orange-100 text-orange-600' :
                      bookmark.type_name === 'Blog' ? 'bg-purple-100 text-purple-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {bookmark.type_name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">
                    {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-red-600 hover:text-red-700 font-semibold text-xs">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> bookmarks
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`?page=${page - 1}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
