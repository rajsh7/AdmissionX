"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import EventFormModal from "./EventFormModal";

interface Option { id: string; name: string; }

interface EventRow {
  id: string;
  collegeprofile_id: string;
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
  q: string;
  collegeId: string;
  eventName: string;
  from: string;
  to: string;
  offset: number;
  total: number;
  pageSize: number;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EventListClient({
  events,
  colleges,
  q,
  collegeId,
  eventName,
  from,
  to,
  offset,
  total,
  pageSize,
  onAdd,
  onDelete,
}: EventListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
      {/* Add button and filter toggle */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all"
        >
          <span className="material-symbols-rounded text-[18px]">filter_alt</span>
          Filters
        </button>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#313131] hover:bg-black text-white font-bold rounded shadow-lg transition-all text-xs uppercase tracking-tight"
        >
          Add new college event +
        </button>
      </div>

      {filtersOpen && (
        <div className="mb-5 border border-slate-200 rounded-[10px] bg-white shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Filter events</h3>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="text-[13px] font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <form method="GET" action="/admin/colleges/events" className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 mb-2">College Name</label>
              <select
                name="collegeId"
                defaultValue={collegeId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-blue-500/20 outline-none"
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>{college.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 mb-2">Event Name</label>
              <input
                name="eventName"
                defaultValue={eventName}
                placeholder="Enter event name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 mb-2">Event From</label>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 mb-2">Event To</label>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <input type="hidden" name="q" value={q} />

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF3C3C] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#e23333]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
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
