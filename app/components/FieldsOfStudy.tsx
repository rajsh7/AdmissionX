"use client";

export default function FieldsOfStudy() {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#0f0f0f] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="home-page-shell relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-white text-[36px] lg:text-[52px] font-bold leading-tight tracking-tight">
            See How AdmissionX Works
          </h2>
          <p className="text-white/50 text-[18px] font-normal mt-4 max-w-2xl mx-auto leading-relaxed">
            Watch how we help students find their dream college and simplify the entire admission journey.
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(227,30,36,0.15)] border border-white/10">
          <video
            src="/intro-video.mp4"
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto block"
          />
        </div>
      </div>
    </section>
  );
}
