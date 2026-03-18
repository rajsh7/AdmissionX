"use client";

import { useState } from "react";
import Header from "../../components/Header";
import OverviewTab from "./tabs/OverviewTab";
import ApplicationsTab from "./tabs/ApplicationsTab";
import ApplyTab from "./tabs/ApplyTab";
import ProfileTab from "./tabs/ProfileTab";
import BookmarksTab from "./tabs/BookmarksTab";
import DocumentsTab from "./tabs/DocumentsTab";
import MarksTab from "./tabs/MarksTab";
import SettingsTab from "./tabs/SettingsTab";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: number; name: string; email: string } | null;
}

type TabId =
  | "overview"
  | "applications"
  | "apply"
  | "profile"
  | "bookmarks"
  | "documents"
  | "marks"
  | "settings";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: string; mobileLabel: string }[] =
  [
    {
      id: "overview",
      label: "Overview",
      icon: "dashboard",
      mobileLabel: "Home",
    },
    {
      id: "applications",
      label: "My Applications",
      icon: "description",
      mobileLabel: "Apps",
    },
    {
      id: "apply",
      label: "Apply & Pay",
      icon: "payments",
      mobileLabel: "Apply",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: "person",
      mobileLabel: "Profile",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: "bookmarks",
      mobileLabel: "Saved",
    },
    {
      id: "documents",
      label: "Documents",
      icon: "folder",
      mobileLabel: "Docs",
    },
    {
      id: "marks",
      label: "Academic Marks",
      icon: "grade",
      mobileLabel: "Marks",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      mobileLabel: "Settings",
    },
  ];

// ── Mobile tabs (show only first 5 in bottom nav) ────────────────────────────
const MOBILE_TABS = TABS.slice(0, 5);

// ══════════════════════════════════════════════════════════════════════════════
// Main export
// ══════════════════════════════════════════════════════════════════════════════
export default function StudentDashboardClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  function renderTab() {
    switch (activeTab) {
      case "overview":
        return <OverviewTab user={user} />;
      case "applications":
        return <ApplicationsTab user={user} />;
      case "apply":
        return <ApplyTab user={user} />;
      case "profile":
        return <ProfileTab user={user} />;
      case "bookmarks":
        return <BookmarksTab user={user} />;
      case "documents":
        return <DocumentsTab user={user} />;
      case "marks":
        return <MarksTab user={user} />;
      case "settings":
        return <SettingsTab user={user} />;
      default:
        return <OverviewTab user={user} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#0f1623] font-display">
      <Header />

      {/* ── Push content below fixed navbar (~88px) ── */}
      <div className="pt-[112px]">
        {/* ── Sticky desktop tab bar ── */}
        <div className="sticky top-[80px] z-40 px-4 sm:px-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 px-2 overflow-hidden">
              <div className="flex items-center overflow-x-auto hide-scrollbar">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-200 ${
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={
                          isActive ? { fontVariationSettings: "'FILL' 1" } : {}
                        }
                      >
                        {tab.icon}
                      </span>
                      <span className="hidden lg:inline">{tab.label}</span>
                      <span className="lg:hidden">{tab.mobileLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-32 md:pb-10">
          {renderTab()}
        </main>
      </div>

      {/* ── Mobile bottom navigation (shows first 5 tabs + "More" drawer) ── */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// ── Mobile Bottom Nav with overflow "More" drawer ────────────────────────────
function MobileBottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
}) {
  const [showMore, setShowMore] = useState(false);

  // First 4 tabs + "More" button
  const primary = TABS.slice(0, 4);
  const overflow = TABS.slice(4);

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 safe-bottom">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {primary.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMore(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
                    isActive
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px] transition-transform"
                    style={
                      isActive
                        ? {
                            fontVariationSettings: "'FILL' 1",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[9px] font-bold tracking-wide">
                    {tab.mobileLabel}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}

            {/* "More" button */}
            <button
              onClick={() => setShowMore((s) => !s)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
                showMore || overflow.some((t) => t.id === activeTab)
                  ? "text-primary"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={
                  showMore || overflow.some((t) => t.id === activeTab)
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {showMore ? "close" : "more_horiz"}
              </span>
              <span className="text-[9px] font-bold tracking-wide">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overflow drawer */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-[64px] left-0 right-0 z-50 md:hidden px-4 pb-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 grid grid-cols-4 gap-2">
              {overflow.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMore(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={
                        isActive ? { fontVariationSettings: "'FILL' 1" } : {}
                      }
                    >
                      {tab.icon}
                    </span>
                    <span className="text-[9px] font-bold text-center leading-tight">
                      {tab.mobileLabel}
                    </span>
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
