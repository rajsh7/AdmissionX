"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function CollegeGallery({ slug }: { slug: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/college/gallery?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? []));
  }, [slug]);

  if (images.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#FF3C3C]">photo_library</span>
        Campus Gallery
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(src)}
            className="relative aspect-[4/3] rounded-[8px] overflow-hidden bg-neutral-100 hover:opacity-90 transition-opacity"
          >
            <Image
              src={src}
              alt={`Campus photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white material-symbols-outlined text-[32px] hover:text-[#FF3C3C] transition-colors"
            onClick={() => setSelected(null)}
          >
            close
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] aspect-[4/3]">
            <Image
              src={selected}
              alt="Campus photo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
