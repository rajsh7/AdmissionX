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

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=150&h=150";

function TestimonialStars({ rating }: { rating: number }) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="mt-auto flex gap-1.5 border-t border-slate-200 pt-5">
      {Array.from({ length: 5 }, (_, starIdx) => {
        const isFilled = starIdx < filledStars;

        return (
          <svg
            key={starIdx}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`h-[22px] w-[22px] ${isFilled ? "text-amber-400" : "text-slate-300"}`}
            fill="currentColor"
          >
            <path d="M12 2.75l2.76 5.59 6.17.9-4.46 4.35 1.05 6.15L12 16.84 6.48 19.74l1.05-6.15-4.46-4.35 6.17-.9L12 2.75z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function Testimonials({ testimonials: dynamicTestimonials }: TestimonialsProps) {
  const displayTestimonials = dynamicTestimonials && dynamicTestimonials.length > 0 
    ? dynamicTestimonials 
    : [];

  if (displayTestimonials.length === 0) return null;

  return (
    <section className="w-full py-24 lg:py-32 bg-white overflow-hidden">
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
          {displayTestimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-[10px] bg-white border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.1)] flex flex-col h-full group transition-all hover:shadow-xl hover:border-slate-200"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                    <img src={t.avatar || DEFAULT_AVATAR} alt={t.name} className="w-full h-full object-cover" />
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

              <div className="border-l-2 border-primary pl-4 mb-8 flex-1">
                <p className="text-slate-600 font-normal leading-relaxed text-[15px] italic line-clamp-4">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <TestimonialStars rating={t.rating} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
