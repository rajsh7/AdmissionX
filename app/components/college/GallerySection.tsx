"use client";

import { useState, useEffect, useCallback } from "react";
import type { GalleryData } from "@/app/api/college/[slug]/route";
import Image from "next/image";

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: GalleryData[];
  index: number;
  onClose: () => void;
}

function Lightbox({ images, index, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-[22px]">close</span>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
        {current + 1} / {images.length}
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10"
          aria-label="Previous image"
        >
          <span className="material-symbols-outlined text-[24px]">
            chevron_left
          </span>
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10"
          aria-label="Next image"
        >
          <span className="material-symbols-outlined text-[24px]">
            chevron_right
          </span>
        </button>
      )}

      {/* Main image */}
      <div
        className="relative max-w-5xl max-h-[80vh] mx-16 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={img.id}
          src={img.image}
          alt={img.caption ?? img.name ?? `Gallery image ${current + 1}`}
          width={1200}
          height={800}
          className="max-h-[75vh] max-w-full w-auto object-contain rounded-xl shadow-2xl"
        />
        {(img.caption || img.name) && (
          <p className="mt-3 text-sm text-white/70 text-center max-w-lg">
            {img.caption ?? img.name}
          </p>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-2 bg-black/40 rounded-2xl backdrop-blur-sm">
            {images.map((thumb, i) => (
              <button
                key={thumb.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={thumb.image}
                  alt={`Thumb ${i + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gallery grid item ────────────────────────────────────────────────────────

function GalleryItem({
  image,
  index,
  onClick,
}: {
  image: GalleryData;
  index: number;
  onClick: (index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <button
      className="relative overflow-hidden rounded-xl group aspect-square bg-white/5 hover:ring-2 hover:ring-red-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
      onClick={() => onClick(index)}
      aria-label={image.caption ?? image.name ?? `View image ${index + 1}`}
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}

      <Image
        src={image.image}
        alt={image.caption ?? image.name ?? `Gallery ${index + 1}`}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 250px"
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-white text-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          zoom_in
        </span>
      </div>

      {/* Caption overlay at bottom */}
      {image.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-[10px] font-semibold line-clamp-2">
            {image.caption}
          </p>
        </div>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GallerySectionProps {
  gallery: GalleryData[];
  collegeName: string;
  /** Max images to show before "View more" — default 12 */
  previewCount?: number;
}

export default function GallerySection({
  gallery,
  collegeName,
  previewCount = 12,
}: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const validImages = gallery.filter((g) => !!g.image);

  if (validImages.length === 0) return null;

  const displayImages = showAll ? validImages : validImages.slice(0, previewCount);
  const remaining = validImages.length - previewCount;

  return (
    <>
      <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden scroll-mt-24" id="gallery">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full block flex-shrink-0" />
            Photo Gallery
          </h2>
          <span className="text-xs font-semibold text-neutral-300 bg-white/5 px-3 py-1 rounded-full flex-shrink-0">
            {validImages.length} photo{validImages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3">
            {displayImages.map((img, i) => (
              <GalleryItem
                key={img.id}
                image={img}
                index={i}
                onClick={setLightboxIndex}
              />
            ))}

            {/* "View more" tile */}
            {!showAll && remaining > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="relative overflow-hidden rounded-xl aspect-square bg-neutral-900 hover:bg-red-600 transition-colors duration-300 flex flex-col items-center justify-center gap-1 group"
                aria-label={`View ${remaining} more photos`}
              >
                <span
                  className="material-symbols-outlined text-[28px] text-white/70 group-hover:text-white transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  photo_library
                </span>
                <span className="text-white font-black text-lg leading-none">
                  +{remaining}
                </span>
                <span className="text-white/60 group-hover:text-white/80 text-[10px] font-semibold transition-colors">
                  more photos
                </span>
              </button>
            )}
          </div>

          {/* Collapse button */}
          {showAll && validImages.length > previewCount && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300"
              >
                <span className="material-symbols-outlined text-[15px]">
                  expand_less
                </span>
                Show less
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-neutral-400">
            photo_camera
          </span>
          <p className="text-[11px] text-neutral-400">
            Campus photos of{" "}
            <span className="font-semibold text-neutral-300">{collegeName}</span>
            {" · "}Click any image to view full screen
          </p>
        </div>
      </section>

      {/* Lightbox portal */}
      {lightboxIndex !== null && (
        <Lightbox
          images={displayImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}




