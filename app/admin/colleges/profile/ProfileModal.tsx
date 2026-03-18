"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
  title: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: ProfileModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600" style={ICO_FILL}>
              {initialData ? "edit_square" : "add_circle"}
            </span>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <input type="hidden" name="id" defaultValue={initialData?.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User ID & Slug */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">User ID (Owner)</label>
              <input
                type="number"
                name="users_id"
                required
                defaultValue={initialData?.users_id}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                placeholder="e.g. 1502"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Slug</label>
              <input
                type="text"
                name="slug"
                required
                defaultValue={initialData?.slug}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                placeholder="e.g. iit-delhi"
              />
            </div>

            {/* Banner Image */}
            <div className="md:col-span-2">
              <ImageUpload 
                name="bannerimage_file"
                label="Banner Image"
                initialImage={initialData?.bannerimage ? (initialData.bannerimage.startsWith('http') ? initialData.bannerimage : `https://admin.admissionx.in/uploads/${initialData.bannerimage}`) : null}
              />
              <input type="hidden" name="bannerimage_existing" defaultValue={initialData?.bannerimage} />
            </div>

            {/* Rating & Ranking */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="rating"
                defaultValue={initialData?.rating || 0}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">General Ranking</label>
              <input
                type="number"
                name="ranking"
                defaultValue={initialData?.ranking || 999}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
              />
            </div>

            {/* University Type & City ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">University Type</label>
              <select
                name="universityType"
                defaultValue={initialData?.universityType || "Private"}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 bg-white"
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="IIT">IIT</option>
                <option value="NIT">NIT</option>
                <option value="IIM">IIM</option>
                <option value="Deemed">Deemed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">City ID</label>
              <input
                type="number"
                name="registeredAddressCityId"
                defaultValue={initialData?.registeredAddressCityId}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                placeholder="City ID"
              />
            </div>

            {/* Verified & Top University Toggles */}
            <div className="flex items-center gap-6 md:col-span-2 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="verified"
                  defaultChecked={!!initialData?.verified}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Verified</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isTopUniversity"
                  defaultChecked={!!initialData?.isTopUniversity}
                  className="w-5 h-5 rounded-lg border-slate-300 text-amber-600 focus:ring-amber-500/20 transition-all cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Top University</span>
              </label>

              <div className="flex-1 flex items-center gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Rank #</label>
                <input
                  type="number"
                  name="topUniversityRank"
                  defaultValue={initialData?.topUniversityRank}
                  className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-slate-700 text-xs"
                  placeholder="Rank"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-[1.25rem] text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-[1.25rem] bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded text-[18px]">check_circle</span>
                  {initialData ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
