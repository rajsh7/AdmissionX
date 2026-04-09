"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import Image from "next/image";

interface Props {
  college: CollegeUser;
}

interface ManagementMember {
  id: number;
  suffix: string | null;
  name: string;
  designation: string | null;
  gender: string | null;
  picture: string | null;
  picture_url: string | null;
  about: string | null;
  emailaddress: string | null;
  phoneno: string | null;
  landlineNo: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  suffix: "",
  designation: "",
  gender: "",
  about: "",
  emailaddress: "",
  phoneno: "",
  landlineNo: "",
};

const SUFFIX_OPTIONS = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Dr.",
  "Prof.",
  "Er.",
  "Shri",
  "Smt.",
];
const GENDER_OPTIONS = ["Male", "Female", "Other"];

// -- Skeleton -------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

// -- Photo Picker ---------------------------------------------------------------
function PhotoPicker({
  currentUrl,
  onChange,
}: {
  currentUrl: string | null;
  onChange: (file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File | null) {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
    if (f.size > 2 * 1024 * 1024) return;
    onChange(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  const shown = preview ?? currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative w-24 h-24 rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
          ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
          }`}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        {shown ? (
          <Image src={shown} alt="photo" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-1">
            <span
              className="material-symbols-rounded text-2xl text-slate-400"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              person
            </span>
            <span className="text-[10px] text-slate-400 text-center px-1">
              Add Photo
            </span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {shown && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onChange(null);
          }}
          className="text-xs text-red-500 hover:underline"
        >
          Remove photo
        </button>
      )}
      <p className="text-[10px] text-slate-400 text-center">
        JPEG, PNG or WebP · max 2 MB
      </p>
    </div>
  );
}

// -- Add / Edit Modal -----------------------------------------------------------
function MemberModal({
  member,
  slug,
  onClose,
  onSaved,
}: {
  member: ManagementMember | null;
  slug: string;
  onClose: () => void;
  onSaved: (m: ManagementMember) => void;
}) {
  const isEdit = !!member;

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(member
      ? {
          name: member.name,
          suffix: member.suffix ?? "",
          designation: member.designation ?? "",
          gender: member.gender ?? "",
          about: member.about ?? "",
          emailaddress: member.emailaddress ?? "",
          phoneno: member.phoneno ?? "",
          landlineNo: member.landlineNo ?? "",
        }
      : {}),
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof EMPTY_FORM, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") fd.append(k, v);
    });
    if (photoFile) fd.append("file", photoFile);

    const url = isEdit
      ? `/api/college/dashboard/${slug}/management?memberId=${member!.id}`
      : `/api/college/dashboard/${slug}/management`;

    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", body: fd });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      setSaving(false);
      return;
    }

    onSaved(data.member);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-rounded text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                manage_accounts
              </span>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                {isEdit ? "Edit Management Member" : "Add Management Member"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Update the details below"
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-slate-600 dark:text-slate-300 text-xl"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo */}
          <div className="flex flex-col items-center">
            <PhotoPicker
              currentUrl={member?.picture_url ?? null}
              onChange={setPhotoFile}
            />
          </div>

          {/* Suffix + Name */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Suffix
              </label>
              <select
                value={form.suffix}
                onChange={(e) => set("suffix", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">None</option>
                {SUFFIX_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Designation + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
                placeholder="e.g. Chairman, Director"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Select</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.emailaddress}
                onChange={(e) => set("emailaddress", e.target.value)}
                placeholder="member@college.edu"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Mobile
              </label>
              <input
                type="tel"
                value={form.phoneno}
                onChange={(e) => set("phoneno", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Landline */}
          <div className="w-1/2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Landline
            </label>
            <input
              type="tel"
              value={form.landlineNo}
              onChange={(e) => set("landlineNo", e.target.value)}
              placeholder="e.g. 022-12345678"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* About */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              About
            </label>
            <textarea
              rows={4}
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="Brief bio, achievements, background..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <span
                className="material-symbols-rounded text-red-500 text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-rounded text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isEdit ? "save" : "add"}
                  </span>
                  {isEdit ? "Save Changes" : "Add Member"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -- Delete Confirm -------------------------------------------------------------
function DeleteConfirm({
  member,
  slug,
  onClose,
  onDeleted,
}: {
  member: ManagementMember;
  slug: string;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const res = await fetch(
      `/api/college/dashboard/${slug}/management?memberId=${member.id}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to delete.");
      setDeleting(false);
      return;
    }
    onDeleted(member.id);
  }

  const displayName = [member.suffix, member.name].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <span
            className="material-symbols-rounded text-3xl text-red-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            delete
          </span>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            Remove Member?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {displayName}
            </span>{" "}
            will be permanently removed from management.
          </p>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing…
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Member Card ----------------------------------------------------------------
function MemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: ManagementMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const displayName = [member.suffix, member.name].filter(Boolean).join(" ");
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/10">
          {member.picture_url ? (
            <Image
              src={member.picture_url}
              alt={member.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl font-black text-violet-500">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
            {displayName}
          </h3>
          {member.designation && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
              <span
                className="material-symbols-rounded text-[11px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                badge
              </span>
              {member.designation}
            </span>
          )}

          {/* Contact */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            {member.emailaddress && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span
                  className="material-symbols-rounded text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  mail
                </span>
                <span className="truncate max-w-[160px]">
                  {member.emailaddress}
                </span>
              </span>
            )}
            {member.phoneno && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span
                  className="material-symbols-rounded text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  call
                </span>
                {member.phoneno}
              </span>
            )}
          </div>

          {/* About snippet */}
          {member.about && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {member.about}
            </p>
          )}
        </div>

        {/* Actions — revealed on hover */}
        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            title="Edit"
            className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-primary text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              edit
            </span>
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors"
          >
            <span
              className="material-symbols-rounded text-red-500 text-base"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
export default function ManagementTab({ college }: Props) {
  const slug = college.slug;

  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ManagementMember | null>(null);
  const [deleting, setDeleting] = useState<ManagementMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/management`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setMembers(data.management ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load management.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(m: ManagementMember) {
    setMembers((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = m;
        return next;
      }
      return [...prev, m];
    });
    setShowModal(false);
    setEditing(null);
  }

  function handleDeleted(id: number) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
  }

  function openAdd() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(m: ManagementMember) {
    setEditing(m);
    setShowModal(true);
  }

  const filtered = members.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.designation ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* -- Header ----------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""} ·
            directors, trustees &amp; key leadership
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <span
            className="material-symbols-rounded text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Add Member
        </button>
      </div>

      {/* -- Error ----------------------------------------------------------- */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 text-red-700 dark:text-red-400">
          <span className="material-symbols-rounded text-xl">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={load}
            className="ml-auto text-xs font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* -- Search ---------------------------------------------------------- */}
      {!loading && members.length > 3 && (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          )}
        </div>
      )}

      {/* -- Grid ------------------------------------------------------------ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span
            className="material-symbols-rounded text-6xl text-slate-300 dark:text-slate-600 mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            manage_accounts
          </span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {search
              ? "No members match your search."
              : "No management members added yet."}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              <span
                className="material-symbols-rounded text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add
              </span>
              Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onEdit={() => openEdit(m)}
              onDelete={() => setDeleting(m)}
            />
          ))}
        </div>
      )}

      {/* -- Modals ---------------------------------------------------------- */}
      {showModal && (
        <MemberModal
          member={editing}
          slug={slug}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteConfirm
          member={deleting}
          slug={slug}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
