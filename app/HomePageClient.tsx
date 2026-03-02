"use client";

import { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FieldsOfStudy from "./components/FieldsOfStudy";
import TopUniversities from "./components/TopUniversities";
import StudyAbroad from "./components/StudyAbroad";
import TrendingDegrees from "./components/TrendingDegrees";
import EntranceExams from "./components/EntranceExams";
import NewsSection from "./components/NewsSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import { University } from "./components/TopUniversities";

interface HomePageClientProps {
  universities: University[];
}

export default function HomePageClient({ universities }: HomePageClientProps) {
  const [isDark, setIsDark] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  // Persist dark mode preference in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admissionx-dark");
    if (stored === "true") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const openLogin = () => setAuthModal("login");
  const openRegister = () => setAuthModal("register");
  const closeModal = () => setAuthModal(null);
  const switchMode = (mode: "login" | "register") => setAuthModal(mode);

  return (
    <div
      className={`flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 ${
        isDark ? "dark" : ""
      }`}
    >
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeModal}
          onSwitchMode={switchMode}
        />
      )}

      {/* Top Navigation Bar */}
      <TopBar onLoginClick={openLogin} onSignUpClick={openRegister} />

      {/* Sticky Header */}
      <Header
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
      />

      {/* Page Content */}
      <main className="flex-1">
        <HeroSection />
        <FieldsOfStudy />
        <TopUniversities universities={universities} />
        <StudyAbroad />
        <TrendingDegrees />
        <EntranceExams />
        <NewsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
