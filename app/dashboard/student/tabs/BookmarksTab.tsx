"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: number; name: string; email: string } | null;
}

interface Bookmark {
  id: number;
  type: "college" | "course" | "blog";
  item_id: number;
  title: string;
  image: string;
  url: string;
  created_at: string;
  college_name: string | null;
  college_slug: string | null;
  college_address: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  blog_topic: string | null;
  blog_slug: string | null;
}

interface Counts {
  total: number;
  college: number;
  course: number;
  blog: number;
}

const TYPE_TABS = [
  { id: "all",     label: "All",     icon: "bookmarks"      },
  { id: "college", label: "Colleges",icon: "account_balance" },
  { id: "course",  label: "Courses", icon: "school"          },
  { id: "blog",    label: "Blogs",   icon: "article"         },
];

const TYPE_META: Record<
  string,
  { icon: string; color: string; bg: string; label: string }
> = {
  college: { icon: "account_balance", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20",   label: "College"  },
  course:  { icon: "school",          color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20",label: "Course"   },
  blog:    { icon: "article",         color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20",label: "Blog"  },
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-pulse">
      <div className="h-32 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl flex-1" />
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function BookmarksTab({ user }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [counts, setCounts]       = useState<Counts>({ total: 0, college: 0, course: 0, blog: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeType, setActiveType] = useState("all");
  const [removing, setRemoving]     = useState<number | null>(null);
  const [searchQ, setSearchQ]       = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${user.id}/bookmarks`);
      if (!res.ok) throw new Error("Failed to load bookmarks");
      const data = await res.json();
      setBookmarks(data.bookmarks ?? []);
      setCounts(data.counts ?? { total: 0, college: 0, course: 0, blog: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function removeBookmark(id: number) {
    if (!user?.id) return;
    setRemoving(id);
    try {
      const res = await fetch(
        `/api/student/${user.id}/bookmarks?bookmarkId=${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Could not remove bookmark.");
        return;
      }
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setCounts((prev) => {
        const removed = bookmarks.find((b) => b.id === id);
        if (!removed) return prev;
        return {
          ...prev,
          total: Math.max(0, prev.total - 1),
          [removed.type]: Math.max(0, prev[removed.type as keyof Counts] - 1),
        };
      });
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRemoving(null);
    }
  }

  const filtered = bookmarks.filter((b) => {
    if (activeType !== "all" && b.type !== activeType) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        (b.college_address ?? "").toLowerCase().includes(q) ||
        (b.stream_name ?? "").toLowerCase().includes(q) ||
        (b.degree_name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            My Bookmarks
          </h1>
          {!loading && (
            <p className="text-primary font-medium mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bookmark</span>
              {counts.total > 0
                ? `${counts.total} saved item${counts.total !== 1 ? "s" : ""}`
                : "No saved items yet"}
            </p>
          )}
        </div>
        {/* Search */}
        <div className="relative min-w-[280px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search bookmarks…"
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none transition-all"
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {TYPE_TABS.map((tab) => {
          const count = tab.id === "all" ? counts.total : counts[tab.id as keyof Counts];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition-all ${
                activeType === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
              {!loading && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeType === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center py-24 gap-4">
          <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
          <button
            onClick={load}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-600 block mb-4">
            {searchQ ? "search_off" : "bookmark_border"}
          </span>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            {searchQ
              ? `No results for "${searchQ}"`
              : activeType !== "all"
                ? `No ${activeType} bookmarks yet`
                : "No bookmarks yet"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {searchQ || activeType !== "all"
              ? "Try a different search or switch tabs."
              : "Browse colleges, courses, and blogs and save items you're interested in."}
          </p>
          {(searchQ || activeType !== "all") && (
            <button
              onClick={() => { setSearchQ(""); setActiveType("all"); }}
              className="px-5 py-2 bg-primary/10 text-primary rounded-xl font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Bookmark grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((bm) => {
            const meta = TYPE_META[bm.type] ?? TYPE_META.college;
            const isRemoving = removing === bm.id;

            return (
              <div
                key={bm.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-col ${
                  isRemoving ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Image / placeholder */}
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-900">
                  {bm.image ? (
                    <img
                      src={bm.image}
                      alt={bm.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`material-symbols-outlined text-5xl ${meta.color} opacity-30`}>
                        {meta.icon}
                      </span>
                    </div>
                  )}
                  {/* Type badge */}
                  <span className={`absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                    <span className="material-symbols-outlined text-[11px]">{meta.icon}</span>
                    {meta.label}
                  </span>
                  {/* Remove button */}
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    disabled={isRemoving}
                    title="Remove bookmark"
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    {isRemoving ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {bm.title}
                  </h3>

                  {/* Type-specific subtitle */}
                  {bm.type === "college" && bm.college_address && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-[11px]">location_on</span>
                      {bm.college_address}
                    </p>
                  )}
                  {bm.type === "course" && (
                    <p className="text-xs text-slate-500 mb-2">
                      {[bm.stream_name, bm.degree_name].filter(Boolean).join(" · ") || "Course"}
                    </p>
                  )}
                  {bm.type === "blog" && bm.blog_topic && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-1">{bm.blog_topic}</p>
                  )}

                  {/* Saved date */}
                  <p className="text-[10px] text-slate-400 mt-auto mb-3">
                    Saved{" "}
                    {new Date(bm.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* CTA */}
                  <a
                    href={bm.url || "#"}
                    target={bm.url?.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-primary/5 dark:bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    {bm.type === "college"
                      ? "View College"
                      : bm.type === "course"
                        ? "Explore Course"
                        : "Read Blog"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh */}
      {!loading && !error && (
        <div className="flex justify-center pt-4">
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh Bookmarks
          </button>
        </div>
      )}
    </div>
  );
}
