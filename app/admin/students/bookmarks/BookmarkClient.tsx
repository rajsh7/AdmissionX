"use client";

import { useState } from "react";
import Link from "next/link";
import BookmarkFormModal from "./BookmarkFormModal";

interface BookmarkClientProps {
  bookmarks: any[];
  users: any[];
  types: any[];
  offset: number;
  PAGE_SIZE: number;
  total: number;
  totalPages: number;
  q: string;
  createBookmark: (data: FormData) => Promise<void>;
  updateBookmark: (data: FormData) => Promise<void>;
  deleteBookmark: (id: number) => Promise<void>;
}

export default function BookmarkClient({
  bookmarks,
  users,
  types,
  offset,
  PAGE_SIZE,
  total,
  totalPages,
  q,
  createBookmark,
  updateBookmark,
  deleteBookmark,
}: BookmarkClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<any | null>(null);

  function openAddModal() {
    setEditingBookmark(null);
    setIsModalOpen(true);
  }

  function openEditModal(b: any) {
    setEditingBookmark(b);
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      await deleteBookmark(id);
    }
  }

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <>
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
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>
            add
          </span>
          Add Bookmark
        </button>
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
                    <a href={bookmark.url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 w-max mt-1">
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
                  <td className="px-4 py-3.5 text-right flex items-center flex-row gap-2 justify-end">
                    <button onClick={() => openEditModal(bookmark)} className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs py-1 px-2 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 rounded">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(bookmark.id)} className="text-red-600 hover:text-red-700 font-semibold text-xs py-1 px-2 border border-red-100 bg-red-50 hover:bg-red-100 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {bookmarks.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500 text-sm">
                    No bookmarks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> bookmarks
            </p>
            <div className="flex gap-1">
              {offset / PAGE_SIZE + 1 > 1 && (
                <Link href={`?page=${offset / PAGE_SIZE}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Prev
                </Link>
              )}
              {offset / PAGE_SIZE + 1 < totalPages && (
                <Link href={`?page=${offset / PAGE_SIZE + 2}&q=${q}`} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <BookmarkFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingBookmark ? updateBookmark : createBookmark}
        bookmark={editingBookmark}
        users={users}
        types={types}
      />
    </>
  );
}




