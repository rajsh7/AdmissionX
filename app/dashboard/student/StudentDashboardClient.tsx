"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OverviewTab from "./tabs/OverviewTab";
import ProfileTab from "./tabs/ProfileTab";
import AddressTab from "./tabs/AddressTab";
import MarksTab from "./tabs/MarksTab";
import DocumentsTab from "./tabs/DocumentsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import SettingsTab from "./tabs/SettingsTab";
import ApplicationsTab from "./tabs/ApplicationsTab";
import QueriesTab from "./tabs/QueriesTab";
import BookmarksTab from "./tabs/BookmarksTab";
import QATab from "./tabs/QATab";
import CounsellingFormsTab from "./tabs/CounsellingFormsTab";
import CounselingTab from "./tabs/CounselingTab";
import HelpDeskTab from "./tabs/HelpDeskTab";
import ProfileViewTab from "./tabs/ProfileViewTab";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: number; name: string; email: string } | null;
}

type TabId =
  | "overview"
  | "account-details" | "address" | "academic-details"
  | "academic-certificates" | "projects" | "account-settings"
  | "app-accepted" | "app-pending" | "app-rejected" | "app-all"
  | "queries-replied" | "queries-pending" | "queries-all"
  | "bookmark-courses" | "bookmark-colleges" | "bookmark-blogs"
  | "qa-questions" | "qa-answers" | "qa-comments" | "qa-reviews"
  | "counselling-forms" | "counseling" | "help-desk" | "profile-view";

interface NavChild { id: TabId; label: string; icon: string }
interface NavGroup  { id: string; label: string; icon: string; children: NavChild[] }

// ── Navigation definition ─────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    id: "student-details",
    label: "Student Details",
    icon: "person",
    children: [
      { id: "account-details",        label: "Account Details",        icon: "manage_accounts"    },
      { id: "address",                label: "Address",                icon: "location_on"        },
      { id: "academic-details",       label: "Academic Details",       icon: "grade"              },
      { id: "academic-certificates",  label: "Academic Certificates",  icon: "workspace_premium"  },
      { id: "projects",               label: "Projects",               icon: "work"               },
      { id: "account-settings",       label: "Account Settings",       icon: "settings"           },
    ],
  },
  {
    id: "application",
    label: "Application",
    icon: "description",
    children: [
      { id: "app-accepted", label: "Accepted",  icon: "check_circle" },
      { id: "app-pending",  label: "Pending",   icon: "pending"      },
      { id: "app-rejected", label: "Rejected",  icon: "cancel"       },
      { id: "app-all",      label: "View All",  icon: "list"         },
    ],
  },
  {
    id: "queries",
    label: "Queries",
    icon: "help_outline",
    children: [
      { id: "queries-replied", label: "Replied",  icon: "mark_chat_read" },
      { id: "queries-pending", label: "Pending",  icon: "pending"        },
      { id: "queries-all",     label: "View All", icon: "list"           },
    ],
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    icon: "bookmarks",
    children: [
      { id: "bookmark-courses",  label: "Bookmark Courses", icon: "menu_book"       },
      { id: "bookmark-colleges", label: "Bookmark College", icon: "account_balance" },
      { id: "bookmark-blogs",    label: "Bookmark Blogs",   icon: "article"         },
    ],
  },
  {
    id: "qa",
    label: "Question / Answer / Comment",
    icon: "forum",
    children: [
      { id: "qa-questions", label: "Question",     icon: "quiz"            },
      { id: "qa-answers",   label: "Answer",       icon: "question_answer" },
      { id: "qa-comments",  label: "Comments",     icon: "comment"         },
      { id: "qa-reviews",   label: "Your Reviews", icon: "rate_review"     },
    ],
  },
];

const STANDALONE: { id: TabId; label: string; icon: string }[] = [
  { id: "counselling-forms", label: "Counselling Forms", icon: "assignment"   },
  { id: "counseling",        label: "Counseling",        icon: "support_agent"},
  { id: "help-desk",         label: "Help Desk",         icon: "help_center"  },
  { id: "profile-view",      label: "Profile View",      icon: "badge"        },
];

// helper – which group does a tab belong to?
function getGroupId(tab: TabId): string | null {
  for (const g of NAV_GROUPS) {
    if (g.children.some((c) => c.id === tab)) return g.id;
  }
  return null;
}

// helper – human-readable breadcrumb label
function getBreadcrumb(tab: TabId): { group: string | null; label: string } {
  for (const g of NAV_GROUPS) {
    const child = g.children.find((c) => c.id === tab);
    if (child) return { group: g.label, label: child.label };
  }
  const standalone = STANDALONE.find((s) => s.id === tab);
  if (standalone) return { group: null, label: standalone.label };
  return { group: null, label: "Dashboard" };
}

// ══════════════════════════════════════════════════════════════════════════════
export default function StudentDashboardClient({ user }: Props) {
  const [activeTab, setActiveTab]     = useState<TabId>("overview");
  const [openGroups, setOpenGroups]   = useState<Set<string>>(new Set(["student-details"]));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-expand the group that owns the active tab
  useEffect(() => {
    const gid = getGroupId(activeTab);
    if (gid) setOpenGroups((prev) => new Set([...prev, gid]));
  }, [activeTab]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function navigate(id: TabId) {
    setActiveTab(id);
    setSidebarOpen(false);
  }

  const initials = (user?.name ?? "ST")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const bc = getBreadcrumb(activeTab);

  // ── Tab renderer ──────────────────────────────────────────────────────────
  function renderTab() {
    switch (activeTab) {
      case "overview":               return <OverviewTab           user={user} />;
      case "account-details":        return <ProfileTab            user={user} />;
      case "address":                return <AddressTab            user={user} />;
      case "academic-details":       return <MarksTab              user={user} />;
      case "academic-certificates":  return <DocumentsTab          user={user} />;
      case "projects":               return <ProjectsTab           user={user} />;
      case "account-settings":       return <SettingsTab           user={user} />;
      case "app-accepted":           return <ApplicationsTab       user={user} initialFilter="enrolled"     />;
      case "app-pending":            return <ApplicationsTab       user={user} initialFilter="pending"      />;
      case "app-rejected":           return <ApplicationsTab       user={user} initialFilter="rejected"     />;
      case "app-all":                return <ApplicationsTab       user={user} initialFilter="all"          />;
      case "queries-replied":        return <QueriesTab            user={user} filter="replied"  />;
      case "queries-pending":        return <QueriesTab            user={user} filter="pending"  />;
      case "queries-all":            return <QueriesTab            user={user} filter="all"      />;
      case "bookmark-courses":       return <BookmarksTab          user={user} initialType="course"  />;
      case "bookmark-colleges":      return <BookmarksTab          user={user} initialType="college" />;
      case "bookmark-blogs":         return <BookmarksTab          user={user} initialType="blog"    />;
      case "qa-questions":           return <QATab                 user={user} type="questions" />;
      case "qa-answers":             return <QATab                 user={user} type="answers"   />;
      case "qa-comments":            return <QATab                 user={user} type="comments"  />;
      case "qa-reviews":             return <QATab                 user={user} type="reviews"   />;
      case "counselling-forms":      return <CounsellingFormsTab   user={user} />;
      case "counseling":             return <CounselingTab         user={user} />;
      case "help-desk":              return <HelpDeskTab           user={user} />;
      case "profile-view":           return <ProfileViewTab        user={user} />;
      default:                       return <OverviewTab           user={user} />;
    }
  }

  // ── Sidebar inner content ─────────────────────────────────────────────────
  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-[17px] border-b border-green-50 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md shadow-green-200 flex-shrink-0">
              <span className="text-white font-black text-sm tracking-tight">ADX</span>
            </div>
            <div>
              <p className="font-black text-slate-900 text-[15px] tracking-tight leading-tight">AdmissionX</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Student Portal</p>
            </div>
          </Link>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">

          {/* Dashboard home */}
          <button
            onClick={() => navigate("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
              activeTab === "overview"
                ? "bg-green-50 text-green-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {activeTab === "overview" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-r-full" />
            )}
            <span
              className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                activeTab === "overview" ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
              }`}
              style={activeTab === "overview" ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              dashboard
            </span>
            <span className="truncate">Dashboard</span>
            {activeTab === "overview" && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            )}
          </button>

          {/* Accordion groups */}
          {NAV_GROUPS.map((group) => {
            const isOpen       = openGroups.has(group.id);
            const hasActive    = group.children.some((c) => c.id === activeTab);
            return (
              <div key={group.id}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    hasActive
                      ? "text-green-700 bg-green-50/60"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] flex-shrink-0 ${
                      hasActive ? "text-green-600" : "text-slate-400"
                    }`}
                    style={hasActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {group.icon}
                  </span>
                  <span className="flex-1 text-left truncate text-[13px]">{group.label}</span>
                  <span
                    className={`material-symbols-outlined text-[16px] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } ${hasActive ? "text-green-500" : "text-slate-300"}`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Children */}
                {isOpen && (
                  <div className="ml-4 pl-3 border-l-2 border-green-100 mt-0.5 mb-1 space-y-0.5">
                    {group.children.map((child) => {
                      const isActive = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => navigate(child.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-150 relative group ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green-500 rounded-r-full" />
                          )}
                          <span
                            className={`material-symbols-outlined text-[16px] flex-shrink-0 ${
                              isActive ? "text-green-600" : "text-slate-350 group-hover:text-slate-500"
                            }`}
                            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {child.icon}
                          </span>
                          <span className="truncate">{child.label}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Divider */}
          <div className="mx-3 my-2 border-t border-dashed border-slate-200" />

          {/* Standalone items */}
          {STANDALONE.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-r-full" />
                )}
                <span
                  className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                    isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Back to site */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 group"
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0 text-slate-300 group-hover:text-red-400 transition-colors">
                logout
              </span>
              <span>Back to Site</span>
            </Link>
          </div>
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-green-50 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-black text-sm">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user?.name ?? "Student"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email ?? ""}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-green-500 transition-colors flex-shrink-0">
              more_vert
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen bg-[#f4fdf6] font-display overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[245px] bg-white border-r border-green-100
          flex flex-col shadow-xl lg:shadow-sm
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="bg-white border-b border-green-100 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm z-30">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-green-50 text-slate-500 hover:text-green-700 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-shrink-0 min-w-0">
            <Link href="/" className="text-slate-400 hover:text-green-600 transition-colors font-medium hidden sm:block whitespace-nowrap">
              Application
            </Link>
            <span className="material-symbols-outlined text-[13px] text-slate-300 hidden sm:block">chevron_right</span>
            {bc.group && (
              <>
                <span className="text-slate-400 font-medium hidden md:block whitespace-nowrap">{bc.group}</span>
                <span className="material-symbols-outlined text-[13px] text-slate-300 hidden md:block">chevron_right</span>
              </>
            )}
            <span className="font-bold text-slate-800 truncate">{bc.label}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:block mx-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search colleges, courses..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {/* Student ID */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <span className="material-symbols-outlined text-green-600 text-[15px]">badge</span>
              <span className="text-xs font-bold text-green-700">ADX-{String(user?.id ?? 0).padStart(5, "0")}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-white" />
            </button>

            {/* Light mode */}
            <button className="p-2 rounded-xl hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors hidden sm:block">
              <span className="material-symbols-outlined text-[22px]">light_mode</span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-sm cursor-pointer ml-1">
              <span className="text-white font-black text-xs">{initials}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6 pb-24 lg:pb-8">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav activeTab={activeTab} navigate={navigate} />
    </div>
  );
}

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
function MobileBottomNav({
  activeTab,
  navigate,
}: {
  activeTab: TabId;
  navigate: (id: TabId) => void;
}) {
  const [showMore, setShowMore] = useState(false);

  const primary: { id: TabId; label: string; icon: string }[] = [
    { id: "overview",      label: "Home",     icon: "dashboard"     },
    { id: "app-all",       label: "Apps",     icon: "description"   },
    { id: "profile-view",  label: "Profile",  icon: "badge"         },
    { id: "bookmark-colleges", label: "Saved", icon: "bookmarks"   },
  ];

  const overflow: { id: TabId; label: string; icon: string }[] = [
    { id: "account-details",       label: "Account",    icon: "manage_accounts"   },
    { id: "address",               label: "Address",    icon: "location_on"       },
    { id: "academic-details",      label: "Marks",      icon: "grade"             },
    { id: "academic-certificates", label: "Docs",       icon: "workspace_premium" },
    { id: "projects",              label: "Projects",   icon: "work"              },
    { id: "account-settings",      label: "Settings",   icon: "settings"          },
    { id: "queries-all",           label: "Queries",    icon: "help_outline"      },
    { id: "qa-questions",          label: "Q&A",        icon: "forum"             },
    { id: "counselling-forms",     label: "Counselling",icon: "assignment"        },
    { id: "counseling",            label: "Counseling", icon: "support_agent"     },
    { id: "help-desk",             label: "Help",       icon: "help_center"       },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
        <div className="bg-white/95 backdrop-blur-xl border-t border-green-100 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {primary.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${
                    isActive ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px] transition-transform"
                    style={isActive ? { fontVariationSettings: "'FILL' 1", transform: "scale(1.1)" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-green-500" />}
                </button>
              );
            })}

            <button
              onClick={() => setShowMore((s) => !s)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${
                showMore ? "text-green-600" : "text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {showMore ? "close" : "more_horiz"}
              </span>
              <span className="text-[9px] font-bold tracking-wide">More</span>
            </button>
          </div>
        </div>
      </div>

      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 z-50 lg:hidden px-4 pb-2">
            <div className="bg-white rounded-2xl shadow-2xl border border-green-100 p-4 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {overflow.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.id); setShowMore(false); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      isActive ? "bg-green-50 text-green-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[9px] font-bold text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
