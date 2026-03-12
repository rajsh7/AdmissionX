"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import StudyAbroad from "./components/StudyAbroad";
import TrendingDegrees from "./components/TrendingDegrees";
import EntranceExams from "./components/EntranceExams";
import NewsSection from "./components/NewsSection";
import CallToAction from "./components/CallToAction";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";

import type { University } from "./components/TopUniversities";
import type { DbBlog } from "./api/home/latest-blogs/route";
import type { DbExam } from "./api/home/exams/route";
import type { HomeStat } from "./api/home/stats/route";

interface HomePageClientProps {
  universities: University[];
  dbBlogs: DbBlog[];
  dbExams: DbExam[];
  stats: HomeStat[];
  streamCounts: Record<string, number>;
}

export default function HomePageClient({
  universities,
  dbBlogs,
  dbExams,
  stats,
  streamCounts,
}: HomePageClientProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admissionx-dark") === "true";
  });
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const openLogin = () => setAuthModal("login");
  const openRegister = () => setAuthModal("register");
  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div
      className={`min-h-screen bg-background-dark text-white ${isDark ? "dark" : ""}`}
    >
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeModal}
          onSwitchMode={switchMode}
        />
      )}

      {/* Floating Header */}
      <Header onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Story Flow */}
      <main>
        {/* Prologue: The Dream */}
        <HeroSection />

        {/* Chapter 1: Explore Your Passion */}
        <FieldsOfStudy streamCounts={streamCounts} />

        {/* Chapter 2: Discover Universities */}
        <TopUniversities universities={universities} />

        {/* Chapter 3: Go Global */}
        <StudyAbroad />

        {/* Chapter 4: Choose Your Path */}
        <TrendingDegrees />

        {/* Chapter 5: Prepare for Exams */}
        <EntranceExams dbExams={dbExams} />

        {/* Chapter 6: Stay Informed */}
        <NewsSection dbBlogs={dbBlogs} />

        {/* Epilogue: Your Story Starts Now */}
        <CallToAction stats={stats} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
