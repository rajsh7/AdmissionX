"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ChapterHeading from "./ChapterHeading";

interface Article {
  image: string;
  category: string;
  categoryColor: string;
  time: string;
  title: string;
  excerpt: string;
  href: string;
}

const articles: Article[] = [
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop",
    category: "Admissions",
    categoryColor: "bg-primary/10 text-primary",
    time: "2 hours ago",
    title: "Fall 2026 Admission Deadlines Announced for Ivy League",
    excerpt:
      "Most Ivy League universities have released their application deadlines for the upcoming fall semester. Early decision applications are due by November 1st.",
    href: "/news/ivy-league-deadlines",
  },
  {
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
    category: "Exam Alert",
    categoryColor: "bg-orange-500/10 text-orange-500",
    time: "1 day ago",
    title: "GMAT Focus Edition: Everything You Need to Know",
    excerpt:
      "The Graduate Management Admission Council has introduced the new GMAT Focus Edition. Learn about the changes in format and scoring.",
    href: "/news/gmat-focus",
  },
  {
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2649&auto=format&fit=crop",
    category: "Scholarships",
    categoryColor: "bg-teal-500/10 text-teal-500",
    time: "3 days ago",
    title: "Top 10 Scholarships for International Students in 2026",
    excerpt:
      "Funding your education abroad can be challenging. We've compiled a list of the most generous scholarship programs available globally.",
    href: "/blogs/scholarships-2026",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function NewsSection() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-background-dark overflow-hidden">
      <div className="orb orb-blue w-[300px] h-[300px] top-10 -right-20 opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <ChapterHeading
            number="06"
            label="Stay Sharp"
            title="Knowledge Is Power"
            subtitle="Stay ahead with the latest admission updates, exam alerts, and education insights that matter."
            align="center"
            light
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              variants={cardVariants}
              className={i === 0 ? "md:row-span-1" : ""}
            >
              <Link href={article.href} className="group flex flex-col glass rounded-2xl overflow-hidden h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${article.categoryColor}`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-slate-500 text-[14px]">schedule</span>
                    <span className="text-xs text-slate-500">{article.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-5 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Read more
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
