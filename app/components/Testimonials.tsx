"use client";

import { motion } from "framer-motion";

export interface HomepageTestimonial {
  id: number;
  name: string;
  college: string;
  text: string;
  rating: number;
  avatar: string | null;
}

interface TestimonialsProps {
  testimonials: HomepageTestimonial[];
}

function getAvatarUrl(src: string | null) {
  if (!src) return null;
  if (src.startsWith("/") || src.startsWith("http")) return src;
  const url = `https://admin.admissionx.in/uploads/testimonials/${src}`;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="w-full py-24 lg:py-32 bg-white overflow-hidden border-b border-slate-200">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="max-w-2xl">
                <h2 className="text-[40px] font-semibold tracking-tight leading-[1.1] mb-4">
                  <span className="text-[#6C6C6C]">Unfiltered</span> <span className="text-primary">Student Voices</span>
                </h2>
                <p className="text-slate-500 font-normal text-lg">
                  Get the real story about campus life, professors, and placements from people who&apos;ve actually been there.
                </p>
            </div>
            <button 
              className="hidden sm:flex items-center justify-center px-10 h-[59px] bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15),0_5px_15px_-5px_rgba(0,0,0,0.1)] border border-slate-200 whitespace-nowrap transition-all rounded-[10px]"
              style={{ fontSize: '24px', fontWeight: 500, color: '#6C6C6C' }}
            >
                Read all reviews
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-[10px] bg-white border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.1)] flex flex-col h-full group transition-all hover:shadow-xl hover:border-slate-200"
            >
              {/* Card Header: Profile Info & Quote */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                    {getAvatarUrl(t.avatar) ? (
                      <img src={getAvatarUrl(t.avatar) || ""} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[13px] font-bold text-slate-500 bg-slate-100">
                        {getInitials(t.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-none mb-1">{t.name}</h4>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.college}</p>
                  </div>
                </div>
                <div className="shrink-0 opacity-100 transition-opacity mt-1 flex items-center gap-1">
                  <img src="/images/Vector.png" alt="quote" className="w-[18px] h-auto" />
                  <img src="/images/Vector.png" alt="quote" className="w-[18px] h-auto" />
                </div>
              </div>

              {/* Card Body: Testimonial Text with Red Accent Line */}
              <div className="border-l-2 border-primary pl-4 mb-8 flex-1">
                <p className="text-slate-600 font-normal leading-relaxed text-[15px] italic">
                  &quot;{t.text}&quot;
                </p>
              </div>

              {/* Card Footer: Star Ratings */}
              <div className="flex gap-0.5 pt-6 border-t border-[#3D3D3D] text-yellow-400 mt-auto">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-rounded text-[18px] ${i < t.rating ? 'text-[#F6C744]' : 'text-[#B9BEC8]'}`}
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
