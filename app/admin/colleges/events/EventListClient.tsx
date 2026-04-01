"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import EventFormModal from "./EventFormModal";
import Link from "next/link";

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
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function EventListClient({
  events,
  colleges,
  offset,
  onAdd,
  onEdit,
  onDelete,
}: EventListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);

  function openAdd() {
    setEditingEvent(null);
    setIsModalOpen(true);
  }

  function openEdit(event: EventRow) {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEvent(null);
  }

  function formatEventDate(d: string | null): string {
    if (!d) return "TBD";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
          Add Event
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>event</span>
            <p className="text-slate-500 font-semibold text-sm">No events found.</p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>add_circle</span>
              Add first event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College & Venue</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{e.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{e.description || "No description"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-medium truncate max-w-[200px] block">{e.college_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[200px] block">{e.venue}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-700 font-bold whitespace-nowrap">{formatEventDate(e.datetime)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {e.link && (
                          <Link href={e.link} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Link">
                            <span className="material-symbols-rounded text-[18px]">link</span>
                          </Link>
                        )}
                        <button
                          onClick={() => openEdit(e)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={onDelete.bind(null, e.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingEvent ? onEdit : onAdd}
        event={editingEvent}
        colleges={colleges}
      />
    </>
  );
}




