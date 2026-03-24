"use client";

import { useState, useEffect } from "react";

interface AdminImageProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackType?: "symbol" | "placeholder" | "div";
  fallbackValue?: string; // Symbol name or Placeholder URL
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function AdminImg({
  src,
  alt = "",
  className = "",
  fallbackType = "div",
  fallbackValue = "No Image"
}: AdminImageProps) {
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    
    // Use the production base URL if nothing else is configured
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE || "https://admin.admissionx.in";
    let url = `${baseUrl}/uploads/${source}`;
    
    // If it's a legacy production URL, use our proxy to bypass SSL SNI issues
    if (url.startsWith("https://admin.admissionx.in/") || url.startsWith("https://admissionx.info/")) {
      url = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }

    // Only add a cache buster if we are already mounted on the client
    // to avoid hydration mismatches.
    if (mounted) {
      return `${url}${url.includes("?") ? "&" : "?" }v=${Date.now()}`;
    }
    return url;
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
