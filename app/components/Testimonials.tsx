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
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="max-w-2xl">
                <h2 className="text-[40px] font-semibold tracking-tight leading-[1.1] mb-4">
                  <span className="text-[#6C6C6C]">Unfiltered</span> <span className="text-primary">Student Voices</span>
                </h2>
                <p className="text-slate-500 font-normal text-lg">
                  Get the real story about campus life, professors, and placements from people who've actually been there.
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
              key={t.name}
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
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
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
                  "{t.text}"
                </p>
              </div>

              {/* Card Footer: Star Ratings */}
              <div className="flex gap-0.5 pt-6 border-t border-[#3D3D3D] text-yellow-400 mt-auto">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-rounded text-[18px] ${i < t.rating ? 'fill-current' : 'text-slate-200'}`}>
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
