import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BOARD_IMAGE =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_BOARD_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Derive a URL-friendly category segment from board misc / title */
function deriveCategory(misc: string | null, title: string): string {
  if (misc && misc.trim()) {
    return misc
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
  }
  // Fall back to first word of title lowercased
  const first = title.trim().split(/\s+/)[0] ?? "board";
  return first.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[boards/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardRow extends RowDataPacket {
  id: number;
  title: string;
  name: string | null;
  status: number;
  misc: string | null;
  slug: string;
  detail_image: string | null;
  detail_description: string | null;
  detail_title: string | null;
  about_board: string | null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Boards — Counseling & Education Boards | AdmissionX",
  description:
    "Explore CBSE, ICSE, state boards and other education boards. Get details on syllabus, exam dates, admission procedures, sample papers, and more.",
  keywords:
    "education boards, CBSE, ICSE, state board, board syllabus, board exam dates, board admissions",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BoardsPage() {
  const boards = await safeQuery<BoardRow>(
    `SELECT
       cb.id,
       cb.title,
       cb.name,
       cb.status,
       cb.misc,
       cb.slug,
       cbd.image       AS detail_image,
       cbd.description AS detail_description,
       cbd.title       AS detail_title,
       cbd.aboutBoard  AS about_board
     FROM counseling_boards cb
     LEFT JOIN counseling_board_details cbd
       ON cbd.counselingBoardId = cb.id
     WHERE cb.status = 1
       AND cb.slug IS NOT NULL
       AND cb.slug != ''
     ORDER BY cb.id ASC`,
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-neutral-300">Boards</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">
                    school
                  </span>
                  Education Boards
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                Explore{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Education Boards
                </span>
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                Get comprehensive information on CBSE, ICSE, state and
                international education boards — syllabus, important dates,
                exam patterns, sample papers, and admission guides.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-white">
                  {boards.length}
                </p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                  Boards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick-info strip ── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { icon: "menu_book", label: "Detailed Syllabus" },
              { icon: "calendar_month", label: "Exam Dates" },
              { icon: "assignment", label: "Sample Papers" },
              { icon: "verified", label: "Admission Guides" },
              { icon: "emoji_events", label: "Result Info" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-500">
                  {icon}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {boards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => {
              const category = deriveCategory(board.misc, board.title);
              const description = stripHtml(
                board.about_board ?? board.detail_description,
              );
              const image = buildImageUrl(board.detail_image);
              const displayName = board.name || board.title;

              return (
                <BoardCard
                  key={board.id}
                  board={board}
                  displayName={displayName}
                  description={description}
                  image={image}
                  category={category}
                />
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {boards.length > 0 && (
          <div className="mt-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-black text-xl mb-1">
                Not sure which board to choose?
              </h3>
              <p className="text-amber-100 text-sm">
                Explore our career counseling resources to find the best path
                for your academic goals.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/popular-careers"
                className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">
                  work
                </span>
                Explore Careers
              </Link>
              <Link
                href="/examination"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">
                  quiz
                </span>
                Find Exams
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ─── Board Card ───────────────────────────────────────────────────────────────

function BoardCard({
  board,
  displayName,
  description,
  image,
  category,
}: {
  board: BoardRow;
  displayName: string;
  description: string;
  image: string;
  category: string;
}) {
  const href = `/board/${category}/${board.slug}`;

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-neutral-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-neutral-100">
        <Image
          src={image}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Board initials badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[15px] text-amber-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            <span className="text-[10px] font-black text-neutral-700 uppercase tracking-wider">
              {displayName.length > 18
                ? displayName.slice(0, 18) + "…"
                : displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <h2 className="text-base font-black text-neutral-900 group-hover:text-amber-600 transition-colors leading-snug mb-2">
          {board.title}
        </h2>

        {description ? (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        ) : (
          <p className="text-xs text-neutral-400 italic flex-1">
            View syllabus, exam dates, admission details and more.
          </p>
        )}

        {/* Features pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            { icon: "menu_book", label: "Syllabus" },
            { icon: "calendar_month", label: "Dates" },
            { icon: "assignment", label: "Sample Papers" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg"
            >
              <span className="material-symbols-outlined text-[12px]">
                {icon}
              </span>
              {label}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400">
            View full details
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
            Explore
            <span className="material-symbols-outlined text-[15px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[36px] text-amber-400"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          school
        </span>
      </div>
      <h3 className="text-lg font-black text-neutral-700 mb-2">
        No boards found
      </h3>
      <p className="text-sm text-neutral-400 max-w-xs leading-relaxed mb-6">
        Board information is being updated. Please check back soon.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
      >
        <span className="material-symbols-outlined text-[17px]">home</span>
        Back to Home
      </Link>
    </div>
  );
}
