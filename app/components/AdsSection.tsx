import Image from "next/image";
import Link from "next/link";

export interface AdItem {
  id: number;
  title: string | null;
  description: string | null;
  img: string | null;
  redirectto: string | null;
}

interface AdsSectionProps {
  ads: AdItem[];
}

export default function AdsSection({ ads }: AdsSectionProps) {
  if (!ads || ads.length === 0) return null;

  return (
    <section className="w-full py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className={`grid gap-4 ${ads.length === 1 ? "grid-cols-1" : ads.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {ads.map((ad) => {
          const imgSrc = ad.img
            ? ad.img.startsWith("/") ? ad.img : `/uploads/${ad.img}`
            : null;

          const inner = (
            <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-slate-100 bg-slate-50 group cursor-pointer">
              {imgSrc ? (
                <div className="relative w-full h-[120px] sm:h-[140px]">
                  <Image
                    src={imgSrc}
                    alt={ad.title || "Advertisement"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {ad.title && (
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white font-bold text-sm truncate drop-shadow">{ad.title}</p>
                      {ad.description && (
                        <p className="text-white/80 text-xs truncate mt-0.5">{ad.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-5 py-6">
                  {ad.title && <p className="font-bold text-slate-800 text-sm">{ad.title}</p>}
                  {ad.description && <p className="text-slate-500 text-xs mt-1">{ad.description}</p>}
                </div>
              )}
              <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest bg-black/30 text-white/70 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                Ad
              </span>
            </div>
          );

          return ad.redirectto ? (
            <Link key={ad.id} href={ad.redirectto} target="_blank" rel="noopener noreferrer sponsored">
              {inner}
            </Link>
          ) : (
            <div key={ad.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
