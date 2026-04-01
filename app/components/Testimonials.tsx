"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Aditi Sharma",
    college: "IIT Delhi",
    text: "AdmissionX made my college search so much easier. The unfiltered reviews helped me understand the ground reality of campus life.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=aditi"
  },
  {
    name: "Rahul Verma",
    college: "BITS Pilani",
    text: "The exam guidance section is top-notch. I found all the mock tests and resources I needed for my BITSAT preparation in one place.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=rahul"
  },
  {
    name: "Sneha Kapur",
    college: "SRCC Delhi",
    text: "I was confused between three different colleges, but the comparison tool and councillor support here helped me make the right choice.",
    rating: 4,
    avatar: "https://i.pravatar.cc/100?u=sneha"
  },
  {
    name: "Priyanshu Jha",
    college: "VIT Vellore",
    text: "The scholarship alerts are a lifesaver! I managed to secure a 50% tuition waiver thanks to the information I found on AdmissionX.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=priyan"
  },
  {
    name: "Ananya Iyer",
    college: "NID Ahmedabad",
    text: "As a design student, finding specific portfolio requirements was hard until I used this platform. Highly recommended for creative fields.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=ananya"
  },
  {
    name: "Vikram Seth",
    college: "IIM Bangalore",
    text: "The placement data provided here is very accurate. It gave me a clear picture of my career prospects after my MBA journey.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=vikram"
  },
  {
    name: "Karan Malhotra",
    college: "SRM University",
    text: "Getting admissions in a top-tier college seemed impossible until I found the right guidance here. The step-by-step process is excellent.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=karan"
  },
  {
    name: "Meera Reddy",
    college: "Osmania University",
    text: "The interface is so intuitive! I could compare five different universities side-by-side and decide which one fits my budget best.",
    rating: 4,
    avatar: "https://i.pravatar.cc/100?u=meera"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full py-24 lg:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        
        <div className="flex items-center justify-between gap-12 mb-20">
            <h2 className="text-[40px] lg:text-[56px] font-normal text-slate-900 tracking-tight leading-[1.1]">
              Unfiltered <span className="text-primary">Student Voices</span>
            </h2>
            <button className="hidden sm:block px-8 py-3.5 rounded-[10px] bg-white border border-slate-100 shadow-sm text-slate-600 font-normal text-sm hover:bg-slate-50 transition-all">
                View All Reviews
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-10 lg:p-12 rounded-[10px] bg-[#f8fafc] border border-slate-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] flex flex-col h-full relative group"
            >
              <div className="absolute top-10 right-12 text-primary/10 group-hover:text-primary/20 transition-colors">
                 <span className="material-symbols-rounded text-[64px]">format_quote</span>
              </div>

              <div className="flex gap-1 mb-8 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-rounded text-[20px] ${i < t.rating ? 'fill-current' : 'text-slate-200'}`}>
                    star
                  </span>
                ))}
              </div>

              <p className="text-slate-600 font-normal leading-relaxed mb-10 flex-1 italic text-[22px]">
                "{t.text}"
              </p>

              <div className="flex items-center gap-5 pt-8 border-t border-slate-100/50">
                <div className="w-16 h-16 rounded-[10px] border-2 border-white shadow-lg overflow-hidden bg-slate-200 shrink-0">
                   <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                   <h4 className="text-[18px] font-normal text-slate-900 leading-none mb-1.5">{t.name}</h4>
                   <p className="text-xs font-normal text-slate-400 uppercase tracking-widest">{t.college}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
