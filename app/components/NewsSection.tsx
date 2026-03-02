"use client";

import Link from "next/link";

interface Article {
  image: string;
  category: string;
  categoryStyle: string;
  time: string;
  title: string;
  excerpt: string;
  href: string;
}

const articles: Article[] = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZHsLzuLeArcrDG-GlT6u4Av2kG-MZs4IVdOj7uGbRaX4sXmdRe97xgVriH6QLXTkqYJVEvgRyG26vtJG5fMyHSO25tIBrO6lsJ2y3xtS2BtfrRLMQAn5JSlo3EnADNe6z7e2R2TCpQz5ydakCrilvovFFqneZcnX985Yb7ZN8y_O0ely9mKUMceBJFGJS9N8IWlrvkaLahsKB9eAr1_8vqcQVz35OXA9rYjszVDGBnWqqLD4fhaxRoh2ly4RPAfy1CuXruXz0SaA",
    category: "Admissions",
    categoryStyle: "text-primary bg-primary/10",
    time: "2 hours ago",
    title: "Fall 2024 Admission Deadlines Announced for Ivy League",
    excerpt:
      "Most Ivy League universities have released their application deadlines for the upcoming fall semester. Early decision applications are due by November 1st.",
    href: "/news/ivy-league-deadlines",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPaz_8mWMCn9KVP3KHlPdsq08U2YWPEKt1oMxiHoz11cAcNozCmOa2S31IIYJ3a-jo2h3HJ6fA0Em6ebmLsoahY5oVzdcH7vGPhjceoKihl-LROcZj4EpSHGmJXnqBQbXHUJGOt5VlqAncLsJZM5wawuWrRh3x8BsO_AT5HrUOuJlo2KpqZO829sp5BZ_PwbfwW00qA2_zjyo96Im1DZdleFF929eQjdbsYSn1SPlRA0bEP90wc0eEVVd5HsZoZx-QyFdmpFf_RJw",
    category: "Exam Alert",
    categoryStyle: "text-orange-600 bg-orange-100",
    time: "1 day ago",
    title: "GMAT Focus Edition: Everything You Need to Know",
    excerpt:
      "The Graduate Management Admission Council has introduced the new GMAT Focus Edition. Learn about the changes in format and scoring.",
    href: "/news/gmat-focus",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNs9ccBRMtocrV0p4FzHZ5q34nDRqbQFvO4X4HKcE3IY2_TFLF98w7qLIPxoSFoPTcioM1yVpLQs9ObGkDKain815vPXu_HOAHXDrutmwAoTfylCNqqglTAfZYoL0TsESugmBehvNA35bfPkfBbnBUpRflwwZAA63CGuySAm3Ppi3j4OPjABlI-l7MvFXl4--21KiTZ9dA_NsduwFx7CqlhnjYe4_-cpnJ1USGc6TvQyGxC9icuYXSkAqI5nIp2J93qqcfbncHlcY",
    category: "Blog",
    categoryStyle: "text-teal-600 bg-teal-100",
    time: "3 days ago",
    title: "Top 10 Scholarships for International Students in 2024",
    excerpt:
      "Funding your education abroad can be challenging. We've compiled a list of the most generous scholarship programs available globally.",
    href: "/blogs/scholarships-2024",
  },
];

export default function NewsSection() {
  return (
    <section className="bg-slate-50 dark:bg-slate-800/50 py-16">
      <div className="w-full px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Latest Updates &amp; News
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Stay informed about admission deadlines and education news.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.title}
              className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="h-48 w-full bg-slate-200 bg-cover bg-center"
                style={{ backgroundImage: `url('${article.image}')` }}
              />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${article.categoryStyle}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {article.time}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                <Link
                  href={article.href}
                  className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  Read more{" "}
                  <span className="material-symbols-outlined text-base ml-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
