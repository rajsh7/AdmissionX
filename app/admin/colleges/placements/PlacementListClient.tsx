"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PlacementFormModal from "./PlacementFormModal";

interface Option { id: number; name: string; }

interface PlacementRow {
  id: number;
  collegeprofile_id: number;
  college_name: string;
  recruiting_companies: string;
  highest_ctc: string;
  lowest_ctc: string;
  average_ctc: string;
  placement_info: string;
}

interface PlacementListClientProps {
  placements: PlacementRow[];
  colleges: Option[];
  offset: number;
  total: number;
  pageSize: number;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function PlacementListClient({
  placements,
  colleges,
  offset,
  total,
  pageSize,
  onAdd,
  onDelete,
}: PlacementListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openAdd() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);

  return (
    <>
      <div className="flex justify-start mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
        >
          Add placement stats +
        </button>
      </div>

      <div className="bg-white">
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
                placements
              </>
            ) : (
              "No placements found"
            )}
          </p>
        </div>

        {placements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                monitoring
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No placement records found
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
              <col style={{ width: "20%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  CTC Range
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Companies
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {placements.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {offset + idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {p.college_name || "Unnamed College"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Profile #{p.collegeprofile_id}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                        Avg: {p.average_ctc || "-"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Low: {p.lowest_ctc || "-"} | High: {p.highest_ctc || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {p.recruiting_companies ? `${p.recruiting_companies}+` : "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] text-slate-500 line-clamp-2">
                      {p.placement_info || "No additional info"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/colleges/placements/${p.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors shadow-sm"
                        title="Edit placement"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await onDelete(p.id);
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PlacementFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onAdd}
        placement={undefined}
        colleges={colleges}
      />
    </>
  );
}
