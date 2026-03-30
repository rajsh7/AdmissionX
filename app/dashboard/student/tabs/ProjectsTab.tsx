"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string;
  link: string;
  status: "completed" | "ongoing" | "planned";
  from_date: string;
  to_date: string;
}

const STATUS_META = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  ongoing:   { label: "Ongoing",   color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  planned:   { label: "Planned",   color: "bg-amber-100 text-amber-700",  dot: "bg-amber-400"  },
};

const EMPTY_FORM = {
  title: "", description: "", tech: "", link: "",
  status: "completed" as Project["status"],
  from_date: "", to_date: "",
};

export default function ProjectsTab({ user }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [editId, setEditId]     = useState<number | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editId !== null) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...form } : p))
      );
      setEditId(null);
    } else {
      const newProject: Project = {
        id: Date.now(),
        ...form,
      };
      setProjects((prev) => [newProject, ...prev]);
    }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  }

  function handleEdit(p: Project) {
    setForm({
      title: p.title,
      description: p.description,
      tech: p.tech,
      link: p.link,
      status: p.status,
      from_date: p.from_date,
      to_date: p.to_date,
    });
    setEditId(p.id);
    setShowForm(true);
  }

  function handleDelete(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCancel() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[22px]">work</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Projects</h1>
            <p className="text-xs text-slate-400 font-medium">
              Showcase your academic and personal projects
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Project
          </button>
        )}
      </div>

      {/* Coming Soon banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl px-5 py-4 flex items-start gap-4">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <span
            className="material-symbols-outlined text-green-600 text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            info
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">
            Projects sync with your profile — Coming Soon
          </p>
          <p className="text-xs text-green-600 mt-0.5 leading-relaxed">
            Soon your projects will be saved to your AdmissionX profile and shared
            with colleges you apply to. For now, they are stored locally in this
            session.
          </p>
        </div>
        <span className="ml-auto flex-shrink-0 text-[10px] font-black text-green-600 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Beta
        </span>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-green-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[16px]">
                  {editId !== null ? "edit" : "add_circle"}
                </span>
              </div>
              <h2 className="font-black text-slate-800 text-[15px]">
                {editId !== null ? "Edit Project" : "Add New Project"}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Hospital Management System"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of what the project does and your role..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 resize-none"
              />
            </div>

            {/* Technologies + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Technologies / Tools
                </label>
                <input
                  type="text"
                  name="tech"
                  value={form.tech}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MySQL"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 appearance-none"
                >
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  From Date
                </label>
                <input
                  type="month"
                  name="from_date"
                  value={form.from_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  To Date
                </label>
                <input
                  type="month"
                  name="to_date"
                  value={form.to_date}
                  onChange={handleChange}
                  disabled={form.status === "ongoing"}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {form.status === "ongoing" && (
                  <p className="text-[10px] text-blue-500 font-semibold mt-1">Present (ongoing)</p>
                )}
              </div>
            </div>

            {/* Project link */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Project Link (GitHub / Demo)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-slate-400">
                  link
                </span>
                <input
                  type="url"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://github.com/username/project"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-colors shadow-md shadow-green-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {editId !== null ? "save" : "add"}
                </span>
                {editId !== null ? "Update Project" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-300">
                work_outline
              </span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-700">No Projects Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Add your academic or personal projects to showcase your skills to
                colleges and employers.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Your First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {(["completed", "ongoing", "planned"] as const).map((s) => {
              const count = projects.filter((p) => p.status === s).length;
              const meta  = STATUS_META[s];
              return (
                <div key={s} className="bg-white rounded-xl border border-green-50 shadow-sm p-4 flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${meta.dot} flex-shrink-0`} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{meta.label}</p>
                    <p className="text-xl font-black text-slate-800">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project cards */}
          {projects.map((p) => {
            const meta = STATUS_META[p.status];
            const techs = p.tech ? p.tech.split(",").map((t) => t.trim()).filter(Boolean) : [];
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-green-50 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-green-600 text-[20px]">
                        work
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-800 text-base group-hover:text-green-700 transition-colors">
                          {p.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.color} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>

                      {(p.from_date || p.to_date) && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">calendar_month</span>
                          {p.from_date || "—"}
                          {" → "}
                          {p.status === "ongoing" ? "Present" : (p.to_date || "—")}
                        </p>
                      )}

                      {p.description && (
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      )}

                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {techs.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          View Project
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
