"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const searchOptions = [
  { 
    title: "Find a course", 
    description: "Search by subject, course or region to find the right course for you.",
    href: "/search?type=course"
  },
  { 
    title: "Find a university", 
    description: "Search for universities to find out about courses and more.",
    href: "/search?type=university"
  },
  { 
    title: "Find an open day", 
    description: "Search and book open days to help you make the right choice.",
    href: "/search?type=openday"
  },
  { 
    title: "Global Search", 
    description: "Discover top-ranked institutions across the globe with our advanced filters.",
    href: "/search"
  },
  { 
    title: "Admission Guidance", 
    description: "Get expert advice and 1-on-1 counseling for your higher education journey.",
    href: "/counselling"
  },
  { 
    title: "Scholarship Finder", 
    description: "Find and apply for scholarships that match your academic profile.",
    href: "/scholarships"
  },
];

export default function FieldsOfStudy() {
  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden">
      {/* Background Image without Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Background-images/20ae9a1c8117e707bfd14ba61097b9db0707fc62.jpg"
          alt="Fields of Study Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {searchOptions.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div 
                className="group flex flex-col p-8 lg:p-10 rounded-[5px] bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] transition-all hover:shadow-2xl hover:-translate-y-2 h-full border border-slate-100"
              >
                <h3 className="text-[24px] font-bold text-[#1F2937] mb-4 tracking-tight leading-tight">
                   {opt.title}
                </h3>
                <p className="text-[17px] text-[#4B5563] font-normal leading-relaxed mb-6 flex-1">
                   {opt.description}
                </p>
                <Link 
                  href={opt.href}
                  className="inline-flex items-center gap-2 text-[#FF3C3C] font-semibold text-[17px] hover:gap-3 transition-all"
                >
                   <span>see more</span>
                   <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}




