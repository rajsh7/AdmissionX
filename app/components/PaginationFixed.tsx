"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** If true, clicking a page pushes to URL. If false, calls onPageChange instead. */
  useUrl?: boolean;
  onPageChange?: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [];

  // Always show first page
  pages.push(1);

  if (current > 4) {
    pages.push("…");
  }

  // Pages around current
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 3) {
    pages.push("…");
  }

  // Always show last page
  pages.push(total);

  return pages;
}

export default function PaginationFixed({
  currentPage,
  totalPages,
  useUrl = true,
  onPageChange,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;

      if (!useUrl && onPageChange) {
        onPageChange(page);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, totalPages, useUrl, onPageChange, router, pathname, searchParams]
  );

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      {/* ← Prev */}
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-[#008080]/30 hover:text-[#008080] hover:bg-[#008080]/5 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[16px]">
          chevron_left
        </span>
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p as number)}
              aria-label={`Go to page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
              className={`w-9 h-9 rounded-[10px] text-sm font-bold transition-all duration-200 ${
                p === currentPage
                  ? "bg-[#008080] text-white shadow-md shadow-[#008080]/25 scale-105"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-[#008080]/30 hover:text-[#008080] hover:bg-[#008080]/5"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* → Next */}
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-[#008080]/30 hover:text-[#008080] hover:bg-[#008080]/5 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="material-symbols-outlined text-[16px]">
          chevron_right
        </span>
      </button>
    </nav>
  );
}
