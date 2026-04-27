"use client";

import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  college: string;
  text: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

function TestimonialStars({ rating }: { rating: number }) {
  return (
    <div className="flex text-yellow-400 gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span 
          key={i} 
          className={`material-symbols-rounded text-xl ${i < rating ? 'opacity-100' : 'text-neutral-200'}`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export default function Testimonials({ testimonials: dynamicTestimonials }: TestimonialsProps) {
  const displayTestimonials = dynamicTestimonials && dynamicTestimonials.length > 0 
    ? dynamicTestimonials 
    : [];

  if (displayTestimonials.length === 0) return null;

  return (
    <section className="w-full py-24 lg:py-32 bg-white overflow-hidden">
      <div className="home-page-shell">
        
        <div className="mb-10 sm:mb-16 flex flex-col justify-between gap-6 sm:gap-8 md:flex-row md:items-start">
            <div className="max-w-2xl">
                <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-semibold tracking-tight leading-[1.1] mb-3 sm:mb-4">
                  <span className="text-[#0F182A]">Unfiltered</span> <span className="text-primary">Student Voices</span>
                </h2>
                <p className="text-slate-500 font-normal text-[14px] sm:text-[16px] lg:text-lg">
                  Get the real story about campus life, professors, and placements from people who&apos;ve actually been there.
                </p>
            </div>
            <button 
              className="hidden sm:flex h-[45px] items-center justify-center rounded-[5px] border border-slate-200 bg-white px-6 whitespace-nowrap transition-all shadow-sm"
              style={{ fontSize: '16px', fontWeight: 500, color: '#475569' }}
            >
                Read all reviews <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {displayTestimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
               className="bg-white rounded-[5px] pl-4 md:pl-6 pr-8 pt-6 pb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col h-full relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-red-500/10"
            >
              {/* Visual Quote Accent */}
              <div className="absolute top-8 right-8 text-[#FF3C3C]">
                <span className="material-symbols-rounded text-3xl">format_quote</span>
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar with Circular Border */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF3C3C] p-0.5 shrink-0 bg-white shadow-sm">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-[#FF3C3C] text-white font-black text-lg items-center justify-center"
                        style={{ display: t.avatar ? "none" : "flex" }}
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-none mb-1">{t.name}</h4>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.college}</p>
                  </div>
                </div>

                {/* Testimonial Text with Accent Bar */}
                <div className="border-l-2 border-[#FF3C3C] pl-4 mb-4 flex-1">
                  <p className="text-sm leading-relaxed text-slate-600 font-medium italic line-clamp-4">
                    &ldquo;{stripHtml(t.text)}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-200">
                  <TestimonialStars rating={t.rating} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
