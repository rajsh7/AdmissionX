"use client";

import { useState } from "react";
import Link from "next/link";
import OverviewTab from "./tabs/OverviewTab";
import ProfileTab from "./tabs/ProfileTab";
import CoursesTab from "./tabs/CoursesTab";
import GalleryTab from "./tabs/GalleryTab";
import FacultyTab from "./tabs/FacultyTab";
import PlacementTab from "./tabs/PlacementTab";
import FacilitiesTab from "./tabs/FacilitiesTab";
import ManagementTab from "./tabs/ManagementTab";
import ScholarshipsTab from "./tabs/ScholarshipsTab";
import ApplicationsTab from "./tabs/ApplicationsTab";
import CutoffsTab from "./tabs/CutoffsTab";
import SportsTab from "./tabs/SportsTab";
import SettingsTab from "./tabs/SettingsTab";
import QueriesTab from "./tabs/QueriesTab";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CollegeUser {
  id: string;
  name: string;
  email: string;
  slug: string;
  collegeprofile_id: unknown | null;
}

export type TabId =
  | "overview"
  | "profile"
  | "courses"
  | "gallery"
  | "faculty"
  | "placement"
  | "facilities"
  | "management"
  | "scholarships"
  | "applications"
  | "cutoffs"
  | "sports"
  | "queries"
  | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  mobileLabel: string;
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: "dashboard", mobileLabel: "Home" },
  { id: "profile", label: "Profile", icon: "edit", mobileLabel: "Profile" },
  {
    id: "courses",
    label: "Courses",
    icon: "menu_book",
    mobileLabel: "Courses",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: "photo_library",
    mobileLabel: "Gallery",
  },
  { id: "faculty", label: "Faculty", icon: "groups", mobileLabel: "Faculty" },
  {
    id: "placement",
    label: "Placements",
    icon: "trending_up",
    mobileLabel: "Place.",
  },
  {
    id: "facilities",
    label: "Facilities",
    icon: "apartment",
    mobileLabel: "Facil.",
  },
  {
    id: "management",
    label: "Management",
    icon: "manage_accounts",
    mobileLabel: "Mgmt.",
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: "workspace_premium",
    mobileLabel: "Scholar.",
  },
  {
    id: "applications",
    label: "Applications",
    icon: "description",
    mobileLabel: "Apps",
  },
  {
    id: "cutoffs",
    label: "Cut-offs",
    icon: "content_cut",
    mobileLabel: "Cutoffs",
  },
  { id: "sports", label: "Sports & Activities", icon: "sports", mobileLabel: "Sports" },
  { id: "queries", label: "Queries", icon: "forum", mobileLabel: "Queries" },
  { id: "settings", label: "Settings", icon: "settings", mobileLabel: "Settings" },
];

const PRIMARY_TABS = TABS.slice(0, 4); // visible in mobile bottom bar
const OVERFLOW_TABS = TABS.slice(4); // in "More" drawer

// ══════════════════════════════════════════════════════════════════════════════
export default function CollegeDashboardClient({
  college,
}: {
  college: CollegeUser;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const slug = college.slug;

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderTab() {
    if (!college.collegeprofile_id) {
      return <PendingProfileState college={college} />;
    }
    switch (activeTab) {
      case "overview":
        return <OverviewTab college={college} onNavigate={handleTabChange} />;
      case "profile":
        return <ProfileTab college={college} />;
      case "courses":
        return <CoursesTab college={college} />;
      case "gallery":
        return <GalleryTab college={college} />;
      case "faculty":
        return <FacultyTab college={college} />;
      case "placement":
        return <PlacementTab college={college} />;
      case "facilities":
        return <FacilitiesTab college={college} />;
      case "management":
        return <ManagementTab college={college} />;
      case "scholarships":
        return <ScholarshipsTab college={college} />;
      case "applications":
        return <ApplicationsTab college={college} />;
      case "cutoffs":
        return <CutoffsTab college={college} />;
      case "sports":
        return <SportsTab college={college} />;
      case "queries":
        return <QueriesTab college={college} />;
      case "settings":
        return <SettingsTab college={college} />;
      default:
        return <OverviewTab college={college} onNavigate={handleTabChange} />;
    }
  }

  const initials = college.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#0f1623] font-display">
      {/* ── Top header ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 font-black text-xl tracking-tight shrink-0"
          >
            <span className="text-primary">Admission</span>
            <span className="text-slate-800 dark:text-white">X</span>
          </Link>

          {/* Dashboard label */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[14px] text-primary">
              domain
            </span>
            College Dashboard
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View public profile */}
            {college.slug && (
              <Link
                href={`/college/${college.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
                View Profile
              </Link>
            )}

            {/* College identity */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[180px]">
                {college.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {college.email}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-primary/20">
              {initials}
            </div>

            {/* Sign out */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                <span className="hidden sm:inline text-xs">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Content below header ───────────────────────────────────────────── */}
      <div className="pt-16">
        {/* ── Sticky desktop tab bar ─────────────────────────────────────── */}
        <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center overflow-x-auto hide-scrollbar gap-0.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-3.5 text-[13px] font-bold whitespace-nowrap border-b-2 transition-all duration-200 ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[17px]"
                      style={
                        isActive ? { fontVariationSettings: "'FILL' 1" } : {}
                      }
                    >
                      {tab.icon}
                    </span>
                    <span className="hidden xl:inline">{tab.label}</span>
                    <span className="hidden lg:inline xl:hidden">
                      {tab.mobileLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-10">
          {renderTab()}
        </main>
      </div>

      {/* ── Mobile bottom navigation ───────────────────────────────────────── */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryTabs={PRIMARY_TABS}
        overflowTabs={OVERFLOW_TABS}
      />
    </div>
  );
}

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
function MobileBottomNav({
  activeTab,
  onTabChange,
  primaryTabs,
  overflowTabs,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  primaryTabs: Tab[];
  overflowTabs: Tab[];
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center justify-around px-1 py-2">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setShowMore(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${
                    isActive
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
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

            {/* More button */}
            <button
              onClick={() => setShowMore((s) => !s)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${
                showMore || overflowTabs.some((t) => t.id === activeTab)
                  ? "text-primary"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={
                  showMore || overflowTabs.some((t) => t.id === activeTab)
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
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 z-50 md:hidden px-4 pb-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 grid grid-cols-4 gap-2">
              {overflowTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setShowMore(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
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

// ── Pending profile state ─────────────────────────────────────────────────────
// Shown when the college account hasn't been linked to a collegeprofile yet
function PendingProfileState({ college }: { college: CollegeUser }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-24 px-4">
      <div className="w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6 shadow-lg shadow-amber-100 dark:shadow-none">
        <span
          className="material-symbols-outlined text-5xl text-amber-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          schedule
        </span>
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
        Profile Pending Setup
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mb-2">
        Your college account ({college.email}) is active, but hasn&apos;t been
        linked to a college profile yet.
      </p>
      <p className="text-slate-400 text-sm max-w-sm mb-8">
        Our team will link your profile shortly. If you believe this is a
        mistake, please contact support.
      </p>

      {/* Info card */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4 max-w-md text-left">
        <span
          className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          info
        </span>
        <div>
          <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">
            What happens next?
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <li>• Our admin team reviews your college account</li>
            <li>• Your profile gets linked to our database</li>
            <li>• You&apos;ll receive an email when it&apos;s ready</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
        >
          Go to Home
        </Link>
        <a
          href="mailto:support@admissionx.in"
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
