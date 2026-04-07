"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import EventFormModal from "./EventFormModal";

interface Option { id: number; name: string; }

interface EventRow {
  id: number;
  collegeprofile_id: number;
  name: string;
  datetime: string;
  venue: string;
  description: string;
  link: string;
  college_name: string;
}

interface EventListClientProps {
  events: EventRow[];
  colleges: Option[];
  offset: number;
  total: number;
  pageSize: number;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function EventListClient({
  events,
  colleges,
  offset,
  total,
  pageSize,
  onAdd,
  onDelete,
}: EventListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openAdd() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function formatEventDate(d: string | null): string {
    if (!d) return "TBD";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "TBD";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);

  return (
    <>
      {/* Add button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
        >
          Add new college event +
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
                events
              </>
            ) : (
              "No events found"
            )}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                event
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No events found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  College & Venue
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {offset + idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {e.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {e.description || "No description"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {e.college_name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {e.venue || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-slate-600 text-sm font-medium">
                      {formatEventDate(e.datetime)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {e.link ? (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-blue-600 hover:underline truncate"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-slate-300 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/colleges/events/${e.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors shadow-sm"
                        title="Edit event"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await onDelete(e.id);
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

      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onAdd}
        event={undefined}
        colleges={colleges}
      />
    </>
  );
}
