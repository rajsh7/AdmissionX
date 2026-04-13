"use client";

import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

export default function BannerTab({ college }: Props) {
  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm p-8">
      <h2 className="text-[22px] font-bold text-[#333] mb-4">Manage College Banner</h2>
      <p className="text-slate-500">This section is currently under construction.</p>
    </div>
  );
}
