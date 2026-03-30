"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Marks {
  class10_board: string;
  class10_school: string;
  class10_year: string;
  class10_percent: string;
  class10_total: string;
  class10_obtained: string;

  class11_board: string;
  class11_school: string;
  class11_year: string;
  class11_percent: string;

  class12_board: string;
  class12_school: string;
  class12_year: string;
  class12_percent: string;
  class12_total: string;
  class12_obtained: string;
  class12_stream: string;

  grad_university: string;
  grad_college: string;
  grad_program: string;
  grad_year: string;
  grad_percent: string;
  grad_cgpa: string;
}

const EMPTY_MARKS: Marks = {
  class10_board: "",   class10_school: "",  class10_year: "",
  class10_percent: "", class10_total: "",   class10_obtained: "",

  class11_board: "",   class11_school: "",  class11_year: "",
  class11_percent: "",

  class12_board: "",   class12_school: "",  class12_year: "",
  class12_percent: "", class12_total: "",   class12_obtained: "",
  class12_stream: "",

  grad_university: "", grad_college: "",    grad_program: "",
  grad_year: "",       grad_percent: "",    grad_cgpa: "",
};

const BOARDS = [
  "CBSE", "ICSE / ISC", "State Board", "IB (International Baccalaureate)",
  "IGCSE", "NIOS", "Other",
];

const STREAMS_12 = [
  "Science (PCM)", "Science (PCB)", "Science (PCMB)",
  "Commerce", "Arts / Humanities", "Vocational", "Other",
];

const YEAR_OPTIONS = Array.from(
  { length: 30 },
  (_, i) => String(new Date().getFullYear() - i),
);

// ── Reusable field components ─────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  color,
  children,
  completion,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
  completion: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className={`px-8 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r ${color}`}>
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-2xl text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <h3 className="font-black text-white text-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
          <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-white text-xs font-black">{completion}%</span>
        </div>
      </div>

      <div className="p-8">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function SkeletonSection() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-16 bg-slate-200 dark:bg-slate-700" />
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Completion helpers ────────────────────────────────────────────────────────
function calc10Completion(m: Marks): number {
  const keys: (keyof Marks)[] = [
    "class10_board", "class10_school", "class10_year", "class10_percent",
  ];
  return Math.round((keys.filter((k) => m[k] !== "").length / keys.length) * 100);
}

function calc11Completion(m: Marks): number {
  const keys: (keyof Marks)[] = [
    "class11_board", "class11_school", "class11_year", "class11_percent",
  ];
  return Math.round((keys.filter((k) => m[k] !== "").length / keys.length) * 100);
}

function calc12Completion(m: Marks): number {
  const keys: (keyof Marks)[] = [
    "class12_board", "class12_school", "class12_year", "class12_percent",
    "class12_stream",
  ];
  return Math.round((keys.filter((k) => m[k] !== "").length / keys.length) * 100);
}

function calcGradCompletion(m: Marks): number {
  const keys: (keyof Marks)[] = [
    "grad_university", "grad_program", "grad_year", "grad_percent",
  ];
  return Math.round((keys.filter((k) => m[k] !== "").length / keys.length) * 100);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function MarksTab({ user }: Props) {
  const [marks, setMarks]     = useState<Marks>({ ...EMPTY_MARKS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [marksComplete, setMarksComplete] = useState(0);

  // Show/hide optional graduation section
  const [showGrad, setShowGrad] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${user.id}/marks`);
      if (!res.ok) throw new Error("Failed to load academic marks");
      const data = await res.json();
      const loaded: Marks = { ...EMPTY_MARKS, ...(data.marks ?? {}) };
      setMarks(loaded);
      setMarksComplete(data.marksComplete ?? 0);
      // Auto-expand graduation if data exists
      if (loaded.grad_university || loaded.grad_program || loaded.grad_year) {
        setShowGrad(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load marks");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  function update(key: keyof Marks, value: string) {
    setMarks((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Build payload — only send non-empty or explicitly cleared fields
    const payload: Partial<Marks> = { ...marks };

    try {
      const res = await fetch(`/api/student/${user.id}/marks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save marks");
      setSuccess(true);
      // Recalculate from fresh data
      await load();
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const c10  = calc10Completion(marks);
  const c11  = calc11Completion(marks);
  const c12  = calc12Completion(marks);
  const cGrad = calcGradCompletion(marks);

  // Overall bar
  const overall = Math.round((c10 + c12) / 2);

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Academic Marks
          </h1>
          <p className="text-slate-500 mt-1">
            Enter your 10th, 12th and graduation marks for accurate college
            matching.
          </p>
        </div>

        {!loading && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 shadow-sm shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Completion
              </p>
              <p className="text-xl font-black text-primary">{overall}%</p>
            </div>
            <div className="w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  className="stroke-slate-100 dark:stroke-slate-700"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={
                    2 * Math.PI * 14 * (1 - overall / 100)
                  }
                  stroke="#135bec"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonSection key={i} />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── 10th / Secondary ─────────────────────────────────────── */}
          <SectionCard
            title="10th / Secondary"
            icon="school"
            color="from-blue-600 to-blue-500"
            completion={c10}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Board / University">
                <SelectInput
                  value={marks.class10_board}
                  onChange={(v) => update("class10_board", v)}
                  options={BOARDS}
                  placeholder="Select board"
                />
              </Field>

              <Field label="School Name">
                <TextInput
                  value={marks.class10_school}
                  onChange={(v) => update("class10_school", v)}
                  placeholder="e.g. Delhi Public School"
                />
              </Field>

              <Field label="Year of Passing">
                <SelectInput
                  value={marks.class10_year}
                  onChange={(v) => update("class10_year", v)}
                  options={YEAR_OPTIONS}
                  placeholder="Select year"
                />
              </Field>

              <Field label="Percentage / CGPA" hint="Enter percentage (e.g. 87.5)">
                <TextInput
                  type="number"
                  value={marks.class10_percent}
                  onChange={(v) => update("class10_percent", v)}
                  placeholder="e.g. 87.5"
                />
              </Field>

              <Field label="Total Marks" hint="Optional">
                <TextInput
                  type="number"
                  value={marks.class10_total}
                  onChange={(v) => update("class10_total", v)}
                  placeholder="e.g. 500"
                />
              </Field>

              <Field label="Marks Obtained" hint="Optional">
                <TextInput
                  type="number"
                  value={marks.class10_obtained}
                  onChange={(v) => update("class10_obtained", v)}
                  placeholder="e.g. 437"
                />
              </Field>
            </div>

            {/* Inline percent indicator */}
            {marks.class10_percent && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Score Indicator
                  </span>
                  <span className="text-sm font-black text-primary">
                    {marks.class10_percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      parseFloat(marks.class10_percent) >= 75
                        ? "bg-emerald-500"
                        : parseFloat(marks.class10_percent) >= 60
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                    style={{
                      width: `${Math.min(100, parseFloat(marks.class10_percent) || 0)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── 11th / Intermediate (optional) ───────────────────────── */}
          <SectionCard
            title="11th / Intermediate"
            icon="menu_book"
            color="from-violet-600 to-violet-500"
            completion={c11}
          >
            <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">
                info
              </span>
              Optional — only required by some colleges for intermediate-year
              data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Board / University">
                <SelectInput
                  value={marks.class11_board}
                  onChange={(v) => update("class11_board", v)}
                  options={BOARDS}
                  placeholder="Select board"
                />
              </Field>

              <Field label="School Name">
                <TextInput
                  value={marks.class11_school}
                  onChange={(v) => update("class11_school", v)}
                  placeholder="e.g. Kendriya Vidyalaya"
                />
              </Field>

              <Field label="Year of Passing">
                <SelectInput
                  value={marks.class11_year}
                  onChange={(v) => update("class11_year", v)}
                  options={YEAR_OPTIONS}
                  placeholder="Select year"
                />
              </Field>

              <Field label="Percentage / CGPA">
                <TextInput
                  type="number"
                  value={marks.class11_percent}
                  onChange={(v) => update("class11_percent", v)}
                  placeholder="e.g. 82.0"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 12th / Senior Secondary ───────────────────────────────── */}
          <SectionCard
            title="12th / Senior Secondary"
            icon="workspace_premium"
            color="from-primary to-blue-500"
            completion={c12}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Board / University">
                <SelectInput
                  value={marks.class12_board}
                  onChange={(v) => update("class12_board", v)}
                  options={BOARDS}
                  placeholder="Select board"
                />
              </Field>

              <Field label="School Name">
                <TextInput
                  value={marks.class12_school}
                  onChange={(v) => update("class12_school", v)}
                  placeholder="e.g. Narayana Junior College"
                />
              </Field>

              <Field label="Year of Passing">
                <SelectInput
                  value={marks.class12_year}
                  onChange={(v) => update("class12_year", v)}
                  options={YEAR_OPTIONS}
                  placeholder="Select year"
                />
              </Field>

              <Field label="Stream">
                <SelectInput
                  value={marks.class12_stream}
                  onChange={(v) => update("class12_stream", v)}
                  options={STREAMS_12}
                  placeholder="Select stream"
                />
              </Field>

              <Field label="Percentage / CGPA" hint="e.g. 91.2">
                <TextInput
                  type="number"
                  value={marks.class12_percent}
                  onChange={(v) => update("class12_percent", v)}
                  placeholder="e.g. 91.2"
                />
              </Field>

              <Field label="Total Marks" hint="Optional">
                <TextInput
                  type="number"
                  value={marks.class12_total}
                  onChange={(v) => update("class12_total", v)}
                  placeholder="e.g. 500"
                />
              </Field>

              <Field label="Marks Obtained" hint="Optional">
                <TextInput
                  type="number"
                  value={marks.class12_obtained}
                  onChange={(v) => update("class12_obtained", v)}
                  placeholder="e.g. 456"
                />
              </Field>
            </div>

            {marks.class12_percent && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Score Indicator
                  </span>
                  <span className="text-sm font-black text-primary">
                    {marks.class12_percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      parseFloat(marks.class12_percent) >= 75
                        ? "bg-emerald-500"
                        : parseFloat(marks.class12_percent) >= 60
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                    style={{
                      width: `${Math.min(100, parseFloat(marks.class12_percent) || 0)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Graduation (optional toggle) ──────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Toggle header */}
            <button
              type="button"
              onClick={() => setShowGrad((s) => !s)}
              className="w-full px-8 py-5 flex items-center justify-between text-left bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-2xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emoji_events
                </span>
                <div>
                  <h3 className="font-black text-white text-lg leading-none">
                    Graduation / Bachelor&apos;s Degree
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    Optional — fill if you are a post-graduate applicant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showGrad && cGrad > 0 && (
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                    {cGrad}%
                  </span>
                )}
                <span
                  className={`material-symbols-outlined text-white text-2xl transition-transform duration-300 ${
                    showGrad ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>

            {showGrad && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="University">
                    <TextInput
                      value={marks.grad_university}
                      onChange={(v) => update("grad_university", v)}
                      placeholder="e.g. Delhi University"
                    />
                  </Field>

                  <Field label="College">
                    <TextInput
                      value={marks.grad_college}
                      onChange={(v) => update("grad_college", v)}
                      placeholder="e.g. St. Stephen's College"
                    />
                  </Field>

                  <Field label="Program / Degree">
                    <TextInput
                      value={marks.grad_program}
                      onChange={(v) => update("grad_program", v)}
                      placeholder="e.g. B.Com (Hons)"
                    />
                  </Field>

                  <Field label="Year of Passing">
                    <SelectInput
                      value={marks.grad_year}
                      onChange={(v) => update("grad_year", v)}
                      options={YEAR_OPTIONS}
                      placeholder="Select year"
                    />
                  </Field>

                  <Field label="Percentage" hint="e.g. 72.4">
                    <TextInput
                      type="number"
                      value={marks.grad_percent}
                      onChange={(v) => update("grad_percent", v)}
                      placeholder="e.g. 72.4"
                    />
                  </Field>

                  <Field label="CGPA" hint="Optional — if your university uses CGPA">
                    <TextInput
                      type="number"
                      value={marks.grad_cgpa}
                      onChange={(v) => update("grad_cgpa", v)}
                      placeholder="e.g. 7.8"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick Summary Strip ───────────────────────────────────── */}
          {(marks.class10_percent || marks.class12_percent) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "10th",
                  value: marks.class10_percent
                    ? `${marks.class10_percent}%`
                    : "—",
                  color: "text-blue-600",
                  bg: "bg-blue-50 dark:bg-blue-900/20",
                },
                {
                  label: "11th",
                  value: marks.class11_percent
                    ? `${marks.class11_percent}%`
                    : "—",
                  color: "text-violet-600",
                  bg: "bg-violet-50 dark:bg-violet-900/20",
                },
                {
                  label: "12th",
                  value: marks.class12_percent
                    ? `${marks.class12_percent}%`
                    : "—",
                  color: "text-primary",
                  bg: "bg-primary/5",
                },
                {
                  label: "Graduation",
                  value: marks.grad_percent ? `${marks.grad_percent}%` : "—",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50 dark:bg-emerald-900/20",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} rounded-2xl p-4 text-center`}
                >
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Feedback ──────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
              <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">
                error
              </span>
              <p className="text-red-700 dark:text-red-300 font-medium text-sm">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
              <span
                className="material-symbols-outlined text-emerald-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                Academic marks saved successfully!
              </p>
            </div>
          )}

          {/* ── Save / Reset ──────────────────────────────────────────── */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Save Marks
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
