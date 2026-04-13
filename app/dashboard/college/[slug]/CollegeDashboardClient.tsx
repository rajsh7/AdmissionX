"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 3f51f6a (College UI Fixes)
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import OverviewTab from "./tabs/OverviewTab";
import BannerTab from "./tabs/BannerTab";
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
import AddressTab from "./tabs/AddressTab";
import AchievementsTab from "./tabs/AchievementsTab";
import LettersTab from "./tabs/LettersTab";
import EventsTab from "./tabs/EventsTab";
import SocialLinksTab from "./tabs/SocialLinksTab";

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
  | "banner"
  | "address"
  | "gallery"
  | "achievements"
  | "courses"
  | "facilities"
  | "events"
  | "scholarships"
  | "placement"
  | "letters"
  | "sports"
  | "cutoffs"
  | "faculty"
  | "admission"
  | "fb_widget"
  | "social_links"
  | "applications"
  | "queries"
  | "reviews"
  | "metrics"
  | "transactions"
  | "faqs"
  | "qa"
  | "helpdesk"
  | "public_view"
  | "terms"
  | "logout"
  | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  mobileLabel: string;
  group?: string;
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: Tab[] = [
  { id: "overview", label: "Institute Details", icon: "school", mobileLabel: "Home" },

  // College Information Group
  { id: "banner", label: "Upload College Banner", icon: "chat_bubble_outline", mobileLabel: "Banner", group: "info" },
  { id: "address", label: "Address", icon: "chat_bubble_outline", mobileLabel: "Addr", group: "info" },
  { id: "gallery", label: "Gallery", icon: "chat_bubble_outline", mobileLabel: "Gal", group: "info" },
  { id: "achievements", label: "Achievements", icon: "chat_bubble_outline", mobileLabel: "Ach", group: "info" },
  { id: "courses", label: "Courses", icon: "chat_bubble_outline", mobileLabel: "Edu", group: "info" },
  { id: "facilities", label: "Facilities", icon: "chat_bubble_outline", mobileLabel: "Fac", group: "info" },
  { id: "events", label: "Events", icon: "chat_bubble_outline", mobileLabel: "Eve", group: "info" },
  { id: "scholarships", label: "Scholarship", icon: "chat_bubble_outline", mobileLabel: "Sch", group: "info" },
  { id: "placement", label: "Placements", icon: "chat_bubble_outline", mobileLabel: "Plac", group: "info" },
  { id: "letters", label: "Affiliation / Accreditation Letters", icon: "chat_bubble_outline", mobileLabel: "Let", group: "info" },
  { id: "sports", label: "Sports & Activity", icon: "chat_bubble_outline", mobileLabel: "Spo", group: "info" },
  { id: "cutoffs", label: "Cut Offs", icon: "chat_bubble_outline", mobileLabel: "Cut", group: "info" },

  { id: "faculty", label: "Our faculties", icon: "groups", mobileLabel: "Faculty" },
  { id: "admission", label: "Admission Procedure", icon: "edit_calendar", mobileLabel: "Adm." },
  { id: "fb_widget", label: "Facebook Widget url", icon: "description", mobileLabel: "FB" },
  { id: "social_links", label: "Social Link Management", icon: "groups", mobileLabel: "Social" },
  { id: "applications", label: "Application", icon: "forum", mobileLabel: "Apps" },
  { id: "queries", label: "Queries", icon: "account_circle", mobileLabel: "Queries" },
  { id: "reviews", label: "Reviews", icon: "account_circle", mobileLabel: "Reviews" },
  { id: "metrics", label: "Metrics", icon: "equalizer", mobileLabel: "Metrics" },
  { id: "transactions", label: "Transaction Details", icon: "account_circle", mobileLabel: "Trans." },
  { id: "faqs", label: "College Faqs", icon: "account_circle", mobileLabel: "FAQs" },
  { id: "qa", label: "Question/ Answer / Comment", icon: "account_circle", mobileLabel: "Q&A" },
  { id: "helpdesk", label: "Help Desk", icon: "account_circle", mobileLabel: "Help" },
  { id: "public_view", label: "Public View", icon: "account_circle", mobileLabel: "Public" },
  { id: "agreement", label: "College Partner Agreement", icon: "account_circle", mobileLabel: "Agr." },
  { id: "terms", label: "Terms and conditions", icon: "account_circle", mobileLabel: "Terms" },
  { id: "settings", label: "Account Settings", icon: "settings", mobileLabel: "Settings" },
  { id: "logout", label: "Logout", icon: "logout", mobileLabel: "Logout" },
];

const PRIMARY_TABS = TABS.filter(t => !t.group).slice(0, 4);
const OVERFLOW_TABS = TABS.filter(t => !t.group).slice(4);

// ══════════════════════════════════════════════════════════════════════════════
export default function CollegeDashboardClient({
  college,
}: {
  college: CollegeUser;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const slug = college.slug;
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }
<<<<<<< HEAD
=======

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/logout";
      document.body.appendChild(form);
      form.submit();
    }
  }
>>>>>>> 3f51f6a (College UI Fixes)

  function handleTabChange(tab: TabId) {
    if (tab === "logout") {
      handleLogout();
      return;
    }
    if (tab === "public_view") {
      window.open(`/college/${slug}`, "_blank");
      return;
    }
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
      case "banner":
        return <BannerTab college={college} />;
      case "address":
        return <AddressTab college={college} />;
      case "achievements":
        return <AchievementsTab college={college} />;
      case "events":
        return <EventsTab college={college} />;
      case "admission":
      case "fb_widget":
        return <ProfileTab college={college} />;
      case "social_links":
        return <SocialLinksTab college={college} onNavigate={handleTabChange} />;
      case "letters":
        return <LettersTab college={college} />;
      case "faculty":
        return <FacultyTab college={college} />;
      case "applications":
        return <ApplicationsTab college={college} />;
      case "queries":
        return <QueriesTab college={college} />;
      case "courses":
        return <CoursesTab college={college} />;
      case "gallery":
        return <GalleryTab college={college} />;
      case "placement":
        return <PlacementTab college={college} />;
      case "facilities":
        return <FacilitiesTab college={college} />;
      case "scholarships":
        return <ScholarshipsTab college={college} />;
      case "cutoffs":
        return <CutoffsTab college={college} />;
      case "sports":
        return <SportsTab college={college} />;
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
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#0f1623] font-poppins">
      {/* ── Top header ────────────────────────────────────────────────────── */}
      <Header theme="light" />

      {/* ── Dashboard Layout ───────────────────────────────────────────── */}
      <div className="flex pt-[80px]">
        {/* ── Sidebar (Desktop) ────────────────────────────────────────── */}
        <aside
          suppressHydrationWarning
          style={{
            backgroundColor: '#3f3f3f',
            top: '80px',
            bottom: '0'
          }}
          className="hidden md:flex flex-col w-[350px] fixed left-0 text-white z-30 border-r border-[#E5E7EB]"
        >
          {/* College Branding / Logo Slot (Fixed at top) */}
          <div className="p-4 flex flex-col items-center border-b border-[#E5E7EB] shrink-0 bg-white">
            <div className="w-[110px] h-[110px] bg-white border border-[#4a90e2] rounded-sm mb-4 flex flex-col items-center justify-center shadow-sm relative group overflow-hidden">
              <div className="w-[50px] h-[50px] bg-slate-100 rounded-full flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-slate-300 text-3xl">photo_camera</span>
              </div>
              <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">IMAGE NOT AVAILABLE</span>
              {/* Overlay for upload */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-white text-3xl">upload</span>
              </div>
            </div>
            <button className="w-[320px] h-[39px] bg-[#6b7280] hover:bg-[#4b5563] text-[13px] font-bold text-slate-100 rounded-md transition-colors flex items-center justify-center gap-2">
              Upload College logo
            </button>
          </div>

          {/* Navigation Menu (Scrollable) */}
          <div
            data-lenis-prevent
            className="flex-1 overflow-y-auto overflow-x-hidden py-4 pb-20 hide-scrollbar"
          >
            <h3 className="px-6 text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Main Menu</h3>
            <nav className="space-y-0">
              {isMounted ? (
                <>
                  {/* 1. Overview Tab (Always First) */}
                  {TABS.filter(t => t.id === "overview").map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 px-6 py-2 text-[14px] font-bold transition-all group relative ${isActive
                          ? "bg-[#8B3D3D] text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                        )}
                        <span
                          className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"
                            }`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          school
                        </span>
                        <span className="whitespace-nowrap truncate">
                          Institute Details
                        </span>
                      </button>
                    );
                  })}

<<<<<<< HEAD
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
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="hidden sm:inline text-xs">Sign out</span>
            </button>
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
=======
                  {/* 2. Special Accordion: College Information (Second) */}
                  <div className="mt-0">
                    <button
                      onClick={() => setInfoExpanded(!infoExpanded)}
                      className={`w-full flex items-center justify-between px-6 py-2 text-[14px] font-bold transition-all group relative ${infoExpanded || TABS.filter(t => t.group === "info").some(t => t.id === activeTab) ? "bg-[#8B3D3D] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
>>>>>>> 3f51f6a (College UI Fixes)
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-white">
                          list_alt
                        </span>
                        <span className="whitespace-nowrap truncate">College Information</span>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${infoExpanded ? "rotate-180 text-white" : "text-white"}`}>
                        expand_more
                      </span>
                    </button>

                    {infoExpanded && (
                      <div className="flex flex-col border-b border-t-0 border-[#8B3D3D]">
                        {TABS.filter(t => t.group === "info").map(tab => {
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`w-full flex items-center gap-3 px-6 py-2 border-b border-white/10 text-[13px] font-bold transition-all ${isActive ? "bg-[#6E3030] text-white shadow-inner" : "bg-[#7c7c7c] text-white hover:bg-[#666666]"
                                }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">chat</span>
                              <span className="truncate">{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Other Navigation Tabs (Remaining) */}
                  <div className="mt-0 text-white">
                    {TABS.filter(tab => !tab.group && tab.id !== "overview").map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`w-full flex items-center gap-3 px-6 py-2 text-[14px] font-bold transition-all group relative ${isActive
                            ? "bg-[#8B3D3D] text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                          )}
                          <span
                            className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500"
                              }`}
                            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {tab.icon}
                          </span>
                          <span className="whitespace-nowrap truncate">
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-2 px-4 animate-pulse">
                  <div className="h-10 bg-white/5 rounded-lg w-full" />
                  <div className="h-10 bg-[#8B3D3D]/20 rounded-lg w-full" />
                  <div className="h-64 bg-white/5 rounded-lg w-full" />
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* ── Main content area ─────────────────────────────────────────── */}
        <main className="flex-1 md:ml-[350px] min-h-[calc(100vh-80px)] bg-[#ffffff] text-slate-800 p-4 sm:p-6 pb-28 md:pb-10 transition-all duration-300">
          <div className="w-full">
            {renderTab()}
          </div>
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
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${isActive
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
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${showMore || overflowTabs.some((t) => t.id === activeTab)
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
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${isActive
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
