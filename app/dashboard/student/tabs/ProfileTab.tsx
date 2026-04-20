"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

type InnerTab = "profile" | "address" | "academic" | "certificates" | "projects" | "settings";

// ── Shared field component ────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder, disabled, children,
}: {
  label: string; value?: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children ?? (
        <input
          type={type} value={value ?? ""} disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/10 transition-all disabled:bg-gray-50 disabled:text-gray-400"
        />
      )}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] bg-[#222] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-300">
      {msg}
    </div>
  );
}

// ── Stat Card (matching screenshot) ──────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-[15px] font-bold text-[#111]">- {value}</p>
      </div>
      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#e31e24] text-[20px]">account_balance</span>
      </div>
    </div>
  );
}

// ── Inner tab bar (matching screenshot style) ─────────────────────────────────
const INNER_TABS: { id: InnerTab; label: string }[] = [
  { id: "profile",      label: "Profile" },
  { id: "address",      label: "Address" },
  { id: "academic",     label: "Academic Details" },
  { id: "certificates", label: "Academic Certificates" },
  { id: "projects",     label: "Projects" },
  { id: "settings",     label: "Account Settings" },
];

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProfileInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [name, setName]       = useState(user?.name ?? "");
  const [gender, setGender]   = useState("");
  const [hobbies, setHobbies] = useState("");
  const [interest, setInterest] = useState("");
  const [dob, setDob]         = useState("");
  const [phone, setPhone]     = useState("");
  const [about, setAbout]     = useState("");
  const [parentsname, setParentsname]     = useState("");
  const [parentsnumber, setParentsnumber] = useState("");
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/profile`);
    const d = await res.json();
    setName(d.name ?? user.name ?? "");
    setGender(d.gender ?? "");
    setHobbies(d.hobbies ?? "");
    setInterest(d.interest ?? "");
    setDob(d.dob ? d.dob.slice(0, 10) : "");
    setPhone(d.phone ?? "");
    setAbout(d.about ?? "");
    setParentsname(d.parentsname ?? "");
    setParentsnumber(d.parentsnumber ?? "");
  }, [user?.id, user?.name]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, hobbies, interest, dob, phone, about, parentsname, parentsnumber }),
      });
      if (res.ok) showToast("Profile saved!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <Field label="Name" value={name} onChange={setName} placeholder="Enter name here" />
      <Field label="Gender">
        <select value={gender} onChange={(e) => setGender(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 appearance-none">
          <option value="">Select Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Hobbies" value={hobbies} onChange={setHobbies} placeholder="Enter hobbies here" />
      <Field label="Interest" value={interest} onChange={setInterest} placeholder="Enter your Interests here" />
      <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
      <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="Enter phone number" />
      <Field label="Parent Name" value={parentsname} onChange={setParentsname} placeholder="Enter parent name" />
      <Field label="Parent Number" value={parentsnumber} onChange={setParentsnumber} type="tel" placeholder="Enter parent phone number" />
      <Field label="About">
        <textarea value={about} onChange={(e) => setAbout(e.target.value)}
          placeholder="Tell us about yourself" rows={4}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 resize-none" />
      </Field>
      <button type="submit" disabled={saving}
        className="px-8 py-2.5 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADDRESS INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
function AddressInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [perm, setPerm] = useState({ street: "", city: "", state: "", pincode: "", country: "" });
  const [pres, setPres] = useState({ street: "", city: "", state: "", pincode: "", country: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/profile`);
    const d = await res.json();
    setPerm({
      street: d.address ?? "", city: d.city ?? "", state: d.state ?? "",
      pincode: d.pincode ?? "", country: d.country ?? "India",
    });
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function saveSection(data: typeof perm, label: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data.street, city: data.city, state: data.state, pincode: data.pincode, country: data.country }),
      });
      if (res.ok) showToast(`${label} saved!`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AddressSection title="Add Permanent address" data={perm} setData={setPerm} onSave={() => saveSection(perm, "Permanent address")} saving={saving} />
      <AddressSection title="Add Present Address" data={pres} setData={setPres} onSave={() => saveSection(pres, "Present address")} saving={saving} />
    </div>
  );
}

function AddressSection({ title, data, setData, onSave, saving }: {
  title: string;
  data: { street: string; city: string; state: string; pincode: string; country: string };
  setData: (d: { street: string; city: string; state: string; pincode: string; country: string }) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-[15px] font-semibold text-[#111]">{title}</h3>
      <Field label="Street Address" value={data.street} onChange={(v) => setData({ ...data, street: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" value={data.city} onChange={(v) => setData({ ...data, city: v })} />
        <Field label="State" value={data.state} onChange={(v) => setData({ ...data, state: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Pincode" value={data.pincode} onChange={(v) => setData({ ...data, pincode: v })} />
        <Field label="Country" value={data.country} onChange={(v) => setData({ ...data, country: v })} />
      </div>
      <button onClick={onSave} disabled={saving}
        className="px-6 py-2 bg-gray-400 text-white text-[13px] font-medium rounded-lg hover:bg-gray-500 transition-all disabled:opacity-50">
        Update Now
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ACADEMIC DETAILS INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NIOS", "Other"];
const STREAMS_12 = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts", "Vocational", "Other"];
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const aCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/10 transition-all";

function AField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? `Enter ${label.toLowerCase()}`} className={aCls} />
    </div>
  );
}

function ASelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className={`${aCls} appearance-none`}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

interface Marks {
  class10_board: string; class10_school: string; class10_year: string;
  class10_percent: string; class10_total: string; class10_obtained: string;
  class12_board: string; class12_school: string; class12_year: string;
  class12_percent: string; class12_total: string; class12_obtained: string; class12_stream: string;
  grad_university: string; grad_college: string; grad_program: string;
  grad_year: string; grad_percent: string; grad_cgpa: string;
}
const EMPTY_MARKS: Marks = {
  class10_board: "", class10_school: "", class10_year: "", class10_percent: "", class10_total: "", class10_obtained: "",
  class12_board: "", class12_school: "", class12_year: "", class12_percent: "", class12_total: "", class12_obtained: "", class12_stream: "",
  grad_university: "", grad_college: "", grad_program: "", grad_year: "", grad_percent: "", grad_cgpa: "",
};

function AcademicInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [marks, setMarks] = useState<Marks>({ ...EMPTY_MARKS });
  const [saving, setSaving] = useState<"class10" | "class12" | "grad" | false>(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/marks`);
    const d = await res.json();
    setMarks({ ...EMPTY_MARKS, ...(d.marks ?? {}) });
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const upd = (k: keyof Marks, v: string) => setMarks(p => ({ ...p, [k]: v }));
  const f = (k: keyof Marks) => ({ value: marks[k], onChange: (v: string) => upd(k, v) });

  async function handleSaveSection(section: "class10" | "class12" | "grad") {
    setSaving(section);
    const sectionFields: Record<string, (keyof Marks)[]> = {
      class10: ["class10_board","class10_school","class10_year","class10_percent","class10_total","class10_obtained"],
      class12: ["class12_board","class12_school","class12_year","class12_percent","class12_total","class12_obtained","class12_stream"],
      grad:    ["grad_university","grad_college","grad_program","grad_year","grad_percent","grad_cgpa"],
    };
    const payload: Partial<Marks> = {};
    for (const key of sectionFields[section]) payload[key] = marks[key];
    try {
      const res = await fetch(`/api/student/${user?.id}/marks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) showToast(`${section === "class10" ? "Class 10" : section === "class12" ? "Class 12" : "Graduation"} details saved!`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-6">
      {/* Class 10 */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#111] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#e31e24] text-[18px]">school</span> Class 10th Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ASelect label="Board" {...f("class10_board")} options={BOARDS} />
          <AField  label="School Name" {...f("class10_school")} />
          <ASelect label="Passing Year" {...f("class10_year")} options={YEAR_OPTIONS} />
          <AField  label="Percentage %" {...f("class10_percent")} placeholder="e.g. 85.5" />
          <AField  label="Total Marks" {...f("class10_total")} placeholder="e.g. 500" />
          <AField  label="Marks Obtained" {...f("class10_obtained")} placeholder="e.g. 425" />
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" disabled={saving} onClick={() => handleSaveSection("class10")}
            className="px-6 py-2 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
            {saving === "class10" ? "Saving..." : "Save Class 10"}
          </button>
        </div>
      </div>

      {/* Class 12 */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#111] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#111] text-[18px]">workspace_premium</span> Class 12th Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ASelect label="Board" {...f("class12_board")} options={BOARDS} />
          <AField  label="School Name" {...f("class12_school")} />
          <ASelect label="Passing Year" {...f("class12_year")} options={YEAR_OPTIONS} />
          <ASelect label="Stream" {...f("class12_stream")} options={STREAMS_12} />
          <AField  label="Percentage %" {...f("class12_percent")} placeholder="e.g. 90.0" />
          <AField  label="Total Marks" {...f("class12_total")} placeholder="e.g. 500" />
          <AField  label="Marks Obtained" {...f("class12_obtained")} placeholder="e.g. 450" />
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" disabled={saving} onClick={() => handleSaveSection("class12")}
            className="px-6 py-2 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
            {saving === "class12" ? "Saving..." : "Save Class 12"}
          </button>
        </div>
      </div>

      {/* Graduation */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#111] flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">account_balance</span> Graduation Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AField  label="University" {...f("grad_university")} />
          <AField  label="College" {...f("grad_college")} />
          <AField  label="Program" {...f("grad_program")} placeholder="e.g. B.Tech CSE" />
          <ASelect label="Pass Year" {...f("grad_year")} options={YEAR_OPTIONS} />
          <AField  label="Percentage %" {...f("grad_percent")} placeholder="e.g. 75.0" />
          <AField  label="CGPA" {...f("grad_cgpa")} placeholder="e.g. 8.5" />
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" disabled={saving} onClick={() => handleSaveSection("grad")}
            className="px-6 py-2 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
            {saving === "grad" ? "Saving..." : "Save Graduation"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATES INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
function CertificatesInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [caption, setCaption]   = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs]         = useState<{ id: number; name: string; file_path: string; category_label: string; is_image: boolean }[]>([]);
  const [category, setCategory] = useState("other");
  const certRef = useRef<HTMLInputElement>(null);

  const CATEGORIES: Record<string, string> = {
    marksheet_10: "10th Marksheet", marksheet_12: "12th Marksheet",
    marksheet_grad: "Graduation Marksheet", id_proof: "ID Proof",
    photo: "Passport Photo", caste_cert: "Caste Certificate",
    income_cert: "Income Certificate", migration: "Migration Certificate",
    other: "Other Document",
  };

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/documents`);
    const d = await res.json();
    setDocs(d.documents ?? []);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload() {
    if (!selectedFile || !user?.id) { showToast("Please select a file first."); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("name", caption || selectedFile.name);
    fd.append("category", category);
    try {
      const res = await fetch(`/api/student/${user.id}/documents`, { method: "POST", body: fd });
      if (res.ok) {
        showToast("Certificate uploaded successfully!");
        setCaption(""); setSelectedFile(null);
        if (certRef.current) certRef.current.value = "";
        load();
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/student/${user?.id}/documents?docId=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      {/* Caption input */}
      <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-[#e31e24] text-xl font-bold">+</span>
        <input value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="add caption"
          className="flex-1 outline-none text-[14px] text-gray-600 bg-transparent" />
      </div>

      {/* Category select */}
      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none appearance-none">
          {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>

      {/* Upload area */}
      <div className="border border-gray-200 rounded-xl p-6 text-center space-y-4">
        <p className="text-[15px] font-semibold text-[#111]">Upload new document to your academic record</p>
        <div onClick={() => certRef.current?.click()}
          className="w-44 h-28 border-2 border-dashed border-gray-300 rounded-xl mx-auto flex flex-col items-center justify-center cursor-pointer hover:border-[#e31e24]/50 transition-colors bg-gray-50">
          <span className="text-3xl text-gray-300">+</span>
          <span className="text-[13px] text-gray-400">Add Image</span>
        </div>
        <input ref={certRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedFile(e.target.files?.[0] ?? null)} />
        <div className="inline-block bg-gray-100 border border-gray-200 rounded-md px-4 py-1.5 text-[13px] text-gray-500">
          {selectedFile ? selectedFile.name : "0 Files Selected"}
        </div>
        <br />
        <button onClick={handleUpload} disabled={uploading}
          className="px-8 py-2.5 bg-gray-400 text-white text-[13px] font-medium rounded-lg hover:bg-gray-500 transition-all disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Uploaded list */}
      {docs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Uploaded Certificates</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden relative group">
                {doc.is_image
                  ? <img src={doc.file_path} alt={doc.name} className="w-full h-24 object-cover" />
                  : <div className="w-full h-24 bg-gray-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-gray-300">description</span>
                    </div>
                }
                <div className="p-2">
                  <p className="text-[11px] text-gray-600 truncate">{doc.name}</p>
                  <p className="text-[10px] text-gray-400">{doc.category_label}</p>
                </div>
                <button onClick={() => handleDelete(doc.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-[#e31e24] text-white rounded text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTS INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const MAX = 1000;

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/profile`);
    const d = await res.json();
    setTitle(d.project_title ?? "");
    setDesc(d.projects ?? "");
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/student/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_title: title, projects: desc }),
      });
      if (res.ok) showToast("Project saved!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Form */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#111]">Update your project details</h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Project Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter project title here"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/10 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value.slice(0, MAX))}
            placeholder="Enter project description here"
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#111] bg-white outline-none focus:border-[#e31e24]/40 resize-vertical"
          />
        </div>
        <p className="text-[12px] text-gray-400">{MAX - desc.length} characters left</p>
        <div className="text-center">
          <button type="submit" disabled={saving}
            className="px-10 py-2.5 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS INNER TAB
// ══════════════════════════════════════════════════════════════════════════════
function SettingsInner({ user, showToast }: { user: Props["user"]; showToast: (m: string) => void }) {
  const [firstName, setFirstName]   = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState(user?.email ?? "");
  const [phone, setPhone]           = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/student/${user.id}/profile`);
    const d = await res.json();
    const parts = (d.name || user?.name || "").trim().split(" ");
    setFirstName(parts[0] ?? "");
    setMiddleName(parts.length > 2 ? parts.slice(1, -1).join(" ") : "");
    setLastName(parts.length > 1 ? parts[parts.length - 1] : "");
    setPhone(d.phone ?? "");
  }, [user?.id, user?.name]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (showPw && newPw !== confirmPw) { showToast("Passwords don't match"); return; }
    setSaving(true);
    try {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      await fetch(`/api/student/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, phone }),
      });
      if (showPw && newPw) {
        const res = await fetch(`/api/student/${user?.id}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "change_password", currentPassword: currentPw, newPassword: newPw }),
        });
        if (res.ok) { setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
        else { showToast("Password update failed"); setSaving(false); return; }
      }
      showToast("Settings saved!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter your first name" />
        <Field label="Middle Name" value={middleName} onChange={setMiddleName} placeholder="Enter your middle name" />
        <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter your last name" />
        <Field label="Email Address" value={user?.email ?? ""} disabled />
        <Field label="Register Contact Number" value={phone} onChange={setPhone} type="tel" placeholder="xxxx-xxx-xxx" />

        <button type="button" onClick={() => setShowPw(!showPw)}
          className="px-5 py-2 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all">
          Change Password
        </button>

        {showPw && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <Field label="Current Password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="Enter current password" />
            <Field label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="Enter new password" />
            <Field label="Confirm Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Confirm new password" />
          </div>
        )}

        <div className="text-center pt-2">
          <button type="submit" disabled={saving}
            className="px-10 py-2.5 bg-[#e31e24] text-white text-[13px] font-semibold rounded-lg hover:bg-[#c0191e] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — ProfileTab (Student Details page)
// ══════════════════════════════════════════════════════════════════════════════
export default function ProfileTab({ user }: Props) {
  const [activeTab, setActiveTab] = useState<InnerTab>("profile");
  const [toast, setToast]         = useState("");
  const [stats, setStats]         = useState({ total: 0, bookmarkCourse: 0, bookmarkCollege: 0, bookmarkBlog: 0, queries: 0 });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/student/${user.id}/applications`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/student/${user.id}/bookmarks`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/student/${user.id}/queries`).then(r => r.json()).catch(() => ({})),
    ]).then(([apps, bookmarks, queries]) => {
      setStats({
        total:           apps?.stats?.total          ?? 0,
        bookmarkCourse:  bookmarks?.courses?.length  ?? 0,
        bookmarkCollege: bookmarks?.colleges?.length ?? 0,
        bookmarkBlog:    bookmarks?.blogs?.length    ?? 0,
        queries:         queries?.total              ?? 0,
      });
    });
  }, [user?.id]);

  const name = user?.name ?? "Student";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Toast msg={toast} />

      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#111]">Dashboard</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Welcome back!</p>
      </div>

      {/* Top 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL APPLICATION"  value={stats.total} />
        <StatCard label="BOOKMARK COURSE"    value={stats.bookmarkCourse} />
        <StatCard label="BOOKMARK COLLEGE"   value={stats.bookmarkCollege} />
        <StatCard label="BOOKMARK BLOGS"     value={stats.bookmarkBlog} />
      </div>

      {/* Greeting + Total Queries row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
          <p className="text-[18px] font-semibold text-[#111]">Hi! {name}</p>
        </div>
        <StatCard label="TOTAL QUERIES" value={stats.queries} />
      </div>

      {/* Inner tab panel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {INNER_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "bg-[#e31e24] text-white border-[#e31e24]"
                  : "text-gray-600 border-transparent hover:text-[#e31e24]"
              }`}>
              {tab.label}
              <span className="material-symbols-outlined text-[14px] opacity-60">edit</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "profile"      && <ProfileInner      user={user} showToast={showToast} />}
          {activeTab === "address"      && <AddressInner      user={user} showToast={showToast} />}
          {activeTab === "academic"     && <AcademicInner     user={user} showToast={showToast} />}
          {activeTab === "certificates" && <CertificatesInner user={user} showToast={showToast} />}
          {activeTab === "projects"     && <ProjectsInner     user={user} showToast={showToast} />}
          {activeTab === "settings"     && <SettingsInner     user={user} showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}
