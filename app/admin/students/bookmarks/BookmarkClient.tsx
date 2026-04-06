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
    <div className="w-full">
      {/* ── Top Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-4">
        <div 
          className="text-white px-5 py-2 text-[13px] font-semibold flex items-center gap-2 rounded-md"
          style={{ backgroundColor: '#3b3b3b', width: 'max-content' }}
        >
          Bookmarks
          <span className="material-symbols-rounded text-[16px]">expand_more</span>
        </div>
      </div>

      {/* ── Main Table ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden min-h-[600px] rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-center border-collapse">
            <thead>
              <tr className="text-white border-b border-slate-200" style={{ backgroundColor: '#4a4a4a' }}>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">ID</th>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">Student name</th>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">College Name</th>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">Course Name</th>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">Blogs</th>
                <th className="font-semibold py-3 px-4 border-r border-slate-500">Last Update by</th>
                <th className="font-semibold py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookmarks.map((bookmark, idx) => {
                // Alternating rows
                const rowClass = idx % 2 === 0 ? "bg-blue-50" : "bg-white";
                
                // Map the bookmark object
                const isCollege = bookmark.type_name === 'College';
                const isCourse = bookmark.type_name === 'Courses';
                const isBlog = bookmark.type_name === 'Blog';

                return (
                  <tr key={bookmark.id} className={`${rowClass} border-b border-slate-200 text-slate-600`}>
                    <td className="py-4 px-4 font-medium border-r border-slate-200">
                      {String(bookmark.id).padStart(4, '0')}
                    </td>
                    <td className="py-4 px-4 font-medium border-r border-slate-200">
                      {bookmark.student_name || "Unknown"}
                    </td>
                    <td className="py-4 px-4 border-r border-slate-200">
                      {isCollege ? bookmark.title : "- - - - -"}
                    </td>
                    <td className="py-4 px-4 border-r border-slate-200">
                      {isCourse ? bookmark.title : "- - - - -"}
                    </td>
                    <td className="py-4 px-4 border-r border-slate-200">
                      {isBlog ? bookmark.title : (bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "- - - - -")}
                    </td>
                    <td className="py-4 px-4 border-r border-slate-200">
                      {bookmark.student_name || "Admin"}
                    </td>
                    <td className="py-4 px-4 flex items-center justify-center gap-2">
                       {/* Edit Box */}
                      <button 
                        onClick={() => openEditModal(bookmark)} 
                        className="text-white p-1.5 rounded transition-opacity hover:opacity-90"
                        title="Edit"
                        style={{ backgroundColor: '#464646' }}
                      >
                        <span className="material-symbols-rounded text-[18px] block">edit_square</span>
                      </button>

                      {/* Delete Box (matches the blue document icon from mockup, but performs delete) */}
                      <button 
                        onClick={() => handleDelete(bookmark.id)} 
                        className="text-white p-1.5 rounded transition-opacity hover:opacity-90"
                        title="Delete"
                        style={{ backgroundColor: '#1890ff' }}
                      >
                        <span className="material-symbols-rounded text-[18px] block">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Pad with empty rows to match the tall mockup table if < 5 items */}
              {bookmarks.length === 0 && (
                <tr className="bg-white">
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No bookmarks found.
                    <button
                      onClick={openAddModal}
                      className="mt-3 block mx-auto text-blue-600 hover:underline font-semibold"
                    >
                      + Add first record
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#dddddd] bg-white flex items-center justify-between">
            <p className="text-[13px] text-slate-500">
              Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> bookmarks
            </p>
            <div className="flex gap-1 text-[13px]">
              {offset / PAGE_SIZE + 1 > 1 && (
                <Link href={`?page=${offset / PAGE_SIZE}&q=${q}`} className="px-3 py-1.5 font-semibold bg-white border border-[#dddddd] rounded hover:bg-slate-50">
                  Prev
                </Link>
              )}
              {offset / PAGE_SIZE + 1 < totalPages && (
                <Link href={`?page=${offset / PAGE_SIZE + 2}&q=${q}`} className="px-3 py-1.5 font-semibold bg-white border border-[#dddddd] rounded hover:bg-slate-50">
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
    </div>
  );
}




