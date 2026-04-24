"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props { college: CollegeUser; }

interface Event {
  id: string;
  name: string;
  datetime: string;
  venue: string;
  description: string;
  link: string;
}

const EMPTY = { name: "", datetime: "", venue: "", description: "", link: "" };
const inputCls = "w-full border border-slate-200 rounded-[5px] px-4 py-3 text-[14px] text-slate-800 bg-white outline-none focus:border-red-400 transition-all placeholder:text-slate-300";

export default function EventsTab({ college }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/events`);
      const d = await res.json();
      setEvents(d.events ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); setError(null); }
  function openEdit(e: Event) { setEditing(e); setForm({ name: e.name, datetime: e.datetime, venue: e.venue, description: e.description, link: e.link }); setShowForm(true); setError(null); }
  function closeForm() { setShowForm(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Event name is required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/events`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save.");
      setSuccess(editing ? "Event updated!" : "Event added!");
      setTimeout(() => setSuccess(null), 3000);
      closeForm(); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    try {
      await fetch(`/api/college/dashboard/${slug}/events?id=${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
      setSuccess("Event deleted!"); setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Delete failed."); }
  }

  function formatDate(dt: string) {
    if (!dt) return null;
    try { return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return dt; }
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#333]">Manage Events</h2>
          <p className="text-slate-400 text-sm mt-0.5">{college.name}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF3D3D] text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Event
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>{success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-[15px] font-bold text-slate-700">{editing ? "Edit Event" : "New Event"}</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Annual Tech Fest 2025" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                  <input type="datetime-local" value={form.datetime} onChange={e => setForm(p => ({ ...p, datetime: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Venue</label>
                  <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Main Auditorium" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the event..." rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registration / Info Link</label>
                <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF3D3D] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#e63535] transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add Event"}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-[8px] font-bold text-[14px] hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">event</span>
            <p className="text-slate-500 font-semibold">No events added yet</p>
            <button onClick={openAdd} className="mt-3 text-sm font-bold text-[#FF3C3C] hover:underline">+ Add your first event</button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#FF3C3C] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-800">{ev.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {ev.datetime && (
                      <span className="flex items-center gap-1 text-[12px] text-slate-500">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatDate(ev.datetime)}
                      </span>
                    )}
                    {ev.venue && (
                      <span className="flex items-center gap-1 text-[12px] text-slate-500">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {ev.venue}
                      </span>
                    )}
                  </div>
                  {ev.description && <p className="text-[13px] text-slate-400 mt-1 line-clamp-2">{ev.description}</p>}
                  {ev.link && (
                    <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 hover:underline mt-1 inline-block">
                      Registration Link →
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(ev.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
