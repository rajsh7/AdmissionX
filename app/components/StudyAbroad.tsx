"use client";

import Link from "next/link";

const countries = [
  {
    name: "MIT",
    fullName: "Massachusetts Institute of Technology",
    rank: "#1 QS Ranking",
    flag: "🇺🇸",
    tags: ["Engineering", "Comp Sci"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYCFqlUbTr10oG_5DWXzfh-FqvGrr7_sutoc8N87szfdJcfqhOStsPzRoRQmGQ32-VK4DlpvU2SFAP4dfKRoLYWoqcL6bfi5CgK79DAadCOpOxZfDT30Ofqugu3mrSqtKG_NwyORjE58yfy6bffRMd5__bWPnFiB-ZC61_eB6m2u4XX6wzBBpb03N_HlELfdWnaohRSEFgKPS1G6uTIWzjobIKkJgeRHdhK9PAGMzP2OSPPCyVCV-vDU_9Kfa6xGGVNPuLzGH-RZc",
    href: "/university/mit",
  },
  {
    name: "Cambridge",
    fullName: "University of Cambridge",
    rank: "#2 QS Ranking",
    flag: "🇬🇧",
    tags: ["Law", "Science"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXoatJfNwxIFKfvrHW8Cj8xm1fBGaoQzSZDYJWEoEsqEIHRVesl-mSbrqYB-mYAkRvFTB-iLiqV6mG9f-Qps7vJdtD_yHgGjAcZpG0qqZaOuaF8tj82SZxSVTyB43Pgi9GaFghDBdvjmsbnZ7GIx2T1QWQSubSCfXloO-K8BgkZUdYeyFzZVD9cko6tfj2UJcrSZFlCy-z9VXHI3xe0LCCzedPy5QfJIlHRjR6EksTeQuG36bU2rLSXRhAZNHrKd2viwMVh24erBw",
    href: "/university/cambridge",
  },
  {
    name: "NUS",
    fullName: "National University of Singapore",
    rank: "#12 QS Ranking",
    flag: "🇸🇬",
    tags: ["Business", "Technology"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZmw7mYfLOfeFi9cqdDtj-4GCHDXNwf2GPJAIH7c77KJozGtT4zPPyANapkHuTCxR7RVzGB8H8lF0DwKuYgyXr3wFiYpfUvtSVRJfRZeA2bIE3JRKeahjUz1ix1RTSi9D4OFg3peNPrn8WLJGyOXDlbDi3ISYRv9Gc_fxRk5lXTqgSuY_J3zF06SiWLDaZ0zceWu9nc_7BUOE1cOJ-psu-9veblPP5epXbvJQFhoA16B6Ltfz7PBcspP-pqleVVWR13QK9dzP3ceQ",
    href: "/university/nus",
  },
];

export default function StudyAbroad() {
  return (
    <section className="bg-white dark:bg-slate-900 py-16 border-t border-slate-100 dark:border-slate-800">
      <div className="w-full px-4">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
            Global Education
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Study Abroad
          </h2>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Explore prestigious international universities ranked among the best
            in the world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {countries.map((uni) => (
            <Link
              key={uni.name}
              href={uni.href}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 block"
            >
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
                <div
                  className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url('${uni.image}')` }}
                />
              </div>
              <div className="relative z-20 p-6 h-full flex flex-col justify-end min-h-[320px]">
                <div className="flex items-start justify-between mb-auto">
                  <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {uni.rank}
                  </span>
                  <div className="bg-white rounded-full p-1.5 h-8 w-8 flex items-center justify-center">
                    <span className="text-lg">{uni.flag}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {uni.name}
                </h3>
                <p className="text-slate-300 text-sm mb-4">{uni.fullName}</p>
                <div className="flex gap-2">
                  {uni.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 rounded text-xs text-white font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
