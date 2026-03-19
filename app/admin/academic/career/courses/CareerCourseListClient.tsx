"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CareerCourseFormModal from "./CareerCourseFormModal";

interface CareerCourse {
  id: number;
  courseName: string;
  jobProfiles: string | null;
  avgSalery: string | null;
  topCompany: string | null;
  coursesDetailsId: number | null;
  career_title?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface CareerStream {
  id: number;
  title: string;
}

interface CareerCourseListClientProps {
  careerCourses: CareerCourse[];
  careerStreams: CareerStream[];
  createCourse: (formData: FormData) => Promise<void>;
  updateCourse: (formData: FormData) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
}

export default function CareerCourseListClient({
  careerCourses,
  careerStreams,
  createCourse,
  updateCourse,
  deleteCourse,
}: CareerCourseListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CareerCourse | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingCourse(null);
    setIsModalOpen(true);
  }

  function handleEdit(c: CareerCourse) {
    setEditingCourse(c);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-cyan-600 text-[22px]" style={ICO_FILL}>
              school
            </span>
            Career Courses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage career-focused courses and their job prospects.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Course
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Course Name</th>
                <th className="px-4 py-3 text-left">Career Stream</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-left">Profiles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {careerCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No career courses found.
                  </td>
                </tr>
              ) : (
                careerCourses.map((row) => (
                  <tr key={row.id} className="hover:bg-cyan-50/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-cyan-600 text-[16px]" style={ICO_FILL}>
                            school
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[250px]">
                            {row.courseName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: #{row.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                       <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold truncate block max-w-[150px]">
                         {row.career_title || "Unassigned"}
                       </span>
                    </td>
                    <td className="px-4 py-3.5">
                       <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                         {row.avgSalery || "—"}
                       </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[10px] text-slate-400 line-clamp-2 max-w-[300px]">
                        {row.jobProfiles || "No profiles listed"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      <div className="flex items-center justify-end gap-2 text-slate-800">
                         <button 
                           onClick={() => handleEdit(row)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-cyan-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteCourse.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CareerCourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingCourse ? updateCourse : createCourse}
        careerCourse={editingCourse}
        careerStreams={careerStreams}
      />
    </>
  );
}
