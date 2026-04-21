"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: string | number; name: string; email: string; avatar?: string } | null;
  activated?: boolean;
}

type TabId =
  | "overview"
  | "account-details" | "address" | "academic-details"
  | "academic-certificates" | "projects" | "account-settings"
  | "app-accepted" | "app-pending" | "app-rejected" | "app-all"
  | "queries-replied" | "queries-pending" | "queries-all"
  | "bookmark-courses" | "bookmark-colleges" | "bookmark-blogs"
  | "qa-questions" | "qa-answers" | "qa-comments" | "qa-reviews"
  | "counselling-forms" | "counseling" | "help-desk";

interface NavItem { id: TabId; label: string; icon: string; groupId?: string }

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboardClient({ user, activated }: Props) {
  const [activeTab, setActiveTab]     = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [showActivatedBanner, setShowActivatedBanner] = useState(!!activated);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function navigate(id: TabId) {
    setActiveTab(id);
    setSidebarOpen(false);
  }

  const initials = (user?.name ?? "ST")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  // ── Tab renderer ──────────────────────────────────────────────────────────
  function renderTab() {
    switch (activeTab) {
      case "overview":               return <OverviewTab           user={user} navigate={(tab: string) => navigate(tab as TabId)} />;
      case "account-details":        return <ProfileTab            user={user} />;
      case "address":                return <AddressTab            user={user} />;
      case "academic-details":       return <MarksTab              user={user} />;
      case "academic-certificates":  return <DocumentsTab          user={user} />;
      case "projects":               return <ProjectsTab           user={user} />;
      case "account-settings":       return <SettingsTab           user={user} />;
      case "app-all":                return <ApplicationsTab       user={user} initialFilter="all"          />;
      case "queries-all":            return <QueriesTab            user={user} filter="all"      />;
      case "bookmark-colleges":      return <BookmarksTab          user={user} initialType="college" />;
      case "qa-questions":           return <QATab                 user={user} type="questions" />;
      case "counselling-forms":      return <CounsellingFormsTab   user={user} />;
      case "help-desk":              return <HelpDeskTab           user={user} />;
      default:                       return <OverviewTab           user={user} navigate={(tab: string) => navigate(tab as TabId)} />;
    }
  }

  // ── Sidebar Inner ──────────────────────────────────────────────────────────
  function SidebarContent() {
    const MENU_ITEMS: NavItem[] = [
      { id: "overview",          label: "Dashboard",                  icon: "bar_chart"       },
      { id: "account-details",   label: "Student Details",            icon: "person"          },
      { id: "app-all",           label: "Application",                icon: "description"     },
      { id: "queries-all",       label: "Queries",                    icon: "forum"           },
      { id: "bookmark-colleges", label: "Bookmarks",                  icon: "bookmarks"       },
      { id: "qa-questions",      label: "Question | Answer | Comment",icon: "rate_review"     },
      { id: "counselling-forms", label: "Counseling Forms",           icon: "assignment"      },
      { id: "help-desk",         label: "Help Desk",                  icon: "help_center"     },
    ];

    return (
      <div className="flex flex-col h-full bg-[#333333] text-white font-sans transition-all duration-300">
        {/* Profile Card Section */}
        <div className="p-5 space-y-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full border-[8px] border-[#f5f5f5] flex items-center justify-center bg-white mb-4 relative overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-[54px] text-[#ddd]">photo_camera</span>
              )}
            </div>
            <p className="text-[13px] font-semibold text-[#555] text-center leading-tight mb-1">
              {user?.name ?? "Student"}
            </p>
            <p className="text-[11px] text-gray-400 text-center truncate max-w-full px-2">
              {user?.email ?? ""}
            </p>
          </div>
          <button className="w-full py-2.5 bg-[#8b8b8b] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#777] transition-colors uppercase tracking-wider shadow-md">
            Upload New Profile image
          </button>
        <div className={`p-5 space-y-4 ${collapsed ? "px-2" : "px-5"}`}>
          <div className="flex flex-col items-center">
            <div className={`rounded-full border-[4px] border-white/20 flex items-center justify-center bg-white/10 relative overflow-hidden transition-all duration-300 ${collapsed ? "w-12 h-12 mb-0" : "w-28 h-28 mb-3"}`}>
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className={`material-symbols-outlined text-white/30 transition-all ${collapsed ? "text-[24px]" : "text-[54px]"}`}>photo_camera</span>
              )}
            </div>
            {!collapsed && (
              <>
                {!photo && (
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-tight text-center leading-tight mb-2">
                    IMAGE NOT AVAILABLE
                  </p>
                )}
                {photo && (
                  <p className="text-[12px] font-semibold text-white/70 truncate max-w-[160px] text-center mb-1">{user?.name}</p>
                )}
              </>
            )}
          </div>
          {!collapsed && (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full py-2.5 bg-[#8b8b8b] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#777] transition-colors uppercase tracking-wider shadow-md disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload New Profile image"}
              </button>
            </>
          )}
        </div>

        {/* Main Menu Label + Toggle */}
        <div className={`px-6 py-4 mt-2 transition-all flex items-center ${collapsed ? "justify-center px-0" : "justify-between"}`}>
          {!collapsed && (
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-[1.5px]">MAIN MENU</p>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {collapsed ? "menu" : "menu_open"}
            </span>
          </button>
        </div>

        {/* Flat Nav List */}
        <nav className="flex-1 px-0 space-y-0 overflow-y-auto no-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.label : ""}
                className={`
                  w-full flex items-center gap-4 py-4 text-[14px] font-medium transition-all border-l-[4px]
                  ${collapsed ? "justify-center px-0 p-3" : "px-6"}
                  ${isActive
                    ? "bg-[#e31e24] text-white border-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white border-transparent"
                  }
                `}
              >
                <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive ? "text-white" : "text-white/60"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f1f2f6] overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-[80px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#333] hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>

          <Link href="/" className="shrink-0">
            <img src="/admissionx-logo.png" alt="AdmissionX logo" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-10">
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { label: "Home", href: "/" },
              { label: "Colleges", href: "/top-colleges" },
              { label: "Top University", href: "/top-university" },
              { label: "Top Courses", href: "/careers-courses" },
              { label: "Study Abroad", href: "/study-abroad" },
              { label: "More", href: "#", hasSub: true },
            ].map((link) => (
              <Link key={link.label} href={link.href}
                className="flex items-center gap-1 px-4 py-2 text-[16px] font-normal text-slate-700 hover:text-primary transition-colors whitespace-nowrap"
              >
                {link.label}
                {link.hasSub && <span className="material-symbols-outlined text-[18px] text-slate-300">expand_more</span>}
              </Link>
            ))}
          </nav>

          <div className="flex items-center relative">
            <button
              onClick={() => setShowAccountMenu(p => !p)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/10 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span className="text-[14px] font-normal">{user?.name?.split(" ")[0] ?? "Account"}</span>
              <span className="material-symbols-outlined text-[16px] text-white/70">expand_more</span>
            </button>
            {showAccountMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-[13px] font-bold text-[#222] truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { navigate("account-details"); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>My Profile
                  </button>
                  <button onClick={() => { navigate("account-settings"); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">settings</span>Settings
                  </button>
                  <div className="border-t border-gray-50" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Email Activated Banner */}
        {showActivatedBanner && (
          <div className="fixed top-[80px] left-0 right-0 z-50 flex items-center justify-between gap-3 px-6 py-3 bg-emerald-500 text-white text-sm font-semibold shadow-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Your email has been verified! Welcome to AdmissionX, {user?.name?.split(" ")[0] ?? "Student"}.
            </div>
            <button onClick={() => setShowActivatedBanner(false)} className="shrink-0 hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar ASIDE */}
        <aside className={`
          fixed inset-y-0 left-0 z-[70] lg:static h-full shadow-2xl lg:shadow-none
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[80px]" : "w-[280px]"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 student-dashboard-scroll bg-[#f8f9fa] relative">
          <main>
            <div className="p-10 max-w-[1600px] mx-auto">
              {renderTab()}
            </div>
          </main>
        </div>
      </div>

      <div className="lg:hidden">
        <MobileBottomNav activeTab={activeTab} navigate={navigate} />
      </div>
    </div>
  );
}

function MobileBottomNav({
  activeTab,
  navigate,
}: {
  activeTab: TabId;
  navigate: (id: TabId) => void;
}) {
  const [showMore, setShowMore] = useState(false);

  const primary: { id: TabId; label: string; icon: string }[] = [
    { id: "overview",          label: "Home",  icon: "dashboard"   },
    { id: "app-all",           label: "Apps",  icon: "description" },
    { id: "account-details",   label: "Profile", icon: "badge"     },
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
    { id: "help-desk",             label: "Help",       icon: "help_center"       },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {primary.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${
                    isActive ? "text-[#e31e24]" : "text-gray-400"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowMore((s) => !s)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${
                showMore ? "text-[#e31e24]" : "text-gray-400"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {showMore ? "close" : "more_horiz"}
              </span>
              <span className="text-[9px] font-medium tracking-wide">More</span>
            </button>
          </div>
        </div>
      </div>

      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-[70px] left-0 right-0 z-50 lg:hidden px-4 pb-2">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {overflow.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    activeTab === item.id ? "bg-red-50 text-[#e31e24]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
