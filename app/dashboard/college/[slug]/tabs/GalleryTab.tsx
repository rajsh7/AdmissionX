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
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => { load(); }, [load]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSuccess(null);
    setError(null);
  }

  async function handleUploadImage() {
    if (!selectedFile) return;
    setUploadingImage(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("name", selectedFile.name);
      const res = await fetch(`/api/college/dashboard/${slug}/gallery`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed.");
      const data = await res.json();
      setImages(prev => [data.image, ...prev]);
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/college/dashboard/${slug}/gallery?imageId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setImages(prev => prev.filter(img => img.id !== id));
      setSuccess("Image deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  async function handleSubmitVideo() {
    if (!videoUrl) return;
    setSubmittingVideo(true);
    setTimeout(() => {
      setSuccess("Video URL submitted!");
      setVideoUrl("");
      setSubmittingVideo(false);
      setTimeout(() => setSuccess(null), 4000);
    }, 1000);
  }

  return (
    <div className="pb-24 font-poppins bg-[#fcfcfc] min-h-[600px] border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">

      {/* Content Area */}
      <div className="p-6 md:p-10">
        <h2 className="text-[20px] font-bold text-[#333] mb-8">Upload New Photo To your Gallery</h2>

        {/* Feedback */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Upload Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Image Upload */}
            <div className="flex-1 flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[280px] aspect-[4/3] bg-[#f0f0f0] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF3C3C] hover:bg-red-50/30 transition-all group mb-4"
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[48px] text-slate-300 group-hover:text-[#FF3C3C] transition-colors">add_photo_alternate</span>
                    <span className="text-[14px] font-bold text-slate-400 mt-2">Add Image</span>
                  </>
                )}
              </div>

              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

              <div className="w-full max-w-[280px] bg-[#f0f0f0] border border-slate-200 rounded py-2 px-3 text-center text-[13px] text-slate-500 mb-6 truncate">
                {selectedFile ? selectedFile.name : "0 Files Selected"}
              </div>

              <button
                onClick={handleUploadImage}
                disabled={!selectedFile || uploadingImage}
                className="bg-[#9DA6B7] hover:bg-[#8e99ac] disabled:opacity-50 text-white px-10 py-3 rounded-[10px] font-bold text-[15px] transition-all w-full max-w-[200px]"
              >
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex lg:flex-col items-center gap-4">
              <div className="flex-1 lg:flex-none h-px lg:h-24 w-full lg:w-px bg-slate-200" />
              <span className="text-slate-400 font-bold text-[13px] shrink-0">OR</span>
              <div className="flex-1 lg:flex-none h-px lg:h-24 w-full lg:w-px bg-slate-200" />
            </div>

            {/* Video URL */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[14px] text-[#666] font-bold text-center mb-2">
                Update Youtube / Vimeo videos in your college profile
              </p>
              <p className="text-[12px] text-slate-400 italic text-center mb-6">
                ( https://www.youtube.com/watch?v=kSERoMjkIM )
              </p>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Enter Video url here"
                className="w-full border border-slate-200 rounded px-4 py-3 text-[14px] text-slate-600 focus:outline-none focus:border-red-400 transition-colors mb-6"
              />
              <button
                onClick={handleSubmitVideo}
                disabled={!videoUrl || submittingVideo}
                className="bg-[#FF3C3C] hover:bg-[#e63535] disabled:opacity-50 text-white px-10 py-3 rounded-[6px] font-bold text-[15px] transition-all w-full max-w-[160px]"
              >
                {submittingVideo ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {!loading && images.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="text-[16px] font-bold text-slate-600 mb-6">Uploaded Photos ({images.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={img.id ?? `img-${idx}`} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  <Image src={img.fullimage} alt={img.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDelete(img.id ?? 0)} className="text-white text-xs font-bold bg-red-600/80 px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-xl" />)}
          </div>
        )}
      </div>
    </div>
  );
}
