"use client";

import Link from "next/link";

export default function CareerGuidance() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="home-page-shell">
        <div
          className="relative rounded-[5px] pt-8 px-8 lg:pt-16 lg:px-16 pb-0 flex flex-col lg:flex-row items-center lg:items-stretch gap-12 border border-slate-300 overflow-hidden bg-white"
          style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)' }}
        >

          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/98dbd696a8ef9396310ca4d2788bf46b8b3d5435.jpg"
              alt="Section Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
          </div>

          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FF3C3C]/5 rounded-full blur-3xl opacity-40 z-0" />

          {/* ── Left Content (60% width) ─────────────────────────────────── */}
          <div className="flex-[1.2] text-center lg:text-left z-10 pb-8 lg:pb-16 flex flex-col justify-center">
            <h2 className="text-[#1F2937] leading-[1.2] mb-6 tracking-tight" style={{ fontSize: '45px', fontWeight: 600 }}>
              Confused about your <span className="text-[#FF3C3C]">career path?</span>
            </h2>
            <p
              className="leading-relaxed mb-8 mx-auto lg:mx-0 w-full"
              style={{ maxWidth: '773px', fontSize: '25px', fontWeight: 500, color: '#222222' }}
            >
              Filter through thousands of institutions worldwide based on your specific academic preferences and career goals.
            </p>

            {/* Features List (Mockup bullets) */}
            <ul
              className="mb-10 flex flex-col gap-4"
              style={{ fontSize: '25px', fontWeight: 500, color: '#222222' }}
            >
              <li className="flex items-center gap-4 justify-center lg:justify-start">
                <span style={{ minWidth: '10px', height: '10px', backgroundColor: '#222222', borderRadius: '50%', display: 'block' }} />
                Helps up to finds the talent
              </li>
              <li className="flex items-center gap-4 justify-center lg:justify-start">
                <span style={{ minWidth: '10px', height: '10px', backgroundColor: '#222222', borderRadius: '50%', display: 'block' }} />
                Save your time
              </li>
              <li className="flex items-center gap-4 justify-center lg:justify-start">
                <span style={{ minWidth: '10px', height: '10px', backgroundColor: '#222222', borderRadius: '50%', display: 'block' }} />
                self assessment
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/counselling"
                className="flex h-[51.8px] w-full items-center justify-center rounded-[10px] bg-[#FF3C3C] px-8 text-center text-white shadow-lg shadow-[#FF3C3C]/20 transition-all hover:brightness-105 sm:w-auto"
                style={{ fontSize: '24px', fontWeight: 600 }}
              >
                Start Free Assessment
              </Link>
              <button
                className="flex h-[51.8px] w-full items-center justify-center rounded-[10px] bg-neutral-800 px-8 text-center text-white shadow-lg shadow-black/10 transition-all hover:bg-neutral-900 sm:w-auto"
                style={{ fontSize: '24px', fontWeight: 600 }}
              >
                Watch how its work
              </button>
            </div>
          </div>

          {/* ── Right Content: Illustration (40% width) ────────────────────── */}
          <div className="flex-1 relative z-10 w-full flex items-end justify-center lg:justify-end pb-0">
            <div className="relative w-full max-w-[480px] flex items-end">
              <img
                src="/images/3718e82201e432bd5219be08e1391c20ad9829af.png"
                alt="Confused Career Path Boy"
                className="w-full h-auto object-contain block object-bottom translate-y-[2px]"
                style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
