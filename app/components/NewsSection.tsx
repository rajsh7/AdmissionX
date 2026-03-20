"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DbBlog } from "../api/home/latest-blogs/route";

interface NewsSectionProps {
  dbBlogs?: DbBlog[];
}

const STATIC_BLOGS = [
  {
    id: 1,
    title: "Guide to Engineering Admissions 2026: Everything You Need to Know",
    excerpt: "Discover the step-by-step process for securing your seat in top engineering colleges this year.",
    category: "Admissions",
    date: "March 15, 2024",
    image: "https://images.unsplash.com/photo-1523240715627-5d0b541f8d9c?q=80&w=2670&auto=format&fit=crop",
    href: "/education-blogs/engineering-admissions-2026",
  },
  {
    id: 2,
    title: "Top 10 MBA Specializations for a High-Growth Career in 2026",
    excerpt: "From AI Management to Sustainable Business, explore the specializations that are in high demand.",
    category: "Career Guidance",
    date: "March 12, 2024",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop",
    href: "/education-blogs/top-mba-specializations-2026",
  },
  {
    id: 3,
    title: "How to Prepare for NEET 2026: Tips from Top Rankers",
    excerpt: "Effective study plans and strategies shared by successful medical aspirants.",
    category: "Exam Tips",
    date: "March 10, 2024",
    image: "https://images.unsplash.com/photo-1576091160550-217359f41f48?q=80&w=2670&auto=format&fit=crop",
    href: "/education-blogs/neet-2026-preparation-tips",
  },
];

export default function NewsSection({ dbBlogs }: NewsSectionProps) {
  const blogs = STATIC_BLOGS;

  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Student Life & Beyond</h2>
              <p className="mt-3 text-slate-500 font-medium max-w-lg">
                Explore our latest articles, guides, and student stories to stay ahead in your academic journey.
              </p>
           </div>
           <Link href="/education-blogs" className="text-sm font-black text-[#008080] hover:underline underline-offset-4 uppercase tracking-widest">
              Explore All Articles
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {blogs.map((blog, i) => (
             <motion.div
               key={blog.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: i * 0.1 }}
             >
                <Link 
                  href={blog.href}
                  className="group block"
                >
                   <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 shadow-lg shadow-black/5">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[#008080]">
                            {blog.category}
                         </span>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span>{blog.date}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                         <span>5 min read</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#008080] transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                      
                      <div className="pt-2 flex items-center gap-2 text-[#008080] font-black text-xs uppercase tracking-widest">
                         <span>Read Article</span>
                         <span className="material-symbols-rounded text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                   </div>
                </Link>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
