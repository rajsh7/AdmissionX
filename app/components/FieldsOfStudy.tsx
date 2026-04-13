"use client";

import { useState, useRef } from "react";

export default function FieldsOfStudy() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handlePlay() {
    setPlaying(true);
    videoRef.current?.play();
  }

  function handleVideoClick() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#0f0f0f] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24 z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-primary text-[13px] font-bold uppercase tracking-[3px] mb-3">
            About AdmissionX
          </p>
          <h2 className="text-white text-[36px] lg:text-[52px] font-bold leading-tight tracking-tight">
            See How We Help Students
          </h2>
          <p className="text-white/50 text-[18px] font-normal mt-4 max-w-2xl mx-auto leading-relaxed">
            Watch how AdmissionX simplifies your college admission journey from discovery to enrollment.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-8xl mx-auto">
          {/* Glow border */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-white/5 to-primary/20 z-0" />

          <div className="relative rounded-2xl overflow-hidden bg-black z-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            <video
              ref={videoRef}
              src="/intro-video.mp4"
              className="w-full aspect-[16/7] object-cover"
              onClick={handleVideoClick}
              onEnded={() => setPlaying(false)}
              playsInline
              preload="metadata"
            />

            {/* Play overlay */}
            {!playing && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                onClick={handlePlay}
              >
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </div>
              </div>
            )}

            {/* Pause button when playing */}
            {playing && (
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleVideoClick}
              >
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    pause
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "500+", label: "Partner Colleges" },
            { value: "50K+", label: "Students Helped" },
            { value: "200+", label: "Courses Listed" },
            { value: "95%", label: "Success Rate" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-primary text-[32px] font-bold leading-none">{s.value}</p>
              <p className="text-white/50 text-[14px] font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
