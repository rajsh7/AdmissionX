"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo: string;
  member_since: string;
  profile_complete: number;
}

interface AppStats {
  total: number;
  submitted: number;
  under_review: number;
  verified: number;
  enrolled: number;
  rejected: number;
  pending_pay: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-[10px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
           <h3 className="text-[28px] font-bold text-[#222] leading-none">{value}</h3>
        </div>
        <div className="w-10 h-10 bg-[#e31e24] rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-100 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-2">
          <span className={`flex items-center text-[11px] font-bold ${trendUp ? "text-green-500" : "text-red-500"}`}>
            <span className="material-symbols-outlined text-[14px]">{trendUp ? "trending_up" : "trending_down"}</span>
            {trend}
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase">Since last week</span>
        </div>
      )}
    </div>
  );
}

export default function OverviewTab({ user }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [profRes, appRes] = await Promise.all([
        fetch(`/api/student/${user.id}/profile`),
        fetch(`/api/student/${user.id}/applications`),
      ]);
      const profData = await profRes.json();
      const appData = await appRes.json();
      setProfile(profData);
      setStats(appData.stats);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-[10px]" />)}
        </div>
        <div className="h-48 bg-gray-200 rounded-[10px]" />
      </div>
    );
  }

  const name = profile?.name ?? user?.name ?? "Student";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-bold text-[#222] tracking-tight">Analytics Dashboard</h2>
        <p className="text-[14px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Welcome back!</p>
      </div>

      {/* Top Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Applications" 
          value={String(stats?.total ?? 0).padStart(2, "0")} 
          icon="description" 
          trend="12.5%" 
          trendUp 
        />
        <StatCard 
          title="Total Fees Paid" 
          value={`₹${(stats?.enrolled ?? 0) * 500}`} 
          icon="payments" 
          trend="0.0%" 
          trendUp 
        />
        <StatCard 
          title="Under Review" 
          value={String(stats?.under_review ?? 0).padStart(2, "0")} 
          icon="manage_search" 
          trend="2.1%" 
          trendUp 
        />
        <StatCard 
          title="Verified Applications" 
          value={String(stats?.verified ?? 0).padStart(2, "0")} 
          icon="verified" 
          trend="5.4%" 
          trendUp 
        />
      </div>

      {/* Greeting Card & Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Greeting Card */}
          <div className="bg-white rounded-[10px] p-8 shadow-sm border border-gray-100 flex items-center gap-8 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#e31e24] opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            
            <div className="w-24 h-24 bg-gray-100 rounded-full shrink-0 border-4 border-gray-50 flex items-center justify-center text-gray-300">
               <span className="material-symbols-outlined text-[48px]">person</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-[28px] font-bold text-[#222]">Hi! {name}</h3>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed max-w-md">
                Your admission journey is progressing well. You have {stats?.total ?? 0} active applications currently being processed.
              </p>
              <div className="pt-2 flex gap-3">
                <button className="px-5 py-2 bg-[#e31e24] text-white text-[13px] font-medium rounded-lg hover:shadow-lg transition-all active:scale-95">
                  Complete Profile
                </button>
                <button className="px-5 py-2 bg-gray-100 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-200 transition-all">
                  View Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Additional details could go here */}
          <div className="bg-white rounded-[10px] p-8 shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-[18px] font-bold text-[#222]">Recent Activity</h4>
                <button className="text-[12px] font-semibold text-[#e31e24] uppercase tracking-wider">View All</button>
             </div>
             
             <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#e31e24]">notifications</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-[#333]">Application status updated for Computer Science</p>
                      <p className="text-[12px] font-medium text-gray-400">2 hours ago · Ref #ADX-12345</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-[#e31e24] transition-colors">chevron_right</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Sidebar Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="bg-[#333333] rounded-[10px] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                 <span className="material-symbols-outlined text-[100px]">equalizer</span>
              </div>
              <h4 className="text-[12px] font-semibold uppercase tracking-widest text-white/50 mb-1">Top Goal</h4>
              <h3 className="text-[24px] font-bold mb-6">University of Delhi</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-[13px] font-medium">
                    <span className="text-white/60">Match Probability</span>
                    <span>85%</span>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e31e24] w-[85%] rounded-full shadow-[0_0_15px_rgba(227,30,36,0.5)]" />
                 </div>
                 <button className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium rounded-lg transition-all border border-white/10">
                    Improve Match Score
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[10px] p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-50 text-[#e31e24] rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-[32px]">support_agent</span>
              </div>
              <h4 className="text-[16px] font-bold text-[#222] mb-2">Need Help?</h4>
              <p className="text-[13px] font-medium text-gray-500 mb-6 leading-relaxed">
                 Chat with our experts to find the perfect course for you.
              </p>
              <button className="w-full py-3 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-lg hover:bg-black transition-all">
                 Live Chat Now
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
