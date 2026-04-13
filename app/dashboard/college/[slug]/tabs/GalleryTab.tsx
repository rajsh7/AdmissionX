"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";
import Image from "next/image";

interface Props {
  college: CollegeUser;
}

interface GalleryImage {
  id: number;
  name: string;
  fullimage: string;
  rawPath: string;
  caption: string;
  created_at: string;
}

export default function GalleryTab({ college }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Video URL State
  const [videoUrl, setVideoUrl] = useState("");
  const [submittingVideo, setSubmittingVideo] = useState(false);

  const slug = college.slug;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/gallery`);
      if (!res.ok) throw new Error("Failed to load gallery.");
      const data = await res.json();
      setImages(data.gallery ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("name", selectedFile.name);
      
      const res = await fetch(`/api/college/dashboard/${slug}/gallery`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed.");
      
      const data = await res.json();
      setImages((prev) => [data.image, ...prev]);
      setSelectedFile(null);
      alert("Image uploaded successfully!");
    } catch (e) {
      alert("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitVideo = async () => {
    if (!videoUrl) return;
    setSubmittingVideo(true);
    // Placeholder for video submission logic
    setTimeout(() => {
      alert("Video URL submitted!");
      setVideoUrl("");
      setSubmittingVideo(false);
    }, 1000);
  };

  const tabs = [
    { id: "address", label: "Address", icon: "location_on" },
    { id: "gallery", label: "Gallery", icon: "image" },
    { id: "achievements", label: "Achievements", icon: "emoji_events" },
    { id: "courses", label: "Courses", icon: "menu_book" },
    { id: "facilities", label: "Facilities", icon: "apartment" },
    { id: "events", label: "Events", icon: "event" },
    { id: "scholarships", label: "Scholarships", icon: "payments" },
    { id: "placement", label: "Placements", icon: "work" },
    { id: "letters", label: "Letters", icon: "description" },
    { id: "sports", label: "Sports", icon: "sports_soccer" },
    { id: "cutoffs", label: "Cut Offs", icon: "assignment" },
    { id: "faculty", label: "Faculties", icon: "groups" },
  ];

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
      {/* ── Sub-navigation ────────────────────────────────────────────────── */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = tab.id === "gallery";
          return (
            <div
              key={tab.id}
              className={`flex items-center justify-center gap-2 py-3 px-6 text-[13px] font-bold transition-all cursor-pointer border-r border-slate-100 flex-1 min-w-[140px] ${
                isActive ? "bg-[#FF3C3C] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-white" : "text-slate-400"}`}>
                {tab.icon}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="p-8 md:p-12">
        <h2 className="text-[22px] font-bold text-[#333] mb-12">Upload New Photo To your Gallery</h2>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0 lg:divide-x lg:divide-slate-200 bg-white p-4 rounded-xl">
          {/* Left: Image Upload Section */}
          <div className="flex-1 w-full flex flex-col items-center px-4 lg:px-12">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-[320px] aspect-[4/3] bg-[#f0f0f0] border border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group mb-4"
            >
              <span className="material-symbols-outlined text-[48px] text-slate-400 group-hover:scale-110 transition-transform">add</span>
              <span className="text-[18px] font-bold text-slate-500 mt-2">Add Image</span>
            </div>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <div className="w-full max-w-[320px] bg-[#f0f0f0] border border-slate-200 rounded py-2 text-center text-[14px] text-slate-500 mb-8">
              {selectedFile ? `1 File Selected (${selectedFile.name})` : "0 Files Selected"}
            </div>

            <button 
              onClick={handleUploadImage}
              disabled={!selectedFile || uploadingImage}
              className="bg-[#9DA6B7] hover:bg-[#8e99ac] disabled:opacity-50 text-white px-12 py-3.5 rounded-[10px] font-bold text-[18px] transition-all shadow-[0_4px_12px_rgba(157,166,183,0.3)] w-full max-w-[240px]"
            >
              {uploadingImage ? "Uploading..." : "Upload Image"}
            </button>
          </div>

          {/* Middle: OR Divider */}
          <div className="hidden lg:flex flex-col items-center px-4">
            <div className="w-[1px] h-32 bg-slate-200 mb-4" />
            <span className="text-slate-400 font-bold text-[14px]">OR</span>
            <div className="w-[1px] h-32 bg-slate-200 mt-4" />
          </div>
          <div className="lg:hidden flex items-center w-full gap-4 px-8">
             <div className="flex-1 h-[1px] bg-slate-200" />
             <span className="text-slate-400 font-bold text-[14px]">OR</span>
             <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Right: Video URL Section */}
          <div className="flex-1 w-full flex flex-col items-center px-4 lg:px-12">
            <div className="w-full text-center mb-10">
              <p className="text-[14px] text-[#666] font-bold leading-relaxed">
                Update Youtube / Vimeo videos in your college profile
              </p>
              <p className="text-[12px] text-slate-400 mt-1 italic">
                ( https://www.youtube.com/watch?v=kSERoMjkIM )
              </p>
            </div>

            <input 
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter Video url here"
              className="w-full border border-slate-200 rounded px-4 py-3 text-[14px] text-slate-600 focus:outline-none focus:border-red-400 transition-colors mb-8"
            />

            <button 
              onClick={handleSubmitVideo}
              disabled={!videoUrl || submittingVideo}
              className="bg-[#FF3C3C] hover:bg-[#e63535] disabled:opacity-50 text-white px-12 py-3 rounded-[6px] font-bold text-[18px] transition-all shadow-md w-full max-w-[200px]"
            >
              {submittingVideo ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Existing Gallery Grid (kept for UX) */}
        {!loading && images.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-100">
            <h3 className="text-[18px] font-bold text-slate-600 mb-6 px-2">Uploaded Photos ({images.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  <Image
                    src={img.fullimage}
                    alt={img.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
    </div>
  );
}
