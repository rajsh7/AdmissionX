"use client";

import Link from "next/link";

interface TopBarProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const navLinks = [
  { label: "Colleges", href: "/colleges" },
  { label: "Universities", href: "/universities" },
  { label: "Courses", href: "/courses" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "Exams", href: "/exams" },
  { label: "Reviews", href: "/reviews" },
  { label: "News", href: "/news" },
  { label: "Blogs", href: "/blogs" },
  { label: "Career Assessment", href: "/career" },
  { label: "Ask", href: "/ask" },
];

export default function TopBar({ onLoginClick, onSignUpClick }: TopBarProps) {
  return (
    <div className="hidden lg:block bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-md font-medium">
      <div className="flex items-center justify-between py-2.5 mx-[5px]">
        <nav className="flex items-center gap-5 text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-primary font-bold hover:text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-lg">event</span>
            World Education Fair 2026-2027
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <button
              onClick={onLoginClick}
              className="hover:text-primary transition-colors font-semibold cursor-pointer bg-transparent border-none"
            >
              Login
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={onSignUpClick}
              className="hover:text-primary transition-colors font-semibold cursor-pointer bg-transparent border-none"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
