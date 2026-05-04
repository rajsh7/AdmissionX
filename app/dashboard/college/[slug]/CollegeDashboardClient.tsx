"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import OverviewTab from "./tabs/OverviewTab";
import BannerTab from "./tabs/BannerTab";
import AboutImagesTab from "./tabs/AboutImagesTab";
import CoursesTab from "./tabs/CoursesTab";
import GalleryTab from "./tabs/GalleryTab";
import FacilitiesTab from "./tabs/FacilitiesTab";
import ScholarshipsTab from "./tabs/ScholarshipsTab";
import CutoffsTab from "./tabs/CutoffsTab";
import SportsTab from "./tabs/SportsTab";
import AddressTab from "./tabs/AddressTab";
import AchievementsTab from "./tabs/AchievementsTab";
import LettersTab from "./tabs/LettersTab";
import EventsTab from "./tabs/EventsTab";
import PlacementTab from "./tabs/PlacementTab";
import SettingsTab from "./tabs/SettingsTab";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CollegeUser {
  id: string;
  name: string;
  email: string;
  slug: string;
  collegeprofile_id: unknown | null;
  logoimage?: string | null;
}

export type TabId =
  | "overview"
  | "banner"
  | "about_images"
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
  | "public_view"
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
  { id: "banner", label: "Upload College Banner", icon: "image", mobileLabel: "Banner", group: "info" },
  { id: "about_images", label: "About Images", icon: "collections", mobileLabel: "About", group: "info" },
  { id: "address", label: "Address", icon: "location_on", mobileLabel: "Addr", group: "info" },
  { id: "gallery", label: "Gallery", icon: "photo_library", mobileLabel: "Gal", group: "info" },
  { id: "achievements", label: "Achievements", icon: "emoji_events", mobileLabel: "Ach", group: "info" },
  { id: "courses", label: "Courses", icon: "menu_book", mobileLabel: "Edu", group: "info" },
  { id: "facilities", label: "Facilities", icon: "apartment", mobileLabel: "Fac", group: "info" },
  { id: "events", label: "Events", icon: "event", mobileLabel: "Eve", group: "info" },
  { id: "scholarships", label: "Scholarship", icon: "school", mobileLabel: "Sch", group: "info" },
  { id: "placement", label: "Placements", icon: "work", mobileLabel: "Plac", group: "info" },
  { id: "letters", label: "Affiliation / Accreditation Letters", icon: "description", mobileLabel: "Let", group: "info" },
  { id: "sports", label: "Sports & Activity", icon: "sports_soccer", mobileLabel: "Spo", group: "info" },
  { id: "cutoffs", label: "Cut Offs", icon: "trending_down", mobileLabel: "Cut", group: "info" },

  { id: "public_view", label: "Public View", icon: "visibility", mobileLabel: "Public" },
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
  const [logo, setLogo] = useState<string | null>(college.logoimage ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const slug = college.slug;
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/logo`, { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.logo) setLogo(d.logo);
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    }
  }

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
      case "about_images":
        return <AboutImagesTab college={college} />;
      case "address":
        return <AddressTab college={college} />;
      case "achievements":
        return <AchievementsTab college={college} />;
      case "events":
        return <EventsTab college={college} />;
      case "faculty":
        return <FacultyTab college={college} />;
      case "social_links":
        return <SocialLinksTab college={college} onNavigate={handleTabChange} />;
      case "letters":
        return <LettersTab college={college} />;
      case "applications":
        return <ApplicationsTab college={college} />;
      case "queries":
        return <QueriesTab college={college} />;
      case "reviews":
        return <ReviewsTab college={college} />;
      case "transactions":
        return <TransactionsTab college={college} />;
      case "faqs":
        return <FAQsTab college={college} />;
      case "qa":
        return <QATab college={college} />;
      case "helpdesk":
        return <HelpdeskTab college={college} />;
      case "agreement":
        return <AgreementTab college={college} />;
      case "terms":
        return <TermsTab college={college} />;
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

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#0f1623] font-poppins">
      <Header theme="light" />

      <div className="flex pt-[60px]">
        {/* Sidebar (Desktop) */}
        <aside
          suppressHydrationWarning
          style={{ backgroundColor: '#313131', top: '60px', bottom: '0' }}
          className="hidden md:flex flex-col w-[260px] fixed left-0 text-white  z-30"
        >
          {/* Logo / College branding */}
          <div
            style={{ backgroundColor: logo ? '#111' : '#1e293b' }}
            className="px-4 py-5 flex flex-col items-center gap-2 border-b border-white/10 shrink-0 transition-colors duration-300"
          >
            <div className="relative group w-[80px] h-[80px] rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
              {logo ? (
                <img src={logo} alt="College Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-slate-400 text-[28px]">photo_camera</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">No Logo</span>
                </div>
              )}
              <div
                onClick={() => logoRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-white text-[22px]">upload</span>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <p className="text-[13px] font-black text-white text-center leading-tight line-clamp-2 px-1">
              {college.name || 'College Dashboard'}
            </p>
            <button
              onClick={() => logoRef.current?.click()}
              disabled={logoUploading}
              className="w-full h-[30px] bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white/70 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[13px]">upload</span>
              {logoUploading ? 'Uploading...' : 'Upload Logo'}
            </button>
          </div>

          {/* Nav */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden py-3 pb-20 hide-scrollbar">
            <nav className="space-y-0">
              {isMounted ? (
                <>
                  {/* Overview */}
                  {TABS.filter(t => t.id === 'overview').map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        style={isActive
                          ? { backgroundColor: '#963737', borderLeft: '4px solid #6e2222', color: 'white' }
                          : { borderLeft: '4px solid transparent', color: 'rgba(255,255,255,0.7)' }
                        }
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold transition-all"
                      >
                        <span
                          className="material-symbols-outlined text-[20px] flex-shrink-0"
                          style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } : { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                        >
                          school
                        </span>
                        <span className="truncate">Institute Details</span>
                      </button>
                    );
                  })}

                  {/* College Information group */}
                  <div>
                    <button
                      onClick={() => setInfoExpanded(!infoExpanded)}
                      style={infoExpanded || TABS.filter(t => t.group === 'info').some(t => t.id === activeTab)
                        ? { backgroundColor: '#963737', borderLeft: '4px solid #6e2222', color: 'white' }
                        : { borderLeft: '4px solid transparent', color: 'rgba(255,255,255,0.7)' }
                      }
                      className="w-full flex items-center justify-between gap-3 px-5 py-2.5 text-[13px] font-bold transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="material-symbols-outlined text-[20px] flex-shrink-0"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                        >
                          list_alt
                        </span>
                        <span className="truncate">College Information</span>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${infoExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {infoExpanded && (
                      <ul className="bg-black/20 py-1">
                        {TABS.filter(t => t.group === 'info').map(tab => {
                          const isActive = activeTab === tab.id;
                          return (
                            <li key={tab.id}>
                              <button
                                onClick={() => handleTabChange(tab.id)}
                                className="w-full flex items-center gap-3 px-11 py-2.5 text-[12px] font-bold transition-colors"
                                style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}
                              >
                                <span
                                  className="material-symbols-outlined text-[16px] flex-shrink-0"
                                  style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } : { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                                >
                                  {tab.icon}
                                </span>
                                <span className="truncate">{tab.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Rest of tabs */}
                  {TABS.filter(tab => !tab.group && tab.id !== 'overview').map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        style={isActive
                          ? { backgroundColor: '#963737', borderLeft: '4px solid #6e2222', color: 'white' }
                          : { borderLeft: '4px solid transparent', color: 'rgba(255,255,255,0.7)' }
                        }
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold transition-all"
                      >
                        <span
                          className="material-symbols-outlined text-[20px] flex-shrink-0"
                          style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } : { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                        >
                          {tab.icon}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="space-y-1 px-3 py-2 animate-pulse">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-9 bg-white/5 rounded-lg" />)}
                </div>
              )}
            </nav>
          </div>
        </aside>

        <main className="flex-1 md:ml-[260px] min-h-[calc(100vh-80px)] bg-[#ffffff] text-slate-800 p-4 sm:p-6 pb-28 md:pb-10 transition-all duration-300">
          <div className="w-full">
            {renderTab()}
          </div>
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryTabs={PRIMARY_TABS}
        overflowTabs={OVERFLOW_TABS}
      />
    </div>
  );
}

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
                    style={isActive ? { fontVariationSettings: "'FILL' 1", transform: "scale(1.1)" } : {}}
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

            <button
              onClick={() => setShowMore((s) => !s)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${showMore || overflowTabs.some((t) => t.id === activeTab)
                ? "text-primary"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={showMore || overflowTabs.some((t) => t.id === activeTab) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
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
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
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
        Your college account ({college.email}) is active, but hasn&apos;t been linked to a college profile yet.
      </p>
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
