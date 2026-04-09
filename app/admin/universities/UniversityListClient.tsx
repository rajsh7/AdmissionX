"use client";

import { useState } from "react";
import Link from "next/link";
import UniversityFormModal from "./UniversityFormModal";

interface UniversityRow {
  id: number;
  slug: string | null;
  college_name: string | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: string | null;
  universityType: string | null;
  ranking: string | null;
  rating: string | null;
  estyear: string | null;
  city_name: string | null;
  bannerimage: string | null;
  logoimage: string | null;
}

interface Props {
  rows: UniversityRow[];
  offset: number;
  updateImages: (formData: FormData) => Promise<void>;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function UniversityListClient({ rows, offset, updateImages }: Props) {
  const [editing, setEditing] = useState<UniversityRow | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left w-8">Rank</th>
              <th className="px-4 py-3 text-left">University</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Images</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Type</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Location</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Rating</th>
              <th className="px-4 py-3 text-center">Verified</th>
              <th className="px-4 py-3 text-left hidden xl:table-cell">Est.</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((uni, idx) => (
              <tr key={uni.id} className="hover:bg-indigo-50/20 transition-colors group">
                <td className="px-5 py-4">
                  {uni.topUniversityRank ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-xs font-black">
                      #{uni.topUniversityRank}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 font-mono">{offset + idx + 1}</span>
                  )}
                </td>

                <td className="px-4 py-4 max-w-[220px]">
                  <div className="flex items-center gap-3">
                    {uni.logoimage ? (
                      <img
                        src={uni.logoimage.startsWith("http") || uni.logoimage.startsWith("/") ? uni.logoimage : `/uploads/${uni.logoimage}`}
                        alt=""
                        className="w-9 h-9 rounded-xl object-contain border border-slate-100 bg-slate-50 flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-rounded text-indigo-600 text-[18px]" style={ICO_FILL}>account_balance</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate leading-tight">
                        {uni.college_name ?? "Unnamed University"}
                      </p>
                      {uni.slug && (
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">/{uni.slug}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Images thumbnails */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0" title="Logo">
                      {uni.logoimage ? (
                        <img
                          src={uni.logoimage.startsWith("http") || uni.logoimage.startsWith("/") ? uni.logoimage : `/uploads/${uni.logoimage}`}
                          alt="" className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>image</span>
                        </div>
                      )}
                    </div>
                    <div className="w-16 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0" title="Banner">
                      {uni.bannerimage ? (
                        <img
                          src={uni.bannerimage.startsWith("http") || uni.bannerimage.startsWith("/") ? uni.bannerimage : `/uploads/${uni.bannerimage}`}
                          alt="" className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-rounded text-slate-200 text-lg" style={ICO_FILL}>panorama</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  {uni.universityType ? (
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full capitalize">
                      {uni.universityType}
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className="text-sm text-slate-600">{uni.city_name ?? "—"}</span>
                </td>

                <td className="px-4 py-4 hidden lg:table-cell">
                  {uni.rating ? (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-rounded text-amber-400 text-[14px]" style={ICO_FILL}>star</span>
                      <span className="text-sm font-semibold text-slate-700">{parseFloat(uni.rating).toFixed(1)}</span>
                    </div>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>

                <td className="px-4 py-4 text-center">
                  {uni.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>verified</span>Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-rounded text-[12px]" style={ICO}>radio_button_unchecked</span>No
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 hidden xl:table-cell">
                  <span className="text-sm text-slate-500">{uni.estyear ?? "—"}</span>
                </td>

                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(uni)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Edit images"
                    >
                      <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>add_photo_alternate</span>
                      Images
                    </button>
                    {uni.slug && (
                      <Link
                        href={`/university/${uni.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-rounded text-[14px]" style={ICO}>open_in_new</span>
                        View
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UniversityFormModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={updateImages}
        university={editing}
      />
    </>
  );
}
