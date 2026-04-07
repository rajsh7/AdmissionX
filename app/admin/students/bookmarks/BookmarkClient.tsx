"use client";

import { useState } from "react";
import Link from "next/link";
import BookmarkFormModal from "./BookmarkFormModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";

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
  deleteBookmark,
}: BookmarkClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  function openAddModal() {
    setIsModalOpen(true);
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="w-full">
      {/* Add button */}
      <div className="flex items-center justify-end gap-2 mb-2 mt-2 px-2">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-admin-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Bookmark
        </button>
      </div>

      {/* Table (matches profile information table style) */}
      <div className="bg-white">
        {/* Table header info */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {start}-{end}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>{" "}
                bookmarks
              </>
            ) : (
              "No bookmarks found"
            )}
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                bookmark
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No bookmarks found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Link / Meta
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookmarks.map((bookmark, idx) => {
                const label = bookmark.type_name || "Bookmark";
                const created = bookmark.created_at
                  ? new Date(bookmark.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "-";

                return (
                  <tr key={bookmark.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                        {offset + idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {bookmark.student_name || "Unknown"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {bookmark.student_email || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        {label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-slate-700 truncate" title={bookmark.title}>
                        {bookmark.title || "-"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        ID: {bookmark.id}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-1">
                        {bookmark.url ? (
                          <a
                            className="text-[12px] text-blue-600 hover:underline truncate"
                            href={bookmark.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {bookmark.url}
                          </a>
                        ) : (
                          <span className="text-slate-300 text-sm">-</span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Created: {created}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-row items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/students/bookmarks/${bookmark.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors shadow-sm"
                          title="Edit bookmark"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            edit
                          </span>
                          Edit
                        </Link>
                        <DeleteButton
                          action={async () => {
                            await deleteBookmark(bookmark.id);
                          }}
                          label="Delete"
                          size="xs"
                          icon={
                            <span className="material-symbols-outlined text-[13px]">
                              delete
                            </span>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-400 font-medium">
            Page {offset / PAGE_SIZE + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            {offset / PAGE_SIZE + 1 > 1 && (
              <a
                href={`?page=${offset / PAGE_SIZE}&q=${encodeURIComponent(q)}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </a>
            )}
            {offset / PAGE_SIZE + 1 < totalPages && (
              <a
                href={`?page=${offset / PAGE_SIZE + 2}&q=${encodeURIComponent(q)}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008080] hover:text-[#008080] transition-colors bg-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      <BookmarkFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createBookmark}
        users={users}
        types={types}
      />
    </div>
  );
}
