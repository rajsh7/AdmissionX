import Image from "next/image";
import Link from "next/link";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface CollegeGridProps {
  colleges: CollegeResult[];
  total: number;
}

export default function CollegeGrid({ colleges, total }: CollegeGridProps) {
  if (colleges.length === 0) return null;

  return (
    <div className="py-14">
      <div className="w-full px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              International Colleges
            </h2>
            <p className="text-neutral-300 text-sm">
              {total.toLocaleString()} colleges available abroad
            </p>
          </div>
          <Link
            href="/study-abroad?page=1"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Browse All
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {colleges.slice(0, 8).map((college) => (
            <Link
              key={college.id}
              href={`/college/${college.slug}`}
              className="group flex flex-col bg-black/40 rounded-2xl border border-white/10 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden bg-neutral-100">
                <Image
<<<<<<< HEAD
                  src={college.image || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=800&auto=format&fit=crop"}
=======
                  src={college.image || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="}
>>>>>>> b53fab0075329efe9629528a612203aedb97b6e0
                  alt={college.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 250px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white text-xs font-medium">
                  <span className="material-symbols-outlined text-[13px]">
                    location_on
                  </span>
                  <span className="truncate max-w-[140px]">
                    {college.location}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {college.name}
                </h3>

                {college.streams.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {college.streams.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 bg-white/10 text-neutral-300 text-[10px] font-semibold rounded uppercase tracking-wide"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[13px] text-amber-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-xs font-bold text-neutral-300">
                      {college.rating > 0
                        ? college.rating.toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-600 group-hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
