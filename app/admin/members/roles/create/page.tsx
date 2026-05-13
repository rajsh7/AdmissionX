"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ALL_PAGES = [
  { path: "/admin/dashboard",                   label: "Dashboard" },
  { path: "/admin/members/registrations",        label: "Registrations" },
  { path: "/admin/members/roles",                label: "Roles & Users" },
  { path: "/admin/members/status",               label: "Status" },
  { path: "/admin/students",                     label: "Student Profiles" },
  { path: "/admin/colleges",                     label: "College Profiles" },
  { path: "/admin/applications",                 label: "Applications" },
  { path: "/admin/payment",                      label: "Payments" },
  { path: "/admin/payment/transactions",         label: "Transactions" },
  { path: "/admin/ads/management",               label: "ADS Management" },
  { path: "/admin/ads/colleges-list",            label: "ADS Colleges List" },
  { path: "/admin/analytics/transactions",       label: "Transaction Analytics" },
  { path: "/admin/analytics/website",            label: "Website Metrics" },
  { path: "/admin/blogs",                        label: "Blogs" },
  { path: "/admin/news",                         label: "News" },
  { path: "/admin/media",                        label: "Media" },
  { path: "/admin/pages",                        label: "Page Content" },
  { path: "/admin/seo",                          label: "SEO Content" },
  { path: "/admin/website-content",              label: "Website Content" },
  { path: "/admin/streams",                      label: "Career Streams" },
  { path: "/admin/courses",                      label: "Career Courses" },
  { path: "/admin/academic",                     label: "Academic / Education" },
  { path: "/admin/exams",                        label: "Examinations" },
  { path: "/admin/queries",                      label: "Queries" },
  { path: "/admin/subscribe",                    label: "Subscribers" },
  { path: "/admin/testimonials",                 label: "Testimonials" },
  { path: "/admin/reports",                      label: "Reports" },
  { path: "/admin/other-info",                   label: "Other Information" },
  { path: "/admin/profile",                      label: "My Profile" },
];

const BADGE_OPTIONS = [
  { label: "Blue",    value: "bg-blue-100 text-blue-700" },
  { label: "Green",   value: "bg-emerald-100 text-emerald-700" },
  { label: "Purple",  value: "bg-purple-100 text-purple-700" },
  { label: "Orange",  value: "bg-orange-100 text-orange-700" },
  { label: "Red",     value: "bg-red-100 text-red-700" },
  { label: "Slate",   value: "bg-slate-100 text-slate-600" },
];

const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-2xl text-sm font-medium bg-white focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all placeholder:text-slate-300 text-slate-700";
const labelCls = "block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5";

export default function CreateAdminUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Role fields
  const [roleLabel, setRoleLabel] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [badgeColor, setBadgeColor] = useState(BADGE_OPTIONS[0].value);
  const [accessMode, setAccessMode] = useState<"whitelist" | "blacklist">("whitelist");
  const [selectedPages, setSelectedPages] = useState<string[]>(["/admin/dashboard", "/admin/profile"]);

  function togglePage(path: string) {
    setSelectedPages(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  }

  function selectAll() { setSelectedPages(ALL_PAGES.map(p => p.path)); }
  function clearAll() { setSelectedPages([]); }

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    setPassword(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
    setShowPass(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !roleLabel) {
      setError("Name, email, password and role name are required.");
      return;
    }
    if (accessMode === "whitelist" && selectedPages.length === 0) {
      setError("Please select at least one page to allow access.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, mobile, password,
          roleLabel, roleDesc, badgeColor, accessMode,
          allowedPaths: accessMode === "whitelist" ? selectedPages : [],
          blockedPaths: accessMode === "blacklist" ? selectedPages : [],
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create user."); return; }
      setSuccess(`Admin user "${name}" created successfully! Login credentials sent to ${email}.`);
      setTimeout(() => router.push("/admin/members/roles"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Link href="/admin/members/roles" className="flex items-center justify-center w-fit h-fit gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none">Create Admin User</h1>
          <p className="text-sm text-slate-500 mt-1">Define a custom role with specific page access, then create the user.</p>
        </div>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">{error}</div>}
      {success && <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: User Details ── */}
          <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-700 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">person</span>
                User Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="e.g. Email adress" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mobile Number</label>
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="e.g. XXXXXXXXX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required minLength={8}
                        placeholder="Min. 8 characters"
                        className={inputCls + " pr-10"}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">{showPass ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                    <button type="button" onClick={generatePassword} className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition-colors whitespace-nowrap">
                      Generate
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">This password will be emailed to the user.</p>
                </div>
              </div>
            </div>

            {/* ── Buttons at bottom of left column ── */}
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={loading} className="w-full h-11 bg-[#FF3C3C] text-white text-sm font-bold rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : "Create Admin User"}
              </button>
              <Link href="/admin/members/roles" className="w-full h-11 flex items-center justify-center border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-colors bg-white">
                Cancel
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Role Definition ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-700 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#FF3C3C]">manage_accounts</span>
                Role Definition
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Role Name *</label>
                  <input value={roleLabel} onChange={e => setRoleLabel(e.target.value)} required placeholder="e.g. Content Manager" className={inputCls} />
                  <p className="text-[10px] text-slate-400 mt-1">Display name for this role.</p>
                </div>
                <div>
                  <label className={labelCls}>Badge Color</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {BADGE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBadgeColor(opt.value)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all ${opt.value} ${badgeColor === opt.value ? "border-slate-800 scale-110" : "border-transparent"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={labelCls}>Role Description</label>
                  <input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="e.g. Can manage blogs and news only" className={inputCls} />
                </div>
              </div>

              {/* Access Mode */}
              <div className="mb-5">
                <label className={labelCls}>Access Mode</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${accessMode === "whitelist" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <input type="radio" checked={accessMode === "whitelist"} onChange={() => setAccessMode("whitelist")} className="mt-0.5 accent-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Whitelist — Allow only selected</p>
                      <p className="text-xs text-slate-400">User can ONLY access pages ticked below.</p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${accessMode === "blacklist" ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <input type="radio" checked={accessMode === "blacklist"} onChange={() => setAccessMode("blacklist")} className="mt-0.5 accent-red-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Blacklist — Block selected</p>
                      <p className="text-xs text-slate-400">User can access everything EXCEPT pages ticked below.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Page Access Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + " mb-0"}>
                    {accessMode === "whitelist" ? "Pages to Allow" : "Pages to Block"}
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-[11px] font-bold text-emerald-600 hover:underline">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" onClick={clearAll} className="text-[11px] font-bold text-red-500 hover:underline">Clear All</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_PAGES.map(page => (
                    <label key={page.path} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${selectedPages.includes(page.path) ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}>
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.path)}
                        onChange={() => togglePage(page.path)}
                        className="accent-emerald-600 flex-shrink-0"
                      />
                      <span className="truncate text-[12px]">{page.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
