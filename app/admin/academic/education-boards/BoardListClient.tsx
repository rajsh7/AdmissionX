"use client";

import { useState, useEffect } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import BoardFormModal from "./BoardFormModal";
import PaginationFixed from "@/app/components/PaginationFixed";
import { formatDate } from "@/lib/utils";

const STEP = 25;

interface Board {
  id: number;
  name: string;
  title: string | null;
  slug: string | null;
  status: number;
  misc?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface BoardListClientProps {
  boards: Board[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  createBoard: (formData: FormData) => Promise<void>;
  updateBoard: (formData: FormData) => Promise<void>;
  deleteBoard: (id: number) => Promise<void>;
}

export default function BoardListClient({
  boards,
  total,
  page,
  totalPages,
  pageSize,
  createBoard,
  updateBoard,
  deleteBoard,
}: BoardListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset visible count when page or board data changes
  useEffect(() => {
    setVisibleCount(STEP);
  }, [page, boards[0]?.id]);

  const showMore = visibleCount < boards.length;
  const showPagination = !showMore && totalPages > 1;

  if (!mounted) return <div className="min-h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse mt-6" />;

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingBoard(null);
    setIsModalOpen(true);
  }

  function handleEdit(board: Board) {
    setEditingBoard(board);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>
              assignment
            </span>
            Education Boards
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage academic boards and their details.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Board
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Board Info</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {boards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No education boards found.
                  </td>
                </tr>
              ) : (
                boards.slice(0, visibleCount).map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-indigo-600 text-[16px]" style={ICO_FILL}>
                            assignment
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[250px]">
                            {row.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ID: #{row.id} • {row.title || "No extra title"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.slug ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                           /{row.slug}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${row.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{row.status ? 'check_circle' : 'motion_photos_off'}</span>
                          {row.status ? 'Live' : 'Draft'}
                       </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleEdit(row)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-indigo-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteBoard.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BoardFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingBoard ? updateBoard : createBoard}
        board={editingBoard}
      />

      {/* Show More */}
      {showMore && (
        <div className="py-6 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount(v => Math.min(v + STEP, boards.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Show More ({boards.length - visibleCount} remaining)
            </span>
            <span className="material-symbols-outlined text-[36px] animate-bounce group-hover:text-indigo-600">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination after all shown */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{(page-1)*pageSize + 1}–{Math.min((page-1)*pageSize + pageSize, total)}</span> of <span className="text-slate-700 font-bold">{total}</span> boards
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}
    </>
  );
}




