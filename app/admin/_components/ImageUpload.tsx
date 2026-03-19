"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  name: string;
  label?: string;
  initialImage?: string | null;
  required?: boolean;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function ImageUpload({ 
  name, 
  label = "Select Image", 
  initialImage,
  required = false 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      
      <div className="relative group">
        <div 
          className={`w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden bg-slate-50/50 ${
            preview ? "border-blue-200 bg-white" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-contain p-2"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600"; }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            </>
          ) : (
            <div 
              className="cursor-pointer flex flex-col items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-rounded text-slate-300 text-[40px]" style={ICO_FILL}>add_photo_alternate</span>
              <p className="text-xs font-semibold text-slate-400">Click to upload or drag & drop</p>
              <p className="text-[10px] text-slate-300">JPG, PNG or WebP (Max 3MB)</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          required={required && !preview}
        />
        
        {preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg opacity-0 group-hover:opacity-100"
          >
            Change Image
          </button>
        )}
      </div>
    </div>
  );
}
