"use client";

import { useState } from "react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import OpportunityFormModal from "./OpportunityFormModal";

interface Opportunity {
  id: number;
  title: string;
  avgSalery: string | null;
  topCompany: string | null;
  careerDetailsId: number | null;
  career_title?: string | null;
}

interface CareerStream {
  id: number;
  title: string;
}

interface OpportunityListClientProps {
  opportunities: Opportunity[];
  careerStreams: CareerStream[];
  createOpportunity: (formData: FormData) => Promise<void>;
  updateOpportunity: (formData: FormData) => Promise<void>;
  deleteOpportunity: (id: number) => Promise<void>;
}

export default function OpportunityListClient({
  opportunities,
  careerStreams,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
}: OpportunityListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  function handleAdd() {
    setEditingOpp(null);
    setIsModalOpen(true);
  }

  function handleEdit(o: Opportunity) {
    setEditingOpp(o);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>
              work
            </span>
            Career Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage job roles, salaries, and top companies.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
          Add New Opportunity
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Job Role</th>
                <th className="px-4 py-3 text-left">Career Stream</th>
                <th className="px-4 py-3 text-left">Avg. Salary</th>
                <th className="px-4 py-3 text-left">Top Companies</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No opportunities found.
                  </td>
                </tr>
              ) : (
                opportunities.map((row) => (
                  <tr key={row.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-rose-600 text-[16px]" style={ICO_FILL}>
                            work
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[250px]">
                            {row.title}
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
                       <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                         {row.avgSalery || "—"}
                       </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[10px] text-slate-400 line-clamp-2 max-w-[300px]">
                        {row.topCompany || "No companies listed"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      <div className="flex items-center justify-end gap-2 text-slate-800">
                         <button 
                           onClick={() => handleEdit(row)}
                           className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-rose-600 transition-colors"
                          >
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                         </button>
                         <DeleteButton action={deleteOpportunity.bind(null, row.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OpportunityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingOpp ? updateOpportunity : createOpportunity}
        opportunity={editingOpp}
        careerStreams={careerStreams}
      />
    </>
  );
}




