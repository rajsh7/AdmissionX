"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Header({
  onLoginClick,
  onRegisterClick,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-4">
        {/* Logo (Left) */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admissionx
          </h2>
        </Link>

        {/* Desktop Search (Center - Wider) */}
        <div className="hidden md:flex justify-center w-full">
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative flex w-full items-center">
              <span className="absolute left-3 text-slate-400 dark:text-slate-500 material-symbols-outlined text-[20px]">
                search
              </span>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Search for colleges, exams, courses..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu Button (Right) */}
        <div className="flex items-center justify-end gap-3">
          {/* Desktop utility buttons removed per user request */}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="px-6 py-4 space-y-1">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative flex w-full items-center">
                <span className="absolute left-3 text-slate-400 material-symbols-outlined text-[20px]">
                  search
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Search colleges, exams..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            {[
              "Colleges", "Universities", "Courses", "Study Abroad",
              "Exams", "Reviews", "News", "Blogs",
            ].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="block py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Login
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onRegisterClick(); }}
                className="flex-1 h-10 rounded-lg bg-primary text-sm font-bold text-white"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
