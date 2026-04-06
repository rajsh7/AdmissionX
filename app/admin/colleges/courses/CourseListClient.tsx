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
      <div className="flex justify-start mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
        >
          Add new college course +
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-[#3498db] shadow-sm overflow-hidden">
        {courses.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>menu_book</span>
            <p className="text-slate-500 font-semibold text-sm">No course records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#444444] text-white uppercase text-[11px] font-black tracking-widest">
                  <th className="px-4 py-4 border-r border-white/10 w-16">ID</th>
                  <th className="px-4 py-4 border-r border-white/10">Course Name</th>
                  <th className="px-4 py-4 border-r border-white/10">Details</th>
                  <th className="px-4 py-4 border-r border-white/10">College</th>
                  <th className="px-4 py-4 border-r border-white/10">Fees</th>
                  <th className="px-4 py-4 border-r border-white/10">Seats</th>
                  <th className="px-4 py-4 border-r border-white/10">Last Update by</th>
                  <th className="px-4 py-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c, idx) => (
                  <tr 
                    key={c.id} 
                    className={`transition-colors text-[13px] font-medium ${idx % 2 === 0 ? "bg-[#e8f4fd]" : "bg-white"} hover:bg-blue-100/30`}
                  >
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-bold text-slate-400">
                      {String(idx + 1).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-bold text-slate-700">
                      {c.course_name || "General Program"}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-semibold text-slate-500 text-xs">
                      {[c.degree_name, c.stream_name].filter(Boolean).join(" • ")}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-slate-600">
                      {c.college_name}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-black text-slate-700">
                      {c.fees ? `₹${c.fees}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-black text-slate-700">
                      {c.seats || "—"}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-blue-400 font-bold">
                      Amit Tyagi
                    </td>
                    <td className="px-4 py-3.5 flex items-center justify-center gap-1.5 min-w-[100px]">
                      <button
                        onClick={() => openEdit(c)}
                        className="w-10 h-10 flex items-center justify-center bg-[#444444] text-white rounded hover:bg-black transition-all"
                        title="Edit"
                      >
                        <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>edit_square</span>
                      </button>
                      <button
                        className="w-10 h-10 flex items-center justify-center bg-[#0799fb] text-white rounded hover:bg-blue-600 transition-all"
                        title="Details"
                      >
                        <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>description</span>
                      </button>
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




