"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function GSAPAnimations() {
  const initialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // No GSAP scroll animations needed in admin
    if (pathname?.startsWith("/admin")) return;

    if (initialized.current) return;
    initialized.current = true;

    const timer = setTimeout(() => {

      // ── Fade up ────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-up']").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Fade in ────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-in']").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0 },
          {
            opacity: 1, duration: 1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Fade left ──────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-left']").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: -60 },
          {
            opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Fade right ─────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-right']").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: 60 },
          {
            opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Scale in ───────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='scale-in']").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Stagger children ───────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='stagger']").forEach((parent) => {
        gsap.fromTo(
          parent.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: parent, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });

      // ── Parallax ───────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-gsap='parallax']").forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.speed || "0.3");
        gsap.to(el, {
          yPercent: -30 * speed, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

    }, 300);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
