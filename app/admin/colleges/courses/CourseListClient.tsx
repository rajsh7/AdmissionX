"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CourseFormModal from "./CourseFormModal";

interface Option { id: number; name: string; }

interface CourseRow {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
}

interface CourseListClientProps {
  courses: CourseRow[];
  colleges: Option[];
  courseOptions: Option[];
  degrees: Option[];
  streams: Option[];
  offset: number;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function CourseListClient({
  courses,
  colleges,
  courseOptions,
  degrees,
  streams,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: CourseListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);

  function openAdd() {
    setEditingCourse(null);
    setIsModalOpen(true);
  }

  function openEdit(course: CourseRow) {
    setEditingCourse(course);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCourse(null);
  }

  return (
    <>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add Course
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {courses.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>menu_book</span>
            <p className="text-slate-500 font-semibold text-sm">No course records found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Detail</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fees &amp; Seats</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {c.course_name || "General Program"}
                        </span>
                        <span className="text-[11px] text-blue-600 font-bold uppercase tracking-tighter mt-0.5">
                          {[c.degree_name, c.stream_name].filter(Boolean).join(" • ")}
                          {c.courseduration && (
                            <span className="text-slate-400 ml-1.5 font-medium normal-case">({c.courseduration})</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[180px] block">{c.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-slate-700 font-bold">
                          {c.fees ? `₹ ${c.fees}` : <span className="text-slate-400 font-normal">N/A</span>}
                        </span>
                        <span className="text-slate-400 font-semibold uppercase tracking-widest text-[9px]">
                          {c.seats ? `${c.seats} Seats` : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, c.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingCourse ? onEdit : onAdd}
        course={editingCourse}
        colleges={colleges}
        courseOptions={courseOptions}
        degrees={degrees}
        streams={streams}
      />
    </>
  );
}




