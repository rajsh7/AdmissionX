"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import AIRecommendTab from "./tabs/AIRecommendTab";

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
  | "counselling-forms" | "counseling" | "help-desk" | "ai-recommend";

interface NavItem { id: TabId; label: string; icon: string }

export default function StudentDashboardClient({ user, activated }: Props) {
  const [activeTab, setActiveTab]         = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showActivatedBanner, setShowActivatedBanner] = useState(!!activated);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab") as TabId | null;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/student/${user.id}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  function navigate(id: TabId) {
    setActiveTab(id);
    setSidebarOpen(false);
  }

  function renderTab() {
    switch (activeTab) {
      case "overview":               return <OverviewTab          user={user} navigate={(t) => navigate(t as TabId)} />;
      case "account-details":        return <ProfileTab           user={user} />;
      case "address":                return <AddressTab           user={user} />;
      case "academic-details":       return <MarksTab             user={user} />;
      case "academic-certificates":  return <DocumentsTab         user={user} />;
      case "projects":               return <ProjectsTab          user={user} />;
      case "account-settings":       return <SettingsTab          user={user} />;
      case "app-all":                return <ApplicationsTab      user={user} initialFilter="all" />;
      case "queries-all":            return <QueriesTab           user={user} filter="all" />;
      case "bookmark-colleges":      return <BookmarksTab         user={user} initialType="college" />;
      case "qa-questions":           return <QATab                user={user} type="questions" />;
      case "counselling-forms":      return <CounsellingFormsTab  user={user} />;
      case "help-desk":              return <HelpDeskTab          user={user} />;
      case "ai-recommend":           return <AIRecommendTab        user={user} navigate={navigate} />;
      default:                       return <OverviewTab          user={user} navigate={(t) => navigate(t as TabId)} />;
    }
  }

  function SidebarContent() {
    const MENU_ITEMS: NavItem[] = [
      { id: "overview",          label: "Dashboard",                  icon: "bar_chart"    },
      { id: "account-details",   label: "Student Details",            icon: "person"       },
      { id: "ai-recommend",      label: "AI Recommendations",         icon: "auto_awesome" },
      { id: "app-all",           label: "Application",                icon: "description"  },
      { id: "queries-all",       label: "Queries",                    icon: "forum"        },
      { id: "bookmark-colleges", label: "Bookmarks",                  icon: "bookmarks"    },
      { id: "qa-questions",      label: "Question | Answer | Comment",icon: "rate_review"  },
      { id: "counselling-forms", label: "Counseling Forms",           icon: "assignment"   },
      { id: "help-desk",         label: "Help Desk",                  icon: "help_center"  },
    ];

    return (
      <div className="flex flex-col h-full bg-[#333333] text-white font-sans">
        {/* Profile Card */}
        <div className="p-5 space-y-4">
          <div className="bg-[#333333] rounded-xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 overflow-hidden ${user?.avatar ? "" : "border-[8px] border-[#f5f5f5] bg-white"}`}>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="w-full py-2.5 bg-[#8b8b8b] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#777] transition-colors uppercase tracking-wider shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploadingAvatar ? "Uploading..." : "Upload New Profile image"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
          />
        </div>

        {/* Main Menu Label */}
        <div className="px-6 py-4 mt-2">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-[1.5px]">MAIN MENU</p>
        </div>

        {/* Nav List */}
        <nav className="flex-1 px-0 space-y-0 overflow-y-auto no-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-medium transition-all border-l-[4px] ${
                  isActive
                    ? "bg-[#e31e24] text-white border-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white border-transparent"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-white/60"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
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
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#333] hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
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
                className="flex items-center gap-1 px-4 py-2 text-[16px] font-normal text-slate-700 hover:text-primary transition-colors whitespace-nowrap">
                {link.label}
                {link.hasSub && <span className="material-symbols-outlined text-[18px] text-slate-300">expand_more</span>}
              </Link>
            ))}
          </nav>

          <div className="flex items-center relative">
            <button onClick={() => setShowAccountMenu(p => !p)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/10 active:scale-95">
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

        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-[70] lg:static w-[280px] h-full shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <SidebarContent />
        </aside>

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

function MobileBottomNav({ activeTab, navigate }: { activeTab: TabId; navigate: (id: TabId) => void }) {
  const [showMore, setShowMore] = useState(false);

  const primary: { id: TabId; label: string; icon: string }[] = [
    { id: "overview",          label: "Home",    icon: "dashboard"   },
    { id: "app-all",           label: "Apps",    icon: "description" },
    { id: "account-details",   label: "Profile", icon: "badge"       },
    { id: "bookmark-colleges", label: "Saved",   icon: "bookmarks"   },
  ];

  const overflow: { id: TabId; label: string; icon: string }[] = [
    { id: "account-details",       label: "Account",     icon: "manage_accounts"   },
    { id: "address",               label: "Address",     icon: "location_on"       },
    { id: "academic-details",      label: "Marks",       icon: "grade"             },
    { id: "academic-certificates", label: "Docs",        icon: "workspace_premium" },
    { id: "projects",              label: "Projects",    icon: "work"              },
    { id: "account-settings",      label: "Settings",    icon: "settings"          },
    { id: "queries-all",           label: "Queries",     icon: "help_outline"      },
    { id: "qa-questions",          label: "Q&A",         icon: "forum"             },
    { id: "counselling-forms",     label: "Counselling", icon: "assignment"        },
    { id: "help-desk",             label: "Help",        icon: "help_center"       },
    { id: "ai-recommend",          label: "AI Match",    icon: "auto_awesome"      },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {primary.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { navigate(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${isActive ? "text-[#e31e24]" : "text-gray-400"}`}>
                  <span className="material-symbols-outlined text-[24px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
            <button onClick={() => setShowMore(s => !s)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[58px] ${showMore ? "text-[#e31e24]" : "text-gray-400"}`}>
              <span className="material-symbols-outlined text-[24px]">{showMore ? "close" : "more_horiz"}</span>
              <span className="text-[9px] font-medium tracking-wide">More</span>
            </button>
          </div>
        </div>
      </div>

      {showMore && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-[70px] left-0 right-0 z-50 lg:hidden px-4 pb-2">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {overflow.map((item) => (
                <button key={item.id} onClick={() => { navigate(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === item.id ? "bg-red-50 text-[#e31e24]" : "text-gray-500 hover:bg-gray-50"}`}>
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
