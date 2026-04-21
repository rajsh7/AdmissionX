import { getDb } from "@/lib/db";
import Link from "next/link";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default async function AdsIndexPage() {
  const db = await getDb();

  const [total, active, inactive, collegeAds] = await Promise.all([
    db.collection("ads_managements").countDocuments({}),
    db.collection("ads_managements").countDocuments({ isactive: { $in: [1, true, "1"] } }),
    db.collection("ads_managements").countDocuments({ isactive: { $in: [0, false, "0", null] } }),
    db.collection("ads_top_college_lists").countDocuments({}),
  ]);

  const CARDS = [
    { label: "Total Ads",      count: total,      icon: "ad_units",     accent: "bg-rose-50 text-rose-600",     href: "/admin/ads/management"   },
    { label: "Active Ads",     count: active,     icon: "check_circle", accent: "bg-green-50 text-green-600",   href: "/admin/ads/management"   },
    { label: "Inactive Ads",   count: inactive,   icon: "cancel",       accent: "bg-slate-50 text-slate-500",   href: "/admin/ads/management"   },
    { label: "College Ads",    count: collegeAds, icon: "apartment",    accent: "bg-blue-50 text-blue-600",     href: "/admin/ads/colleges-list" },
  ];

  const LINKS = [
    { label: "Ads Management",  desc: "Manage all advertisement campaigns", icon: "ad_units",  href: "/admin/ads/management",   color: "text-rose-600"  },
    { label: "College Ads List", desc: "Manage college advertisement list",  icon: "apartment", href: "/admin/ads/colleges-list", color: "text-blue-600"  },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>ad_units</span>
          Ads Manager
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage advertisement campaigns and college listings.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <Link key={i} href={c.href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${c.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{c.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{c.count.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((l, i) => (
          <Link key={i} href={l.href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="bg-slate-50 p-3 rounded-xl flex-shrink-0 group-hover:bg-slate-100 transition-colors">
              <span className={`material-symbols-rounded text-[22px] ${l.color}`} style={ICO_FILL}>{l.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{l.label}</p>
              <p className="text-xs text-slate-400">{l.desc}</p>
            </div>
            <span className="material-symbols-rounded text-slate-300 text-[20px] group-hover:text-slate-500 transition-colors">chevron_right</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
