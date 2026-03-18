"use client";

import { useState } from "react";

interface AdminImageProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackType?: "symbol" | "placeholder" | "div";
  fallbackValue?: string; // Symbol name or Placeholder URL
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function AdminImage({
  src,
  alt = "",
  className = "",
  fallbackType = "div",
  fallbackValue = "No Image"
}: AdminImageProps) {
  const [error, setError] = useState(false);

  // If there's an error or no src, show the fallback
  if (error || !src) {
    if (fallbackType === "symbol") {
      return (
        <span className="material-symbols-rounded text-blue-600 text-[20px]" style={ICO_FILL}>
          {fallbackValue}
        </span>
      );
    }
    if (fallbackType === "placeholder") {
      return (
        <img 
          src={fallbackValue} 
          alt="Placeholder" 
          className={className} 
        />
      );
    }
    return (
      <div className={`${className} flex items-center justify-center bg-slate-50 text-slate-300 text-[9px] font-bold uppercase tracking-tighter text-center leading-none p-1`}>
        {fallbackValue}
      </div>
    );
  }

  const getImageUrl = (source: string) => {
    if (!source) return "";
    if (source.startsWith("http://") || source.startsWith("https://") || source.startsWith("/")) {
      return source;
    }
    // Assume it's a relative path in the uploads directory
    return `/uploads/${source}`;
  };

  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
