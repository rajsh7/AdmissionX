import { getDb } from "@/lib/db";
import Link from "next/link";
import AchievementsClient from "./AchievementsClient";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const slug = (sp.slug ?? "").trim();

  const db = await getDb();

  // Get all colleges for dropdown
  const colleges = await db.collection("collegeprofile")
    .find({}, { projection: { slug: 1, college_name: 1 } })
    .sort({ college_name: 1 })
    .limit(500)
    .toArray();

  const selectedCollege = colleges.find((c: any) => c.slug === slug);
  const collegeName = selectedCollege
    ? String(selectedCollege.college_name || selectedCollege.slug || "")
    : "";

  return (
    <div className="p-6 space-y-6 w-full">
      {/* College selector */}
      <form method="GET" action="/admin/colleges/achievements" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 block mb-2">
              Select College
            </label>
            <select
              name="slug"
              defaultValue={slug}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">— Select a college —</option>
              {colleges.map((c: any) => (
                <option key={c.slug} value={c.slug}>
                  {c.college_name || c.slug}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all">
            Load
          </button>
        </div>
      </form>

      {!slug ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">emoji_events</span>
          <p className="text-slate-500 font-semibold text-sm">Select a college to manage achievements</p>
        </div>
      ) : (
        <AchievementsClient slug={slug} collegeName={collegeName} />
      )}
    </div>
  );
}
